"""
Customer accounts over the session cookie (Architecture.md §6).

Accounts are optional: guests can still order. Every POST here needs the
X-CSRFToken header, logged in or not (CsrfSessionAuthentication).
"""

from django.conf import settings
from django.contrib.auth import get_user_model, login, logout
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import (
    LoginSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    SignupSerializer,
    UserSerializer,
)

User = get_user_model()


class SignupView(APIView):
    """Creates an account and logs the new user in."""

    permission_classes = [AllowAny]
    throttle_scope = "signup"

    @extend_schema(request=SignupSerializer, responses={201: UserSerializer})
    def post(self, request):
        serializer = SignupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        login(request, user)
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    """Checks the email and password, then starts a session."""

    permission_classes = [AllowAny]
    # Slows down password guessing (DEFAULT_THROTTLE_RATES in base.py).
    throttle_scope = "login"

    @extend_schema(request=LoginSerializer, responses={200: UserSerializer})
    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        # Gives a new session id and a new CSRF token, so a session id or token
        # someone saw before login is useless after it.
        login(request, user)
        return Response(UserSerializer(user).data)


class LogoutView(APIView):
    """Ends the session. Safe to call when already logged out."""

    permission_classes = [AllowAny]

    @extend_schema(request=None, responses={204: None})
    def post(self, request):
        logout(request)
        return Response(status=status.HTTP_204_NO_CONTENT)


class MeView(APIView):
    """The logged-in user, or 204 No Content for a guest (not an error)."""

    permission_classes = [AllowAny]

    @extend_schema(responses={200: UserSerializer, 204: None})
    def get(self, request):
        if not request.user.is_authenticated:
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response(UserSerializer(request.user).data)


class PasswordResetRequestView(APIView):
    """
    Emails a reset link. Always answers 204, so nobody can use this form to
    find out which email addresses have an account.
    """

    permission_classes = [AllowAny]
    throttle_scope = "password_reset"

    @extend_schema(request=PasswordResetRequestSerializer, responses={204: None})
    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]
        user = User.objects.filter(email__iexact=email, is_active=True).first()
        if user is not None:
            _send_reset_email(request, user)
        return Response(status=status.HTTP_204_NO_CONTENT)


class PasswordResetConfirmView(APIView):
    """Sets a new password from the uid and token in the emailed link."""

    permission_classes = [AllowAny]
    throttle_scope = "password_reset"

    @extend_schema(request=PasswordResetConfirmSerializer, responses={204: None})
    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


def _send_reset_email(request, user):
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)
    # SITE_URL is the address customers use. The request host is wrong in dev,
    # where the Vite proxy forwards the request to Django on another port.
    base = settings.SITE_URL or request.build_absolute_uri("/")
    context = {
        "user": user,
        "reset_url": f"{base.rstrip('/')}/accounts/password-reset/{uid}/{token}/",
        "valid_hours": settings.PASSWORD_RESET_TIMEOUT // 3600,
    }
    send_mail(
        subject=render_to_string("accounts/password_reset_subject.txt", context).strip(),
        message=render_to_string("accounts/password_reset_email.txt", context),
        from_email=None,  # DEFAULT_FROM_EMAIL
        recipient_list=[user.email],
    )
