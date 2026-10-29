import { useId } from 'react'
import { STAR_PATH } from '../../lib/star'

// Hero background in plain CSS and SVG: slow drifting light, a faint grid of
// stars from the logo, and film grain. No WebGL, so it costs nothing on cheap phones.
export function HeroBackdrop() {
  const id = useId()

  return (
    <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden bg-primary-900">
      <div
        className="absolute -top-1/4 right-[-10%] size-[60vmax] rounded-full opacity-40 blur-3xl"
        style={{ background: 'var(--color-accent)', animation: 'drift 28s ease-in-out infinite' }}
      />
      <div
        className="absolute -bottom-1/3 left-[-15%] size-[55vmax] rounded-full opacity-50 blur-3xl"
        style={{
          background: 'var(--color-primary)',
          animation: 'drift 34s ease-in-out -12s infinite reverse',
        }}
      />

      {/* Star grid fades out toward the text so the headline stays easy to read. */}
      <svg className="absolute inset-0 size-full text-white opacity-[0.07] [mask-image:linear-gradient(to_left,black,transparent_75%)]">
        <defs>
          <pattern id={`${id}-stars`} width="72" height="72" patternUnits="userSpaceOnUse">
            <path d={STAR_PATH} fill="currentColor" transform="translate(26 26) scale(0.2)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${id}-stars)`} />
      </svg>

      <svg className="absolute inset-0 size-full opacity-[0.12] mix-blend-overlay">
        <filter id={`${id}-grain`}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves="2"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter={`url(#${id}-grain)`} />
      </svg>

      <div className="absolute inset-0 bg-gradient-to-r from-primary-900/80 via-primary-900/30 to-transparent" />
    </div>
  )
}
