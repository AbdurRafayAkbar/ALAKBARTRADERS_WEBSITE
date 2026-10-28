import { categories, deliveryInfo, products } from './mock/data'
import type { Category, CategorySlug, DeliveryInfo, Product } from './types'

// Catalogue reads. Each function matches one API endpoint.
// Today they return sample data; in Phase 3 each body becomes one apiFetch() call.

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), 120))
}

export interface ProductFilters {
  category?: CategorySlug
  q?: string
  featured?: boolean
}

// GET categories/
export function fetchCategories(): Promise<Category[]> {
  return delay(categories)
}

// GET products/?category=&q=
export function fetchProducts(filters: ProductFilters = {}): Promise<Product[]> {
  const q = filters.q?.trim().toLowerCase()
  return delay(
    products.filter(
      (p) =>
        (!filters.category || p.category === filters.category) &&
        (!filters.featured || p.is_featured) &&
        (!q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)),
    ),
  )
}

// GET products/<slug>/
export function fetchProduct(slug: string): Promise<Product | null> {
  return delay(products.find((p) => p.slug === slug) ?? null)
}

// GET zones/
export function fetchDeliveryInfo(): Promise<DeliveryInfo> {
  return delay(deliveryInfo)
}
