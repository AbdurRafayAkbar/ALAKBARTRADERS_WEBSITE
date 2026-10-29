from rest_framework.authentication import SessionAuthentication


class CsrfSessionAuthentication(SessionAuthentication):
    """
    Session auth that checks the CSRF token for anonymous users too.

    DRF's SessionAuthentication checks CSRF only once a user is logged in, so an
    anonymous POST (login, signup, add to cart) would skip it. Login CSRF and
    forged cart or checkout requests are real risks, so every unsafe request
    must carry the X-CSRFToken header. Safe methods (GET, HEAD, OPTIONS) pass.
    """

    def authenticate(self, request):
        user = getattr(request._request, "user", None)
        if not user or not user.is_active:
            self.enforce_csrf(request)
            return None
        return super().authenticate(request)
