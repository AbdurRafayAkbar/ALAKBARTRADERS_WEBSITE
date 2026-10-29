"""
One JSON shape for every API error (rules.md §4, Architecture.md §6):

    {"code": "not_found", "message": "Not found.", "fields": {"phone": ["..."]}}

React shows `message`, puts `fields` next to form inputs, and tests check `code`.
"""

from rest_framework import exceptions
from rest_framework.views import exception_handler

VALIDATION_MESSAGE = "Please check the highlighted fields."


def api_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is None:
        # Not an API error (a bug): let Django return a 500 and log it.
        return None

    if isinstance(exc, exceptions.ValidationError):
        response.data = _validation_body(exc.detail)
    else:
        response.data = {
            "code": _first_code(exc.get_codes()),
            "message": _first_message(exc.detail),
            "fields": {},
        }
    return response


def _validation_body(detail):
    if not isinstance(detail, dict):
        # Raised as ValidationError("...") without a field.
        return {
            "code": "validation_error",
            "message": _first_message(detail),
            "fields": {},
        }

    fields = _flatten(detail)
    general = fields.pop("non_field_errors", None)
    return {
        "code": "validation_error",
        "message": general[0] if general else VALIDATION_MESSAGE,
        "fields": fields,
    }


def _flatten(detail, prefix=""):
    """Turn nested serializer errors into {"address.city": ["..."]}."""
    fields = {}
    for key, value in detail.items():
        name = f"{prefix}{key}"
        if isinstance(value, dict):
            fields.update(_flatten(value, f"{name}."))
        elif isinstance(value, list) and value and isinstance(value[0], dict):
            # A list of nested objects, e.g. cart items.
            for index, item in enumerate(value):
                fields.update(_flatten(item, f"{name}.{index}."))
        else:
            fields[name] = [str(message) for message in _as_list(value)]
    return fields


def _first_message(detail):
    while isinstance(detail, (list, dict)):
        if not detail:
            return VALIDATION_MESSAGE
        detail = detail[0] if isinstance(detail, list) else next(iter(detail.values()))
    return str(detail)


def _first_code(codes):
    while isinstance(codes, (list, dict)):
        if not codes:
            return "error"
        codes = codes[0] if isinstance(codes, list) else next(iter(codes.values()))
    return str(codes)


def _as_list(value):
    return value if isinstance(value, list) else [value]
