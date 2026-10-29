import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createAddress,
  deleteAddress,
  fetchAddresses,
  updateAddress,
  updateProfile,
  type AddressInput,
  type ProfileInput,
} from './account'
import {
  confirmPasswordReset,
  fetchMe,
  login,
  logout,
  requestPasswordReset,
  signup,
  type PasswordResetConfirmInput,
  type SignupInput,
} from './auth'
import { addCartItem, fetchCart, updateCartItem } from './cart'
import {
  fetchCategories,
  fetchDeliveryInfo,
  fetchProduct,
  fetchProducts,
  type ProductFilters,
} from './catalog'

// Components use these hooks, never fetch directly (rules.md §3.1).

export const queryKeys = {
  categories: ['categories'] as const,
  products: (filters: ProductFilters) => ['products', filters] as const,
  product: (slug: string) => ['product', slug] as const,
  delivery: ['delivery'] as const,
  cart: ['cart'] as const,
  me: ['me'] as const,
  addresses: ['addresses'] as const,
}

export const useCategories = () =>
  useQuery({ queryKey: queryKeys.categories, queryFn: fetchCategories })

export const useProducts = (filters: ProductFilters = {}) =>
  useQuery({ queryKey: queryKeys.products(filters), queryFn: () => fetchProducts(filters) })

export const useProduct = (slug: string) =>
  useQuery({ queryKey: queryKeys.product(slug), queryFn: () => fetchProduct(slug) })

export const useDeliveryInfo = () =>
  useQuery({ queryKey: queryKeys.delivery, queryFn: fetchDeliveryInfo })

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
    mutationFn: ({ lineId, quantity }: { lineId: number; quantity: number }) =>
      updateCartItem(lineId, quantity),
    onSuccess: (cart) => client.setQueryData(queryKeys.cart, cart),
  })
}

// The logged-in user, or null for a guest.
export const useMe = () => useQuery({ queryKey: queryKeys.me, queryFn: fetchMe })

export function useLogin() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      login(email, password),
    onSuccess: (user) => client.setQueryData(queryKeys.me, user),
  })
}

export function useSignup() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (input: SignupInput) => signup(input),
    onSuccess: (user) => client.setQueryData(queryKeys.me, user),
  })
}

export function useLogout() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: logout,
    onSuccess: () => client.setQueryData(queryKeys.me, null),
  })
}

export const usePasswordReset = () =>
  useMutation({ mutationFn: (email: string) => requestPasswordReset(email) })

export const usePasswordResetConfirm = () =>
  useMutation({ mutationFn: (input: PasswordResetConfirmInput) => confirmPasswordReset(input) })

export function useUpdateProfile() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (input: ProfileInput) => updateProfile(input),
    onSuccess: (user) => client.setQueryData(queryKeys.me, user),
  })
}

export const useAddresses = () =>
  useQuery({ queryKey: queryKeys.addresses, queryFn: fetchAddresses })

// A change to one address can move the default flag on another, so each
// change reloads the whole list.
function useAddressMutation<V>(mutationFn: (vars: V) => Promise<unknown>) {
  const client = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.addresses }),
  })
}

export const useCreateAddress = () =>
  useAddressMutation((input: AddressInput) => createAddress(input))

export const useUpdateAddress = () =>
  useAddressMutation(({ id, input }: { id: number; input: Partial<AddressInput> }) =>
    updateAddress(id, input),
  )

export const useDeleteAddress = () => useAddressMutation((id: number) => deleteAddress(id))
