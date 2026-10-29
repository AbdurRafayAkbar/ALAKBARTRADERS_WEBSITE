from django.contrib.auth import authenticate, get_user_model, password_validation
from django.contrib.auth.tokens import default_token_generator
from django.core.exceptions import ValidationError as DjangoValidationError
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode
from rest_framework import serializers

from ..models import Address
from ..validators import normalize_pk_mobile

User = get_user_model()

# One message for a wrong email and a wrong password, so the form does not tell
# a stranger which email addresses have an account.
LOGIN_FAILED = "Email or password is wrong."
RESET_LINK_BAD = "This reset link is wrong or has expired. Ask for a new one."
# Enough for home, work and family; stops a script filling the table.
MAX_ADDRESSES = 10
TOO_MANY_ADDRESSES = f"You can save up to {MAX_ADDRESSES} addresses. Delete one to add another."


def _phone(value):
    try:
        return normalize_pk_mobile(value)
    except DjangoValidationError as error:
        raise serializers.ValidationError(error.messages) from error


class UserSerializer(serializers.ModelSerializer):
    """The logged-in user, as React sees it (auth/me/)."""

    class Meta:
        model = User
        fields = ["id", "email", "first_name", "last_name", "phone"]
        read_only_fields = fields


class ProfileSerializer(serializers.ModelSerializer):
    """Name and phone the customer can change. Email stays fixed: it is the login."""

    class Meta:
        model = User
        fields = ["id", "email", "first_name", "last_name", "phone"]
        read_only_fields = ["id", "email"]

    def validate_phone(self, value):
        return _phone(value) if value else value


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = [
            "id",
            "full_name",
            "phone",
            "house_number",
            "block",
            "colony",
            "house_name",
            "landmark",
            "area",
            "is_default",
        ]

    def validate_phone(self, value):
        return _phone(value)

    def validate(self, attrs):
        user = self.context["request"].user
        if self.instance is None and user.addresses.count() >= MAX_ADDRESSES:
            raise serializers.ValidationError(TOO_MANY_ADDRESSES)
        return attrs


class SignupSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, style={"input_type": "password"})
    first_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)

    def validate_email(self, value):
        email = User.objects.normalize_email(value)
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return email

    def validate_phone(self, value):
        return _phone(value) if value else value

    def validate(self, attrs):
        # Built but not saved, so the "too similar to your email" check can run.
        user = User(email=attrs["email"], first_name=attrs.get("first_name", ""))
        try:
            password_validation.validate_password(attrs["password"], user)
        except DjangoValidationError as error:
            raise serializers.ValidationError({"password": list(error.messages)}) from error
        return attrs

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, style={"input_type": "password"})

    def validate(self, attrs):
        # Returns None for a wrong password and for an inactive user.
        user = authenticate(
            self.context["request"], username=attrs["email"], password=attrs["password"]
        )
        if user is None:
            raise serializers.ValidationError(LOGIN_FAILED)
        attrs["user"] = user
        return attrs


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    """The uid and token come from the link in the reset email."""

    uid = serializers.CharField()
    token = serializers.CharField()
    password = serializers.CharField(write_only=True, style={"input_type": "password"})

    def validate(self, attrs):
        try:
            pk = force_str(urlsafe_base64_decode(attrs["uid"]))
            user = User.objects.get(pk=pk, is_active=True)
        except ValueError, TypeError, OverflowError, User.DoesNotExist:
            user = None
        # The token is tied to the current password hash, so it stops working
        # once the password changes (one use) or after PASSWORD_RESET_TIMEOUT.
        if user is None or not default_token_generator.check_token(user, attrs["token"]):
            raise serializers.ValidationError(RESET_LINK_BAD)

        try:
            password_validation.validate_password(attrs["password"], user)
        except DjangoValidationError as error:
            raise serializers.ValidationError({"password": list(error.messages)}) from error
        attrs["user"] = user
        return attrs

    def save(self):
        user = self.validated_data["user"]
        user.set_password(self.validated_data["password"])
        user.save(update_fields=["password"])
        return user
