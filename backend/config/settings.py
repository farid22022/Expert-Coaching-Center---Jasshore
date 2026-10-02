from datetime import timedelta
from pathlib import Path
import os
import sys
from urllib.parse import parse_qsl, unquote, urlparse

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
# The project .env is the source of truth for this local backend. This also
# prevents an unrelated machine-level DEBUG variable from disabling dev assets.
load_dotenv(BASE_DIR / ".env", override=True)


def env(name, default=None):
    return os.getenv(name, default)


SECRET_KEY = env("DJANGO_SECRET_KEY", "unsafe-dev-key-change-me")
DEBUG = env("DEBUG", "False").lower() == "true"
ALLOWED_HOSTS = [h.strip() for h in env("ALLOWED_HOSTS", "localhost,127.0.0.1").split(",") if h.strip()]

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "corsheaders",
    "django_filters",
    "drf_spectacular",
    "rest_framework",
    "rest_framework_simplejwt.token_blacklist",
    "apps.core",
    "apps.organizations",
    "apps.accounts",
    "apps.academic",
    "apps.people",
    "apps.courses",
    "apps.assessments",
    "apps.admissions",
    "apps.payments",
    "apps.exams",
    "apps.finance",
    "apps.hr",
    "apps.messaging",
    "apps.website",
    "apps.audit",
    "apps.integrations",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"
WSGI_APPLICATION = "config.wsgi.application"
ASGI_APPLICATION = "config.asgi.application"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {"context_processors": [
            "django.template.context_processors.debug",
            "django.template.context_processors.request",
            "django.contrib.auth.context_processors.auth",
            "django.contrib.messages.context_processors.messages",
        ]},
    }
]

def _database_from_url(url):
    """Parse DATABASE_URL (postgresql://user:pass@host:port/db?sslmode=require)."""
    parsed = urlparse(url)
    if parsed.scheme not in {"postgres", "postgresql", "postgresql+psycopg"}:
        raise ValueError("DATABASE_URL must be a postgresql:// URL.")
    options = dict(parse_qsl(parsed.query))
    config = {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": unquote(parsed.path.lstrip("/")),
        "USER": unquote(parsed.username or ""),
        "PASSWORD": unquote(parsed.password or ""),
        "HOST": parsed.hostname or "localhost",
        "PORT": str(parsed.port or 5432),
        "CONN_MAX_AGE": int(env("DB_CONN_MAX_AGE", "30")),
        "CONN_HEALTH_CHECKS": True,
        "OPTIONS": {k: v for k, v in options.items() if k in {"sslmode", "channel_binding", "sslrootcert", "connect_timeout", "application_name"}},
    }
    # Neon requires TLS; default to it for remote hosts unless the URL says otherwise.
    if config["HOST"] not in {"localhost", "127.0.0.1", "::1"}:
        config["OPTIONS"].setdefault("sslmode", "require")
    config["OPTIONS"].setdefault("connect_timeout", "10")
    return config


DATABASE_URL = env("DATABASE_URL", "")
LEGACY_MYSQL_MIGRATION_MODE = bool(env("LEGACY_MYSQL_NAME", ""))

if DATABASE_URL:
    # Production / Neon / local PostgreSQL. Only PostgreSQL is supported here.
    DATABASES = {"default": _database_from_url(DATABASE_URL)}
else:
    # Pre-cutover fallback: the original MySQL/MariaDB database. Remove once the
    # PostgreSQL cutover is complete and rollback is no longer required.
    import pymysql

    pymysql.install_as_MySQLdb()
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.mysql",
            "NAME": env("DB_NAME", "expert_coaching"),
            "USER": env("DB_USER", "expert_user"),
            "PASSWORD": env("DB_PASSWORD", ""),
            "HOST": env("DB_HOST", "localhost"),
            "PORT": env("DB_PORT", "3306"),
            "OPTIONS": {"charset": "utf8mb4"},
        }
    }

if LEGACY_MYSQL_MIGRATION_MODE:
    # Migration tooling only (manage.py migrate_mysql_to_postgres). Never set in production.
    import pymysql

    pymysql.install_as_MySQLdb()
    DATABASES["legacy_mysql"] = {
        "ENGINE": "django.db.backends.mysql",
        "NAME": env("LEGACY_MYSQL_NAME"),
        "USER": env("LEGACY_MYSQL_USER", ""),
        "PASSWORD": env("LEGACY_MYSQL_PASSWORD", ""),
        "HOST": env("LEGACY_MYSQL_HOST", "localhost"),
        "PORT": env("LEGACY_MYSQL_PORT", "3306"),
        "OPTIONS": {"charset": "utf8mb4"},
    }

# Tests use SQLite unless TEST_USE_DATABASE_URL=1 (then they run against the PostgreSQL DATABASE_URL).
if "test" in sys.argv and not (DATABASE_URL and env("TEST_USE_DATABASE_URL", "") == "1"):
    DATABASES = {"default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "test.sqlite3",
    }}

AUTH_USER_MODEL = "accounts.User"
AUTHENTICATION_BACKENDS = ["apps.accounts.backends.CaseInsensitiveEmailBackend"]
LOGIN_REDIRECT_URL = "/api/v1/"
LOGOUT_REDIRECT_URL = "/api/v1/"

