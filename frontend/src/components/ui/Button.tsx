import type { ButtonHTMLAttributes } from 'react'
import { Link, type LinkProps } from 'react-router'

// primary = orange, one per screen (design.md §1.2). outline = everything else.
type Variant = 'primary' | 'outline' | 'ghost'

const base =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-5 font-semibold transition-[color,background-color,transform,box-shadow] duration-300 disabled:cursor-not-allowed disabled:opacity-60'

const variants: Record<Variant, string> = {
  primary:
    'btn-sheen bg-accent text-lg font-bold text-on-accent shadow-[0_10px_30px_-12px_var(--color-accent)] hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-14px_var(--color-accent)] active:translate-y-0',
  outline: 'btn-fill border-2 border-primary-900 text-primary-900',
  ghost: 'text-primary-900 underline-offset-4 hover:underline',
}

export const buttonClass = (variant: Variant = 'outline', extra = '') => `${base} ${variants[variant]} ${extra}`

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }

export function Button({ variant = 'outline', className = '', type = 'button', ...props }: ButtonProps) {
  return <button type={type} className={buttonClass(variant, className)} {...props} />
}

export function ButtonLink({ variant = 'outline', className = '', ...props }: LinkProps & { variant?: Variant }) {
  return <Link className={buttonClass(variant, className)} {...props} />
}
