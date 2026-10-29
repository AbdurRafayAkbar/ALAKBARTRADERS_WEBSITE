import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import type { User } from '../../api/types'
import { routes } from '../../routes/routes'

const ali: User = { id: 1, email: 'ali@example.com', first_name: 'Ali', last_name: '', phone: '' }

const validation = (
  fields: Record<string, string[]>,
  message = 'Please check the highlighted fields.',
) => HttpResponse.json({ code: 'validation_error', message, fields }, { status: 400 })

const guest = () => new HttpResponse(null, { status: 204 })

const server = setupServer(http.get('/api/v1/auth/me/', guest))

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }))
beforeEach(() => {
  // Skips the auth/csrf/ request; client.test.ts covers it.
  document.cookie = 'csrftoken=test-token'
})
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

function renderAt(path: string) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
  return router
}

describe('login page', () => {
  it('logs in, goes home and shows the account link in the header', async () => {
    let sent: unknown
    server.use(
      http.post('/api/v1/auth/login/', async ({ request }) => {
        sent = await request.json()
        return HttpResponse.json(ali)
      }),
    )
    const user = userEvent.setup()
    const router = renderAt('/accounts/login/')

    await user.type(await screen.findByLabelText('Email'), 'ali@example.com')
    await user.type(screen.getByLabelText('Password'), 'Basmati-Sella-2026')
    await user.click(screen.getByRole('button', { name: 'Log in' }))

    const header = screen.getByRole('banner')
    expect(await within(header).findByRole('link', { name: /account/i })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/')
    expect(sent).toEqual({ email: 'ali@example.com', password: 'Basmati-Sella-2026' })
  })

  it('goes back to the next page after login', async () => {
    server.use(http.post('/api/v1/auth/login/', () => HttpResponse.json(ali)))
    const user = userEvent.setup()
    const router = renderAt('/accounts/login/?next=/cart/')

    await user.type(await screen.findByLabelText('Email'), 'ali@example.com')
    await user.type(screen.getByLabelText('Password'), 'Basmati-Sella-2026')
    await user.click(screen.getByRole('button', { name: 'Log in' }))

    await screen.findByRole('heading', { level: 1, name: /cart/i })
    expect(router.state.location.pathname).toBe('/cart/')
  })

  it('shows the error for a wrong password and stays on the page', async () => {
    server.use(
      http.post('/api/v1/auth/login/', () => validation({}, 'Email or password is wrong.')),
    )
    const user = userEvent.setup()
    const router = renderAt('/accounts/login/')

    await user.type(await screen.findByLabelText('Email'), 'ali@example.com')
    await user.type(screen.getByLabelText('Password'), 'wrong')
    await user.click(screen.getByRole('button', { name: 'Log in' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Email or password is wrong.')
    expect(router.state.location.pathname).toBe('/accounts/login/')
  })

  it('shows a connection error when the server cannot be reached', async () => {
    server.use(http.post('/api/v1/auth/login/', () => HttpResponse.error()))
    const user = userEvent.setup()
    renderAt('/accounts/login/')

    await user.type(await screen.findByLabelText('Email'), 'ali@example.com')
    await user.type(screen.getByLabelText('Password'), 'whatever')
    await user.click(screen.getByRole('button', { name: 'Log in' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/internet connection/i)
  })
})

describe('signup page', () => {
  it('marks the fields Django refused', async () => {
    server.use(
      http.post('/api/v1/auth/signup/', () =>
        validation({ email: ['An account with this email already exists.'] }),
      ),
    )
    const user = userEvent.setup()
    renderAt('/accounts/signup/')

    await user.type(await screen.findByLabelText('Email'), 'ali@example.com')
    await user.type(screen.getByLabelText('Password'), 'Basmati-Sella-2026')
    await user.click(screen.getByRole('button', { name: 'Create account' }))

    const email = screen.getByLabelText('Email')
    expect(await screen.findByText('An account with this email already exists.')).toBeVisible()
    expect(email).toHaveAttribute('aria-invalid', 'true')
    expect(email).toHaveAccessibleDescription('An account with this email already exists.')
  })

  it('creates the account and logs in', async () => {
    let sent: unknown
    server.use(
      http.post('/api/v1/auth/signup/', async ({ request }) => {
        sent = await request.json()
        return HttpResponse.json(ali, { status: 201 })
      }),
    )
    const user = userEvent.setup()
    const router = renderAt('/accounts/signup/')

    await user.type(await screen.findByLabelText('Email'), 'ali@example.com')
    await user.type(screen.getByLabelText('Password'), 'Basmati-Sella-2026')
    await user.type(screen.getByLabelText('Name (optional)'), ' Ali ')
    await user.click(screen.getByRole('button', { name: 'Create account' }))

    const header = screen.getByRole('banner')
    expect(await within(header).findByRole('link', { name: /account/i })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/')
    expect(sent).toEqual({
      email: 'ali@example.com',
      password: 'Basmati-Sella-2026',
      first_name: 'Ali',
      phone: '',
    })
  })
})

describe('password reset', () => {
  it('asks the customer to check their email', async () => {
    server.use(
      http.post('/api/v1/auth/password-reset/', () => new HttpResponse(null, { status: 204 })),
    )
    const user = userEvent.setup()
    renderAt('/accounts/password-reset/')

    await user.type(await screen.findByLabelText('Email'), 'ali@example.com')
    await user.click(screen.getByRole('button', { name: 'Send reset link' }))

    expect(await screen.findByRole('status')).toHaveTextContent('Check your email')
    expect(screen.getByRole('status')).toHaveTextContent('ali@example.com')
  })

  it('sets the new password from the link', async () => {
    let sent: unknown
    server.use(
      http.post('/api/v1/auth/password-reset/confirm/', async ({ request }) => {
        sent = await request.json()
        return new HttpResponse(null, { status: 204 })
      }),
    )
    const user = userEvent.setup()
    renderAt('/accounts/password-reset/MQ/abc-123/')

    await user.type(await screen.findByLabelText('New password'), 'New-Kainat-Rice-9')
    await user.click(screen.getByRole('button', { name: 'Save new password' }))

    const status = await screen.findByRole('status')
    expect(status).toHaveTextContent('Password changed')
    expect(within(status).getByRole('link', { name: 'Log in' })).toHaveAttribute(
      'href',
      '/accounts/login/',
    )
    expect(sent).toEqual({ uid: 'MQ', token: 'abc-123', password: 'New-Kainat-Rice-9' })
  })

  it('offers a new link when the link is wrong or used', async () => {
    server.use(
      http.post('/api/v1/auth/password-reset/confirm/', () =>
        validation({}, 'This reset link is wrong or has expired. Ask for a new one.'),
      ),
    )
    const user = userEvent.setup()
    renderAt('/accounts/password-reset/MQ/old/')

    await user.type(await screen.findByLabelText('New password'), 'New-Kainat-Rice-9')
    await user.click(screen.getByRole('button', { name: 'Save new password' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('wrong or has expired')
    expect(screen.getByRole('link', { name: 'Ask for a new link' })).toHaveAttribute(
      'href',
      '/accounts/password-reset/',
    )
  })
})

describe('header account control', () => {
  it('shows log in for a guest', async () => {
    renderAt('/accounts/signup/')

    const header = screen.getByRole('banner')
    expect(await within(header).findByRole('link', { name: 'Log in' })).toHaveAttribute(
      'href',
      '/accounts/login/',
    )
  })

  it('links a logged-in customer to their account', async () => {
    server.use(http.get('/api/v1/auth/me/', () => HttpResponse.json(ali)))
    renderAt('/delivery-areas/')

    const header = screen.getByRole('banner')
    expect(
      await within(header).findByRole('link', { name: /account ali@example.com/i }),
    ).toHaveAttribute('href', '/account/')
  })
})
