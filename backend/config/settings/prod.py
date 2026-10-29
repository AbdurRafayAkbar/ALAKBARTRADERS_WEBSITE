"""
Production on the VPS, behind Nginx with HTTPS.

DJANGO_ALLOWED_HOSTS must be set (base.py reads it), e.g. "alakbartraders.pk".
"""

from .base import *  # noqa: F403
from .base import env

DEBUG = False

# Nginx terminates HTTPS and tells Django through this header.
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
CSRF_TRUSTED_ORIGINS = env.list("DJANGO_CSRF_TRUSTED_ORIGINS", default=[])

# Browsers use HTTPS only for one year. Start lower if the domain is new.
SECURE_HSTS_SECONDS = env.int("DJANGO_HSTS_SECONDS", default=31536000)
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = False
