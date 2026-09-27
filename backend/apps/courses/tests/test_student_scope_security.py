from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

from apps.accounts.models import Permission, Role
from apps.courses.models import Course, CourseSection, CourseSubject, CourseSyllabusItem, Enrollment, TeacherAssignment
from apps.organizations.models import Organization
from apps.people.models import Department, Designation, Employee, Student


class StudentCannotReachAdminCourseSurfaceTests(APITestCase):
    """
    Regression test for a confirmed, exploitable authorization gap on the courses side.
    CourseViewSet/CourseSectionViewSet/CourseSubjectViewSet/TeacherAssignmentViewSet/
    EnrollmentViewSet had no get_queryset override beyond organization filtering, so any
    student holding the (previously seeded) `course.view` permission could list every
    enrollment, teacher assignment, and draft/unpublished course/section/subject in the
    org. CourseSyllabusItemViewSet was worse: it had no permission_module at all, so its
    "no teacher -> check generic permission" fallback trivially passed for ANY
    authenticated user, letting a student create/edit/delete any chapter. This test
    proves all of that is now closed, while staff/teacher access still works.
    """

    def setUp(self):
        self.organization = Organization.objects.create(name="E2E_TEST Course Scope Org", code="e2e-test-course-scope-org")
        student_role = Role.objects.create(organization=self.organization, name="Student", code="scope-student-course")
        for code in ("course.view", "course.create", "course.edit"):
            permission = Permission.objects.get_or_create(code=code, defaults={"name": code, "module": "course"})[0]
            student_role.permissions.add(permission)

        User = get_user_model()
        self.student_user = User.objects.create_user(username="scope_student3", email="scope.student3@example.com", password="2633123", organization=self.organization)
        self.student_user.roles.add(student_role)

        teacher_role = Role.objects.create(organization=self.organization, name="Teacher", code="scope-teacher-course")
        for code in ("course.view", "course.create", "course.edit"):
            permission = Permission.objects.get_or_create(code=code, defaults={"name": code, "module": "course"})[0]
            teacher_role.permissions.add(permission)

        department = Department.objects.create(organization=self.organization, name="Academic")
        designation = Designation.objects.create(organization=self.organization, name="Teacher")
        self.teacher_user = User.objects.create_user(username="scope_teacher3", email="scope.teacher3@example.com", password="2633123", organization=self.organization)
        self.teacher_user.roles.add(teacher_role)
        self.teacher = Employee.objects.create(organization=self.organization, employee_id="CST-TCH-001", full_name="Scope Teacher", employee_type="teacher", email=self.teacher_user.email, department=department, designation=designation)

        self.course = Course.objects.create(organization=self.organization, title="HSC Science 2027", slug="hsc-science-course-scope-test", status="running", is_published=True)
        self.section = CourseSection.objects.create(organization=self.organization, course=self.course, name="Science")
        self.subject = CourseSubject.objects.create(organization=self.organization, course_section=self.section, name="Physics", code="PHY-CST")
        TeacherAssignment.objects.create(organization=self.organization, teacher=self.teacher, course=self.course, course_section=self.section, subject=self.subject, role="subject_teacher", assignment_status="accepted", is_active=True)

        self.other_student = Student.objects.create(organization=self.organization, student_id="CST-STU-002", full_name="Other Student", email="other.cst@example.com")
        self.other_enrollment = Enrollment.objects.create(organization=self.organization, student=self.other_student, course=self.course, course_section=self.section, enrollment_number="CST-ENR-002", status="active")

        self.syllabus_item = CourseSyllabusItem.objects.create(organization=self.organization, course=self.course, course_section=self.section, subject=self.subject, title="Chapter 1", is_public=True)

    def login(self, user):
        response = self.client.post("/api/v1/auth/login/", {"email": user.email, "password": "2633123"}, format="json")
        self.assertEqual(response.status_code, 200, response.data)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.data['access']}")

    def test_student_cannot_list_courses_via_admin_endpoint(self):
        self.login(self.student_user)
        listed = self.client.get("/api/v1/courses/courses/")
        self.assertEqual(listed.status_code, 200, listed.data)
        self.assertEqual(listed.data["results"], [])
        retrieved = self.client.get(f"/api/v1/courses/courses/{self.course.id}/")
        self.assertEqual(retrieved.status_code, 404)

    def test_student_cannot_list_other_students_enrollments(self):
        self.login(self.student_user)
        listed = self.client.get("/api/v1/courses/enrollments/")
        self.assertEqual(listed.status_code, 200, listed.data)
        self.assertEqual(listed.data["results"], [])
        retrieved = self.client.get(f"/api/v1/courses/enrollments/{self.other_enrollment.id}/")
        self.assertEqual(retrieved.status_code, 404)

    def test_student_cannot_list_teacher_assignments(self):
        self.login(self.student_user)
        listed = self.client.get("/api/v1/courses/teacher-assignments/")
        self.assertEqual(listed.status_code, 200, listed.data)
        self.assertEqual(listed.data["results"], [])

    def test_student_cannot_read_or_write_syllabus_items(self):
        self.login(self.student_user)
        listed = self.client.get("/api/v1/courses/syllabus-items/")
        self.assertEqual(listed.status_code, 200, listed.data)
        self.assertEqual(listed.data["results"], [])

        retrieved = self.client.get(f"/api/v1/courses/syllabus-items/{self.syllabus_item.id}/")
        self.assertEqual(retrieved.status_code, 404)

        created = self.client.post(
            "/api/v1/courses/syllabus-items/",
            {"course": self.course.id, "course_section": self.section.id, "subject": self.subject.id, "title": "Hacked Chapter"},
            format="json",
        )
        self.assertEqual(created.status_code, 403, created.data)

        patched = self.client.patch(f"/api/v1/courses/syllabus-items/{self.syllabus_item.id}/", {"title": "Hacked"}, format="json")
        self.assertIn(patched.status_code, (403, 404))
        self.syllabus_item.refresh_from_db()
        self.assertEqual(self.syllabus_item.title, "Chapter 1")

    def test_teacher_can_still_manage_own_syllabus_items(self):
        """Positive control: the fix must not over-restrict the assigned teacher."""
        self.login(self.teacher_user)
        listed = self.client.get("/api/v1/courses/syllabus-items/")
        self.assertEqual(listed.status_code, 200, listed.data)
        self.assertIn(self.syllabus_item.id, [row["id"] for row in listed.data["results"]])

        created = self.client.post(
            "/api/v1/courses/syllabus-items/",
            {"course": self.course.id, "course_section": self.section.id, "subject": self.subject.id, "title": "Chapter 2"},
            format="json",
        )
        self.assertEqual(created.status_code, 201, created.data)

    def test_teacher_can_still_list_own_courses(self):
        self.login(self.teacher_user)
        listed = self.client.get("/api/v1/courses/courses/")
        self.assertEqual(listed.status_code, 200, listed.data)
        self.assertIn(self.course.id, [row["id"] for row in listed.data["results"]])
