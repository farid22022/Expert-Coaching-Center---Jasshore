"""Run the API against a PostgreSQL DATABASE_URL on port 8001 (side-by-side with the MySQL dev server).

    PG_DEV_DATABASE_URL=postgresql://... python scripts/run_pg_dev.py
"""
import os
import subprocess
import sys
from pathlib import Path

root = Path(__file__).resolve().parents[1]
env = dict(os.environ)
url_file = Path(__file__).with_name(".pg_dev_url")
env["DATABASE_URL"] = env.get("PG_DEV_DATABASE_URL") or (url_file.read_text().strip() if url_file.exists() else "")
if not env["DATABASE_URL"]:
    sys.exit("Set PG_DEV_DATABASE_URL or create scripts/.pg_dev_url - refusing to start on MySQL.")
env["CORS_EXTRA_ORIGINS"] = "http://127.0.0.1:5174,http://localhost:5174"
env.setdefault("PYTHONUTF8", "1")
env.setdefault("APP_CONFIG_ENCRYPTION_KEY", "throwaway-verification-only-key-0123456789")  # dev verification DB only
sys.exit(subprocess.call([sys.executable, "manage.py", "runserver", "127.0.0.1:8001", "--noreload"], cwd=root, env=env))
