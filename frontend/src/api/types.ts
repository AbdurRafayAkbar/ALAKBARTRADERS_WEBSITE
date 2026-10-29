// Shapes returned by the Django API (docs/Architecture.md §5–6).
// Money is always a string, e.g. "1250.00".

export type Money = string

export type CategorySlug = 'rice' | 'dry-fruits' | 'milk-cream'

export interface Category {
  slug: CategorySlug
  name: string
  summary: string
  pack_sizes: string
  is_perishable: boolean
}

export type StockState = 'in_stock' | 'low_stock' | 'out_of_stock'

export interface ProductVariant {
  id: number
  label: string
  sku: string
  price: Money
  compare_at_price: Money | null
  stock_state: StockState
}

export interface Product {
  slug: string
  name: string
  category: CategorySlug
  description: string
  is_perishable: boolean
  is_featured: boolean
  variants: ProductVariant[]
}

export interface DeliveryZone {
  id: number
  name: string
  fee: Money
  cream_allowed: boolean
}

export interface DeliveryInfo {
  zones: DeliveryZone[]
  free_shipping_threshold: Money
}

export interface CartLine {
  id: number
  variant_id: number
  product_name: string
  product_slug: string
  variant_label: string
  unit_price: Money
  quantity: number
  line_total: Money
}

export interface Cart {
  items: CartLine[]
  item_count: number
  subtotal: Money
}

// The logged-in customer (auth/me/). Accounts are optional; guests can order.
export interface User {
  id: number
  email: string
  first_name: string
  last_name: string
  phone: string
}

// A saved delivery address (account/addresses/). Chashma addresses are a
// house number, a block and a colony. area stays blank until zones exist.
export interface Address {
  id: number
  full_name: string
  phone: string
  house_number: string
  block: string
  colony: string
  house_name: string
  landmark: string
  area: string
  is_default: boolean
}

// One error shape for the whole API (rules.md §4).
export interface ApiError {
  code: string
  message: string
  fields?: Record<string, string[]>
}
