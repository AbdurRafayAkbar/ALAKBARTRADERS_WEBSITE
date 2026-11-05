import { ApiRequestError, apiFetch } from './client'
import { deliveryInfo } from './mock/data'
import type {
  Category,
  CategorySlug,
  DeliveryInfo,
  Product,
  ProductPage,
  ProductVariant,
} from './types'

// Catalogue reads. Each function matches one API endpoint.

export type ProductSort = 'popular' | 'price_asc' | 'price_desc' | 'newest'

export interface ProductFilters {
  category?: CategorySlug
  q?: string
  featured?: boolean
  sizes?: string[]
  minPrice?: string
  maxPrice?: string
  inStock?: boolean
  sort?: ProductSort
  page?: number
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

// GET products/?category=&q=&featured=1&size=&min_price=&max_price=&in_stock=1&sort=&page=
export async function fetchProducts(filters: ProductFilters = {}): Promise<ProductPage> {
  const params = new URLSearchParams()
  if (filters.category) params.set('category', filters.category)
  const q = filters.q?.trim()
  if (q) params.set('q', q)
  if (filters.featured) params.set('featured', '1')
  for (const size of filters.sizes ?? []) params.append('size', size)
  if (filters.minPrice) params.set('min_price', filters.minPrice)
  if (filters.maxPrice) params.set('max_price', filters.maxPrice)
  if (filters.inStock) params.set('in_stock', '1')
  if (filters.sort && filters.sort !== 'popular') params.set('sort', filters.sort)
  if (filters.page && filters.page > 1) params.set('page', String(filters.page))
  const query = params.toString()
  const page = await apiFetch<ProductPage>(`products/${query ? `?${query}` : ''}`)
  remember(page.results)
  return page
}

// GET pack-sizes/?category= (the labels for the size filter, lightest first)
export function fetchPackSizes(category?: CategorySlug): Promise<string[]> {
  const query = category ? `?category=${encodeURIComponent(category)}` : ''
  return apiFetch<string[]>(`pack-sizes/${query}`)
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
