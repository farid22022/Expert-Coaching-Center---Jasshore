"""python scripts/measure_student.py <email> : query counts of every student-dashboard endpoint, using a real JWT (GET only)."""
import os, sys, time, django
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings"); django.setup()
from django.db import connection
from django.test.utils import CaptureQueriesContext
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import AccessToken
from apps.accounts.models import User
from apps.courses.models import Enrollment
u = User.objects.get(email=sys.argv[1])
enr = Enrollment.objects.filter(student__email=u.email, status="active").first()
cl = APIClient(); cl.credentials(HTTP_AUTHORIZATION=f"Bearer {AccessToken.for_user(u)}")
paths = ["/api/v1/auth/me/", "/api/v1/courses/student/dashboard/", f"/api/v1/courses/student/dashboard/{enr.id}/content/" if enr else None,
  "/api/v1/assessments/student/assessments/dashboard/", "/api/v1/assessments/student/assessments/performance/",
  "/api/v1/assessments/student/assessments/history/", "/api/v1/assessments/student/assessments/materials/",
  "/api/v1/assessments/student/assessments/recommended/", "/api/v1/assessments/student/assessments/actions/",
  "/api/v1/assessments/student/assessments/feedback/", "/api/v1/sms/notifications/?page_size=5", "/api/v1/sms/notifications/unread_count/",
  "/api/v1/assessments/student/assessments/?page_size=100"]
cl.get("/api/v1/auth/me/", HTTP_HOST="localhost")  # warm pool
tot = 0
for p in filter(None, paths):
    with CaptureQueriesContext(connection) as q:
        t = time.perf_counter(); r = cl.get(p, HTTP_HOST="localhost"); ms = (time.perf_counter() - t) * 1000
    tot += len(q)
    print(f"{r.status_code} q={len(q):3d} {ms:6.0f}ms {p}")
print("TOTAL queries", tot)

if len(sys.argv) > 2:
    import re
    with CaptureQueriesContext(connection) as q:
        cl.get(sys.argv[2], HTTP_HOST="localhost")
    for x in q.captured_queries:
        sql = re.sub(r"\s+", " ", x["sql"])
        tables = re.findall(r'FROM "(\w+)"', sql)[:1] + [f"JOIN {t}" for t in re.findall(r'JOIN "(\w+)"', sql)[:3]]
        where = re.search(r"WHERE (.{0,110})", sql)
        print("  *", " ".join(tables), "|", where.group(1) if where else "")