REST_FRAMEWORK = {
    "DEFAULT_RENDERER_CLASSES": (
        "rest_framework.renderers.JSONRenderer",
        "rest_framework.renderers.BrowsableAPIRenderer",
    ),
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": ("rest_framework.permissions.IsAuthenticated",),
    "DEFAULT_FILTER_BACKENDS": (
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ),
    "DEFAULT_PAGINATION_CLASS": "apps.core.pagination.StandardResultsSetPagination",
    "PAGE_SIZE": 20,
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "EXCEPTION_HANDLER": "apps.core.exceptions.api_exception_handler",
    "DEFAULT_THROTTLE_CLASSES": (
        "rest_framework.throttling.UserRateThrottle",
    ),
    "DEFAULT_THROTTLE_RATES": {
        # SPA screens legitimately make several parallel reads; keep a high
        # configurable authenticated limit while retaining strict test-submit limits.
        "user": env("API_USER_RATE_LIMIT", "1000/min"),
        "assessment_submit": "20/min",
    },
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=int(env("ACCESS_TOKEN_MINUTES", "30"))),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=int(env("REFRESH_TOKEN_DAYS", "7"))),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
}

CORS_ALLOWED_ORIGINS = [
    u.strip()
    for u in env("CORS_ALLOWED_ORIGINS", env("FRONTEND_URL", "http://localhost:5173")).split(",")
    if u.strip()
]
for local_origin in ("http://localhost:5173", "http://127.0.0.1:5173"):
    if local_origin not in CORS_ALLOWED_ORIGINS:
        CORS_ALLOWED_ORIGINS.append(local_origin)
CORS_ALLOWED_ORIGINS += [o.strip() for o in env("CORS_EXTRA_ORIGINS", "").split(",") if o.strip() and o.strip() not in CORS_ALLOWED_ORIGINS]
CSRF_TRUSTED_ORIGINS = CORS_ALLOWED_ORIGINS

LANGUAGE_CODE = "en-us"
TIME_ZONE = "Asia/Dhaka"
USE_I18N = True
USE_TZ = True

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_DIRS = [BASE_DIR / "static"] if (BASE_DIR / "static").is_dir() else []
MEDIA_URL = env("MEDIA_URL", "/media/")
MEDIA_ROOT = BASE_DIR / env("MEDIA_ROOT", "media")
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# Integration secrets (server-side only; never exposed to the frontend).
# Master key for encrypting admin-saved integration API keys (Fernet key). Keep outside the DB.
APP_CONFIG_ENCRYPTION_KEY = env("APP_CONFIG_ENCRYPTION_KEY", "")
# Optional ImgBB fallback used when no admin-configured key is enabled.
IMGBB_API_KEY = env("IMGBB_API_KEY", "")
IMGBB_TIMEOUT_SECONDS = int(env("IMGBB_TIMEOUT_SECONDS", "20"))

PAYMENT_PROVIDER = env("PAYMENT_PROVIDER", "bkash").lower()
BKASH_MODE = env("BKASH_MODE", "mock").lower()
BKASH_MOCK_ENABLED = env("BKASH_MOCK_ENABLED", "false").lower() == "true"
BKASH_MOCK_DEFAULT_RESULT = env("BKASH_MOCK_DEFAULT_RESULT", "manual")
BKASH_MOCK_DELAY_MS = int(env("BKASH_MOCK_DELAY_MS", "700"))
BKASH_MOCK_ACCOUNT = env("BKASH_MOCK_ACCOUNT", "01700000000")
BKASH_MOCK_OTP = env("BKASH_MOCK_OTP", "123456")
BKASH_MOCK_PIN = env("BKASH_MOCK_PIN", "12121")
BKASH_APP_KEY = env("BKASH_APP_KEY", "")
BKASH_APP_SECRET = env("BKASH_APP_SECRET", "")
BKASH_USERNAME = env("BKASH_USERNAME", "")
BKASH_PASSWORD = env("BKASH_PASSWORD", "")
BKASH_TOKEN_URL = env("BKASH_TOKEN_URL", "")
BKASH_CREATE_PAYMENT_URL = env("BKASH_CREATE_PAYMENT_URL", "")
BKASH_EXECUTE_PAYMENT_URL = env("BKASH_EXECUTE_PAYMENT_URL", "")
BKASH_QUERY_PAYMENT_URL = env("BKASH_QUERY_PAYMENT_URL", "")
BKASH_CALLBACK_URL = env("BKASH_CALLBACK_URL", "http://127.0.0.1:8000/api/v1/payments/bkash/callback/")
BKASH_FRONTEND_RETURN_URL = env("BKASH_FRONTEND_RETURN_URL", "http://127.0.0.1:5173/student/payments/result")
BKASH_CURRENCY = env("BKASH_CURRENCY", "BDT")
BKASH_WEBHOOK_SECRET = env("BKASH_WEBHOOK_SECRET", "")
if PAYMENT_PROVIDER != "bkash":
    raise ValueError("PAYMENT_PROVIDER must be bkash.")
if BKASH_MODE not in {"mock", "sandbox", "live"}:
    raise ValueError("BKASH_MODE must be mock, sandbox, or live.")
if not DEBUG and BKASH_MODE == "mock":
    raise ValueError("Mock bKash is forbidden when DEBUG=False.")

SPECTACULAR_SETTINGS = {
    "TITLE": "Expert Coaching Center API",
    "DESCRIPTION": "School/Institute Management System backend API.",
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
}
