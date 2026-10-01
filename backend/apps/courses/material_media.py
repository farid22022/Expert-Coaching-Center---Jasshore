"""Short-lived, enrollment-scoped URLs for browser-native PDF and video playback."""

import mimetypes
import re
from urllib.parse import urlencode

from django.core import signing
from django.contrib.auth import get_user_model
from django.db.models import Q
from django.http import FileResponse, Http404, HttpResponse, StreamingHttpResponse
from django.urls import reverse
from django.utils import timezone
from django.utils.http import content_disposition_header
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny

from apps.assessments.models import CourseMaterial
from apps.courses.curriculum import content_is_released
from apps.courses.models import Enrollment, EnrollmentStatus, TeacherAssignment
from apps.people.models import Employee


TOKEN_SALT = "student-material-media-v1"
TOKEN_MAX_AGE = 60 * 60


def student_material_url(request, material, enrollment):
    token = signing.dumps(
        {"user": request.user.pk, "enrollment": enrollment.pk, "material": material.pk},
        salt=TOKEN_SALT,
    )
    path = reverse("student-material-media", kwargs={"material_id": material.pk})
    return request.build_absolute_uri(f"{path}?{urlencode({'token': token})}")


def staff_material_url(request, material):
    token = signing.dumps(
        {"user": request.user.pk, "material": material.pk, "access": "staff"},
        salt=TOKEN_SALT,
    )
    path = reverse("student-material-media", kwargs={"material_id": material.pk})
    return request.build_absolute_uri(f"{path}?{urlencode({'token': token})}")


def _chunks(upload, start, length):
    try:
        upload.seek(start)
        while length > 0:
            chunk = upload.read(min(64 * 1024, length))
            if not chunk:
                break
            length -= len(chunk)
            yield chunk
    finally:
        upload.close()


@api_view(["GET"])
@permission_classes([AllowAny])
def student_material_media(request, material_id):
    try:
        payload = signing.loads(request.query_params.get("token", ""), salt=TOKEN_SALT, max_age=TOKEN_MAX_AGE)
    except (signing.BadSignature, signing.SignatureExpired):
        raise Http404
    if payload.get("material") != material_id:
        raise Http404
    user = get_user_model().objects.filter(pk=payload.get("user"), is_active=True).first()
    if not user:
        raise Http404
    if payload.get("access") == "staff":
        material = CourseMaterial.objects.filter(pk=material_id, organization=user.organization).first()
        if not material or not material.file:
            raise Http404
        if not (user.is_staff or user.is_superuser):
            teacher = Employee.objects.filter(organization=user.organization, email__iexact=user.email, employee_type="teacher").first()
            if not teacher:
                raise Http404
            if material.subject_id:
                from apps.courses.services import ensure_teacher_subject_scope
                from rest_framework.exceptions import PermissionDenied
                try:
                    ensure_teacher_subject_scope(teacher, user.organization, material.subject)
                except PermissionDenied:
                    raise Http404
            elif not TeacherAssignment.objects.filter(
                organization=user.organization, teacher=teacher, course=material.course,
                is_active=True, assignment_status="accepted",
            ).filter(Q(course_section__isnull=True) | Q(course_section=material.course_section)).exists():
                raise Http404
        return _serve_file(request, material)
    enrollment = Enrollment.objects.select_related("student", "course").filter(
        pk=payload.get("enrollment"), organization=user.organization,
        student__email__iexact=user.email,
        status=EnrollmentStatus.ACTIVE,
    ).first()
    if not enrollment:
        raise Http404
    material = CourseMaterial.objects.select_related("curriculum_chapter__week").filter(
        pk=material_id, organization=enrollment.organization, course=enrollment.course,
        is_published=True, status="published", review_status="approved",
    ).first()
    if not material or not material.file or not content_is_released(material):
        raise Http404
    if material.course_section_id and material.course_section_id != enrollment.course_section_id:
        raise Http404
    if enrollment.course_section_id and material.subject_id and material.subject.course_section_id != enrollment.course_section_id:
        raise Http404
    if material.publish_at and material.publish_at > timezone.now():
        raise Http404

    return _serve_file(request, material)


def _serve_file(request, material):

    name = material.file.name
    content_type = mimetypes.guess_type(name)[0] or "application/octet-stream"
    size = material.file.size
    range_header = request.headers.get("Range", "")
    if range_header:
        match = re.fullmatch(r"bytes=(\d+)-(\d*)", range_header)
        if not match or size == 0:
            return HttpResponse(status=416, headers={"Content-Range": f"bytes */{size}"})
        start = int(match.group(1))
        end = int(match.group(2)) if match.group(2) else size - 1
        if start >= size or end < start:
            return HttpResponse(status=416, headers={"Content-Range": f"bytes */{size}"})
        end = min(end, size - 1)
        response = StreamingHttpResponse(_chunks(material.file.open("rb"), start, end - start + 1), status=206, content_type=content_type)
        response["Content-Range"] = f"bytes {start}-{end}/{size}"
        response["Content-Length"] = end - start + 1
    else:
        response = FileResponse(material.file.open("rb"), content_type=content_type)
        response["Content-Length"] = size
    response["Accept-Ranges"] = "bytes"
    response["Content-Disposition"] = content_disposition_header(False, name.rsplit("/", 1)[-1])
    response["Cache-Control"] = "private, no-store"
    return response
