# PostgreSQL / Neon / ImgBB migration state (pre-change audit)

Audited 2026-10-02 before any code change. Exact row counts: [MYSQL_DATA_COUNTS_BEFORE_MIGRATION.md](MYSQL_DATA_COUNTS_BEFORE_MIGRATION.md).

## Current database

| Item | Value |
|---|---|
| Engine | `django.db.backends.mysql` (MySQL 8.0.39 on localhost:3306, service `MySQL80`) |
| Database | `expert_coaching`, charset `utf8mb4` |
| Driver | `PyMySQL` via `pymysql.install_as_MySQLdb()` in `config/settings.py` |
| Tables | 128 (127 Django models incl. auto M2M tables + `django_migrations`) |
| Migration state | 48 applied rows in `django_migrations`; `makemigrations --check` clean before the audit |
| Django / DRF | Django 5.1, DRF 3.15, SimpleJWT, django-filter, drf-spectacular |
| Backup | `db_backups/mysql_backup_before_postgres.sql` (mysqldump, 747 KB, git-ignored) |

## Existing data (key tables, live counts at time of final copy)

| Domain | Table | Rows |
|---|---|---:|
| Users | `accounts_user` | 99 |
| Teachers | `people_employee` (teachers) / `people_teacherprofile` | 23 / 3 |
| Students | `people_student` / `people_studentprofile` | 67 / 46+ |
| Admissions (courses) | `courses_course` | 14 |
| Admission applications | `admissions_admissionapplication` | 19 |
| Head-teacher / teacher assignments | `courses_teacherassignment` | 39 |
| Enrollments | `courses_enrollment` | 92 |
| Chapters / lessons / materials | `courses_coursesyllabusitem`, `assessments_coursematerial` | 2 / 6 |
| Questions / options | `assessments_question` / `assessments_questionoption` | 35 / 129 |
| Tests (assessments) | `assessments_assessment` | 18 |
| Attempts / answers | `assessments_assessmentattempt` / `assessments_studentanswer` | 30 / 35 |
| Assignment submissions | `assessments_assignmentsubmission` | 13 |
| Results | `assessments_studentcourseresult` / `..componentresult` | 4 / 8 |
| Notifications | `messaging_notification` | see counts file |
| Payments | `payments_admissionpaymenttransaction` / `payments_bkashagreement` | 5 / 5 |

The MySQL database is live (counts moved while auditing). Freeze writes before the final copy.

## MySQL-specific findings

| # | Finding | Action |
|---|---|---|
| 1 | Engine/driver hard-wired to MySQL + PyMySQL shim | `DATABASE_URL` → PostgreSQL (psycopg 3); MySQL kept only as pre-cutover fallback and `legacy_mysql` migration alias |
| 2 | No `RunSQL`, raw SQL, `.raw()`, `.extra()`, `RawSQL`, triggers, unsigned columns or custom collations in app code/migrations | none needed; all 48+ migrations ran unchanged on PostgreSQL |
| 3 | **Case-insensitive email login** came implicitly from MySQL's collation (`User.objects.get(email=…)`) | `CaseInsensitiveEmailBackend` keeps `Foo@x.com` == `foo@x.com` |
| 4 | **`select_for_update()` + `select_related()` over a nullable FK** is illegal on PostgreSQL (`FOR UPDATE cannot be applied to the nullable side of an outer join`) – broke 11 payment/admission tests | `select_for_update(of=("self",))` in `payments/services.py`, `admissions/services.py` |
| 5 | Explicit PKs copied → PostgreSQL identity sequences are behind | migration command resets all 129 sequences |
| 6 | `ContentType` / `auth_permission` ids differ between DBs (created by `post_migrate`) | command replaces them with the legacy rows so FKs stay valid |
| 7 | `auto_now`/`auto_now_add` would overwrite timestamps on insert | command disables them while copying |
| 8 | NULL ordering (MySQL NULLs first, PostgreSQL last) and unordered paginated querysets (pre-existing `UnorderedObjectListWarning` for `User`, `Role`, `Assessment`) | documented as remaining risk |
| 9 | MySQL `PAD SPACE`/ci uniqueness no longer applies to other unique text columns | documented as remaining risk |

## Existing image storage

All image columns are Django `ImageField`s that stored files under `backend/media/…`, uploaded as multipart `FormData` straight to the model serializer, served by `MEDIA_URL`.

| Feature | Model.field | Previous behaviour | Now |
|---|---|---|---|
| User avatar | `accounts.User.avatar` | local `users/avatars/` | `HostedImageField` |
| Admission applicant photo | `admissions.AdmissionApplication.photo` | local | `HostedImageField` |
| Course/admission thumbnail, cover, hero | `courses.Course.thumbnail / cover_image / hero_image` | local | `HostedImageField` + `<ImageUploader>` in the admission editor |
| Subject/course content images | (courses use the Course fields above) | – | – |
| Question image / diagram | `assessments.Question.image / diagram` | local | `HostedImageField` |
| Option image | `assessments.QuestionOption.image` | local | `HostedImageField` |
| Test question image | `assessments.Assessment.question_image` | local | `HostedImageField` |
| Student photos | `people.StudentProfile.photo`, `people.Student.photo` | local | `HostedImageField` |
| Teacher/employee photo | `people.Employee.photo` | local | `HostedImageField` |
| Organization logo/favicon | `organizations.Organization.logo / favicon` | local | `HostedImageField` |
| Website content/banner/story/teacher | `website.ContentItem.image`, `Banner.image`, `SuccessStory.photo`, `RenownedTeacher.image` | local | `HostedImageField` |
| Gallery (photos **and** videos) | `website.GalleryItem.file` (`FileField`) | local | `HostedMediaField`: real images → ImgBB, videos/other → local |

Public URL behaviour: DRF returns `field.url`; local values resolve to `/media/…` (unchanged), ImgBB values are absolute `https://i.ibb.co/…` URLs and are returned verbatim.

## Existing non-image uploads (never moved to ImgBB)

| Use | Model.field |
|---|---|
| Assignment submission PDFs | `assessments.SubmissionAttachment.file` (validated by `validate_submission_file`) |
| Study material (PDF / video / image, enrollment-gated delivery) | `assessments.CourseMaterial.file` |
| Question attachment, test question/supporting files | `assessments.Question.attachment`, `Assessment.question_file / supporting_file` |
| Syllabus files | `courses.CourseSyllabusItem.file`, `academic.Syllabus.file` |
| Admission / student documents | `admissions.ApplicantDocument.file`, `people.StudentDocument.file` |

These remain `FileField` on the existing local storage. Study materials may be images but are paid, enrollment-scoped content, so they deliberately stay private.
