"""python scripts/trace_queries.py email:<user> <path> <table-substring> : show call sites of matching queries (GET only)."""
import os, sys, traceback, django
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings"); django.setup()
from django.db import connection
from rest_framework.test import APIClient
from apps.accounts.models import User
who, path, needle = sys.argv[1], sys.argv[2], sys.argv[3]
u = User.objects.get(email=who[6:])
def wrapper(execute, sql, params, many, context):
    if needle in sql:
        frames = [f for f in traceback.extract_stack() if "apps" + os.sep in f.filename and "scripts" not in f.filename]
        print("-", needle, "<-", " > ".join(f"{os.path.basename(f.filename)}:{f.lineno}({f.name})" for f in frames[-3:]))
    return execute(sql, params, many, context)
cl = APIClient(); cl.force_authenticate(u)
with connection.execute_wrapper(wrapper):
    r = cl.get(path, HTTP_HOST="localhost")
print(r.status_code)
