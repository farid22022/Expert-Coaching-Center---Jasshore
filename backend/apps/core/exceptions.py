import logging

from django.db import InterfaceError, OperationalError
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import exception_handler

logger = logging.getLogger("django.request")


def api_exception_handler(exc, context):
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

