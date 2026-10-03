from datetime import timedelta

from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APITestCase

from apps.accounts.models import Permission, Role
from apps.assessments.models import Assessment, AssessmentQuestion, ContentReviewStatus, Question, QuestionOption
from apps.assessments.publication import TestPublicationService
from apps.courses.models import Course, CourseSection, CourseSubject, Enrollment, TeacherAssignment
from apps.messaging.models import Notification
from apps.organizations.models import Organization
from apps.people.models import Department, Designation, Employee, Student

PASSWORD = "2633123"


class TestNotificationPipelineTests(APITestCase):
    def setUp(self):
        self.org = Organization.objects.create(name="E2E_TEST Pipeline Org", code="e2e-test-pipeline-org")
        User = get_user_model()
        self.User = User

        teacher_role = Role.objects.create(organization=self.org, name="Teacher", code="pipe-teacher")
        for code in ("assessment.view", "assessment.create", "assessment.edit", "assessment.delete"):
            teacher_role.permissions.add(Permission.objects.get_or_create(code=code, defaults={"name": code, "module": "assessment"})[0])
        student_role = Role.objects.create(organization=self.org, name="Student", code="pipe-student")

        department = Department.objects.create(organization=self.org, name="Academic")
        designation = Designation.objects.create(organization=self.org, name="Teacher")

        def make_teacher(key):
            user = User.objects.create_user(username=f"pipe_{key}", email=f"{key}@example.com", password=PASSWORD, organization=self.org)
            user.roles.add(teacher_role)
            employee = Employee.objects.create(organization=self.org, employee_id=f"PIPE-{key}", full_name=f"{key} teacher", employee_type="teacher", email=user.email, department=department, designation=designation)
            return user, employee

        self.course = Course.objects.create(organization=self.org, title="ASTRA Course", slug="astra-pipe", status="running", is_published=True)
        self.other_course = Course.objects.create(organization=self.org, title="Other Course", slug="other-pipe", status="running", is_published=True)
        self.section = CourseSection.objects.create(organization=self.org, course=self.course, name="Science")
        self.other_section = CourseSection.objects.create(organization=self.org, course=self.course, name="Commerce")
        self.physics = CourseSubject.objects.create(organization=self.org, course_section=self.section, name="Physics", code="PHY-P")
        other_section_subject = CourseSubject.objects.create(organization=self.org, course_section=self.other_section, name="Accounting", code="ACC-P")
        self.other_subject = CourseSubject.objects.create(organization=self.org, course_section=CourseSection.objects.create(organization=self.org, course=self.other_course, name="X"), name="Biology", code="BIO-P")

        self.head_user, self.head = make_teacher("head")
        self.phys_user, self.phys_teacher = make_teacher("physteacher")
        TeacherAssignment.objects.create(organization=self.org, teacher=self.head, course=self.course, role="head_teacher", assignment_status="accepted", is_active=True)
        TeacherAssignment.objects.create(organization=self.org, teacher=self.phys_teacher, course=self.course, course_section=self.section, subject=self.physics, role="subject_teacher", assignment_status="accepted", is_active=True)

        def make_student(key, course, section, status="active"):
            user = User.objects.create_user(username=f"pipe_{key}", email=f"{key}@example.com", password=PASSWORD, organization=self.org)
            user.roles.add(student_role)
            student = Student.objects.create(organization=self.org, student_id=f"PIPE-{key}", full_name=key, email=user.email)
            Enrollment.objects.create(organization=self.org, student=student, course=course, course_section=section, enrollment_number=f"ENR-{key}", status=status)
            return user, student

        self.s1_user, self.s1 = make_student("s1", self.course, self.section)
        self.s2_user, self.s2 = make_student("s2", self.course, self.section)
        self.commerce_user, _ = make_student("commerce", self.course, self.other_section)          # other section
        self.inactive_user, _ = make_student("inactive", self.course, self.section, status="cancelled")  # not active
        self.stranger_user, _ = make_student("stranger", self.other_course, None)                   # other admission

    # ---- helpers -------------------------------------------------------------------------
    def login(self, user):
        response = self.client.post("/api/v1/auth/login/", {"email": user.email, "password": PASSWORD}, format="json")
        self.assertEqual(response.status_code, 200, response.data)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.data['access']}")

    def make_test(self, **overrides):
        values = dict(
            organization=self.org, title="Mechanics MCQ", assessment_type="mcq", course=self.course, course_section=self.section,
            subject=self.physics, created_by_teacher=self.head, status="draft", review_status=ContentReviewStatus.DRAFT,
            timing_mode="practice", duration_minutes=20,
        )
        values.update(overrides)
        assessment = Assessment.objects.create(**values)
        question = Question.objects.create(organization=self.org, course=self.course, course_section=self.section, subject=self.physics, text="SI unit of force?")
        QuestionOption.objects.create(organization=self.org, question=question, text="Joule", is_correct=False)
        QuestionOption.objects.create(organization=self.org, question=question, text="Newton", is_correct=True)
        AssessmentQuestion.objects.create(organization=self.org, assessment=assessment, question=question, order=1, marks=1)
        return assessment

    def publish(self, assessment, user=None):
        self.login(user or self.head_user)
        return self.client.post(f"/api/v1/assessments/assessments/{assessment.id}/publish/")

    def notifications_for(self, assessment, user=None):
        qs = Notification.objects.filter(target_id=assessment.id)
        return qs.filter(recipient=user) if user else qs

    # ---- recipients ----------------------------------------------------------------------
    def test_head_teacher_publish_notifies_only_eligible_active_enrolled_students(self):
        assessment = self.make_test()
        self.assertEqual(self.notifications_for(assessment).count(), 0, "drafts must not notify")
        response = self.publish(assessment)
        self.assertEqual(response.status_code, 200, response.data)
        recipients = set(self.notifications_for(assessment).values_list("recipient__email", flat=True))
        self.assertEqual(recipients, {"s1@example.com", "s2@example.com"})
        for user in (self.commerce_user, self.inactive_user, self.stranger_user):
            self.assertFalse(self.notifications_for(assessment, user).exists(), f"{user.email} must not be notified")

    def test_notification_carries_structured_target_and_internal_deep_link(self):
        assessment = self.make_test(timing_mode="scheduled", starts_at=timezone.now() + timedelta(days=2), ends_at=timezone.now() + timedelta(days=2, hours=1))
        self.publish(assessment)
        notification = self.notifications_for(assessment, self.s1_user).get()
        self.assertEqual(notification.notification_type, "SCHEDULED_TEST_PUBLISHED")
        self.assertEqual(notification.target_type, "ONLINE_TEST")
        self.assertEqual(notification.target_id, assessment.id)
        self.assertEqual(notification.target_url, f"/student/tests/{assessment.id}")
        self.assertEqual(notification.metadata["admission_id"], self.course.id)
        self.assertEqual(notification.metadata["subject_id"], self.physics.id)
        self.assertTrue(notification.metadata["starts_at"])
        self.assertIn("Physics", notification.body)

    def test_individually_targeted_test_notifies_only_allowed_students(self):
        assessment = self.make_test(title="Targeted practice")
        assessment.allowed_students.add(self.s1)
        self.publish(assessment)
        self.assertEqual(set(self.notifications_for(assessment).values_list("recipient__email", flat=True)), {"s1@example.com"})

    # ---- idempotency / lifecycle ---------------------------------------------------------
    def test_double_publish_creates_one_notification_per_student(self):
        assessment = self.make_test()
        self.publish(assessment)
        self.publish(assessment)
        TestPublicationService.notify_published(Assessment.objects.get(pk=assessment.pk), self.head_user)
        self.assertEqual(self.notifications_for(assessment).count(), 2)

    def test_subject_teacher_test_notifies_when_head_teacher_approves_not_before(self):
        assessment = self.make_test(created_by_teacher=self.phys_teacher, review_status=ContentReviewStatus.PENDING)
        self.login(self.phys_user)
        self.assertEqual(self.client.post(f"/api/v1/assessments/assessments/{assessment.id}/publish/").status_code, 403)
        self.assertEqual(self.notifications_for(assessment).count(), 0)
        self.login(self.head_user)
        response = self.client.post(f"/api/v1/assessments/assessments/{assessment.id}/review/", {"decision": "approve"}, format="json")
        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(self.notifications_for(assessment).count(), 2)

    def test_future_publish_at_waits_then_delivers_once(self):
        assessment = self.make_test(publish_at=timezone.now() + timedelta(hours=1))
        self.publish(assessment)
        self.assertEqual(self.notifications_for(assessment).count(), 0)
        later = timezone.now() + timedelta(hours=2)
        self.assertEqual(TestPublicationService.deliver_due(now=later), 2)
        self.assertEqual(TestPublicationService.deliver_due(now=later), 0)
        self.assertEqual(self.notifications_for(assessment).count(), 2)

    def test_reschedule_notifies_once_per_new_time_and_ignores_unrelated_edits(self):
        start = timezone.now() + timedelta(days=1)
        assessment = self.make_test(timing_mode="scheduled", starts_at=start, ends_at=start + timedelta(hours=1))
        self.publish(assessment)
        url = f"/api/v1/assessments/assessments/{assessment.id}/"
        self.login(self.head_user)
        new_start = start + timedelta(hours=3)
        self.assertEqual(self.client.patch(url, {"starts_at": new_start.isoformat(), "ends_at": (new_start + timedelta(hours=1)).isoformat()}, format="json").status_code, 200)
        self.assertEqual(self.client.patch(url, {"description": "unrelated edit"}, format="json").status_code, 200)
        self.assertEqual(self.client.patch(url, {"starts_at": new_start.isoformat()}, format="json").status_code, 200)
        updates = Notification.objects.filter(target_id=assessment.id, notification_type="TEST_UPDATED")
        self.assertEqual(updates.count(), 2)  # one per student, exactly once for the one real change

    def test_cancelling_a_published_test_notifies_and_student_sees_cancelled(self):
        assessment = self.make_test()
        self.publish(assessment)
        self.login(self.head_user)
        self.assertEqual(self.client.patch(f"/api/v1/assessments/assessments/{assessment.id}/", {"status": "archived"}, format="json").status_code, 200)
        self.assertEqual(Notification.objects.filter(target_id=assessment.id, notification_type="TEST_CANCELLED").count(), 2)
        self.login(self.s1_user)
        response = self.client.get(f"/api/v1/assessments/student/assessments/{assessment.id}/")
        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(response.data["student_status"], "CANCELLED")
        self.assertFalse(response.data["can_start"])

    # ---- student status & server-side start gate -----------------------------------------
    def test_scheduled_test_status_server_time_and_start_is_rejected_before_starts_at(self):
        start = timezone.now() + timedelta(hours=2)
        assessment = self.make_test(timing_mode="scheduled", status="scheduled", review_status=ContentReviewStatus.APPROVED, starts_at=start, ends_at=start + timedelta(hours=1))
        self.login(self.s1_user)
        detail = self.client.get(f"/api/v1/assessments/student/assessments/{assessment.id}/")
        self.assertEqual(detail.status_code, 200, detail.data)
        self.assertEqual(detail.data["student_status"], "UPCOMING")
        self.assertTrue(detail.data["server_time"])
        self.assertFalse(detail.data["can_start"])
        self.assertEqual(detail.data["subject_name"], "Physics")
        self.assertEqual(detail.data["question_count"], 1)
        self.assertEqual(self.client.post(f"/api/v1/assessments/student/assessments/{assessment.id}/start/").status_code, 400)

    def test_starting_soon_available_now_and_expired_states(self):
        soon = self.make_test(title="soon", status="scheduled", review_status=ContentReviewStatus.APPROVED, starts_at=timezone.now() + timedelta(minutes=5), ends_at=timezone.now() + timedelta(hours=1))
        live = self.make_test(title="live", timing_mode="live", status="live", review_status=ContentReviewStatus.APPROVED, starts_at=timezone.now() - timedelta(minutes=1), ends_at=timezone.now() + timedelta(hours=1))
        ended = self.make_test(title="ended", status="published", review_status=ContentReviewStatus.APPROVED, starts_at=timezone.now() - timedelta(hours=3), ends_at=timezone.now() - timedelta(hours=1))
        self.login(self.s1_user)
        get = lambda a: self.client.get(f"/api/v1/assessments/student/assessments/{a.id}/")
        self.assertEqual(get(soon).data["student_status"], "STARTING_SOON")
        self.assertEqual(get(live).data["student_status"], "AVAILABLE_NOW")
        self.assertTrue(get(live).data["can_start"])
        self.assertEqual(get(ended).status_code, 200)
        self.assertEqual(get(ended).data["student_status"], "EXPIRED")
        self.assertEqual(self.client.post(f"/api/v1/assessments/student/assessments/{ended.id}/start/").status_code, 404)

    def test_unrelated_students_cannot_open_the_test_even_with_the_id(self):
        assessment = self.make_test(status="published", review_status=ContentReviewStatus.APPROVED)
        for user in (self.stranger_user, self.commerce_user, self.inactive_user):
            self.login(user)
            self.assertEqual(self.client.get(f"/api/v1/assessments/student/assessments/{assessment.id}/").status_code, 404, user.email)
            self.assertEqual(self.client.post(f"/api/v1/assessments/student/assessments/{assessment.id}/start/").status_code, 404, user.email)

    def test_draft_is_not_reachable_by_students(self):
        assessment = self.make_test()
        self.login(self.s1_user)
        self.assertEqual(self.client.get(f"/api/v1/assessments/student/assessments/{assessment.id}/").status_code, 404)

    def test_reading_a_notification_does_not_grant_or_remove_access(self):
        assessment = self.make_test()
        self.publish(assessment)
        notification = self.notifications_for(assessment, self.s1_user).get()
        self.login(self.s1_user)
        self.assertEqual(self.client.post(f"/api/v1/sms/notifications/{notification.id}/read/").status_code, 200)
        Notification.objects.filter(pk=notification.pk).delete()
        self.assertEqual(self.client.get(f"/api/v1/assessments/student/assessments/{assessment.id}/").status_code, 200)
        # other students cannot read/mark someone else's notification
        other = self.notifications_for(assessment, self.s2_user).get()
        self.assertEqual(self.client.post(f"/api/v1/sms/notifications/{other.id}/read/").status_code, 404)
