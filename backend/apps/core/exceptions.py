from rest_framework.views import exception_handler


def api_exception_handler(exc, context):
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

