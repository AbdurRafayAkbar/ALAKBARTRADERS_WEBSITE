"""Local development on the Windows PC. Never used on the server."""

from .base import *  # noqa: F403

DEBUG = True
ALLOWED_HOSTS = ["localhost", "127.0.0.1"]

# Print emails in the runserver terminal instead of sending them.
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
