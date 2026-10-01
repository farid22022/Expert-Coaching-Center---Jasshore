# EXPERT Academic Workflow Implementation Report

## Previous State

See `CURRENT_SYSTEM_STATE.md`, written before this implementation. The project already had persistent admissions, a schema-backed application form, head-teacher/subject-teacher assignments, staged subjects, date-released weeks and chapters, a `CourseMaterial` lesson model, assessments, grading, notifications, and bKash payment/enrollment services. This pass extended those systems; it did not add a duplicate Admission or Lesson model.

## Admin Changes

Existing admin admission cards, form builder, application review, head-teacher assignment and payment oversight were retained. The form source of truth remains `Course.admission_form_schema`; no frontend-only copy was introduced. Existing persistence tests are included in the 72-test suite.

## Head Teacher Changes

Only an assigned head teacher (or existing staff override) can now create/update scheduled weeks and chapters. Previously an ordinary assigned subject teacher could change the weekly release schedule. The existing course-outline editor now offers a rich-text chapter introduction. Head Teacher can use the existing material editor to upload a chapter-linked video or PDF and approve teacher-authored material.

## Teacher Changes

Existing assigned-subject question bank, normal/live/scheduled MCQ, assignments, submissions, grading and review flows remain. The material editor accepts an MP4/WebM upload in place of a mandatory external video URL; ordinary subject-teacher uploads continue through the existing pending-review workflow.
The weekly curriculum section shows those teachers the schedule without edit controls; their existing public syllabus-item editor remains available for assigned content.

## Student Changes

The course player renders uploaded MP4/WebM files in a native video control, displays PDFs inline with an open/download link, and shows sanitized chapter introductions inside the outline. Released material file URLs are one-hour signed URLs, checked again for active enrollment, matching course/section, approval, publication and week release on every request. Video byte ranges are supported for playback and seeking. The student materials list uses the same signed URL path.

## Admission Workflow and Payment Integration

The existing `AdmissionApplicationViewSet`, `AdmissionService`, `PaymentService`, `BkashAgreement` and `AdmissionPaymentTransaction` were reused. Approval of a paid application waits for verified payment. The backend marks the transaction completed and calls `PaymentService.complete_admission_payment()` to activate an enrollment, with retry/idempotent behavior. Mock-payment, failed-payment, callback and enrollment tests are in the passing payment suite. No live bKash transaction was attempted; sandbox/live require merchant credentials and provider access.

## Automatic Enrollment

For paid admissions, the existing centralized `PaymentService.complete_admission_payment()` activates enrollment only after a verified completed transaction. Duplicate/retry behavior remains covered by the payment tests. Free-admission activation continues through `AdmissionService`.

## Course Outline, Subject Assignment, Chapters and Lessons

`Course` → `CourseSection` → `CourseSubject` → `SubjectWeek` → `CourseChapter` remains the curriculum hierarchy. `CourseMaterial` and `Assessment` link to a chapter. `TeacherAssignment` remains the single assignment record. A chapter introduction is stored in the existing `CourseChapter.description` field; lesson text/PDF/video is stored in the existing `CourseMaterial` record. No database model or migration was needed.

## Video and PDF Support

Material uploads go through the Django `FileField`/`MEDIA_ROOT`, rather than requiring files to be copied into React `public/`. Backend validation checks extension, signature and size: MP4/WebM up to 100 MB; PDF/PNG/JPEG/WebP up to 25 MB. The existing user-supplied `frontend/public/academic/prob ch-2.pdf` and `istockphoto-931134082-640_adpp_is.mp4` were preserved and not auto-published. Signed student delivery and byte-range streaming are in `apps.courses.material_media`. In DEBUG, direct `/media/assessments/materials/` paths are denied so the development server cannot bypass the signed endpoint.

## Media Handling

Uploaded lesson media stays in the configured Django file storage and is served through short-lived, signed application URLs. Existing React `public/` assets stay in place. Production web-server/CDN access rules must deny direct reads from the private lesson-material directory.

## React Quill Integration

This pass added the existing reusable `RichTextEditor` to **Teacher course outline → Chapter introduction** (`CurriculumManager`). The existing editor already serves admin admission description and teacher question text/explanation, assessment description/instructions, material description, feedback and notices. The student chapter introduction uses the existing DOMPurify-backed `SafeHtml` component. No second editor dependency was added.

## MCQ System, Assignments, Grading and Notifications

Normal/practice, live and scheduled modes, attempt timing, answer storage, assignment submission and teacher grading were retained. Submission validation now rejects a file whose PDF/image extension does not match its header, in addition to existing type and 10 MB size checks. The existing grade service updates one submission and creates a grading notification. Tests exercised a PDF submission and subsequent grading/analytics. A full interactive timer/autosave/refresh browser journey was not run in this pass.

## Assignment Workflow and PDF Submission

The existing teacher-created assignment and student submission APIs remain authoritative. A valid PDF submission and its downstream review were exercised in the regression tests. Disguised PDFs now fail upload validation.

## Teacher Grading and Notifications

`AssignmentSubmission` remains the single graded record. Teacher grading and feedback use the existing evaluation service, which creates the student's grading notification. No parallel grading or notification store was added.

## Permissions and Security

