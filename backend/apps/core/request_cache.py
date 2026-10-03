def student_for_user(user):
    """The `people.Student` row for an authenticated user (matched by organization + email).

    Memoized on the user instance, which DRF creates once per request, so the many places that need
    "the current student" (viewsets, services, serializers) share one database round trip instead of
    each repeating it. Returns None for non-students.
    """
    cache = user.__dict__
    if "_cached_student" not in cache:
        from apps.people.models import Student

        cache["_cached_student"] = (
            Student.objects.filter(organization_id=user.organization_id, email__iexact=user.email).first()
            if user.is_authenticated and user.email
            else None
        )
    return cache["_cached_student"]
