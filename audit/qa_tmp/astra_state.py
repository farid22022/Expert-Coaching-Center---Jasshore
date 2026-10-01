from apps.courses.models import Course, CourseSection, CourseSubject, TeacherAssignment, AcademicStage, Enrollment
from apps.people.models import Employee
from django.contrib.auth import get_user_model
U = get_user_model()
for c in Course.objects.filter(title__icontains="ASTRA"):
    print("COURSE", c.id, c.title, c.status, c.is_published, c.slug, c.admission_fee, len(c.admission_form_schema or []))
    for s in CourseSection.objects.filter(course=c): print("  SECTION", s.id, s.name, s.head_teacher_id)
    for s in CourseSubject.objects.filter(course_section__course=c): print("  SUBJECT", s.id, s.name, s.code, s.course_section_id)
    for s in AcademicStage.objects.filter(course=c): print("  STAGE", s.id, s.name)
    for a in TeacherAssignment.objects.filter(course=c): print("  ASSIGN", a.id, a.teacher_id, a.teacher.full_name, a.teacher.email, a.role, a.subject_id, a.is_active, a.assignment_status)
    for e in Enrollment.objects.filter(course=c): print("  ENROLL", e.id, e.student_id, e.status)
for e in Employee.objects.filter(email__startswith="demo.teacher").order_by("email")[:10]:
    print("EMP", e.id, e.full_name, e.email, e.status, TeacherAssignment.objects.filter(teacher=e, is_active=True).values_list("course_id","role")[:5].__repr__())
print("ASTRA users:", list(U.objects.filter(email__icontains="astra").values_list("id","email","is_active")))
