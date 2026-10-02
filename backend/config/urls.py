from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


admin.site.site_header = "Expert Coaching Center Administration"
admin.site.site_title = "Expert Coaching Admin"
admin.site.index_title = "School ERP Administration Dashboard"


@api_view(["GET"])
@permission_classes([AllowAny])
def browsable_api_root(request):
    """Entry point for browsing the API using JWT or a browser session."""
    return Response({
        name: request.build_absolute_uri(f"/api/v1/{name}/")
        for name in (
            "auth", "organizations", "academic", "people", "courses", "assessments",
            "applications", "payments", "exams", "finance", "hr", "sms", "website", "audit",
        )
    })


def api_root(request):
    return JsonResponse(
        {
            "name": "Expert Coaching Center API",
            "status": "ok",
            "docs": "/api/docs/",
            "schema": "/api/schema/",
            "api_base": "/api/v1/",
        }
    )

urlpatterns = [
    path("", api_root, name="api-root"),
    path("health/", api_root, name="health-check"),
    path("admin/", admin.site.urls),
    path("api-auth/", include("rest_framework.urls")),
    path("api/v1/", browsable_api_root, name="browsable-api-root"),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/v1/auth/", include("apps.accounts.urls")),
    path("api/v1/organizations/", include("apps.organizations.urls")),
    path("api/v1/academic/", include("apps.academic.urls")),
    path("api/v1/people/", include("apps.people.urls")),
    path("api/v1/courses/", include("apps.courses.urls")),
    path("api/v1/assessments/", include("apps.assessments.urls")),
    path("api/v1/applications/", include("apps.admissions.urls")),
    path("api/v1/admissions/", include("apps.admissions.urls")),
    path("api/v1/payments/", include("apps.payments.urls")),
    path("api/v1/exams/", include("apps.exams.urls")),
    path("api/v1/finance/", include("apps.finance.urls")),
    path("api/v1/hr/", include("apps.hr.urls")),
    path("api/v1/sms/", include("apps.messaging.urls")),
    path("api/v1/website/", include("apps.website.urls")),
    path("api/v1/audit/", include("apps.audit.urls")),
    path("api/v1/", include("apps.integrations.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    # Academic lesson uploads have a signed, enrollment-scoped delivery endpoint.
    # Do not let Django's development media server bypass those checks.
    from django.http import HttpResponseNotFound
    from django.urls import re_path
    urlpatterns += [re_path(r"^media/assessments/materials/.*$", lambda request: HttpResponseNotFound())]
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
