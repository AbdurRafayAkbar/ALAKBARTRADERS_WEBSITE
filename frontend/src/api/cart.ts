import { products } from './mock/data'
import type { Cart, CartLine } from './types'

// Cart endpoints. The real cart lives in the Django session (Phase 5).
// This in-memory stand-in plays the server: it reads prices from the catalogue
// and returns line totals, so React never adds up money itself (rules.md §3.1).

let lines: { id: number; variant_id: number; quantity: number }[] = []
let nextLineId = 1

// Sample-only arithmetic in paisa, standing in for Django's Decimal maths.
const toPaisa = (m: string) => Math.round(Number(m) * 100)
const fromPaisa = (p: number) => (p / 100).toFixed(2)

function findVariant(variantId: number) {
  for (const product of products) {
    const variant = product.variants.find((v) => v.id === variantId)
    if (variant) return { product, variant }
  }
  return null
}

function snapshot(): Cart {
  const items: CartLine[] = []
  let subtotal = 0
  for (const line of lines) {
    const found = findVariant(line.variant_id)
    if (!found) continue
    const lineTotal = toPaisa(found.variant.price) * line.quantity
    subtotal += lineTotal
    items.push({
      id: line.id,
      variant_id: line.variant_id,
      product_name: found.product.name,
      product_slug: found.product.slug,
      variant_label: found.variant.label,
      unit_price: found.variant.price,
      quantity: line.quantity,
      line_total: fromPaisa(lineTotal),
    })
  }
  return {
    items,
    item_count: lines.reduce((n, l) => n + l.quantity, 0),
    subtotal: fromPaisa(subtotal),
  }
}

function respond(): Promise<Cart> {
  return new Promise((resolve) => setTimeout(() => resolve(snapshot()), 80))
}

// GET cart/
export function fetchCart(): Promise<Cart> {
  return respond()
}

// POST cart/items/
export function addCartItem(variantId: number, quantity = 1): Promise<Cart> {
  const existing = lines.find((l) => l.variant_id === variantId)
  if (existing) existing.quantity += quantity
  else lines.push({ id: nextLineId++, variant_id: variantId, quantity })
  return respond()
}

// PATCH cart/items/<id>/ (quantity 0 removes the line)
export function updateCartItem(lineId: number, quantity: number): Promise<Cart> {
  lines =
    quantity > 0
      ? lines.map((l) => (l.id === lineId ? { ...l, quantity } : l))
      : lines.filter((l) => l.id !== lineId)
  return respond()
}

// Test helper: start each test with an empty cart.
export function resetMockCart() {
  lines = []
  nextLineId = 1
}
