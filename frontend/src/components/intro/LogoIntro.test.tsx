import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LogoIntro } from './LogoIntro'

function allowMotion() {
  vi.stubGlobal('matchMedia', (query: string) => ({ matches: false, media: query }))
}

beforeEach(() => sessionStorage.clear())
afterEach(() => vi.unstubAllGlobals())

describe('LogoIntro', () => {
  it('does not play when the visitor asks for reduced motion', () => {
    vi.stubGlobal('matchMedia', (query: string) => ({ matches: true, media: query }))
    render(<LogoIntro />)
    expect(screen.queryByRole('button', { name: 'Skip intro' })).not.toBeInTheDocument()
  })

  it('plays only once per session', () => {
    allowMotion()
    sessionStorage.setItem('intro-seen', '1')
    render(<LogoIntro />)
    expect(screen.queryByRole('button', { name: 'Skip intro' })).not.toBeInTheDocument()
  })

  it('can be skipped, which shows the page and remembers it', async () => {
    allowMotion()
    render(<LogoIntro />)
    expect(document.documentElement.style.overflow).toBe('hidden')

    await userEvent.click(screen.getByRole('button', { name: 'Skip intro' }))

    // The overlay fades out first, then leaves the page.
    await vi.waitFor(() =>
      expect(screen.queryByRole('button', { name: 'Skip intro' })).not.toBeInTheDocument(),
    )
    expect(document.documentElement.style.overflow).toBe('')
    expect(sessionStorage.getItem('intro-seen')).toBe('1')
  })
})
