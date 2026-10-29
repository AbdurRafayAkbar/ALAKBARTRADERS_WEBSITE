import { apiFetch } from './client'
import type { Address, User } from './types'

// The logged-in customer's profile and saved addresses (Architecture.md §6).
// Django returns only the customer's own addresses; another id answers 404.

const send = <T>(method: string, path: string, body?: unknown) =>
  apiFetch<T>(path, { method, body: body === undefined ? undefined : JSON.stringify(body) })

export type ProfileInput = Pick<User, 'first_name' | 'last_name' | 'phone'>

export type AddressInput = Omit<Address, 'id' | 'area'>

export const updateProfile = (input: ProfileInput) => send<User>('PATCH', 'account/profile/', input)

export const fetchAddresses = () => apiFetch<Address[]>('account/addresses/')

export const createAddress = (input: AddressInput) =>
  send<Address>('POST', 'account/addresses/', input)

export const updateAddress = (id: number, input: Partial<AddressInput>) =>
  send<Address>('PATCH', `account/addresses/${id}/`, input)

export const deleteAddress = (id: number) => send<void>('DELETE', `account/addresses/${id}/`)
