from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated

from apps.people.models import Employee
from .services import ensure_head_teacher_of_course, teacher_scope


class HeadTeacherCourseScopeMixin:
    """Restricts list/retrieve/write access on academic-structure ViewSets (Sections,
    Subjects, Academic Stages, subject-Teacher Assignments) to staff/superuser or the
    head teacher of the course a row belongs to. Ordinary subject teachers get no
    visibility here at all - academic-structure management is head-teacher-only, unlike
    the content-delivery ViewSets in apps.assessments which grant broader subject-teacher
    access via ensure_teacher_subject_scope.

    Subclasses set `course_lookup` (an ORM path from this model to Course, e.g.
    "course_id" or "course_section__course_id", used for queryset filtering) and
    implement `_target_course_id(serializer)` for the write-path check.

    Applied alongside (not instead of) HasActionPermission - staff/superuser access is
    completely unaffected (HasActionPermission already short-circuits True for them);
    this mixin is what additionally lets a head teacher (who typically holds no
    Role/permission grant at all) through for their own course(s).
    """

    course_lookup = "course_id"

    def get_permissions(self):
        user = self.request.user
        if user and user.is_authenticated and not (user.is_staff or user.is_superuser):
            teacher = self._teacher()
            if teacher and teacher_scope(teacher, self.get_request_organization())["head_course_ids"]:
                # Object and write scope checks below still enforce the target admission.
                return [IsAuthenticated()]
        return super().get_permissions()

    def _teacher(self):
        return Employee.objects.filter(
            organization=self.get_request_organization(),
            email=self.request.user.email,
            employee_type="teacher",
        ).first()

    def _is_role_based_admin(self, user):
        """Matches HasActionPermission's own definition of "authorized" for this
        module - a Role granting any course.* permission code, not is_staff/is_superuser
        specifically (this codebase's admin accounts aren't required to be Django staff,
        confirmed by the existing seeded/test admin patterns). Superuser always passes."""
        if user.is_superuser or user.is_staff:
            return True
        if self._teacher():
            return False
        module = getattr(self, "permission_module", None) or "course"
        return user.roles.filter(permissions__code__startswith=f"{module}.").exists()

    def get_queryset(self):
        """Deliberately NOT using _is_role_based_admin here: a role-granted course.*
        permission authorizes a specific write action (see ensure_head_teacher_write),
        it must never widen list/retrieve to org-wide data on its own - that exact
        pattern (a view/edit permission code treated as "see everything") is the root
        cause of several confirmed data-leak bugs fixed earlier in this project. Reads
        stay restricted to staff/superuser or the head teacher's own scope."""
        queryset = super().get_queryset()
        user = self.request.user
        if user.is_staff or user.is_superuser:
            return queryset
        teacher = self._teacher()
        if not teacher:
            return queryset.none()
        scope = teacher_scope(teacher, self.get_request_organization())
        return queryset.filter(**{f"{self.course_lookup}__in": scope["head_course_ids"]})

    def _target_course_id(self, serializer):
        """Subclasses resolve the course a create/update payload concerns, preferring
        validated_data (the incoming FK) and falling back to the existing instance."""
        raise NotImplementedError

    def _instance_course_id(self, instance):
        """Subclasses resolve the course an existing row (for destroy) belongs to."""
        raise NotImplementedError

    def ensure_head_teacher_write(self, serializer):
        """Call explicitly at the top of perform_create/perform_update - not wired via
        an automatic perform_* override here, since CourseSectionViewSet/
        TeacherAssignmentViewSet already define their own perform_create/perform_update
        for head-teacher-sync side effects that don't call super()."""
        user = self.request.user
        if self._is_role_based_admin(user):
            return
        course_id = self._target_course_id(serializer)
        ensure_head_teacher_of_course(self._teacher(), self.get_request_organization(), course_id)

    def ensure_head_teacher_destroy(self, instance):
        """Call explicitly at the top of perform_destroy."""
        user = self.request.user
        if self._is_role_based_admin(user):
            return
        course_id = self._instance_course_id(instance)
        ensure_head_teacher_of_course(self._teacher(), self.get_request_organization(), course_id)
