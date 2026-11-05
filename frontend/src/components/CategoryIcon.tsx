import type { CategorySlug } from '../api/types'

// Simple line drawings so each category is recognisable before product photos exist.
export function CategoryIcon({
  slug,
  className = 'size-10',
}: {
  slug: CategorySlug
  className?: string
}) {
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
  if (slug === 'oil-ghee') {
    // oil bottle
    return (
      <svg {...common}>
        <path d="M20 6h8v6h-8z" />
        <path d="M20 12c-6 3-8 7-8 12v14a4 4 0 0 0 4 4h16a4 4 0 0 0 4-4V24c0-5-2-9-8-12" />
        <path d="M12 28h24" />
        <path d="M24 33c-2 2-2 4 0 5 2-1 2-3 0-5z" />
      </svg>
    )
  }
  if (slug === 'anmol-rewari') {
    // plate of sweets
    return (
      <svg {...common}>
        <ellipse cx="24" cy="32" rx="18" ry="7" />
        <circle cx="17" cy="26" r="4" />
        <circle cx="27" cy="25" r="4" />
        <circle cx="22" cy="19" r="4" />
        <circle cx="33" cy="29" r="3" />
      </svg>
    )
  }
  if (slug === 'desi-ghee' || slug === 'honey') {
    // jar with a lid; honey gets a drop on the label
    return (
      <svg {...common}>
        <path d="M14 8h20v6H14z" />
        <path d="M15 14c-3 2-4 5-4 8v16a4 4 0 0 0 4 4h18a4 4 0 0 0 4-4V22c0-3-1-6-4-8" />
        {slug === 'honey' ? (
          <path d="M24 23c-3 4-4 6-4 8a4 4 0 0 0 8 0c0-2-1-4-4-8z" />
        ) : (
          <path d="M17 26h14M17 32h14" />
        )}
      </svg>
    )
  }
  if (slug === 'milk-cream') {
    // cream tub with snowflake: kept cold
    return (
      <svg {...common}>
        <path d="M10 16h28l-3 24H13z" />
        <path d="M8 12h32v4H8z" />
        <path d="M24 22v12M19 25l10 6M29 25l-10 6" />
      </svg>
    )
  }
  // shopping bag for any category added later in admin
  return (
    <svg {...common}>
      <path d="M10 16h28l-2 26H12z" />
      <path d="M18 20v-6a6 6 0 0 1 12 0v6" />
    </svg>
  )
}