- Weekly scheduling/chapter writes now require head-teacher course assignment (existing staff override retained).
- Student file streaming uses signed, time-limited URLs, with the authorization and release gates re-evaluated at fetch time. A revoked enrollment or unpublished week immediately prevents access, even with an unexpired URL.
- Staff/teacher material-preview URLs are also signed. Teacher access is checked against current assignments.
- PDF/image/video uploads reject disguised file headers. Student rich text is sanitized before rendering.
- Deployment must block public web-server/CDN access to raw `MEDIA_ROOT/assessments/materials/` paths. The DEBUG-only Django denial does not configure nginx, Apache, object storage or CDN rules.

## Database Changes and Migrations

None. `makemigrations --check --dry-run` reported “No changes detected.” Existing table relationships were reused.

## API Changes

Added `GET /api/v1/courses/student/materials/:material_id/file/?token=...` for signed streaming. The student course content and student materials APIs now return signed file URLs and `file_name` for uploaded materials. Existing material write API now validates file signatures and permits uploaded video without a URL. Curriculum week/chapter write authorization was tightened.

## Frontend Changes and Query/State Fixes

The material editor accepts video uploads and labels the supported formats/limits. The course player switches between native uploaded video, external iframe, image and PDF viewers according to the material. Chapter descriptions now arrive in the course content payload and display in the existing animated outline. No new client cache was introduced; existing API reload/refetch behavior remains.

## Bugs Found and Fixed

1. Uploaded videos were blocked by frontend URL validation and, if present, rendered as an iframe. They now upload and play as videos.
2. Subject teachers could alter the weekly release schedule. Head-teacher ownership is enforced on writes.
3. Material and submission upload checks did not verify the actual file header. Disguised files are now rejected.
4. Student material APIs exposed plain media paths. They now issue signed access URLs; direct lesson-material media paths are denied by Django in DEBUG.
5. Chapter introduction was plain text and absent from the student outline. It is now rich text and sanitized on display.

## Tests Performed

| Check | Result | Evidence / limit |
| --- | --- | --- |
| `manage.py check` | PASS | No issues reported after final backend edits. |
| `manage.py makemigrations --check --dry-run` | PASS | No model changes detected. |
| `manage.py test apps.courses apps.assessments apps.admissions apps.payments --noinput` | PASS | 72 tests before the final media-endpoint refinement. Includes admission form, role scope, weekly release, payment verification/idempotency, MCQ, grading and notifications. Expected negative-case log messages appeared; test exit was OK. |
| Focused curriculum/assignment tests after final media edits | PASS | 7 tests, including signed video range, release/enrollment revocation, staff preview, direct media denial, disguised video/PDF rejection and PDF assignment/grading. |
| `manage.py test --noinput` | PASS | Final full Django suite: 83 tests. Expected negative-case payment logs and unordered-pagination warnings appeared; exit was OK. |
| `npm run build` | PASS | Vite production build. Existing large-chunk and unresolved `fragment-mono.woff2` warnings remain. |
| Local public site | PASS (smoke only) | `http://127.0.0.1:5173/` loaded; browser console had no error entries during inspection. A sample published admission detail also loaded. |
| Complete four-role browser journey | NOT RUN | Authenticated admin/head-teacher/teacher/student UI workflow was not exercised end-to-end in a browser during this pass. Backend tests cover its principal state transitions. |
| Live bKash transaction | NOT RUN | Merchant credentials/provider environment were not supplied; no real-money success is claimed. |

## Remaining Issues and Production Recommendations

- Configure private media storage or web-server/CDN rules so raw lesson material files cannot be fetched outside the signed API in production. Apply the same review to assignment attachments and any other private `FileField`s. Signed URLs are bearer links; keep their one-hour lifetime and avoid logging query strings.
- The sampled published admission `E2E Medical Admission 2027` currently displays “Application Form Not Ready Yet”; its own form schema must be configured by an admin before applicants can use that particular card. This was observed in the public browser, and no form configuration was invented during this pass.
- For growing video libraries, the same `CourseMaterial` business model can use S3-compatible or Cloudinary storage; suitable public video may be hosted on YouTube/Vimeo. Large videos should use storage/CDN streaming rather than long-lived Django worker streams.
- Run a credentialed browser journey through all four roles, including refresh/deep links, playback on target browsers, live/scheduled timers, submission preview, grading, notices and receipt UI. Verify sandbox/live bKash only with approved merchant credentials.
- Resolve the existing Vite large-chunk and `fragment-mono.woff2` warnings when optimizing production assets.

## Acceptance checklist (executed evidence only)

- [x] Baseline documented first; supplied academic video/PDF identified and preserved.
- [x] Existing admission/payment/enrollment/assessment services reused; no duplicate models or migrations.
- [x] Head-teacher week/chapter write scope, teacher subject scope and student release/enrollment gates covered by backend tests.
- [x] Video upload, signed playback byte range, PDF assignment submission and disguised-file rejection covered by tests.
- [x] Chapter rich text added and sanitized in the student outline.
- [x] Django checks, migration check, 83-test full suite, final 7-test focused suite and frontend build passed.
- [ ] Complete authenticated four-role browser workflow and live bKash provider verification; see limits above.
