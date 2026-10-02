"""Copy legacy MySQL data into Neon (shell-independent).

Usage (from backend/, venv active):
    python scripts/copy_mysql_to_neon.py            # wipe target, copy, verify
    python scripts/copy_mysql_to_neon.py --dry-run  # counts only
"""
import os
import subprocess
import sys
from pathlib import Path

BACKEND = Path(__file__).resolve().parent.parent


def load_env(path):
    values = {}
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, val = line.partition("=")
        values[key.strip()] = val.strip().strip('"').strip("'")
    return values


env_file = load_env(BACKEND / ".env")
env = {**os.environ, **env_file}
env["DATABASE_URL"] = env_file.get("DATABASE_URL_UNPOOLED") or env_file["DATABASE_URL"]
env["LEGACY_MYSQL_NAME"] = env_file["DB_NAME"]
env["LEGACY_MYSQL_USER"] = env_file.get("DB_USER", "")
env["LEGACY_MYSQL_PASSWORD"] = env_file.get("DB_PASSWORD", "")
env["LEGACY_MYSQL_HOST"] = env_file.get("DB_HOST", "localhost")
env["LEGACY_MYSQL_PORT"] = env_file.get("DB_PORT", "3306")


def manage(*args):
    cmd = [sys.executable, "manage.py", "migrate_mysql_to_postgres", *args]
    print(">", " ".join(cmd[1:]), flush=True)
    return subprocess.call(cmd, cwd=BACKEND, env=env)


if "--dry-run" in sys.argv:
    sys.exit(manage("--dry-run"))

if manage("--wipe-target") != 0:
    sys.exit("Copy failed; nothing was committed (single transaction).")
sys.exit(manage("--verify", "--report", "../MYSQL_TO_POSTGRES_NEON_VALIDATION.md"))
