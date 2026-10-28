import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'
import { resetMockCart } from '../api/cart'
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

beforeEach(() => resetMockCart())

describe('home page', () => {
  it('shows the hero and the shop CTA', async () => {
    renderAt('/')
    expect(screen.getByRole('heading', { level: 1, name: /at your door in Chashma/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Shop all products' })).toHaveAttribute('href', '/shop/')
    expect((await screen.findAllByRole('link', { name: /Super Kernel Basmati/i })).length).toBeGreaterThan(0)
  })
})

describe('product page', () => {
  it('adds the selected pack to the cart and updates the header count', async () => {
    const user = userEvent.setup()
    renderAt('/p/super-kernel-basmati/')
    await screen.findByRole('heading', { level: 1, name: 'Super Kernel Basmati' })

    await user.click(screen.getByRole('button', { name: 'Add to cart' }))

    expect(await screen.findByRole('status')).toHaveTextContent('Added to cart')
    const header = screen.getByRole('banner')
    expect(await within(header).findByTestId('cart-count')).toHaveTextContent('1')
  })

  it('shows not found for an unknown product', async () => {
    renderAt('/p/no-such-thing/')
    expect(await screen.findByRole('heading', { name: 'This page does not exist' })).toBeInTheDocument()
  })
})
