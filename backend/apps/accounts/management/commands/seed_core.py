from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.accounts.models import Permission, Role
from apps.academic.models import AcademicSession, AcademicClass, Section, Shift, StudentGroup
from apps.assessments.models import (
    Assessment,
    AssessmentAttempt,
    AssessmentQuestion,
    AssignmentSubmission,
    Question,
    QuestionOption,
    StudentAnswer,
)
from apps.courses.models import Course, CourseSection, CourseSubject, Enrollment, TeacherAssignment
from apps.messaging.models import Notification
from apps.organizations.models import Organization
from apps.people.models import Department, Designation, Employee, Student, StudentProfile


PERMISSIONS = [
    "student.view", "student.create", "student.edit", "student.delete",
    "employee.view", "employee.create", "employee.edit", "employee.delete",
    "academic.view", "academic.create", "academic.edit", "academic.delete",
    "course.view", "course.create", "course.edit", "course.delete",
    "assessment.view", "assessment.create", "assessment.edit", "assessment.delete", "assessment.publish",
    "application.view", "application.create", "application.edit", "application.delete",
    "application.approve", "application.reject", "application.process",
    "result.view", "result.process", "result.publish",
    "payroll.view", "payroll.create", "payroll.update", "payroll.delete",
    "sms.view", "sms.send", "sms.configure",
    "report.view",
]


