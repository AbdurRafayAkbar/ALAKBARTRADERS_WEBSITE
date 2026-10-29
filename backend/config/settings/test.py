"""Settings for pytest. Uses the same PostgreSQL server; Django creates a separate test database."""

from .base import *  # noqa: F403

DEBUG = False
ALLOWED_HOSTS = ["testserver"]

# Fast hashing: real hashers are slow on purpose, which slows every test that creates a user.
PASSWORD_HASHERS = ["django.contrib.auth.hashers.MD5PasswordHasher"]
EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"
