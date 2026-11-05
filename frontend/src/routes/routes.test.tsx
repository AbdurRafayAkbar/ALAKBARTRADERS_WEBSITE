import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { resetMockCart } from '../api/cart'
import type { Category, Product } from '../api/types'
import { routes } from './routes'

function renderAt(path: string) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

const categories: Category[] = [
  { slug: 'rice', name: 'Rice', summary: 'Kacha, steam and sela rice' },
  { slug: 'honey', name: 'Honey', summary: 'Pure honey' },
]

// One product with a price, and one still waiting for the owner to set it.
const products: Product[] = [
  {
    slug: 'kainat-kacha',
    name: 'Kainat Kacha',
    category: 'rice',
    description: '',
    is_perishable: false,
    is_featured: true,
    variants: [
      {
        id: 1,
        label: '5 kg',
        sku: 'KK-5',
        price: '1500.00',
        compare_at_price: null,
        stock_state: 'in_stock',
      },
    ],
    images: [],
  },
  {
    slug: 'honey',
    name: 'Honey',
    category: 'honey',
    description: '',
    is_perishable: false,
    is_featured: true,
    variants: [],
    images: [],
  },
]

// The last product list query the page sent, so tests can check its filters.
let lastProductQuery = new URLSearchParams()

const page = (results: Product[], extra: object = {}) => ({
  count: results.length,
  next: null,
  previous: null,
  results,
  ...extra,
})

// The cart is still a mock; the catalog and login check come from the API.
const server = setupServer(
  http.get('/api/v1/auth/me/', () => new HttpResponse(null, { status: 204 })),
  http.get('/api/v1/categories/', () => HttpResponse.json(categories)),
  http.get('/api/v1/products/', ({ request }) => {
    lastProductQuery = new URL(request.url).searchParams
    return HttpResponse.json(page(products))
  }),
  http.get('/api/v1/pack-sizes/', () => HttpResponse.json(['5 kg'])),
  http.get('/api/v1/products/:slug/', ({ params }) => {
    const product = products.find((p) => p.slug === params.slug)
    return product ? HttpResponse.json(product) : new HttpResponse(null, { status: 404 })
  }),
)

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
beforeEach(() => resetMockCart())

describe('home page', () => {
  it('shows the hero and the shop CTA', async () => {
    renderAt('/')
    expect(
      screen.getByRole('heading', { level: 1, name: /ready for your table/i }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Shop all products' })).toHaveAttribute(
      'href',
      '/shop/',
    )
    expect((await screen.findAllByRole('link', { name: /Kainat Kacha/i })).length).toBeGreaterThan(
      0,
    )
  })

  it('opens WhatsApp from the header contact link', () => {
    renderAt('/')
    const link = screen.getByRole('link', { name: /WhatsApp 0333-6839509/ })
    expect(link).toHaveAttribute('href', 'https://wa.me/923336839509')
    expect(link).toHaveAttribute('target', '_blank')
  })
})

describe('product page', () => {
  it('adds the selected pack to the cart and updates the header count', async () => {
    const user = userEvent.setup()
    renderAt('/p/kainat-kacha/')
    await screen.findByRole('heading', { level: 1, name: 'Kainat Kacha' })

    await user.click(screen.getByRole('button', { name: 'Add to cart' }))

    expect(await screen.findByRole('status')).toHaveTextContent('Added to cart')
    const header = screen.getByRole('banner')
    expect(await within(header).findByTestId('cart-count')).toHaveTextContent('1')
  })

  it('shows price coming soon and no cart button before a price is set', async () => {
    renderAt('/p/honey/')
    await screen.findByRole('heading', { level: 1, name: 'Honey' })
    expect(screen.getByText('Price coming soon')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Add to cart' })).not.toBeInTheDocument()
  })

  it('shows not found for an unknown product', async () => {
    renderAt('/p/no-such-thing/')
    expect(
      await screen.findByRole('heading', { name: 'This page does not exist' }),
    ).toBeInTheDocument()
  })
})

describe('shop filters', () => {
  it('sends the ticked pack size to the API', async () => {
    const user = userEvent.setup()
    renderAt('/shop/')
    await screen.findByText('2 products')

    await user.click(await screen.findByRole('checkbox', { name: '5 kg' }))

    await vi.waitFor(() => expect(lastProductQuery.getAll('size')).toEqual(['5 kg']))
    expect(screen.getByRole('checkbox', { name: '5 kg' })).toBeChecked()
  })

  it('sorts by price when the sort changes', async () => {
    const user = userEvent.setup()
    renderAt('/shop/')
    await screen.findByText('2 products')

    await user.selectOptions(screen.getByRole('combobox', { name: 'Sort by' }), 'price_asc')

    await vi.waitFor(() => expect(lastProductQuery.get('sort')).toBe('price_asc'))
  })

  it('moves to the next page and back', async () => {
    server.use(
      http.get('/api/v1/products/', ({ request }) => {
        lastProductQuery = new URL(request.url).searchParams
        const second = lastProductQuery.get('page') === '2'
        return HttpResponse.json(
          page(second ? [products[1]] : [products[0]], {
            count: 30,
            next: second ? null : '/api/v1/products/?page=2',
            previous: second ? '/api/v1/products/' : null,
          }),
        )
      }),
    )
    const user = userEvent.setup()
    renderAt('/shop/')
    expect(await screen.findByText('Page 1 of 2')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: 'Next' }))

    expect(await screen.findByText('Page 2 of 2')).toBeInTheDocument()
    expect(await screen.findByRole('link', { name: /Honey/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()
  })

  it('offers the first page when a bookmarked page is gone', async () => {
    server.use(
      http.get('/api/v1/products/', () =>
        HttpResponse.json({ detail: 'Invalid page.' }, { status: 404 }),
      ),
    )
    renderAt('/shop/?page=9')
    expect(await screen.findByText('This page is empty')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Go to the first page' })).toBeInTheDocument()
  })
})
