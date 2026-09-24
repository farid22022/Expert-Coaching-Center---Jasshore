from django.db import transaction
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.accounts.models import User
from apps.core.responses import success_response
from apps.core.permissions import HasActionPermission
from apps.core.viewsets import OrganizationScopedModelViewSet
from . import models, serializers


class PeopleViewSet(OrganizationScopedModelViewSet):
    permission_classes = [HasActionPermission]


class GuardianViewSet(PeopleViewSet):
    permission_module = "student"
    queryset = models.Guardian.objects.all()
    serializer_class = serializers.GuardianSerializer
    search_fields = ("name", "phone", "email")


class StudentViewSet(PeopleViewSet):
    permission_module = "student"
    queryset = models.Student.objects.select_related("session", "academic_class", "section", "group", "shift", "category")
    serializer_class = serializers.StudentSerializer
    search_fields = ("student_id", "admission_no", "roll", "full_name", "phone")
    filterset_fields = ("session", "academic_class", "section", "group", "shift", "category", "status", "gender")


class StudentProfileViewSet(PeopleViewSet):
    permission_module = "student"
    queryset = models.StudentProfile.objects.select_related("user")
    serializer_class = serializers.StudentProfileSerializer
    search_fields = ("full_name", "phone", "email", "guardian_name", "institution")
    filterset_fields = ("user", "gender")


class StudentAddressViewSet(PeopleViewSet):
    permission_module = "student"
    queryset = models.StudentAddress.objects.select_related("student")
    serializer_class = serializers.StudentAddressSerializer
    filterset_fields = ("student", "address_type")


class StudentDocumentViewSet(PeopleViewSet):
    permission_module = "student"
    queryset = models.StudentDocument.objects.select_related("student")
    serializer_class = serializers.StudentDocumentSerializer
    filterset_fields = ("student", "document_type")


class StudentStatusHistoryViewSet(PeopleViewSet):
    permission_module = "student"
    queryset = models.StudentStatusHistory.objects.select_related("student")
    serializer_class = serializers.StudentStatusHistorySerializer
    filterset_fields = ("student", "new_status")


class DepartmentViewSet(PeopleViewSet):
    permission_module = "employee"
    queryset = models.Department.objects.all()
    serializer_class = serializers.DepartmentSerializer
    search_fields = ("name",)


class DesignationViewSet(PeopleViewSet):
    permission_module = "employee"
    queryset = models.Designation.objects.all()
    serializer_class = serializers.DesignationSerializer
    search_fields = ("name",)


class EmployeeViewSet(PeopleViewSet):
    permission_module = "employee"
    queryset = models.Employee.objects.select_related("department", "designation")
    serializer_class = serializers.EmployeeSerializer
    search_fields = ("employee_id", "full_name", "phone", "email")
    filterset_fields = ("employee_type", "department", "designation", "status")

    @action(detail=True, methods=["post"])
    def deactivate(self, request, pk=None):
        employee = self.get_object()
        if employee.employee_type != "teacher":
            return Response({"detail": "Only teacher accounts can be deactivated here."}, status=status.HTTP_400_BAD_REQUEST)
        with transaction.atomic():
            employee.status = "inactive"
            employee.updated_by = request.user
            employee.save(update_fields=["status", "updated_by", "updated_at"])
            User.objects.filter(organization=employee.organization, email__iexact=employee.email).update(is_active=False)
            from apps.courses.models import TeacherAssignment
            TeacherAssignment.objects.filter(teacher=employee, is_active=True).update(is_active=False, updated_by=request.user)
        return success_response(serializers.EmployeeSerializer(employee).data, "Teacher account deactivated. Academic history remains intact.")


class TeacherAccountViewSet(PeopleViewSet):
    """Creates a teacher login and matching employee record; email delivery stays external."""
    permission_module = "employee"
    queryset = models.Employee.objects.filter(employee_type="teacher")
    serializer_class = serializers.TeacherAccountSerializer
    http_method_names = ["post"]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        teacher = serializer.save()
        return Response(serializers.EmployeeSerializer(teacher).data, status=status.HTTP_201_CREATED)
