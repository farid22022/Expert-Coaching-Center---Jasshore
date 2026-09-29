from datetime import timedelta
from django.contrib.auth import get_user_model
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
        self.assertEqual(self.client.post("/api/v1/courses/weeks/", payload).status_code, 201)
        payload["subject"] = self.other.pk
        self.assertEqual(self.client.post("/api/v1/courses/weeks/", payload).status_code, 403)
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
