"""python scripts/show_queries.py <role> <path> : print normalized SQL of each query (GET only)."""
import os, sys, re, collections, django
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings"); django.setup()
from django.db import connection
from django.test.utils import CaptureQueriesContext
from rest_framework.test import APIClient
from apps.accounts.models import User
role, path = sys.argv[1], sys.argv[2]
qs = User.objects.filter(is_active=True)
u = (qs.filter(is_superuser=True).first() if role == "admin" else qs.get(email=role[6:]) if role.startswith("email:") else qs.filter(roles__code__iexact=role).first())
cl = APIClient(); cl.force_authenticate(u)
with CaptureQueriesContext(connection) as q:
    r = cl.get(path, HTTP_HOST="localhost")
print(r.status_code, len(q))
for x in q.captured_queries:
    print("-", re.sub(r"\s+", " ", x["sql"])[:230])
