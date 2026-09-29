import secrets
from django.db import transaction
from rest_framework import serializers
from apps.accounts.models import Role, User
from . import models


def serializer_for(model):
    return type(f"{model.__name__}Serializer", (serializers.ModelSerializer,), {"Meta": type("Meta", (), {"model": model, "fields": "__all__"})})


GuardianSerializer = serializer_for(models.Guardian)
StudentSerializer = serializer_for(models.Student)
StudentAddressSerializer = serializer_for(models.StudentAddress)
StudentDocumentSerializer = serializer_for(models.StudentDocument)
StudentStatusHistorySerializer = serializer_for(models.StudentStatusHistory)
DepartmentSerializer = serializer_for(models.Department)
DesignationSerializer = serializer_for(models.Designation)
EmployeeSerializer = serializer_for(models.Employee)
StudentProfileSerializer = serializer_for(models.StudentProfile)
TeacherProfileSerializer = serializer_for(models.TeacherProfile)


class TeacherAccountSerializer(serializers.Serializer):
    employee_id = serializers.CharField(max_length=80)
    full_name = serializers.CharField(max_length=180)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=50, required=False, allow_blank=True)
    joining_date = serializers.DateField(required=False, allow_null=True)
    gender = serializers.ChoiceField(choices=models.PersonGender.choices, required=False, allow_blank=True)
    qualification = serializers.CharField(max_length=255, required=False, allow_blank=True)
    specialization = serializers.CharField(max_length=255, required=False, allow_blank=True)
    bio = serializers.CharField(required=False, allow_blank=True)
    status = serializers.ChoiceField(choices=models.StatusChoices.choices, default=models.StatusChoices.ACTIVE)
    photo = serializers.ImageField(required=False, allow_null=True)

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("An account already exists for this email address.")
        return value.lower()

    @transaction.atomic
    def create(self, validated_data):
        request = self.context["request"]
        # Same organization-resolution fallback OrganizationScopedModelViewSet already
        # applies everywhere else (get-or-create the default org for staff/superusers
        # with no organization FK set) - this serializer previously used the raw FK
        # directly and rejected any such account outright.
        organization = self.context["view"].get_request_organization()
        if models.Employee.objects.filter(organization=organization, employee_id=validated_data["employee_id"]).exists():
            raise serializers.ValidationError({"employee_id": "This teacher ID is already in use."})
        names = validated_data["full_name"].strip().split(None, 1)
        role, _ = Role.objects.get_or_create(organization=organization, code="teacher", defaults={"name": "Teacher", "is_system": True})
        # Invitation delivery belongs to a future mail service. A high-entropy
        # unusable-to-humans temporary secret is hashed by Django and never returned.
        user = User.objects.create_user(username=validated_data["email"], email=validated_data["email"], password=secrets.token_urlsafe(32), first_name=names[0], last_name=names[1] if len(names) > 1 else "", phone=validated_data.get("phone", ""), organization=organization, is_active=validated_data.get("status") == models.StatusChoices.ACTIVE)
        user.roles.add(role)
        employee = models.Employee.objects.create(organization=organization, employee_id=validated_data["employee_id"], full_name=validated_data["full_name"], email=validated_data["email"], phone=validated_data.get("phone", ""), joining_date=validated_data.get("joining_date"), photo=validated_data.get("photo"), employee_type="teacher", status=validated_data.get("status"), created_by=request.user, updated_by=request.user)
        models.TeacherProfile.objects.create(organization=organization, user=user, employee=employee, gender=validated_data.get("gender", ""), qualification=validated_data.get("qualification", ""), specialization=validated_data.get("specialization", ""), bio=validated_data.get("bio", ""), created_by=request.user, updated_by=request.user)
        return employee
