import type { ReactNode } from 'react'

// Shared loading / empty / error states (design.md §6).

export function LoadingBlock({ label = 'Loading' }: { label?: string }) {
  return (
    <div role="status" className="flex items-center gap-3 py-10 text-muted">
      <span className="size-4 animate-spin rounded-full border-2 border-primary border-t-primary-900" aria-hidden />
      {label}…
    </div>
  )
}

export function MessageBlock({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-card border border-secondary/60 bg-primary-50 px-6 py-8">
      <p className="font-wide text-lg font-semibold text-primary-900">{title}</p>
      {children && <div className="mt-2 text-muted">{children}</div>}
    </div>
  )
}

export function ErrorBlock({ onRetry }: { onRetry?: () => void }) {
  return (
    <div role="alert" className="rounded-card border border-danger/40 bg-card px-6 py-8">
      <p className="font-semibold text-danger">This section did not load.</p>
      <p className="mt-1 text-muted">Check your internet connection and try again.</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="link-grow mt-3 font-semibold text-primary-900">
          Try again
        </button>
      )}
    </div>
  )
}
