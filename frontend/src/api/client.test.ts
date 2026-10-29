import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { apiFetch, ApiRequestError } from './client'

// Tests without a csrftoken cookie still get past the CSRF bootstrap.
const server = setupServer(
  http.get('/api/v1/auth/csrf/', () => new HttpResponse(null, { status: 204 })),
)

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }))
afterEach(() => {
  server.resetHandlers()
  document.cookie = 'csrftoken=; expires=Thu, 01 Jan 1970 00:00:00 GMT'
})
afterAll(() => server.close())

describe('apiFetch', () => {
  it('returns the JSON body', async () => {
    server.use(http.get('/api/v1/products/', () => HttpResponse.json([{ slug: 'basmati' }])))

    await expect(apiFetch('products/')).resolves.toEqual([{ slug: 'basmati' }])
  })

  it('sends the CSRF cookie as a header on POST', async () => {
    document.cookie = 'csrftoken=abc123'
    let token: string | null = null
    server.use(
      http.post('/api/v1/cart/items/', ({ request }) => {
        token = request.headers.get('X-CSRFToken')
        return HttpResponse.json({ ok: true }, { status: 201 })
      }),
    )

    await apiFetch('cart/items/', { method: 'POST', body: JSON.stringify({ variant: 1 }) })

    expect(token).toBe('abc123')
  })

  it('asks Django for a CSRF cookie before the first POST', async () => {
    let token: string | null = null
    server.use(
      http.get('/api/v1/auth/csrf/', () => {
        document.cookie = 'csrftoken=fresh'
        return new HttpResponse(null, { status: 204 })
      }),
      http.post('/api/v1/auth/logout/', ({ request }) => {
        token = request.headers.get('X-CSRFToken')
        return new HttpResponse(null, { status: 204 })
      }),
    )

    await apiFetch('auth/logout/', { method: 'POST' })

    expect(token).toBe('fresh')
  })

  it('returns undefined for 204 No Content', async () => {
    server.use(http.delete('/api/v1/cart/items/1/', () => new HttpResponse(null, { status: 204 })))

    await expect(apiFetch('cart/items/1/', { method: 'DELETE' })).resolves.toBeUndefined()
  })

  it('throws ApiRequestError with the server error body', async () => {
    const error = { code: 'out_of_stock', message: 'Only 2 left.' }
    server.use(http.post('/api/v1/cart/items/', () => HttpResponse.json(error, { status: 409 })))

    const request = apiFetch('cart/items/', { method: 'POST', body: '{}' })

    await expect(request).rejects.toBeInstanceOf(ApiRequestError)
    await expect(request).rejects.toMatchObject({ status: 409, error })
  })

  it('falls back to a generic message when the error body is not JSON', async () => {
    server.use(http.get('/api/v1/products/', () => new HttpResponse('<html>', { status: 502 })))

    await expect(apiFetch('products/')).rejects.toMatchObject({
      status: 502,
      error: { code: 'network_error' },
    })
  })
})
