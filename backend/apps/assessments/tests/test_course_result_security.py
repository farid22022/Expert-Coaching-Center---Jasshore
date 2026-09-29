from decimal import Decimal

from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

from apps.assessments.models import (
    AssessmentComponent,
    ComponentSourceType,
    CourseGradeScale,
    CourseGradeScaleItem,
    CourseResultStatus,
    StudentCourseResult,
)
from apps.courses.models import AcademicStage, Course, CourseSection, CourseSubject, Enrollment
from apps.organizations.models import Organization
from apps.people.models import Department, Designation, Employee, Student


class CourseResultSecurityTests(APITestCase):
    """
    Spec §59-60/§87: a student may only reach their OWN enrollment's academic overview
    and course result, never another student's or another course's, even by manipulating
    the enrollment_id/subject_id in the URL. Draft/calculated (unpublished) results must
    never leak a percentage/grade to the student.
    """

    def setUp(self):
        self.organization = Organization.objects.create(name="E2E_TEST Course Result Org", code="e2e-test-course-result-org")

        User = get_user_model()
        self.student_a_user = User.objects.create_user(username="cr_student_a", email="cr.student.a@example.com", password="2633123", organization=self.organization)
        self.student_b_user = User.objects.create_user(username="cr_student_b", email="cr.student.b@example.com", password="2633123", organization=self.organization)

        self.course = Course.objects.create(organization=self.organization, title="Medical Admission CR Test", slug="medical-admission-cr-test", status="running", is_published=True)
        self.section = CourseSection.objects.create(organization=self.organization, course=self.course, name="Science")
        self.stage = AcademicStage.objects.create(organization=self.organization, course=self.course, name="Foundation Phase", order=1)
        self.physics = CourseSubject.objects.create(organization=self.organization, course_section=self.section, academic_stage=self.stage, name="Physics", code="PHY-CR")

        self.student_a = Student.objects.create(organization=self.organization, student_id="CR-STU-A", full_name="CR Student A", email=self.student_a_user.email)
        self.student_b = Student.objects.create(organization=self.organization, student_id="CR-STU-B", full_name="CR Student B", email=self.student_b_user.email)
        self.enrollment_a = Enrollment.objects.create(organization=self.organization, student=self.student_a, course=self.course, course_section=self.section, enrollment_number="CR-ENR-A", status="active")
        self.enrollment_b = Enrollment.objects.create(organization=self.organization, student=self.student_b, course=self.course, course_section=self.section, enrollment_number="CR-ENR-B", status="active")

        grade_scale = CourseGradeScale.objects.create(organization=self.organization, course=self.course, name="Default")
        CourseGradeScaleItem.objects.create(organization=self.organization, grade_scale=grade_scale, min_percentage=80, max_percentage=100, grade="A+", grade_point=Decimal("5.00"))
        CourseGradeScaleItem.objects.create(organization=self.organization, grade_scale=grade_scale, min_percentage=0, max_percentage=79.99, grade="A", grade_point=Decimal("4.00"))

        AssessmentComponent.objects.create(
            organization=self.organization, course_subject=self.physics, name="Final", code="FINAL",
            total_marks=100, weight_percentage=100, source_type=ComponentSourceType.MANUAL,
        )

        self.published_result_a = StudentCourseResult.objects.create(
            organization=self.organization, enrollment=self.enrollment_a, course_subject=self.physics,
            status=CourseResultStatus.PUBLISHED, total_percentage=Decimal("82.00"), grade="A+", grade_point=Decimal("5.00"), pass_status="passed",
        )
        self.draft_result_b = StudentCourseResult.objects.create(
            organization=self.organization, enrollment=self.enrollment_b, course_subject=self.physics,
            status=CourseResultStatus.CALCULATED, total_percentage=Decimal("55.00"), grade="B", grade_point=Decimal("3.00"), pass_status="passed",
        )

        department = Department.objects.create(organization=self.organization, name="Academic")
        designation = Designation.objects.create(organization=self.organization, name="Teacher")
        self.other_teacher = Employee.objects.create(organization=self.organization, employee_id="CR-TCH-002", full_name="Unrelated Teacher", employee_type="teacher", email="cr.teacher.unrelated@example.com", department=department, designation=designation)

    def login(self, user):
        response = self.client.post("/api/v1/auth/login/", {"email": user.email, "password": "2633123"}, format="json")
        self.assertEqual(response.status_code, 200, response.data)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.data['access']}")

    def test_student_cannot_fetch_another_students_enrollment_overview(self):
        self.login(self.student_a_user)
        response = self.client.get(f"/api/v1/courses/student/dashboard/{self.enrollment_b.id}/academic-overview/")
        self.assertEqual(response.status_code, 403, response.data)

    def test_student_cannot_fetch_another_students_course_result(self):
        self.login(self.student_a_user)
        response = self.client.get(f"/api/v1/courses/student/dashboard/{self.enrollment_b.id}/subjects/{self.physics.id}/result/")
        self.assertEqual(response.status_code, 403, response.data)

    def test_student_own_academic_overview_shows_published_percentage_and_grade(self):
        self.login(self.student_a_user)
        response = self.client.get(f"/api/v1/courses/student/dashboard/{self.enrollment_a.id}/academic-overview/")
        self.assertEqual(response.status_code, 200, response.data)
        physics_row = next(s for stage in response.data["stages"] for s in stage["subjects"] if s["id"] == self.physics.id)
        self.assertEqual(physics_row["percentage"], "82.00")
        self.assertEqual(physics_row["grade"], "A+")

    def test_unpublished_result_never_leaks_percentage_or_grade_to_student(self):
        self.login(self.student_b_user)
        overview = self.client.get(f"/api/v1/courses/student/dashboard/{self.enrollment_b.id}/academic-overview/")
        self.assertEqual(overview.status_code, 200, overview.data)
        physics_row = next(s for stage in overview.data["stages"] for s in stage["subjects"] if s["id"] == self.physics.id)
        self.assertIsNone(physics_row["percentage"])
        self.assertIsNone(physics_row["grade"])

        detail = self.client.get(f"/api/v1/courses/student/dashboard/{self.enrollment_b.id}/subjects/{self.physics.id}/result/")
        self.assertEqual(detail.status_code, 200, detail.data)
        self.assertIsNone(detail.data["total_percentage"])
        self.assertIsNone(detail.data["grade"])
        self.assertEqual(detail.data["result_status"], "calculated")

    def test_student_cannot_reach_subject_outside_their_course_via_manipulated_id(self):
        other_course = Course.objects.create(organization=self.organization, title="Unrelated Course CR", slug="unrelated-course-cr", status="running", is_published=True)
        other_section = CourseSection.objects.create(organization=self.organization, course=other_course, name="Other")
        other_subject = CourseSubject.objects.create(organization=self.organization, course_section=other_section, name="Chemistry", code="CHM-CR")

        self.login(self.student_a_user)
        response = self.client.get(f"/api/v1/courses/student/dashboard/{self.enrollment_a.id}/subjects/{other_subject.id}/result/")
        self.assertEqual(response.status_code, 404, response.data)

    def test_unrelated_teacher_cannot_access_gradebook(self):
        User = get_user_model()
        teacher_user = User.objects.create_user(username="cr_unrelated_teacher", email=self.other_teacher.email, password="2633123", organization=self.organization)
        self.login(teacher_user)
        response = self.client.get(f"/api/v1/assessments/gradebook/{self.physics.id}/")
        self.assertEqual(response.status_code, 403, response.data)

    def test_student_cannot_submit_rating_for_another_students_enrollment(self):
        self.login(self.student_a_user)
        response = self.client.post("/api/v1/assessments/student/course-ratings/", {
            "enrollment": self.enrollment_b.id, "course_subject": self.physics.id, "rating": 5,
        }, format="json")
        self.assertIn(response.status_code, (403, 400), response.data)
