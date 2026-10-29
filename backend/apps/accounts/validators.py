import re

from django.core.exceptions import ValidationError

PHONE_INVALID = "Enter a Pakistani mobile number, like 0300 1234567."

# 03XX XXXXXXX, written with or without +92, spaces or dashes.
_MOBILE = re.compile(r"(?:\+?92|0)(3\d{9})")


def normalize_pk_mobile(value):
    """Returns the number as 03XXXXXXXXX, so the same phone is stored one way."""
    digits = re.sub(r"[\s-]", "", value)
    match = _MOBILE.fullmatch(digits)
    if not match:
        raise ValidationError(PHONE_INVALID)
    return "0" + match.group(1)
