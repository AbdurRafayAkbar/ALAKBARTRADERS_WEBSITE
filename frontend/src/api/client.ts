import type { ApiError } from './types'

// Thin fetch wrapper for /api/v1/. Used once the Django API exists (Phase 1+).
// Session cookie + X-CSRFToken header; no tokens in localStorage (rules.md §7).

const BASE = '/api/v1/'

export class ApiRequestError extends Error {
  readonly status: number
  readonly error: ApiError

  constructor(status: number, error: ApiError) {
    super(error.message)
    this.status = status
    this.error = error
  }
}

function csrfToken(): string {
  const match = document.cookie.match(/(?:^|;\s*)csrftoken=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : ''
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const method = (init.method ?? 'GET').toUpperCase()
  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/json')
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) headers.set('X-CSRFToken', csrfToken())

  const response = await fetch(BASE + path, {
    ...init,
    method,
    headers,
    credentials: 'same-origin',
  })
  if (response.status === 204) return undefined as T

  const body = await response.json().catch(() => null)
  if (!response.ok) {
    throw new ApiRequestError(
      response.status,
      body ?? { code: 'network_error', message: 'Something went wrong. Please try again.' },
    )
  }
  return body as T
}
