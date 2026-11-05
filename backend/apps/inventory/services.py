"""
Every stock change in the shop goes through these functions (rules.md: Inventory).

Each one locks the pack size's row, changes the stock with an F() update, and
writes one StockMovement, all inside one transaction. If any step fails,
nothing is saved. The database CHECK (stock_quantity >= 0) is the last guard
if code ever skips these functions.
"""

from django.db import transaction
from django.db.models import F

from apps.catalog.models import ProductVariant

from .exceptions import InsufficientStock, InvalidQuantity
from .models import StockMovement

Reason = StockMovement.Reason

DEDUCT_REASONS = (Reason.SOLD, Reason.EXPIRED)
RESTORE_REASONS = (Reason.CANCELLED, Reason.RETURNED)


def _require_positive(quantity: int) -> None:
    if quantity <= 0:
        raise InvalidQuantity(f"Quantity must be more than 0, got {quantity}.")


@transaction.atomic
def _apply_change(
    variant: ProductVariant, change: int, reason: str, user=None, note: str = ""
) -> StockMovement:
    """Lock the row, check the result stays at 0 or more, update, and log it."""
    # select_for_update makes a second request wait here until this one commits,
    # so two orders cannot both sell the last bag.
    locked = ProductVariant.objects.select_for_update().get(pk=variant.pk)
    if locked.stock_quantity + change < 0:
        raise InsufficientStock(variant, requested=-change, available=locked.stock_quantity)

    ProductVariant.objects.filter(pk=variant.pk).update(stock_quantity=F("stock_quantity") + change)
    stock_after = locked.stock_quantity + change
    variant.stock_quantity = stock_after  # keep the caller's object in step

    return StockMovement.objects.create(
        variant=variant,
        change=change,
        reason=reason,
        stock_after=stock_after,
        user=user,
        note=note,
    )


def receive_stock(
    variant: ProductVariant, quantity: int, *, user=None, note: str = ""
) -> StockMovement:
    """
    Add units that arrived from a supplier.

    Raises:
        InvalidQuantity: quantity is 0 or less.
    """
    _require_positive(quantity)
    return _apply_change(variant, quantity, Reason.RECEIVED, user, note)


def deduct_stock(
    variant: ProductVariant,
    quantity: int,
    *,
    reason: str = Reason.SOLD,
    user=None,
    note: str = "",
) -> StockMovement:
    """
    Take units away because they were sold, or expired or were damaged.

    Raises:
        InvalidQuantity: quantity is 0 or less.
        ValueError: reason is not SOLD or EXPIRED.
        InsufficientStock: fewer units are in stock than asked for.
    """
    _require_positive(quantity)
    if reason not in DEDUCT_REASONS:
        raise ValueError(f"deduct_stock cannot use reason {reason!r}.")
    return _apply_change(variant, -quantity, reason, user, note)


def restore_stock(
    variant: ProductVariant, quantity: int, *, reason: str, user=None, note: str = ""
) -> StockMovement:
    """
    Put units back after an order was cancelled or items were returned.

    Raises:
        InvalidQuantity: quantity is 0 or less.
        ValueError: reason is not CANCELLED or RETURNED.
    """
    _require_positive(quantity)
    if reason not in RESTORE_REASONS:
        raise ValueError(f"restore_stock cannot use reason {reason!r}.")
    return _apply_change(variant, quantity, reason, user, note)


def adjust_stock(variant: ProductVariant, change: int, *, user, note: str) -> StockMovement:
    """
    Correct the stock after a shelf count. The note must say why.

    Raises:
        InvalidQuantity: change is 0.
        ValueError: note is empty.
        InsufficientStock: the change would take stock below 0.
    """
    if change == 0:
        raise InvalidQuantity("A correction must change the stock.")
    if not note.strip():
        raise ValueError("A stock correction needs a note saying why.")
    return _apply_change(variant, change, Reason.ADJUSTED, user, note.strip())
