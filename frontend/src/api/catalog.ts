import { ApiRequestError, apiFetch } from './client'
import { deliveryInfo } from './mock/data'
import type { Category, CategorySlug, DeliveryInfo, Product, ProductVariant } from './types'

// Catalogue reads. Each function matches one API endpoint.

export interface ProductFilters {
  category?: CategorySlug
  q?: string
  featured?: boolean
}

// Every product the shop front has loaded, keyed by variant id. The mock
// cart reads prices from here until the real cart API exists (Phase 5).
const seenVariants = new Map<number, { product: Product; variant: ProductVariant }>()

function remember(products: Product[]): Product[] {
  for (const product of products) {
    for (const variant of product.variants) seenVariants.set(variant.id, { product, variant })
  }
  return products
}

export function findSeenVariant(variantId: number) {
  return seenVariants.get(variantId) ?? null
}

// GET categories/
export function fetchCategories(): Promise<Category[]> {
  return apiFetch<Category[]>('categories/')
}

// GET products/?category=&q=&featured=1
export async function fetchProducts(filters: ProductFilters = {}): Promise<Product[]> {
  const params = new URLSearchParams()
  if (filters.category) params.set('category', filters.category)
  const q = filters.q?.trim()
  if (q) params.set('q', q)
  if (filters.featured) params.set('featured', '1')
  const query = params.toString()
  return remember(await apiFetch<Product[]>(`products/${query ? `?${query}` : ''}`))
}

// GET products/<slug>/ (null when there is no such product)
export async function fetchProduct(slug: string): Promise<Product | null> {
  try {
    const product = await apiFetch<Product>(`products/${encodeURIComponent(slug)}/`)
    remember([product])
    return product
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 404) return null
    throw error
  }
}

// GET zones/ (sample data until the zones API exists)
export function fetchDeliveryInfo(): Promise<DeliveryInfo> {
  return new Promise((resolve) => setTimeout(() => resolve(deliveryInfo), 120))
}
