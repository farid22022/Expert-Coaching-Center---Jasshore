import io
from unittest import mock

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from PIL import Image
from rest_framework.test import APIClient

from apps.accounts.models import User
from apps.audit.models import AuditLog
from apps.integrations.crypto import decrypt_secret
from apps.integrations.models import IntegrationSetting, MediaAsset

SECRET = "0123456789abcdef0123456789abcd4X7P"[:32]
ENC_KEY = "unit-test-master-key-which-is-long-enough"


def png_bytes(size=(40, 30), fmt="PNG"):
    buf = io.BytesIO()
    Image.new("RGB", size, (200, 30, 30)).save(buf, fmt)
    return buf.getvalue()


def ok_response(**extra):
    resp = mock.Mock(status_code=200)
    data = {"id": "abc123", "url": "https://i.ibb.co/abc123/upload.png", "display_url": "https://i.ibb.co/abc123/upload.png",
            "delete_url": "https://ibb.co/abc123/deletetoken", "width": 40, "height": 30, "size": 100,
            "thumb": {"url": "https://i.ibb.co/t/upload.png"}, "image": {"mime": "image/png"}}
    data.update(extra)
    resp.json.return_value = {"success": True, "status_code": 200, "data": data}
    return resp


@override_settings(APP_CONFIG_ENCRYPTION_KEY=ENC_KEY, IMGBB_API_KEY="")
class ImgBBTests(TestCase):
    def setUp(self):
        self.admin = User.objects.create_superuser(username="adm", email="adm@example.com", password="pw-12345-xyz")
        self.teacher = User.objects.create_user(username="tch", email="tch@example.com", password="pw-12345-xyz")
        self.client = APIClient()

    def login(self, user):
        self.client.force_authenticate(user)

    def test_only_superuser_can_manage_key(self):
        self.login(self.teacher)
        for method, url in (("get", "/api/v1/integrations/imgbb/"), ("put", "/api/v1/integrations/imgbb/"),
                            ("delete", "/api/v1/integrations/imgbb/"), ("post", "/api/v1/integrations/imgbb/test/")):
            self.assertEqual(getattr(self.client, method)(url, {}, format="json").status_code, 403, url)

    def test_save_encrypts_masks_and_never_returns_key(self):
        self.login(self.admin)
        r = self.client.put("/api/v1/integrations/imgbb/", {"api_key": SECRET}, format="json")
        self.assertEqual(r.status_code, 200)
        self.assertTrue(r.json()["configured"] and r.json()["enabled"])
        self.assertTrue(r.json()["masked_key"].endswith(SECRET[-4:]))
        self.assertNotIn(SECRET, r.content.decode())
        self.assertNotIn(SECRET, self.client.get("/api/v1/integrations/imgbb/").content.decode())
        row = IntegrationSetting.objects.get(provider="imgbb")
        self.assertNotIn(SECRET, row.encrypted_api_key)
        self.assertEqual(decrypt_secret(row.encrypted_api_key), SECRET)
        logs = AuditLog.objects.filter(entity="IntegrationSetting")
        self.assertTrue(logs.filter(action="imgbb.api_key_configured").exists())
        self.assertNotIn(SECRET, str([l.new_values for l in logs]))

    @override_settings(APP_CONFIG_ENCRYPTION_KEY="")
    def test_save_refused_without_server_encryption_key(self):
        self.login(self.admin)
        r = self.client.put("/api/v1/integrations/imgbb/", {"api_key": SECRET}, format="json")
        self.assertEqual(r.status_code, 503)
        self.assertFalse(IntegrationSetting.objects.filter(encrypted_api_key__gt="").exists())

    def test_upload_not_configured_message(self):
        self.login(self.teacher)
        f = SimpleUploadedFile("a.png", png_bytes(), "image/png")
        r = self.client.post("/api/v1/uploads/images/", {"image": f, "context": "general"}, format="multipart")
        self.assertEqual(r.status_code, 503)
        self.assertEqual(r.json()["detail"], "Image hosting is not configured. Please contact an administrator.")

    @mock.patch("apps.integrations.image_hosting.imgbb.requests.post")
    def test_upload_success_normalises_and_hides_delete_url(self, post):
        post.return_value = ok_response()
        self.login(self.admin)
        self.client.put("/api/v1/integrations/imgbb/", {"api_key": SECRET}, format="json")
        self.login(self.teacher)
        f = SimpleUploadedFile("a.png", png_bytes(), "image/png")
        r = self.client.post("/api/v1/uploads/images/", {"image": f, "context": "course_cover"}, format="multipart")
        self.assertEqual(r.status_code, 201, r.content)
        body = r.json()
        self.assertEqual(body["url"], "https://i.ibb.co/abc123/upload.png")
        self.assertEqual(body["provider"], "imgbb")
        self.assertNotIn("delete_url", body)
        self.assertNotIn("deletetoken", r.content.decode())
        self.assertNotIn(SECRET, r.content.decode())
        # key goes to ImgBB in the POST body, never in the URL
        args, kwargs = post.call_args
        self.assertNotIn(SECRET, args[0])
        self.assertEqual(kwargs["data"]["key"], SECRET)
        asset = MediaAsset.objects.get()
        self.assertNotIn("deletetoken", asset.encrypted_delete_url)

    @mock.patch("apps.integrations.image_hosting.imgbb.requests.post")
    def test_invalid_key_and_garbage_files_are_safe(self, post):
        bad = mock.Mock(status_code=400)
        bad.json.return_value = {"status_code": 400, "error": {"message": "Invalid API v1 key."}}
        post.return_value = bad
        self.login(self.admin)
        self.client.put("/api/v1/integrations/imgbb/", {"api_key": SECRET}, format="json")
        f = SimpleUploadedFile("a.png", png_bytes(), "image/png")
        r = self.client.post("/api/v1/uploads/images/", {"image": f}, format="multipart")
        self.assertEqual(r.status_code, 502)
        self.assertNotIn(SECRET, r.content.decode())
        self.assertEqual(MediaAsset.objects.count(), 0)
        fake = SimpleUploadedFile("evil.png", b"%PDF-1.4 not an image", "image/png")
        r = self.client.post("/api/v1/uploads/images/", {"image": fake}, format="multipart")
        self.assertEqual(r.status_code, 400)

    @mock.patch("apps.integrations.image_hosting.imgbb.requests.post")
    def test_disable_blocks_uploads_and_env_fallback(self, post):
        self.login(self.admin)
        self.client.put("/api/v1/integrations/imgbb/", {"api_key": SECRET}, format="json")
        r = self.client.put("/api/v1/integrations/imgbb/", {"enabled": False}, format="json")
        self.assertFalse(r.json()["enabled"])
        with override_settings(IMGBB_API_KEY="envkey0123456789envkey"):
            f = SimpleUploadedFile("a.png", png_bytes(), "image/png")
            r = self.client.post("/api/v1/uploads/images/", {"image": f}, format="multipart")
        self.assertEqual(r.status_code, 503)
        post.assert_not_called()

    @mock.patch("apps.integrations.image_hosting.imgbb.requests.post")
    def test_env_fallback_used_when_no_admin_row(self, post):
        post.return_value = ok_response()
        self.login(self.teacher)
        with override_settings(IMGBB_API_KEY="envkey0123456789envkey"):
            f = SimpleUploadedFile("a.png", png_bytes(), "image/png")
            r = self.client.post("/api/v1/uploads/images/", {"image": f}, format="multipart")
        self.assertEqual(r.status_code, 201)

    def test_oversize_rejected_by_context_limit(self):
        self.login(self.admin)
        big = SimpleUploadedFile("big.png", b"0" * (5 * 1024 * 1024 + 1), "image/png")
        r = self.client.post("/api/v1/uploads/images/", {"image": big, "context": "avatar"}, format="multipart")
        self.assertEqual(r.status_code, 413)

    @mock.patch("apps.integrations.image_hosting.imgbb.requests.post")
    def test_model_imagefield_stores_public_url_when_configured(self, post):
        post.return_value = ok_response()
        self.login(self.admin)
        self.client.put("/api/v1/integrations/imgbb/", {"api_key": SECRET}, format="json")
        self.admin.avatar.save("me.png", io.BytesIO(png_bytes()), save=True)
        self.admin.refresh_from_db()
        self.assertEqual(self.admin.avatar.name, "https://i.ibb.co/abc123/upload.png")
        self.assertEqual(self.admin.avatar.url, "https://i.ibb.co/abc123/upload.png")

    def test_legacy_local_image_url_still_resolves(self):
        self.admin.avatar.name = "users/avatars/old.png"
        self.assertTrue(self.admin.avatar.url.endswith("/media/users/avatars/old.png"))


