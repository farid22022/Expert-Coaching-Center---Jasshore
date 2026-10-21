from django.contrib.auth.models import AbstractUser
from django.db import models
from apps.core.fields import HostedImageField


class Permission(models.Model):
    code = models.CharField(max_length=120, unique=True)
    name = models.CharField(max_length=180)
    module = models.CharField(max_length=80, db_index=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.code


class Role(models.Model):
    organization = models.ForeignKey(
        "organizations.Organization",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name="roles",
    )
    name = models.CharField(max_length=120)
    code = models.CharField(max_length=120)
    permissions = models.ManyToManyField(Permission, blank=True, related_name="roles")
    is_system = models.BooleanField(default=False)

    class Meta:
        unique_together = ("organization", "code")

    def __str__(self):
        return self.name


class User(AbstractUser):
    email = models.EmailField(unique=True)
    organization = models.ForeignKey(
        "organizations.Organization",
        null=True,
        blank=True,
        on_delete=models.PROTECT,
        related_name="users",
    )
    branch = models.ForeignKey(
        "organizations.Branch",
        null=True,
        blank=True,
        on_delete=models.PROTECT,
        related_name="users",
    )
    phone = models.CharField(max_length=50, blank=True, db_index=True)
    avatar = HostedImageField(upload_to="users/avatars/", blank=True)
    roles = models.ManyToManyField(Role, blank=True, related_name="users")

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    def has_app_permission(self, code):
        if self.is_superuser:
            return True
        return self.roles.filter(permissions__code=code).exists()


class UserLoginHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="login_history")
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-created_at",)


from .session_models import UserSession, SessionPolicy  # noqa: E402,F401
