import type { CSSProperties, ReactNode } from 'react'
import { useReveal } from '../../hooks/useReveal'

// Fades and lifts its content in on first scroll. `index` staggers siblings.
export function Reveal({
  children,
  index = 0,
  className = '',
  as: Tag = 'div',
}: {
  children: ReactNode
  index?: number
  className?: string
  as?: 'div' | 'li'
}) {
  const ref = useReveal<HTMLDivElement & HTMLLIElement>()
  return (
    <Tag ref={ref} className={`reveal ${className}`} style={{ '--i': index } as CSSProperties}>
      {children}
    </Tag>
  )
}
