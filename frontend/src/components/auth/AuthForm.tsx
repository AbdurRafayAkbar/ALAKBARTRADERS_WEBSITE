import type { InputHTMLAttributes, ReactNode } from 'react'
import { ApiRequestError } from '../../api/client'
import type { ApiError } from '../../api/types'
import { Container } from '../ui/Container'

// Shared parts of the account pages: login, signup and password reset.

// A failed request without our error body is a lost connection.
export function toApiError(error: unknown): ApiError | null {
  if (!error) return null
  if (error instanceof ApiRequestError) return error.error
  return { code: 'network_error', message: 'Check your internet connection and try again.' }
}

// The heading and text match Django's shell page (pages.py), so crawlers and
// customers see the same words.
export function AuthLayout({
  heading,
  text,
  children,
}: {
  heading: string
  text?: string
  children: ReactNode
}) {
  return (
    <Container className="max-w-md py-10 sm:py-14">
      <div className="animate-page-in">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">{heading}</h1>
        {text && <p className="mt-3 text-lg text-muted">{text}</p>}
        <div className="mt-8">{children}</div>
      </div>
    </Container>
  )
}

export function FormError({ error }: { error: ApiError | null }) {
  if (!error) return null
  return (
    <p role="alert" className="rounded-lg border border-danger/40 bg-card px-4 py-3 text-danger">
      {error.message}
    </p>
  )
}

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  name: string
  label: string
  hint?: string
  errors?: string[]
}

export function Field({ name, label, hint, errors, ...input }: FieldProps) {
  const id = `field-${name}`
  const hasErrors = Boolean(errors?.length)
  const describedBy = [hint && `${id}-hint`, hasErrors && `${id}-error`].filter(Boolean).join(' ')
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="font-semibold">
        {label}
      </label>
      <input
        id={id}
        name={name}
        aria-invalid={hasErrors || undefined}
        aria-describedby={describedBy || undefined}
        className="min-h-11 rounded-lg border border-secondary bg-card px-4 transition-[border-color,box-shadow] focus:border-primary-900 focus:shadow-lg aria-invalid:border-danger"
        {...input}
      />
      {hint && (
        <p id={`${id}-hint`} className="text-sm text-muted">
          {hint}
        </p>
      )}
      {hasErrors && (
        <ul id={`${id}-error`} className="text-sm text-danger">
          {errors?.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
