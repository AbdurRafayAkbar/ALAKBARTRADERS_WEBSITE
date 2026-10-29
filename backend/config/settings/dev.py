"""Local development on the Windows PC. Never used on the server."""

from .base import *  # noqa: F403
from .base import REST_FRAMEWORK, SPECTACULAR_SETTINGS

DEBUG = True
ALLOWED_HOSTS = ["localhost", "127.0.0.1"]

# Print emails in the runserver terminal instead of sending them.
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

# Clickable API pages in the browser, and the schema open to everyone.
REST_FRAMEWORK["DEFAULT_RENDERER_CLASSES"] = [
    "rest_framework.renderers.JSONRenderer",
    "rest_framework.renderers.BrowsableAPIRenderer",
]
SPECTACULAR_SETTINGS["SERVE_PERMISSIONS"] = ["rest_framework.permissions.AllowAny"]
