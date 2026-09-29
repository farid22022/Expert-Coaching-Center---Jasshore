# Bug fixes and validation

## Admission form persistence repair — 2026-09-28

Confirmed cause: the editor and CourseSerializer silently filtered fields with blank labels and sections without valid fields. Admins could receive a success message while saving an empty schema. Section headings were visually easy to mistake for field labels.

- Frontend validates every section and field before uploading or saving. It shows an exact section/field error and keeps the entered form intact.
- Backend rejects incomplete schemas instead of removing fields; an invalid PATCH preserves the previous saved form.
- Editor labels distinguish section headings from applicant fields. Save messages report the actual persisted field count, and editing the schema clears stale success notices.
- GST C Unit (local course 15, `gst-c-unit`) had an empty schema. Restored Full name and Phone as required fields using the normal serializer. Previous value retained in `audit/gst-c-form-before-repair.json`; guarded repair script in `audit/repair_gst_c_form.py` refuses to overwrite an existing form.
- Browser verified both fields and Submit Application on the applicant page, both saved fields in the admin editor, and a precise error when attempting to save a blank field label. No real applicant submission was created.
- Three Django regression tests passed: JSON persistence/reload/public exposure/application submission, multipart persistence, and invalid edits retaining saved data. Three frontend schema tests plus six session tests passed.

Student UI continuation: adapted the logged-in reference layout with current course, course grid, announcements and real submission analytics; full-viewport sidebar and independently scrolling content; shared student route shell, component entrances, lesson transitions, and disclosure/drawer exits. Browser measured sidebar top/left at 0 and height equal to the 884px viewport, with no horizontal overflow.

Status: implementation work is ongoing; this is not a production certification.

- Authentication: single-flight token refresh, rotated-token persistence, logout race protection, and separation of invalid credentials from expired sessions. Six automated session tests pass.
- Course access: server-side weekly release checks for student content, test access, and material completion; teacher curriculum writes restricted to assigned subjects. Legacy unscheduled content remains supported.
- Curriculum: subject weeks with teacher-selected release dates, chapters, and links from teacher materials, questions, and assessments. Question-bank material format added. Migrations were applied locally.
- Forms and navigation: shared modal keyboard handling; role checks use server identity; CRUD save errors retained; head-teacher assignment scope retained.
- Presentation: shared admin spacing, radii, table/form/focus styles; common headings and empty states; restrained page/card/modal/backdrop transitions using existing Framer Motion. Authentication backgrounds no longer run continuous shader animation.

Evidence: full backend suite passed 69 tests in `audit/backend-weekly-final.txt` before the final assessment target-scope change. Targeted rerun and final frontend build are recorded separately when complete. Browser verification previously covered student MCQ save/resume/submit. The weekly teacher form browser save did not complete successfully and requires another authenticated check; API tests alone do not establish end-to-end completion. The current browser session shows a failed login.

Remaining: exhaustive route/role/responsive QA, weekly form browser verification, direct media URL access policy, and preexisting placeholders outside this change. No production deployment or real student grade edits were performed.

Final continuation checks (2026-09-28): six session tests passed and `git diff --check` passed (line-ending warnings only). Final Vite production builds completed in `audit/build-resume-final` and `audit/build-resume-final-2`; the targeted weekly-curriculum and head-teacher suite passed 5 tests in 0.680 seconds. The homepage now stops an admission-card request from remaining in a loading state indefinitely. Authenticated browser QA still requires a valid test session.
