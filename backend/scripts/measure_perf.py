import os, sys, django
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()
"""Read-only API perf probe: python scripts/measure_perf.py
Reports SQL query count, wall time and payload size per endpoint (GET only)."""
import json, os, time
from django.db import connection
from django.test.utils import CaptureQueriesContext
from django.conf import settings
from rest_framework.test import APIClient
from apps.accounts.models import User

settings.ALLOWED_HOSTS = ["*"]
# connection RTT: trivial query x10 on a warm connection
with connection.cursor() as c:
    c.execute("select 1")
    t = time.perf_counter()
    for _ in range(10): c.execute("select 1")
    print("RTT select1 avg ms: %.1f" % ((time.perf_counter() - t) * 100))
    c.execute("select version()"); print(c.fetchone()[0][:40])
t = time.perf_counter(); connection.close(); connection.ensure_connection()
print("connect ms: %.0f" % ((time.perf_counter() - t) * 1000))

ROLES = {"admin": os.environ.get("PERF_ADMIN", ""), "student": os.environ.get("PERF_STUDENT", "")}
def user_for(role):
    qs = User.objects.filter(is_active=True)
    if role == "admin": return qs.filter(is_superuser=True).first() or qs.filter(roles__code__iexact="admin").first()
    return qs.filter(roles__code__iexact="student").first()

PATHS = {
 "admin": ["/api/v1/auth/me/", "/api/v1/applications/?page_size=200&ordering=-created_at",
   "/api/v1/people/employees/?employee_type=teacher&page_size=100",
   "/api/v1/courses/teacher-assignments/?page_size=200", "/api/v1/courses/courses/?page_size=100",
   "/api/v1/applications/?page_size=20&ordering=-created_at"],
 "student": ["/api/v1/auth/me/", "/api/v1/assessments/student/assessments/?page_size=100", "/api/v1/sms/notifications/?page_size=5"],
}
for role, paths in PATHS.items():
    u = user_for(role)
    if not u: print(role, "no user"); continue
    cl = APIClient(); cl.force_authenticate(u)
    for p in paths:
        with CaptureQueriesContext(connection) as q:
            t = time.perf_counter(); r = cl.get(p, HTTP_HOST="localhost"); ms = (time.perf_counter() - t) * 1000
        print(f"{role:7} {r.status_code} q={len(q):4d} {ms:7.0f}ms {len(r.content)/1024:7.1f}KB {p}")
