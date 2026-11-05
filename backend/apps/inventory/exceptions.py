class InvalidQuantity(ValueError):
    """A stock change of zero, or a negative amount where only positive makes sense."""


class InsufficientStock(Exception):
    """The change would take a pack size below zero."""

    def __init__(self, variant, requested: int, available: int):
        self.variant = variant
        self.requested = requested
        self.available = available
        super().__init__(f"{variant}: asked for {requested}, only {available} left.")
