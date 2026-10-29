import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import type { Address, User } from '../../api/types'
import { routes } from '../../routes/routes'

const ali: User = { id: 1, email: 'ali@example.com', first_name: 'Ali', last_name: '', phone: '' }

const home: Address = {
  id: 7,
  full_name: 'Ali Khan',
  phone: '03001234567',
  house_number: 'House#999',
  block: 'CAT-V',
  colony: 'Officers Colony',
  house_name: '',
  landmark: 'Near the mosque',
  area: '',
  is_default: true,
}

const shop: Address = {
  ...home,
  id: 8,
  full_name: 'Ali at the shop',
  house_number: 'Shop 4',
  landmark: '',
  is_default: false,
}

const validation = (
  fields: Record<string, string[]>,
  message = 'Please check the highlighted fields.',
) => HttpResponse.json({ code: 'validation_error', message, fields }, { status: 400 })

const server = setupServer(
  http.get('/api/v1/auth/me/', () => HttpResponse.json(ali)),
  http.get('/api/v1/account/addresses/', () => HttpResponse.json([home, shop])),
)

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

describe('account pages need a login', () => {
  it.each(['/account/', '/account/addresses/'])('sends a guest from %s to log in', async (path) => {
    server.use(http.get('/api/v1/auth/me/', () => new HttpResponse(null, { status: 204 })))
    const router = renderAt(path)

    await screen.findByRole('heading', { level: 1, name: 'Log in' })
    expect(router.state.location.pathname).toBe('/accounts/login/')
    expect(router.state.location.search).toBe(`?next=${encodeURIComponent(path)}`)
  })
})

describe('profile page', () => {
  it('saves the name and phone', async () => {
    let sent: unknown
    server.use(
      http.patch('/api/v1/account/profile/', async ({ request }) => {
        sent = await request.json()
        return HttpResponse.json({ ...ali, last_name: 'Khan', phone: '03001234567' })
      }),
    )
    const user = userEvent.setup()
    renderAt('/account/')

    expect(await screen.findByText(/logged in as/i)).toHaveTextContent('ali@example.com')
    expect(screen.getByLabelText('First name')).toHaveValue('Ali')
    await user.type(screen.getByLabelText('Last name'), 'Khan')
    await user.type(screen.getByLabelText('Phone (optional)'), '03001234567')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(await screen.findByRole('status')).toHaveTextContent('Changes saved.')
    expect(sent).toEqual({ first_name: 'Ali', last_name: 'Khan', phone: '03001234567' })
  })

  it('marks a phone Django refused', async () => {
    server.use(
      http.patch('/api/v1/account/profile/', () =>
        validation({ phone: ['Enter a Pakistani mobile number, like 03001234567.'] }),
      ),
    )
    const user = userEvent.setup()
    renderAt('/account/')

    await user.type(await screen.findByLabelText('Phone (optional)'), '123')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(await screen.findByText(/pakistani mobile number/i)).toBeVisible()
    expect(screen.getByLabelText('Phone (optional)')).toHaveAttribute('aria-invalid', 'true')
  })

  it('logs out and goes home', async () => {
    server.use(http.post('/api/v1/auth/logout/', () => new HttpResponse(null, { status: 204 })))
    const user = userEvent.setup()
    const router = renderAt('/account/')

    await user.click(await screen.findByRole('button', { name: 'Log out' }))

    const header = screen.getByRole('banner')
    expect(await within(header).findByRole('link', { name: 'Log in' })).toBeInTheDocument()
    await expect.poll(() => router.state.location.pathname).toBe('/')
  })
})

