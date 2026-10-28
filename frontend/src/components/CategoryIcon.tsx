import type { CategorySlug } from '../api/types'

// Simple line drawings so each category is recognisable before product photos exist.
export function CategoryIcon({ slug, className = 'size-10' }: { slug: CategorySlug; className?: string }) {
  const common = {
    className,
    viewBox: '0 0 48 48',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2.2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  }
  if (slug === 'rice') {
    // sack with grains
    return (
      <svg {...common}>
        <path d="M14 14c2-3 18-3 20 0l-2 4c4 4 6 10 6 16 0 6-6 9-14 9S10 40 10 34c0-6 2-12 6-16z" />
        <path d="M16 18h16" />
        <ellipse cx="21" cy="30" rx="1.4" ry="3" transform="rotate(-20 21 30)" />
        <ellipse cx="27" cy="31" rx="1.4" ry="3" transform="rotate(20 27 31)" />
        <ellipse cx="24" cy="36" rx="1.4" ry="3" />
      </svg>
    )
  }
  if (slug === 'dry-fruits') {
    // almond
    return (
      <svg {...common}>
        <path d="M24 6c8 6 12 15 12 23 0 8-5 13-12 13S12 37 12 29c0-8 4-17 12-23z" />
        <path d="M24 12c-3 6-4 12-3 22" />
      </svg>
    )
  }
  // cream tub with snowflake: kept cold
  return (
    <svg {...common}>
      <path d="M10 16h28l-3 24H13z" />
      <path d="M8 12h32v4H8z" />
      <path d="M24 22v12M19 25l10 6M29 25l-10 6" />
    </svg>
  )
}
