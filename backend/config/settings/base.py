"""
Settings shared by every environment.

Values that change between dev and prod (secrets, hosts, database) come from
environment variables, read from `backend/.env` in dev. See `.env.example`.
dev.py and prod.py import everything from here and override only what differs.
"""

from pathlib import Path

import environ

# backend/ (this file is backend/config/settings/base.py)
BASE_DIR = Path(__file__).resolve().parent.parent.parent

env = environ.Env()
# Real environment variables win over the file, so the server can skip .env.
environ.Env.read_env(BASE_DIR / ".env", overwrite=False)

SECRET_KEY = env("DJANGO_SECRET_KEY")
DEBUG = False
ALLOWED_HOSTS = env.list("DJANGO_ALLOWED_HOSTS", default=[])

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # Third party
    "rest_framework",
    "drf_spectacular",
    # Our apps
    "apps.core",
    "apps.accounts",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    # Serves the Vite build (WHITENOISE_ROOT) and collected static files.
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

# One URL holds driver, user, password, host, port and database name,
# e.g. postgres://user:password@localhost:5432/alakbartraders
DATABASES = {"default": env.db("DATABASE_URL")}
# Every request runs in one transaction: all its writes save, or none do.
DATABASES["default"]["ATOMIC_REQUESTS"] = True
# Keep connections open for 60 s instead of reconnecting on every request.
DATABASES["default"]["CONN_MAX_AGE"] = env.int("DATABASE_CONN_MAX_AGE", default=60)

# Must be set before the first migrate; changing it later is very hard.
AUTH_USER_MODEL = "accounts.User"

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# English now; i18n stays on so Urdu can be added later.
LANGUAGE_CODE = "en"
TIME_ZONE = "Asia/Karachi"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
MEDIA_URL = "media/"
MEDIA_ROOT = BASE_DIR / "media"

# The Vite build (`npm run build` in frontend/). Django sends its index.html for
# page URLs (apps/core/shell.py) and WhiteNoise serves its /assets/ files.
FRONTEND_DIST_DIR = Path(
    env("FRONTEND_DIST_DIR", default=str(BASE_DIR.parent / "frontend" / "dist"))
)
WHITENOISE_ROOT = FRONTEND_DIST_DIR if FRONTEND_DIST_DIR.is_dir() else None
# Vite puts a content hash in every /assets/ file name (index-BIFjTqe8.js), so a
# changed file gets a new name and browsers may keep the old one for a year.
WHITENOISE_IMMUTABLE_FILE_TEST = r"^/assets/"

# Origin for canonical and og:url links, e.g. https://alakbartraders.pk.
# Empty means the origin the request came in on, which is fine in dev.
SITE_URL = env("DJANGO_SITE_URL", default="")

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# React reads this cookie to send the X-CSRFToken header, so it must not be HttpOnly.
CSRF_COOKIE_HTTPONLY = False

REST_FRAMEWORK = {
    # Same-origin session cookie, with CSRF checked for anonymous users too.
    "DEFAULT_AUTHENTICATION_CLASSES": ["apps.core.authentication.CsrfSessionAuthentication"],
    # Closed by default: every public endpoint opts in with AllowAny.
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.IsAuthenticated"],
    "DEFAULT_RENDERER_CLASSES": ["rest_framework.renderers.JSONRenderer"],
    "DEFAULT_PARSER_CLASSES": ["rest_framework.parsers.JSONParser"],
    "EXCEPTION_HANDLER": "apps.core.exceptions.api_exception_handler",
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    # Money goes out as strings ("1250.00") so JavaScript never turns it into a float.
    "COERCE_DECIMAL_TO_STRING": True,
}

SPECTACULAR_SETTINGS = {
    "TITLE": "ALAKBARTRADERS API",
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
    "SERVE_PERMISSIONS": ["rest_framework.permissions.IsAdminUser"],
}
