from django.db import connection
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView


def count_many(querysets):
    """COUNT several querysets in ONE SQL statement (one database round trip)."""
    names, parts, params = [], [], []
    for index, (name, queryset) in enumerate(querysets.items()):
        sql, query_params = queryset.order_by().values("pk").query.sql_with_params()
        names.append(name)
        parts.append(f"(SELECT COUNT(*) FROM ({sql}) AS _count_{index})")
        params.extend(query_params)
    if not parts:
        return {}
    with connection.cursor() as cursor:
        cursor.execute("SELECT " + ", ".join(parts), params)
        return dict(zip(names, cursor.fetchone()))


class AdminDashboardStatsView(APIView):
    """Compact counters for the admin dashboard (replaces downloading 100-200 rows to count them).

    Each counter is only computed when the caller holds the same permission as the matching
    list endpoint; otherwise it is returned as null.
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        from apps.admissions.models import AdmissionApplication, ApplicationStatus
        from apps.courses.models import Course, CourseType, TeacherAssignment
        from apps.people.models import Employee, Student

        user = request.user

        def scoped(queryset):
            if user.is_superuser:
                return queryset
            return queryset.filter(organization_id=user.organization_id)

        def allowed(code):
            return user.is_superuser or user.has_app_permission(code)

        wanted = {}
        if allowed("application.view"):
            applications = scoped(AdmissionApplication.objects.all())
            wanted["applications"] = applications
            wanted["pending_applications"] = applications.filter(status__in=[ApplicationStatus.PENDING, ApplicationStatus.UNDER_REVIEW])
        if allowed("employee.view"):
            wanted["teachers"] = scoped(Employee.objects.filter(employee_type="teacher"))
        if allowed("student.view"):
            wanted["students"] = scoped(Student.objects.all())
        if allowed("course.view"):
            wanted["courses"] = scoped(Course.objects.all())
            wanted["admissions"] = scoped(Course.objects.filter(course_type=CourseType.ADMISSION))
            wanted["teacher_assignments"] = scoped(TeacherAssignment.objects.all())

        counts = count_many(wanted)
        keys = ["applications", "pending_applications", "teachers", "students", "courses", "admissions", "teacher_assignments"]
        return Response({key: counts.get(key) for key in keys})
