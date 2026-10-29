import { apiFetch } from './client'
import type { User } from './types'

// Account endpoints (Architecture.md §6). The session cookie does the rest.

const post = <T>(path: string, body?: unknown) =>
  apiFetch<T>(path, { method: 'POST', body: body === undefined ? undefined : JSON.stringify(body) })

export interface SignupInput {
  email: string
  password: string
  first_name?: string
  phone?: string
}

export interface PasswordResetConfirmInput {
  uid: string
  token: string
  password: string
}

// GET auth/me/ answers 204 for a guest, which apiFetch returns as undefined.
export const fetchMe = async (): Promise<User | null> => (await apiFetch<User>('auth/me/')) ?? null

export const signup = (input: SignupInput) => post<User>('auth/signup/', input)

export const login = (email: string, password: string) =>
  post<User>('auth/login/', { email, password })

export const logout = () => post<void>('auth/logout/')

export const requestPasswordReset = (email: string) => post<void>('auth/password-reset/', { email })

export const confirmPasswordReset = (input: PasswordResetConfirmInput) =>
  post<void>('auth/password-reset/confirm/', input)