class HostedImageSerializerFieldTests(TestCase):
    def field(self):
        from apps.website.serializers import BannerSerializer

        return BannerSerializer().fields["image"]

    def test_model_serializers_use_hosted_field(self):
        from apps.integrations.serializer_fields import HostedImageSerializerField

        self.assertIsInstance(self.field(), HostedImageSerializerField)

    def test_accepts_platform_url_rejects_foreign_and_allows_clear(self):
        from rest_framework.exceptions import ValidationError

        f = self.field()
        self.assertEqual(f.to_internal_value("https://i.ibb.co/abc/pic.png"), "https://i.ibb.co/abc/pic.png")
        self.assertEqual(f.to_internal_value(""), "")
        for bad in ("https://evil.example.com/x.png", "http://i.ibb.co/abc/pic.png", "javascript:alert(1)"):
            with self.assertRaises(ValidationError):
                f.to_internal_value(bad)


class DatabaseFailureHandlingTests(TestCase):
    def test_db_outage_returns_generic_503_without_internals(self):
        from django.db import OperationalError

        from apps.core.exceptions import api_exception_handler

        resp = api_exception_handler(OperationalError("could not connect to host ep-secret.neon.tech user=app password=hunter2"), {})
        self.assertEqual(resp.status_code, 503)
        body = str(resp.data)
        self.assertNotIn("neon", body)
        self.assertNotIn("hunter2", body)


@override_settings(APP_CONFIG_ENCRYPTION_KEY=ENC_KEY, IMGBB_API_KEY="envkey0123456789envkey")
class MixedMediaRoutingTests(TestCase):
    @mock.patch("apps.integrations.image_hosting.imgbb.requests.post")
    def test_gallery_photo_hosted_but_video_and_pdf_stay_local(self, post):
        import tempfile

        from apps.organizations.models import Organization
        from apps.website.models import GalleryItem

        post.return_value = ok_response()
        org = Organization.objects.create(name="Org", code="ORG1") if not Organization.objects.exists() else Organization.objects.first()
        with tempfile.TemporaryDirectory() as tmp, override_settings(MEDIA_ROOT=tmp):
            photo = GalleryItem(organization=org, title="p")
            photo.file.save("p.png", io.BytesIO(png_bytes()), save=True)
            self.assertTrue(photo.file.name.startswith("https://i.ibb.co/"))
            post.reset_mock()
            for fname, payload in (("v.mp4", b"\x00\x00\x00\x18ftypmp42" + b"0" * 64), ("a.pdf", b"%PDF-1.4 0000")):
                item = GalleryItem(organization=org, title=fname)
                item.file.save(fname, io.BytesIO(payload), save=True)
                self.assertTrue(item.file.name.startswith("website/gallery/"), item.file.name)
            post.assert_not_called()