describe('saved addresses page', () => {
  it('lists the addresses with the default marked', async () => {
    renderAt('/account/addresses/')

    const list = await screen.findByRole('list', { name: 'Your addresses' })
    const cards = within(list).getAllByRole('listitem')
    expect(cards).toHaveLength(2)
    expect(cards[0]).toHaveTextContent('Ali Khan')
    expect(cards[0]).toHaveTextContent('Default')
    expect(cards[0]).toHaveTextContent('Near the mosque')
    expect(within(cards[0]).queryByRole('button', { name: 'Make default' })).toBeNull()
    expect(cards[1]).not.toHaveTextContent('Default')
  })

  it('invites the customer to add one when there are none', async () => {
    server.use(http.get('/api/v1/account/addresses/', () => HttpResponse.json([])))
    renderAt('/account/addresses/')

    expect(await screen.findByText(/no saved addresses yet/i)).toBeVisible()
    expect(screen.getByRole('button', { name: 'Add an address' })).toBeVisible()
  })

  it('adds an address', async () => {
    let sent: unknown
    let saved: Address[] = []
    server.use(
      http.get('/api/v1/account/addresses/', () => HttpResponse.json(saved)),
      http.post('/api/v1/account/addresses/', async ({ request }) => {
        sent = await request.json()
        saved = [{ ...home, id: 9 }]
        return HttpResponse.json(saved[0], { status: 201 })
      }),
    )
    const user = userEvent.setup()
    renderAt('/account/addresses/')

    await user.click(await screen.findByRole('button', { name: 'Add an address' }))
    await user.type(screen.getByLabelText('Name'), 'Ali Khan')
    await user.type(screen.getByLabelText('Phone'), '03001234567')
    await user.type(screen.getByLabelText('House number'), 'House#999')
    await user.type(screen.getByLabelText('Block'), 'CAT-V')
    await user.type(screen.getByLabelText('Colony'), 'Officers Colony')
    await user.type(screen.getByLabelText('Landmark (optional)'), 'Near the mosque')
    await user.click(screen.getByLabelText('Use as my default address'))
    await user.click(screen.getByRole('button', { name: 'Save address' }))

    const list = await screen.findByRole('list', { name: 'Your addresses' })
    expect(within(list).getByText('Ali Khan')).toBeVisible()
    expect(screen.queryByRole('button', { name: 'Save address' })).toBeNull()
    expect(sent).toEqual({
      full_name: 'Ali Khan',
      phone: '03001234567',
      house_number: 'House#999',
      block: 'CAT-V',
      colony: 'Officers Colony',
      house_name: '',
      landmark: 'Near the mosque',
      is_default: true,
    })
  })

  it('shows the limit message from Django', async () => {
    server.use(
      http.post('/api/v1/account/addresses/', () =>
        validation({}, 'You can save up to 5 addresses. Delete one to add another.'),
      ),
    )
    const user = userEvent.setup()
    renderAt('/account/addresses/')

    await user.click(await screen.findByRole('button', { name: 'Add an address' }))
    await user.type(screen.getByLabelText('Name'), 'Ali Khan')
    await user.type(screen.getByLabelText('Phone'), '03001234567')
    await user.type(screen.getByLabelText('House number'), '1')
    await user.type(screen.getByLabelText('Block'), 'A')
    await user.type(screen.getByLabelText('Colony'), 'B')
    await user.click(screen.getByRole('button', { name: 'Save address' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('up to 5 addresses')
  })

  it('edits an address', async () => {
    let sent: unknown
    server.use(
      http.patch('/api/v1/account/addresses/8/', async ({ request }) => {
        sent = await request.json()
        return HttpResponse.json({ ...shop, colony: 'Main Bazaar' })
      }),
    )
    const user = userEvent.setup()
    renderAt('/account/addresses/')

    const list = await screen.findByRole('list', { name: 'Your addresses' })
    await user.click(
      within(within(list).getAllByRole('listitem')[1]).getByRole('button', { name: 'Edit' }),
    )
    const colony = screen.getByLabelText('Colony')
    expect(colony).toHaveValue('Officers Colony')
    await user.clear(colony)
    await user.type(colony, 'Main Bazaar')
    await user.click(screen.getByRole('button', { name: 'Save address' }))

    await screen.findByRole('button', { name: 'Add an address' })
    expect(sent).toMatchObject({ colony: 'Main Bazaar', house_number: 'Shop 4', is_default: false })
  })

  it('makes an address the default', async () => {
    let sent: unknown
    server.use(
      http.patch('/api/v1/account/addresses/8/', async ({ request }) => {
        sent = await request.json()
        return HttpResponse.json({ ...shop, is_default: true })
      }),
    )
    const user = userEvent.setup()
    renderAt('/account/addresses/')

    await user.click(await screen.findByRole('button', { name: 'Make default' }))

    await screen.findByRole('list', { name: 'Your addresses' })
    expect(sent).toEqual({ is_default: true })
  })

  it('asks before deleting an address', async () => {
    let deleted = false
    server.use(
      http.get('/api/v1/account/addresses/', () =>
        HttpResponse.json(deleted ? [home] : [home, shop]),
      ),
      http.delete('/api/v1/account/addresses/8/', () => {
        deleted = true
        return new HttpResponse(null, { status: 204 })
      }),
    )
    const user = userEvent.setup()
    renderAt('/account/addresses/')

    const list = await screen.findByRole('list', { name: 'Your addresses' })
    const card = within(list).getAllByRole('listitem')[1]
    await user.click(within(card).getByRole('button', { name: 'Delete' }))
    expect(within(card).getByText('Delete this address?')).toBeVisible()
    await user.click(within(card).getByRole('button', { name: 'Keep it' }))
    expect(deleted).toBe(false)

    await user.click(within(card).getByRole('button', { name: 'Delete' }))
    await user.click(within(card).getByRole('button', { name: 'Yes, delete' }))

    await expect.poll(() => within(list).queryAllByRole('listitem').length).toBe(1)
    expect(deleted).toBe(true)
  })
})
