"""Teaches drf-spectacular how our custom classes appear in the API schema."""

from drf_spectacular.authentication import SessionScheme


class CsrfSessionScheme(SessionScheme):
    # Same session cookie as DRF's SessionAuthentication; only the CSRF rule differs.
    target_class = "apps.core.authentication.CsrfSessionAuthentication"