class Command(BaseCommand):
    help = "Seed organization, permissions, demo users, courses, assessments, and dashboard test data."

    def handle(self, *args, **options):
        org, _ = Organization.objects.get_or_create(
            code="expert-jashore",
            defaults={
                "name": "Expert Coaching Center",
                "email": "expertjashore@gmail.com",
                "phone": "01719486254",
                "address": "Stadium Road, Jashore",
                "established_year": 2017,
            },
        )

        permission_objs = []
        for code in PERMISSIONS:
            module = code.split(".", 1)[0]
            permission, _ = Permission.objects.get_or_create(
                code=code,
                defaults={"name": code.replace(".", " ").title(), "module": module},
            )
            permission_objs.append(permission)

        role, _ = Role.objects.get_or_create(
            organization=org,
            code="institute-admin",
            defaults={"name": "Institute Admin", "is_system": True},
        )
        role.permissions.set(permission_objs)

        student_role, _ = Role.objects.get_or_create(
            organization=org,
            code="student",
            defaults={"name": "Student", "is_system": True},
        )
        teacher_role, _ = Role.objects.get_or_create(
            organization=org,
            code="teacher",
            defaults={"name": "Teacher", "is_system": True},
        )
        parent_role, _ = Role.objects.get_or_create(
            organization=org,
            code="parent",
            defaults={"name": "Parent / Guardian", "is_system": True},
        )

        User = get_user_model()
        admin, created = User.objects.get_or_create(
            email="expertjashore@gmail.com",
            defaults={
                "username": "expertjashore",
                "organization": org,
                "is_staff": True,
                "is_active": True,
            },
        )
        if created:
            admin.set_password("change-this-password")
            admin.save()
        admin.roles.add(role)
        teacher_permission_codes = {
            "course.view",
            "assessment.view",
            "assessment.create",
            "assessment.edit",
            "assessment.publish",
            "student.view",
        }
        teacher_role.permissions.set([permission for permission in permission_objs if permission.code in teacher_permission_codes])
        # Students use dedicated /student/... endpoints gated by plain IsAuthenticated + their
        # own Enrollment — they should hold no admin-surface permissions at all. Granting
        # assessment.view/course.view here previously let students reach the teacher/admin
        # ViewSets (answer keys, other students' attempts/submissions, unpublished content).
        student_role.permissions.set([])

        session, _ = AcademicSession.objects.get_or_create(
            organization=org,
            name="2026",
            defaults={"is_active": True, "created_by": admin, "updated_by": admin},
        )
        academic_class, _ = AcademicClass.objects.get_or_create(
            organization=org,
            name="SSC",
            defaults={"sorting": 1, "group_required": True, "created_by": admin, "updated_by": admin},
        )
        section, _ = Section.objects.get_or_create(
            organization=org,
            academic_class=academic_class,
            shift=None,
            name="Science",
            defaults={"created_by": admin, "updated_by": admin},
        )
        student_group, _ = StudentGroup.objects.get_or_create(
            organization=org,
            name="Science",
            defaults={"created_by": admin, "updated_by": admin},
        )
        Shift.objects.get_or_create(
            organization=org,
            name="Morning",
            defaults={"created_by": admin, "updated_by": admin},
        )

        department, _ = Department.objects.get_or_create(
            organization=org,
            name="Academic",
            defaults={"created_by": admin, "updated_by": admin},
        )
        teacher_designation, _ = Designation.objects.get_or_create(
            organization=org,
            name="Teacher",
            defaults={"created_by": admin, "updated_by": admin},
        )

        demo_password = "2633123"

        course_specs = [
            ("SSC 2027", "ssc-2027", "Regular SSC preparation for Science students.", "regular", "running"),
            ("Class 9 Admission", "class-9-admission", "Admission coaching for Class 9 students.", "admission", "admission_open"),
            ("Class 10 Admission", "class-10-admission", "Admission coaching for Class 10 students.", "admission", "admission_open"),
            ("University Admission A Unit", "university-admission-a-unit", "University admission program for A Unit.", "admission", "admission_open"),
            ("HSC 2027", "hsc-2027", "HSC academic and assessment preparation.", "regular", "running"),
        ]
        courses = []
        for index, (title, slug, description, course_type, status) in enumerate(course_specs, start=1):
            course, _ = Course.objects.update_or_create(
                organization=org,
                slug=slug,
                defaults={
                    "title": title,
                    "code": f"CRS-{index:02d}",
                    "description": description,
                    "course_type": course_type,
                    "admission_fee": 1200 + index * 100,
                    "course_fee": 4500 + index * 500,
                    "capacity": 120,
                    "session": session,
                    "start_date": timezone.localdate(),
                    "end_date": timezone.localdate() + timezone.timedelta(days=180),
                    "enrollment_start": timezone.localdate(),
                    "enrollment_end": timezone.localdate() + timezone.timedelta(days=45),
                    "status": status,
                    "is_published": True,
                    "created_by": admin,
                    "updated_by": admin,
                },
            )
            courses.append(course)

        course_sections = []
        course_subjects = []
        subject_names = ["Physics", "Chemistry", "Mathematics", "Biology", "English"]
        for course in courses:
            course_section, _ = CourseSection.objects.update_or_create(
                organization=org,
                course=course,
                name="Science" if course.course_type != "admission" else "A Unit",
                defaults={"description": "Demo section for dashboard testing.", "status": "active", "order": 1, "created_by": admin, "updated_by": admin},
            )
            course_sections.append(course_section)
            for order, subject_name in enumerate(subject_names, start=1):
                subject, _ = CourseSubject.objects.update_or_create(
                    organization=org,
                    course_section=course_section,
                    code=f"{subject_name[:3].upper()}-{course.id}",
                    defaults={"name": subject_name, "description": f"{subject_name} demo subject.", "order": order, "status": "active", "created_by": admin, "updated_by": admin},
                )
                course_subjects.append(subject)

        students = []
        teachers = []

        for index in range(1, 51):
            email = f"demo.student{index:02d}@gmail.com"
            user, _ = User.objects.get_or_create(
                email=email,
                defaults={
                    "username": email,
                    "first_name": "Demo",
                    "last_name": f"Student {index:02d}",
                    "phone": f"01720{index:06d}",
                    "organization": org,
                    "is_active": True,
                },
            )
            user.organization = org
            user.first_name = "Demo"
            user.last_name = f"Student {index:02d}"
            user.phone = f"01720{index:06d}"
            user.set_password(demo_password)
            user.save()
            user.roles.set([student_role])

            StudentProfile.objects.update_or_create(
                user=user,
                defaults={
                    "organization": org,
                    "full_name": f"Demo Student {index:02d}",
                    "phone": user.phone,
                    "email": email,
                    "guardian_name": f"Guardian {index:02d}",
                    "guardian_phone": f"01920{index:06d}",
                    "institution": "Expert Coaching Center",
                    "created_by": admin,
                    "updated_by": admin,
                },
            )

            student, _ = Student.objects.update_or_create(
                organization=org,
                student_id=f"DEMO-STU-{index:03d}",
                defaults={
                    "full_name": f"Demo Student {index:02d}",
                    "phone": user.phone,
                    "email": email,
                    "session": session,
                    "academic_class": academic_class,
                    "section": section,
                    "group": student_group,
                    "roll": str(index),
                    "created_by": admin,
                    "updated_by": admin,
                },
            )
            students.append(student)

        for index in range(1, 11):
            email = f"demo.teacher{index:02d}@gmail.com"
            user, _ = User.objects.get_or_create(
                email=email,
                defaults={
                    "username": email,
                    "first_name": "Demo",
                    "last_name": f"Teacher {index:02d}",
                    "phone": f"01820{index:06d}",
                    "organization": org,
                    "is_active": True,
                },
            )
            user.organization = org
            user.first_name = "Demo"
            user.last_name = f"Teacher {index:02d}"
            user.phone = f"01820{index:06d}"
            user.set_password(demo_password)
            user.save()
            user.roles.set([teacher_role])

            teacher, _ = Employee.objects.update_or_create(
                organization=org,
                employee_id=f"DEMO-TCH-{index:03d}",
                defaults={
                    "full_name": f"Demo Teacher {index:02d}",
                    "employee_type": "teacher",
                    "department": department,
                    "designation": teacher_designation,
                    "phone": user.phone,
                    "email": email,
                    "created_by": admin,
                    "updated_by": admin,
                },
            )
            teachers.append(teacher)

        for index, course in enumerate(courses):
            course_section = course_sections[index]
            section_subjects = [subject for subject in course_subjects if subject.course_section_id == course_section.id]
            head_teacher = teachers[index % len(teachers)]
            course_section.head_teacher = head_teacher
            course_section.updated_by = admin
            course_section.save(update_fields=["head_teacher", "updated_by", "updated_at"])
            TeacherAssignment.objects.update_or_create(
                organization=org,
                teacher=head_teacher,
                course=course,
                course_section=course_section,
                subject=None,
                role="head_teacher",
                defaults={"permissions": ["course.manage", "assessment.manage", "student.view"], "assigned_by": admin, "is_active": True, "created_by": admin, "updated_by": admin},
            )
            for subject_index, subject in enumerate(section_subjects):
                teacher = teachers[(index + subject_index + 1) % len(teachers)]
                TeacherAssignment.objects.update_or_create(
                    organization=org,
                    teacher=teacher,
                    course=course,
                    course_section=course_section,
                    subject=subject,
                    role="subject_teacher",
                    defaults={"permissions": ["content.create", "assessment.create", "student.view"], "assigned_by": admin, "is_active": True, "created_by": admin, "updated_by": admin},
                )

        for index, student in enumerate(students, start=1):
            primary_course = courses[index % len(courses)]
            primary_section = primary_course.sections.first()
            Enrollment.objects.update_or_create(
                organization=org,
                student=student,
                course=primary_course,
                defaults={
                    "course_section": primary_section,
                    "enrollment_number": f"DEMO-ENR-{index:03d}",
                    "status": "active",
                    "enrolled_at": timezone.now(),
                    "created_by": admin,
                    "updated_by": admin,
                },
            )
            if index <= 25:
                second_course = courses[(index + 1) % len(courses)]
                Enrollment.objects.update_or_create(
                    organization=org,
                    student=student,
                    course=second_course,
                    defaults={
                        "course_section": second_course.sections.first(),
                        "enrollment_number": f"DEMO-ENR-B-{index:03d}",
                        "status": "active",
                        "enrolled_at": timezone.now(),
                        "created_by": admin,
                        "updated_by": admin,
                    },
                )

        live_start = timezone.now() - timezone.timedelta(minutes=10)
        live_end = timezone.now() + timezone.timedelta(minutes=50)
        scheduled_start = timezone.now() + timezone.timedelta(days=1)
        assessment_specs = [
            ("Physics Live MCQ", "mcq", "live", live_start, live_end, course_subjects[0]),
            ("Chemistry Chapter Test", "mcq", "scheduled", scheduled_start, scheduled_start + timezone.timedelta(minutes=30), course_subjects[1]),
            ("Mathematics Assignment", "assignment", "published", timezone.now() - timezone.timedelta(days=1), timezone.now() + timezone.timedelta(days=7), course_subjects[2]),
            ("Biology Online Exam", "exam", "published", timezone.now() + timezone.timedelta(days=3), timezone.now() + timezone.timedelta(days=3, minutes=60), course_subjects[3]),
        ]
        assessments = []
        for title, assessment_type, status, starts_at, ends_at, subject in assessment_specs:
            teacher = subject.teacher_assignments.filter(is_active=True).first().teacher if subject.teacher_assignments.filter(is_active=True).exists() else teachers[0]
            assessment, _ = Assessment.objects.update_or_create(
                organization=org,
                title=title,
                course=subject.course_section.course,
                defaults={
                    "assessment_type": assessment_type,
                    "course_section": subject.course_section,
                    "subject": subject,
                    "created_by_teacher": teacher,
                    "instructions": "Demo assessment prepared for dashboard testing.",
                    "duration_minutes": 30,
                    "starts_at": starts_at,
                    "ends_at": ends_at,
                    "status": status,
                    "published_at": timezone.now(),
                    "allow_late_join": True,
                    "created_by": admin,
                    "updated_by": admin,
                },
            )
            assessments.append(assessment)

            if assessment_type in {"mcq", "exam"}:
                for question_index in range(1, 6):
                    question, _ = Question.objects.update_or_create(
                        organization=org,
                        course=assessment.course,
                        subject=subject,
                        text=f"{title} demo question {question_index}?",
                        defaults={
                            "course_section": assessment.course_section,
                            "created_by_teacher": teacher,
                            "explanation": "Demo explanation.",
                            "question_type": "single",
                            "marks": 1,
                            "status": "active",
                            "created_by": admin,
                            "updated_by": admin,
                        },
                    )
                    correct_option = None
                    for option_index, text in enumerate(["Option A", "Option B", "Option C", "Option D"], start=1):
                        option, _ = QuestionOption.objects.update_or_create(
                            organization=org,
                            question=question,
                            order=option_index,
                            defaults={"text": text, "is_correct": option_index == 1, "created_by": admin, "updated_by": admin},
                        )
                        if option.is_correct:
                            correct_option = option
                    AssessmentQuestion.objects.update_or_create(
                        organization=org,
                        assessment=assessment,
                        question=question,
                        defaults={"order": question_index, "marks": 1, "created_by": admin, "updated_by": admin},
                    )
                    if question_index == 1:
                        question.demo_correct_option = correct_option

        completed_assessment = assessments[0]
        first_question = completed_assessment.assessment_questions.select_related("question").first()
        first_option = first_question.question.options.filter(is_correct=True).first() if first_question else None
        for index, student in enumerate(students[:20], start=1):
            attempt, _ = AssessmentAttempt.objects.update_or_create(
                organization=org,
                assessment=completed_assessment,
                student=student,
                defaults={
                    "submitted_at": timezone.now() - timezone.timedelta(minutes=index),
                    "status": "submitted",
                    "score": 18 + (index % 3),
                    "total_marks": 20,
                    "auto_submitted": False,
                    "created_by": admin,
                    "updated_by": admin,
                },
            )
            if first_question and first_option:
                answer, _ = StudentAnswer.objects.update_or_create(
                    organization=org,
                    attempt=attempt,
                    question=first_question.question,
                    defaults={"is_correct": True, "marks_obtained": 1, "created_by": admin, "updated_by": admin},
                )
                answer.selected_options.set([first_option])

        assignment = assessments[2]
        for index, student in enumerate(students[:12], start=1):
            evaluator = assignment.created_by_teacher or teachers[0]
            AssignmentSubmission.objects.update_or_create(
                organization=org,
                assessment=assignment,
                student=student,
                defaults={
                    "submitted_at": timezone.now() - timezone.timedelta(hours=index),
                    "status": "evaluated" if index <= 6 else "submitted",
                    "marks_obtained": 8 + (index % 3) if index <= 6 else None,
                    "total_marks": 10,
                    "feedback": "Good work. Review the marked chapter again." if index <= 6 else "",
                    "evaluated_by": evaluator if index <= 6 else None,
                    "evaluated_at": timezone.now() if index <= 6 else None,
                    "created_by": admin,
                    "updated_by": admin,
                },
            )

        for index, student in enumerate(students[:10], start=1):
            user = User.objects.filter(email=student.email).first()
            if user:
                Notification.objects.update_or_create(
                    organization=org,
                    recipient=user,
                    title="Physics MCQ is live",
                    defaults={
                        "body": "Join the live MCQ from your assessment page.",
                        "notification_type": "assessment",
                        "target_url": "/student/dashboard#assessments",
                        "is_read": index % 3 == 0,
                        "created_by": admin,
                        "updated_by": admin,
                    },
                )

        self.stdout.write(self.style.SUCCESS(f"Seed complete for {org.name}. Active session: {session.name}"))
        self.stdout.write(self.style.SUCCESS(f"Demo students: demo.student01@gmail.com ... demo.student50@gmail.com / password: {demo_password}"))
        self.stdout.write(self.style.SUCCESS(f"Demo teachers: demo.teacher01@gmail.com ... demo.teacher10@gmail.com / password: {demo_password}"))
