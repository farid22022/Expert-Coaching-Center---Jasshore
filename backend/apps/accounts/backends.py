from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend


class CaseInsensitiveEmailBackend(ModelBackend):
    """MySQL's default collation made email logins case-insensitive; PostgreSQL's is not.
    Keep the old behaviour so users who type a differently-cased email can still sign in."""

    def authenticate(self, request, username=None, password=None, **kwargs):
        User = get_user_model()
        if username is None:
            username = kwargs.get(User.USERNAME_FIELD)
        if username is None or password is None:
            return None
        matches = list(User.objects.filter(email__iexact=str(username).strip())[:2])
        if len(matches) != 1:
            # Unknown or ambiguous: run the hasher once to keep timing similar, then refuse.
            User().set_password(password)
            return None
        user = matches[0]
        if user.check_password(password) and self.user_can_authenticate(user):
            return user
        return None
