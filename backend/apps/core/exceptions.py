import logging

from django.db import InterfaceError, OperationalError
from django.db.models.deletion import ProtectedError, RestrictedError
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import exception_handler

logger = logging.getLogger("django.request")


def _supports_archive(view):
    model = getattr(getattr(view, "queryset", None), "model", None)
    try:
        status_field = model._meta.get_field("status")
    except Exception:
        return False
    return any(value == "archived" for value, _ in (status_field.choices or []))


def _protected_response(exc, context):
    """Historical records reference this object: 409 Conflict instead of a 500."""
    objects = getattr(exc, "protected_objects", None) or getattr(exc, "restricted_objects", None) or []
    names = sorted({str(obj._meta.verbose_name_plural) for obj in objects})
    target = getattr(getattr(getattr(context.get("view"), "queryset", None), "model", None), "_meta", None)
    label = str(target.verbose_name) if target else "record"
    detail = f"This {label} cannot be deleted because existing {', '.join(names) or 'records'} reference it."
    action = "archive" if _supports_archive(context.get("view")) else None
    if action:
        detail += " Archive it instead."
    logger.warning("Protected delete blocked: %s", detail)
    return Response(
        {"success": False, "code": "RESOURCE_IN_USE", "message": detail, "detail": detail, "action": action, "errors": {}},
        status=status.HTTP_409_CONFLICT,
    )


def api_exception_handler(exc, context):
    if isinstance(exc, (ProtectedError, RestrictedError)):
        return _protected_response(exc, context)
    if isinstance(exc, (OperationalError, InterfaceError)):
        # Database unreachable/timeouts: log server-side, never leak hosts, credentials or stack traces.
        logger.error("Database unavailable: %s", exc.__class__.__name__)
        return Response(
            {"success": False, "message": "The service is temporarily unavailable. Please try again shortly.", "errors": {}},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )
    response = exception_handler(exc, context)

    if response is None:
        return response

    detail = response.data
    message = "Request failed."
    errors = detail

    if isinstance(detail, dict) and "detail" in detail:
        message = str(detail["detail"])
        errors = {}

    response.data = {
        "success": False,
        "message": message,
        "errors": errors,
    }
    return response

