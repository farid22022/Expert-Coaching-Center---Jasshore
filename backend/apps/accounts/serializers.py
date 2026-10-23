from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from apps.organizations.models import Organization
from apps.people.models import StudentProfile
from .models import Permission, Role, User, UserLoginHistory


class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = "__all__"


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ("id", "name", "code", "organization", "permissions", "is_system")
        read_only_fields = ("organization", "is_system")


class UserSerializer(serializers.ModelSerializer):
    role_codes = serializers.SerializerMethodField()
    role_ids = serializers.SerializerMethodField()
    permission_codes = serializers.SerializerMethodField()
    roles = serializers.PrimaryKeyRelatedField(queryset=Role.objects.all(), many=True, required=False, write_only=True)

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "phone",
            "organization",
            "branch",
            "is_active",
            "is_staff",
            "is_superuser",
            "role_codes",
            "role_ids",
            "permission_codes",
            "roles",
            "avatar",
            "date_joined",
        )
        read_only_fields = ("is_superuser", "is_staff", "organization", "date_joined")

    def get_role_codes(self, obj):
        return [role.code for role in obj.roles.all()]

    def get_role_ids(self, obj):
        return [role.pk for role in obj.roles.all()]

    def get_permission_codes(self, obj):
        return sorted({permission.code for role in obj.roles.all() for permission in role.permissions.all()})

    def validate_roles(self, roles):
        request = self.context.get("request")
        actor = getattr(request, "user", None)
        if actor and not actor.is_superuser:
            organization_id = actor.organization_id
            if not organization_id or any(role.organization_id not in (None, organization_id) for role in roles):
                raise serializers.ValidationError("You can only assign system roles or roles belonging to your organization.")
        return roles


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    role = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ("id", "name", "username", "email", "first_name", "last_name", "phone", "role", "password")
        read_only_fields = ("id",)
        extra_kwargs = {
            "username": {"required": False, "allow_blank": True},
            "first_name": {"required": False, "allow_blank": True},
            "last_name": {"required": False, "allow_blank": True},
            "phone": {"required": False, "allow_blank": True},
        }

    def create(self, validated_data):
        password = validated_data.pop("password")
        name = validated_data.pop("name", "").strip()
        validated_data.pop("role", None)  # accepted for compatibility but ignored; see below
        email = validated_data.pop("email").strip().lower()
        username = validated_data.get("username") or email
        validated_data.pop("username", None)

        if name and not validated_data.get("first_name"):
            parts = name.split(" ", 1)
            validated_data["first_name"] = parts[0]
            if len(parts) > 1:
                validated_data["last_name"] = parts[1]

        organization = validated_data.get("organization")
        if not organization:
            organization, _ = Organization.objects.get_or_create(
                code="expert-jashore",
                defaults={
                    "name": "Expert Coaching Center",
                    "email": "expertjashore@gmail.com",
                    "phone": "01719486254",
                    "address": "Stadium Road, Jashore",
                    "established_year": 2017,
                },
            )
            validated_data["organization"] = organization

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            **validated_data,
        )

        # Public self-registration always creates a student. Privileged roles
        # (teacher/parent/staff) must be granted by an admin via the user admin
        # APIs; honoring a client-supplied role here is a privilege escalation.
        role, _ = Role.objects.get_or_create(
            organization=organization,
            code="student",
            defaults={"name": "Student", "is_system": True},
        )
        user.roles.add(role)

        StudentProfile.objects.get_or_create(
            user=user,
            defaults={
                "organization": organization,
                "full_name": f"{user.first_name} {user.last_name}".strip() or user.email,
                "phone": user.phone,
                "email": user.email,
                "created_by": user,
                "updated_by": user,
            },
        )

        return user


class LoginSerializer(TokenObtainPairSerializer):
    username_field = "email"

    def validate(self, attrs):
        data = super().validate(attrs)
        from .sessions import create_session
        session, refresh = create_session(self.user, self.context["request"])
        data["refresh"] = str(refresh)
        data["access"] = str(refresh.access_token)
        data["user"] = UserSerializer(self.user).data
        return data


class UserLoginHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = UserLoginHistory
        fields = "__all__"
