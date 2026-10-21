from datetime import timedelta
from django.utils import timezone
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken
from apps.accounts.models import User, UserSession


class DeviceSessionTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="device-user", email="devices@example.test", password="Session-test-572!")
        self.other = User.objects.create_user(username="other-user", email="other@example.test", password="Session-test-572!")

    def login(self, user=None):
        response = self.client.post("/api/v1/auth/login/", {"email": (user or self.user).email, "password": "Session-test-572!"}, format="json", HTTP_USER_AGENT="Mozilla/5.0 (Windows NT 10.0) Chrome/130.0.0.0 Safari/537.36", REMOTE_ADDR="203.0.113.42")
        self.assertEqual(response.status_code, 200, response.data)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.data['access']}")
        return response.data

    def test_login_records_masked_device_and_no_raw_tokens(self):
        self.login()
        response = self.client.get("/api/v1/auth/me/sessions/")
        row = response.data["data"]["sessions"][0]
        self.assertTrue(row["is_current"])
        self.assertEqual(row["masked_ip"], "203.0.113.xxx")
        self.assertEqual(row["browser"], "Chrome 130.0.0.0")
        self.assertNotIn("user_agent", row)
        self.assertNotIn("refresh", row)

    def test_revoke_denies_access_and_refresh(self):
        tokens = self.login()
        sid = RefreshToken(tokens["refresh"])["sid"]
        self.assertEqual(self.client.delete(f"/api/v1/auth/me/sessions/{sid}/").status_code, 200)
        self.assertEqual(self.client.get("/api/v1/auth/me/").status_code, 401)
        self.client.credentials()
        self.assertEqual(self.client.post("/api/v1/auth/refresh/", {"refresh": tokens["refresh"]}, format="json").status_code, 401)

    def test_others_revoke_preserves_current_and_rejects_other_access(self):
        old = self.login()
        current = self.login()
        self.assertEqual(self.client.delete("/api/v1/auth/me/sessions/?others=true").status_code, 200)
        self.assertEqual(self.client.get("/api/v1/auth/me/").status_code, 200)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {old['access']}")
        self.assertEqual(self.client.get("/api/v1/auth/me/").status_code, 401)
        self.client.credentials()
        self.assertEqual(self.client.post("/api/v1/auth/refresh/", {"refresh": current["refresh"]}, format="json").status_code, 200)

    def test_owner_isolation(self):
        self.login(self.other)
        row = UserSession.objects.get(user=self.other)
        self.login()
        response = self.client.get("/api/v1/auth/me/sessions/")
        self.assertEqual(len(response.data["data"]["sessions"]), 1)
        self.assertEqual(self.client.delete(f"/api/v1/auth/me/sessions/{row.pk}/").status_code, 404)
        row.refresh_from_db()
        self.assertIsNone(row.revoked_at)

    def test_legacy_token_works_then_upgrades_and_revokes(self):
        legacy = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {legacy.access_token}")
        self.assertEqual(self.client.get("/api/v1/auth/me/").status_code, 200)
        upgraded = self.client.post("/api/v1/auth/me/sessions/", {"refresh": str(legacy)}, format="json")
        self.assertEqual(upgraded.status_code, 200)
        self.assertIn("sid", RefreshToken(upgraded.data["data"]["refresh"]))
        self.assertEqual(self.client.delete(f"/api/v1/auth/me/sessions/{UserSession.objects.get().pk}/").status_code, 200)
        self.assertEqual(self.client.get("/api/v1/auth/me/").status_code, 401)

    def test_legacy_refresh_from_another_user_cannot_upgrade(self):
        legacy = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {legacy.access_token}")
        response = self.client.post("/api/v1/auth/me/sessions/", {"refresh": str(RefreshToken.for_user(self.other))}, format="json")
        self.assertEqual(response.status_code, 401)
        self.assertFalse(UserSession.objects.exists())

    def test_others_revocation_also_invalidates_unknown_legacy_tokens(self):
        legacy = RefreshToken.for_user(self.user)
        self.login()
        self.client.delete("/api/v1/auth/me/sessions/?others=true")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {legacy.access_token}")
        self.assertEqual(self.client.get("/api/v1/auth/me/").status_code, 401)
        self.client.credentials()
        self.assertEqual(self.client.post("/api/v1/auth/refresh/", {"refresh": str(legacy)}, format="json").status_code, 401)

    def test_heartbeat_throttled_to_five_minutes(self):
        self.login()
        row = UserSession.objects.get()
        first = row.last_active_at
        self.client.get("/api/v1/auth/me/")
        row.refresh_from_db()
        self.assertEqual(row.last_active_at, first)
        UserSession.objects.filter(pk=row.pk).update(last_active_at=timezone.now() - timedelta(minutes=6))
        self.client.get("/api/v1/auth/me/")
        row.refresh_from_db()
        self.assertGreater(row.last_active_at, first)

    def test_profile_cannot_change_roles_or_email(self):
        self.login()
        self.assertEqual(self.client.patch("/api/v1/auth/me/profile/", {"is_staff": True}, format="json").status_code, 400)
        self.assertEqual(self.client.patch("/api/v1/auth/me/profile/", {"first_name": "বাংলা", "phone": "01700000000"}, format="json").status_code, 200)
        self.user.refresh_from_db()
        self.assertFalse(self.user.is_staff)
        self.assertEqual(self.user.first_name, "বাংলা")

    def test_password_requires_current_and_revokes_sessions(self):
        self.login()
        self.assertEqual(self.client.post("/api/v1/auth/me/password/", {"current_password": "wrong", "new_password": "New-pass-572!"}, format="json").status_code, 400)
        self.assertEqual(self.client.post("/api/v1/auth/me/password/", {"current_password": "Session-test-572!", "new_password": "New-pass-572!"}, format="json").status_code, 200)
        self.assertEqual(self.client.get("/api/v1/auth/me/").status_code, 401)

    def test_anonymous_cannot_view_devices(self):
        self.assertEqual(self.client.get("/api/v1/auth/me/sessions/").status_code, 401)
