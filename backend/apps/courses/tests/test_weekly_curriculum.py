from datetime import timedelta
from tempfile import TemporaryDirectory
from urllib.parse import urlsplit
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from django.utils import timezone
from rest_framework.test import APITestCase
from apps.organizations.models import Organization
from apps.people.models import Employee, Student
from apps.courses.models import Course, CourseSection, CourseSubject, SubjectWeek, CourseChapter, TeacherAssignment, Enrollment
from apps.assessments.models import CourseMaterial, Assessment


class WeeklyCurriculumTests(APITestCase):
    def setUp(self):
        self.org = Organization.objects.create(name="Curriculum test", code="curriculum-test")
        self.course = Course.objects.create(organization=self.org, title="Admission", slug="curriculum")
        self.section = CourseSection.objects.create(organization=self.org, course=self.course, name="Science")
        self.subject = CourseSubject.objects.create(organization=self.org, course_section=self.section, name="Physics", code="P")
        self.other = CourseSubject.objects.create(organization=self.org, course_section=self.section, name="Chemistry", code="C")
        self.teacher_user = get_user_model().objects.create_user(username="curriculumteacher", email="curriculumteacher@example.com", organization=self.org)
        self.teacher = Employee.objects.create(organization=self.org, employee_id="CUR-T", full_name="Teacher", email=self.teacher_user.email, employee_type="teacher")
        TeacherAssignment.objects.create(organization=self.org, teacher=self.teacher, course=self.course, course_section=self.section, subject=self.subject, role="subject_teacher", assignment_status="accepted")
        self.user = get_user_model().objects.create_user(username="curriculumstudent", email="curriculumstudent@example.com", organization=self.org)
        self.student = Student.objects.create(organization=self.org, student_id="CUR-S", full_name="Student", email=self.user.email)
        self.enrollment = Enrollment.objects.create(organization=self.org, student=self.student, course=self.course, course_section=self.section, enrollment_number="CUR-E", status="active")
        self.week = SubjectWeek.objects.create(organization=self.org, subject=self.subject, number=1, title="Foundation", release_at=timezone.now()+timedelta(days=1), is_published=True)
        self.chapter = CourseChapter.objects.create(organization=self.org, week=self.week, title="Motion")
        self.material = CourseMaterial.objects.create(organization=self.org, course=self.course, course_section=self.section, subject=self.subject, curriculum_chapter=self.chapter, title="Motion notes", is_published=True, status="published", review_status="approved")
        self.assessment = Assessment.objects.create(organization=self.org, course=self.course, course_section=self.section, subject=self.subject, curriculum_chapter=self.chapter, title="Motion test", status="published", review_status="approved")

    def test_teacher_scope_and_required_date(self):
        self.client.force_authenticate(self.teacher_user)
        payload = {"subject":self.subject.pk,"title":"Week two","number":2,"is_published":True}
        self.assertEqual(self.client.post("/api/v1/courses/weeks/", payload).status_code, 400)
        payload["release_at"] = timezone.now().isoformat()
        self.assertEqual(self.client.post("/api/v1/courses/weeks/", payload).status_code, 403)
        TeacherAssignment.objects.create(organization=self.org, teacher=self.teacher, course=self.course,
                                         course_section=self.section, role="head_teacher", assignment_status="accepted")
        self.assertEqual(self.client.post("/api/v1/courses/weeks/", payload).status_code, 201)
        payload["subject"] = self.other.pk
        payload["number"] = 3
        self.assertEqual(self.client.post("/api/v1/courses/weeks/", payload).status_code, 201)
        response = self.client.patch(f"/api/v1/assessments/materials/{self.material.pk}/", {"subject": self.other.pk}, format="json")
        self.assertIn(response.status_code, (400, 404))

    def test_release_gate_covers_course_materials_and_direct_test_access(self):
        self.client.force_authenticate(self.user)
        url = f"/api/v1/courses/student/dashboard/{self.enrollment.pk}/content/"
        data = self.client.get(url).data
        self.assertEqual(data["materials"], [])
        self.assertEqual(data["assessments"], [])
        self.assertTrue(data["weeks"][0]["locked"])
        self.assertEqual(data["weeks"][0]["chapters"], [])
        self.assertEqual(self.client.post(f"/api/v1/assessments/student/assessments/{self.assessment.pk}/start/").status_code, 404)
        mark_url = f"/api/v1/courses/student/dashboard/{self.enrollment.pk}/materials/{self.material.pk}/view/"
        self.assertEqual(self.client.post(mark_url).status_code, 404)
        self.week.release_at = timezone.now()-timedelta(seconds=1)
        self.week.save()
        data = self.client.get(url).data
        self.assertEqual(len(data["materials"]), 1)
        self.assertEqual(len(data["assessments"]), 1)
        self.assertFalse(data["weeks"][0]["locked"])
        self.assertEqual(self.client.post(mark_url).status_code, 200)
        self.week.is_published = False
        self.week.save()
        self.assertEqual(self.client.get(url).data["materials"], [])

    def test_student_cannot_manage_curriculum(self):
        self.client.force_authenticate(self.user)
        response = self.client.post("/api/v1/courses/chapters/", {"week":self.week.pk,"title":"Forbidden"})
        self.assertEqual(response.status_code, 403)

    def test_uploaded_video_stream_requires_released_week_and_active_enrollment(self):
        TeacherAssignment.objects.create(organization=self.org, teacher=self.teacher, course=self.course,
                                         course_section=self.section, role="head_teacher", assignment_status="accepted")
        with TemporaryDirectory() as media_root, override_settings(MEDIA_ROOT=media_root):
            self.client.force_authenticate(self.teacher_user)
            video = SimpleUploadedFile("lesson.mp4", b"\x00\x00\x00\x18ftypisom" + b"lesson video bytes", content_type="video/mp4")
            created = self.client.post("/api/v1/assessments/materials/", {
                "course": self.course.pk, "course_section": self.section.pk, "subject": self.subject.pk,
                "curriculum_chapter": self.chapter.pk, "title": "Motion video", "material_type": "video",
                "file": video,
            }, format="multipart")
            self.assertEqual(created.status_code, 201, created.data)
            video_id = created.data["id"]
            pdf = SimpleUploadedFile("motion.pdf", b"%PDF-1.4 lesson notes", content_type="application/pdf")
            pdf_created = self.client.post("/api/v1/assessments/materials/", {
                "course": self.course.pk, "course_section": self.section.pk, "subject": self.subject.pk,
                "curriculum_chapter": self.chapter.pk, "title": "Motion notes PDF", "material_type": "file",
                "file": pdf,
            }, format="multipart")
            self.assertEqual(pdf_created.status_code, 201, pdf_created.data)
            staff_url = urlsplit(created.data["file"])
            staff_stream = self.client.get(staff_url.path + "?" + staff_url.query)
            self.assertEqual(staff_stream.status_code, 200)
            self.assertIn(b"ftyp", b"".join(staff_stream.streaming_content))
            self.assertEqual(self.client.get("/media/assessments/materials/lesson.mp4").status_code, 404)
            self.client.force_authenticate(self.user)
            content_url = f"/api/v1/courses/student/dashboard/{self.enrollment.pk}/content/"
            self.assertNotIn(video_id, [row["id"] for row in self.client.get(content_url).data["materials"]])
            self.week.release_at = timezone.now() - timedelta(minutes=1)
            self.week.save(update_fields=["release_at"])
            data = self.client.get(content_url).data
            row = next(row for row in data["materials"] if row["id"] == video_id)
            self.assertEqual(row["file_name"], "lesson.mp4")
            pdf_row = next(row for row in data["materials"] if row["id"] == pdf_created.data["id"])
            self.assertEqual(pdf_row["file_name"], "motion.pdf")
            pdf_url = urlsplit(pdf_row["file"])
            pdf_stream = self.client.get(pdf_url.path + "?" + pdf_url.query)
            self.assertEqual(pdf_stream.status_code, 200)
            self.assertEqual(pdf_stream["Content-Type"], "application/pdf")
            self.assertTrue(b"".join(pdf_stream.streaming_content).startswith(b"%PDF-"))
            signed_path = urlsplit(row["file"]).path + "?" + urlsplit(row["file"]).query
            streamed = self.client.get(signed_path, HTTP_RANGE="bytes=0-3")
            self.assertEqual(streamed.status_code, 206)
            self.assertEqual(b"".join(streamed.streaming_content), b"\x00\x00\x00\x18")
            self.week.is_published = False
            self.week.save(update_fields=["is_published"])
            self.assertEqual(self.client.get(signed_path).status_code, 404)
            self.week.is_published = True
            self.week.save(update_fields=["is_published"])
            self.enrollment.status = "cancelled"
            self.enrollment.save(update_fields=["status"])
            self.assertEqual(self.client.get(signed_path).status_code, 404)

    def test_material_upload_rejects_disguised_video(self):
        TeacherAssignment.objects.create(organization=self.org, teacher=self.teacher, course=self.course,
                                         course_section=self.section, role="head_teacher", assignment_status="accepted")
        self.client.force_authenticate(self.teacher_user)
        fake_video = SimpleUploadedFile("lesson.mp4", b"not an mp4", content_type="video/mp4")
        response = self.client.post("/api/v1/assessments/materials/", {
            "course": self.course.pk, "course_section": self.section.pk, "subject": self.subject.pk,
            "title": "Fake video", "material_type": "video", "file": fake_video,
        }, format="multipart")
        self.assertEqual(response.status_code, 400, response.data)
