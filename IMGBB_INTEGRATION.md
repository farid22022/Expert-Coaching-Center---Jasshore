# ImgBB image hosting

## Architecture
```
React (<ImageUploader/>)  --multipart image-->  Django  --server-side key-->  ImgBB
                                                  |                              |
                                          validate + optimise              public image URL
                                                  |<-----------------------------|
React <-- {url, display_url, thumbnail_url, …} ---|  (URL stored in PostgreSQL by the form save)
```
The browser never talks to ImgBB and never sees the key. Only **images** are hosted; PDFs, videos, documents and assignment files keep using the existing local file storage.

Code: `backend/apps/integrations/` (`image_hosting/imgbb.py` client, `validation.py`, `storage.py`, `crypto.py`, `views.py`), `backend/apps/core/fields.py`, frontend `components/common/ImageUploader.jsx` and `pages/admin/Dashboard/website/IntegrationsPage.jsx`.

## Admin configuration
Admin portal → **Integrations** (`/admin/dashboard/integrations`): status (Configured ✓ / Not Configured), enable/disable, save or replace key, **Test connection**, remove key. After saving only `••••••••••••4X7P` is shown; no endpoint ever returns the key.

API (superuser only, enforced in Django; 403 for Head Teacher/Teacher/Student/non-superuser staff):
* `GET/PUT/DELETE /api/v1/integrations/imgbb/`, `POST /api/v1/integrations/imgbb/test/`

Test connection uploads a 1×1 PNG with a 60-second expiry (ImgBB has no verify endpoint), so no permanent garbage is left. A candidate key can be tested before saving.

## Encryption
Saved keys are encrypted with Fernet (AES-128-CBC + HMAC-SHA256, authenticated). The master secret is `APP_CONFIG_ENCRYPTION_KEY` in the server environment only (`python -c "import secrets;print(secrets.token_urlsafe(48))"`). The DB stores `encrypted_api_key` plus the last 4 characters for display. Without the master key the admin page refuses to save and tells the administrator why. ImgBB deletion URLs (secret capabilities) are stored encrypted in `MediaAsset` and never serialised.

## Key priority
1. Admin-configured key, when the integration row exists and is **enabled**.
2. `IMGBB_API_KEY` from the server environment, only if no admin row exists.
3. Otherwise uploads are unavailable: *"Image hosting is not configured. Please contact an administrator."*

An explicit admin **Disable** is a kill switch and also blocks the env fallback ("currently disabled by an administrator"). Existing image URLs are never touched by key changes or disabling.

## Upload flow
`POST /api/v1/uploads/images/` (authenticated, multipart `image`, optional `context`) → `201` with only: `provider, url, display_url, thumbnail_url, provider_image_id, width, height, size`.

Two entry points share the same service:
1. **Explicit endpoint + `<ImageUploader>`** – used in the Admission editor for card/cover/hero images; the form saves the returned URL (`HostedImageSerializerField` accepts only `https://i.ibb.co/…` URLs or a file).
2. **Model fields** – every `ImageField` is a `HostedImageField` (and `GalleryItem.file` a `HostedMediaField`): any existing multipart form that posts a file to the model serializer is transparently hosted on ImgBB and the URL is stored in the same column. Legacy local values (`courses/thumbnails/x.jpg`) keep resolving to `/media/…`.

If hosting is simply not set up, model-field saves fall back to local storage so existing screens keep working; the explicit endpoint returns the "not configured" message. If hosting is enabled but ImgBB fails, nothing is saved and the request fails with "Image upload failed. Please retry." (no broken URL is stored).

## Validation and limits
Real decoding with Pillow (extension/Content-Type not trusted); only JPEG, PNG, WebP, GIF; ≤ 60 MP.

| Context | Max size | Max dimension | Who |
|---|---|---|---|
| `avatar`, `profile` | 5 MB | 1024 px | any signed-in user |
| `teacher_photo` | 5 MB | 1024 | staff |
| `thumbnail` | 5 MB | 640 | staff |
| `admission_cover`, `course_cover`, `subject_image`, `lesson_image`, `notice`, `news`, `event`, `gallery` | 10 MB | 1920 | staff |
| `question_image` | 5 MB | 1600 | staff |
| `general` (default) | 5 MB | 1920 | staff |

"Staff" = anyone who is not a student-only account. Images are EXIF-transposed, metadata-stripped, downscaled and re-encoded (JPEG q85, PNG optimised, WebP q85); animated GIFs are passed through unchanged.

## Errors (all user-safe, no key/stack traces)
not configured / disabled (503), invalid key (502, admin action needed), rate limited (429), timeout/unavailable/malformed response (502), invalid or oversized image (400/413). The uploader shows the message, keeps the form values and offers Retry.

## Integrated image fields
Admission card/cover/hero (UI uploader) and, through the model fields: user avatar, applicant photo, student/teacher photos, organisation logo/favicon, question/option/test images, website content/banner/story/teacher images, gallery photos. Full table in `POSTGRES_NEON_IMGBB_MIGRATION_STATE.md`.

## Existing images
Left in place. `python manage.py migrate_images_to_imgbb --dry-run --report ../EXISTING_IMAGE_MIGRATION_PLAN.md` lists them; running it without `--dry-run` uploads (restartable, never deletes local files, optional `--limit`).

## Rotating the key
Create a new key at imgbb.com → Admin → Integrations → paste → *Test connection* → *Save*. New uploads use it immediately; stored URLs are unaffected. Remove the old key at ImgBB afterwards. Audit actions recorded (no secrets): `imgbb.api_key_configured/replaced/removed`, `imgbb.enabled/disabled`, `imgbb.connection_tested`.

## Known limits
ImgBB has no API to delete images, so replacing/removing an image in EXPERT does not delete the hosted file. Uploaded images are public by URL – never use ImgBB for private/paid content (study materials stay local for that reason).
