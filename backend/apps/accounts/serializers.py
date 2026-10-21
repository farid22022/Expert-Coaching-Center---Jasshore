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
        fields = "__all__"


class UserSerializer(serializers.ModelSerializer):
    role_codes = serializers.SerializerMethodField()

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
            "avatar",
            "date_joined",
        )
        read_only_fields = ("is_superuser",)

    def get_role_codes(self, obj):
        return list(obj.roles.values_list("code", flat=True))


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
        role_code = validated_data.pop("role", "").strip().lower()
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

        if role_code in {"student", "learner", "teacher", "parent"}:
            normalized_role_code = "student" if role_code == "learner" else role_code
            role, _ = Role.objects.get_or_create(
                organization=organization,
                code=normalized_role_code,
                defaults={"name": normalized_role_code.title(), "is_system": True},
            )
            user.roles.add(role)

        if role_code in {"student", "learner"}:
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
