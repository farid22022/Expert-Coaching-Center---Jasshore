"""PostgreSQL post-migration smoke check. Run with DATABASE_URL set:

    python scripts/pg_smoke_check.py

Checks sequences, password-hash preservation, role logins (case-insensitive email) and
Bangla/Unicode round-trips. Credentials come from tested_profiles_credentials.txt (local fixtures)
and are never printed.
"""
import os
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
import django  # noqa: E402

django.setup()

from django.db import connection
from rest_framework.test import APIClient

assert connection.vendor == "postgresql", "run against PostgreSQL"

# 1. sequences ahead of max(pk) on every serial table
bad = 0
with connection.cursor() as cur:
    cur.execute("select table_name from information_schema.columns where table_schema='public' and column_name='id' and (is_identity = 'YES' or column_default like 'nextval%%')")
    tables = [r[0] for r in cur.fetchall()]
    for t in tables:
        cur.execute(f'select coalesce(max(id),0) from "{t}"')
        mx = cur.fetchone()[0]
        cur.execute("select pg_get_serial_sequence(%s,'id')", [t])
        seq = cur.fetchone()[0]
        cur.execute(f"select last_value, is_called from {seq}")
        last, called = cur.fetchone()
        nxt = last + 1 if called else last
        if nxt <= mx:
            bad += 1
            print("SEQUENCE BEHIND", t, mx, nxt)
print(f"sequences checked: {len(tables)}, behind: {bad}")

# 2. logins
text = Path(__file__).resolve().parents[2].joinpath("tested_profiles_credentials.txt").read_text(encoding="utf-8")
blocks = re.findall(r"(ADMIN|HEAD TEACHER|TEACHER|STUDENT)\n-+\n.*?Username/Email: (\S+)\nPassword: (\S+)", text, re.S)
client = APIClient()
for role, email, pw in blocks:
    for variant in (email, email.upper()):
        r = client.post("/api/v1/auth/login/", {"email": variant, "password": pw}, format="json", HTTP_HOST="localhost")
        print(f"login {role:12} {'exact' if variant == email else 'UPPER':5} -> {r.status_code}")
r = client.post("/api/v1/auth/login/", {"email": blocks[0][1], "password": "definitely-wrong"}, format="json", HTTP_HOST="localhost")
print("wrong password ->", r.status_code)

# 2b. demo accounts (shared demo password from demo-credentials.md): a head teacher and a student
demo = Path(__file__).resolve().parents[2].joinpath("demo-credentials.md").read_text(encoding="utf-8")
demo_pw = re.search(r"\| 1 \| demo\.teacher01@gmail\.com \| (\S+) \|", demo).group(1)
from apps.courses.models import TeacherAssignment  # noqa: E402
from apps.people.models import Student  # noqa: E402

ht = TeacherAssignment.objects.filter(role="head_teacher", teacher__email__startswith="demo.").select_related("teacher").first()
student_email = Student.objects.filter(email__startswith="demo.").values_list("email", flat=True).first()
for role, email in (("HEAD TEACHER*", ht.teacher.email if ht else None), ("STUDENT*", student_email)):
    if email:
        r = client.post("/api/v1/auth/login/", {"email": email.upper(), "password": demo_pw}, format="json", HTTP_HOST="localhost")
        print(f"login {role:13} UPPER -> {r.status_code}")
    else:
        print(f"login {role:13} no demo account found")

# 3. Unicode round trip on a throwaway table row
from apps.messaging.models import Notice  # noqa: E402
from apps.organizations.models import Organization  # noqa: E402
from django.db import transaction  # noqa: E402

sample = "বাংলা নোটিশ ✓ — ঢাকা, যশোর 😀 <p>Rich “text” & more</p>"
try:
    with transaction.atomic():
        org = Organization.objects.first()
        fields = {f.name for f in Notice._meta.get_fields()}
        kwargs = {"organization": org, "title": sample}
        if "content" in fields:
            kwargs["content"] = sample
        n = Notice.objects.create(**kwargs)
        n.refresh_from_db()
        print("unicode round-trip:", "OK" if n.title == sample else "MISMATCH")
        raise RuntimeError("rollback")
except RuntimeError:
    pass
