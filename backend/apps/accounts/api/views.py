"""
Customer accounts over the session cookie (Architecture.md §6).

Accounts are optional: guests can still order. Every POST here needs the
X-CSRFToken header, logged in or not (CsrfSessionAuthentication).
"""

from django.conf import settings
from django.contrib.auth import get_user_model, login, logout
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.db import transaction
from django.template.loader import render_to_string
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from drf_spectacular.utils import extend_schema
from rest_framework import status, viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models import Address
from .serializers import (
    AddressSerializer,
    LoginSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    ProfileSerializer,
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


class ProfileView(APIView):
    """The logged-in customer's name and phone."""

    permission_classes = [IsAuthenticated]

    @extend_schema(responses={200: ProfileSerializer})
    def get(self, request):
        return Response(ProfileSerializer(request.user).data)

    @extend_schema(request=ProfileSerializer, responses={200: ProfileSerializer})
    def patch(self, request):
        serializer = ProfileSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class AddressViewSet(viewsets.ModelViewSet):
    """
    The logged-in customer's saved addresses.

    The queryset holds only the customer's own rows, so another user's id
    answers 404, the same as an id that does not exist (rules.md §7).
    """

    serializer_class = AddressSerializer
    permission_classes = [IsAuthenticated]
    # PATCH only: a partial edit is all the React form sends.
    http_method_names = ["get", "post", "patch", "delete"]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            # The schema generator has no logged-in user.
            return Address.objects.none()
        return Address.objects.filter(user=self.request.user)

    @transaction.atomic
    def perform_create(self, serializer):
        user = self.request.user
        # The first address is the default, so checkout always has one to fill in.
        make_default = serializer.validated_data.get("is_default") or not user.addresses.exists()
        if make_default:
            user.addresses.update(is_default=False)
        serializer.save(user=user, is_default=make_default)

    @transaction.atomic
    def perform_update(self, serializer):
        is_default = serializer.validated_data.get("is_default")
        if is_default:
            self.get_queryset().exclude(pk=serializer.instance.pk).update(is_default=False)
        elif is_default is False and serializer.instance.is_default:
            # A default can only move to another address, never disappear.
            serializer.validated_data.pop("is_default")
        serializer.save()

    @transaction.atomic
    def perform_destroy(self, instance):
        was_default = instance.is_default
        instance.delete()
        if was_default:
            newest = self.get_queryset().order_by("-created_at").first()
            if newest is not None:
                newest.is_default = True
                newest.save(update_fields=["is_default", "updated_at"])


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
