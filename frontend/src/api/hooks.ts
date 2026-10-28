import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { addCartItem, fetchCart, updateCartItem } from './cart'
import { fetchCategories, fetchDeliveryInfo, fetchProduct, fetchProducts, type ProductFilters } from './catalog'

// Components use these hooks, never fetch directly (rules.md §3.1).

export const queryKeys = {
  categories: ['categories'] as const,
  products: (filters: ProductFilters) => ['products', filters] as const,
  product: (slug: string) => ['product', slug] as const,
  delivery: ['delivery'] as const,
  cart: ['cart'] as const,
}

export const useCategories = () => useQuery({ queryKey: queryKeys.categories, queryFn: fetchCategories })

export const useProducts = (filters: ProductFilters = {}) =>
  useQuery({ queryKey: queryKeys.products(filters), queryFn: () => fetchProducts(filters) })

export const useProduct = (slug: string) =>
  useQuery({ queryKey: queryKeys.product(slug), queryFn: () => fetchProduct(slug) })

export const useDeliveryInfo = () => useQuery({ queryKey: queryKeys.delivery, queryFn: fetchDeliveryInfo })

export const useCart = () => useQuery({ queryKey: queryKeys.cart, queryFn: fetchCart })

export function useAddToCart() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ variantId, quantity }: { variantId: number; quantity?: number }) =>
      addCartItem(variantId, quantity),
    onSuccess: (cart) => client.setQueryData(queryKeys.cart, cart),
  })
}

export function useUpdateCartItem() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ lineId, quantity }: { lineId: number; quantity: number }) => updateCartItem(lineId, quantity),
    onSuccess: (cart) => client.setQueryData(queryKeys.cart, cart),
  })
}
