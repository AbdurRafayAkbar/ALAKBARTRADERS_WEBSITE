import { Suspense } from 'react'
import { Outlet, ScrollRestoration, useLocation } from 'react-router'
import { LogoIntro } from '../intro/LogoIntro'
import { LoadingBlock } from '../ui/StatusMessage'
import { Container } from '../ui/Container'
import { PageBackdrop } from './PageBackdrop'
import { SiteFooter } from './SiteFooter'
import { SiteHeader } from './SiteHeader'

// Shell shared by every customer page.
export function Layout() {
  const { pathname } = useLocation()

  return (
    <div className="grain relative isolate flex min-h-dvh flex-col bg-surface text-ink">
      <a
        href="#main"
        className="sr-only z-50 bg-card px-4 py-2 font-semibold focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <PageBackdrop />
      <SiteHeader />
      {/* Clip, not hidden: sections tilted by scroll-3d.css grow wider than a
          phone screen, and clip trims them without making a scroll box. */}
      <main id="main" className="flex-1 overflow-x-clip">
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
      {pathname === '/' && <LogoIntro />}
      <ScrollRestoration />
    </div>
  )
}
