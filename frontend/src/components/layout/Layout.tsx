import { Suspense, useState } from 'react'
import { Outlet, ScrollRestoration, useLocation, useMatches } from 'react-router'
import { isPaletteId, type PaletteId, type RouteHandle } from '../../config/palettes'
import { IntroCurtain } from '../intro/IntroCurtain'
import { LoadingBlock } from '../ui/StatusMessage'
import { Container } from '../ui/Container'
import { PageBackdrop } from './PageBackdrop'
import { PaletteSwitcher } from './PaletteSwitcher'
import { SiteFooter } from './SiteFooter'
import { SiteHeader } from './SiteHeader'

const PREVIEW_KEY = 'palette-preview'

function readPreview(): PaletteId | null {
  try {
    const value = localStorage.getItem(PREVIEW_KEY)
    return isPaletteId(value) ? value : null
  } catch {
    return null
  }
}

// Each route names its palette in `handle`; the deepest match wins.
function usePagePalette(): PaletteId {
  const matches = useMatches()
  for (let i = matches.length - 1; i >= 0; i--) {
    const palette = (matches[i].handle as RouteHandle | undefined)?.palette
    if (palette) return palette
  }
  return 'sage'
}

// Shell shared by every customer page.
export function Layout() {
  const { pathname } = useLocation()
  const pagePalette = usePagePalette()
  const [preview, setPreview] = useState<PaletteId | null>(readPreview)

  const choosePreview = (id: PaletteId | null) => {
    setPreview(id)
    try {
      if (id) localStorage.setItem(PREVIEW_KEY, id)
      else localStorage.removeItem(PREVIEW_KEY)
    } catch {
      // Storage blocked: the choice still applies until the tab closes.
    }
  }

  return (
    <div data-palette={preview ?? pagePalette} className="grain relative isolate flex min-h-dvh flex-col bg-surface text-ink">
      <a
        href="#main"
        className="sr-only z-50 bg-card px-4 py-2 font-semibold focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <PageBackdrop />
      <SiteHeader />
      <main id="main" className="flex-1">
        <Suspense
          fallback={
            <Container>
              <LoadingBlock />
            </Container>
          }
        >
          {/* Keyed by path so each page plays its entrance once. */}
          <div key={pathname} className="animate-page-in">
            <Outlet />
          </div>
        </Suspense>
      </main>
      <SiteFooter />
      {pathname === '/' && <IntroCurtain />}
      <PaletteSwitcher value={preview} pageDefault={pagePalette} onChange={choosePreview} />
      <ScrollRestoration />
    </div>
  )
}
