import { useEffect, useState, type CSSProperties } from 'react'
import { site } from '../../config/site'
import { prefersReducedMotion } from '../../lib/motion'
import { STAR_PATH } from '../../lib/star'

const SEEN_KEY = 'intro-seen'
const OPEN_AT = 2600
const CLOSE_AFTER = 900

function shouldPlay() {
  if (prefersReducedMotion()) return false
  try {
    return sessionStorage.getItem(SEEN_KEY) !== '1'
  } catch {
    return true
  }
}

// Grains of rice falling behind the logo. Positions come from the index, so
// every render draws the same picture.
const grains = Array.from({ length: 28 }, (_, i) => ({
  left: (i * 37) % 100,
  delay: (i * 173) % 1600,
  duration: 1800 + ((i * 97) % 1400),
  scale: 0.6 + ((i * 13) % 10) / 12,
}))

// Plays once per browser session on the home page: the star draws itself,
// the name rises letter by letter, then the curtain splits to show the page.
// The page underneath stays in the accessibility tree the whole time.
export function IntroCurtain() {
  const [phase, setPhase] = useState<'play' | 'open' | 'done'>(() =>
    shouldPlay() ? 'play' : 'done',
  )

  useEffect(() => {
    if (phase === 'done') {
      try {
        sessionStorage.setItem(SEEN_KEY, '1')
      } catch {
        // Private mode: the intro may play again next visit, which is fine.
      }
      return
    }
    const root = document.documentElement
    root.style.overflow = 'hidden'
    const timer =
      phase === 'play'
        ? window.setTimeout(() => setPhase('open'), OPEN_AT)
        : window.setTimeout(() => setPhase('done'), CLOSE_AFTER)
    return () => {
      window.clearTimeout(timer)
      root.style.overflow = ''
    }
  }, [phase])

  if (phase === 'done') return null
  const opening = phase === 'open'
  const panel = 'absolute inset-x-0 h-1/2 bg-primary-900'
  const panelMotion = (name: string): CSSProperties =>
    opening ? { animation: `${name} ${CLOSE_AFTER}ms cubic-bezier(0.76, 0, 0.24, 1) forwards` } : {}

  return (
    <div className="fixed inset-0 z-[70]" onClick={() => setPhase('open')}>
      <div aria-hidden className="absolute inset-0">
        <div className={`${panel} top-0`} style={panelMotion('curtain-up')} />
        <div className={`${panel} bottom-0`} style={panelMotion('curtain-down')} />

        <div
          className="absolute inset-0 overflow-hidden transition-opacity duration-300"
          style={{ opacity: opening ? 0 : 1 }}
        >
          {grains.map((g, i) => (
            <span
              key={i}
              className="absolute top-0 h-3 w-1.5 rounded-full bg-primary-50/70"
              style={{
                left: `${g.left}%`,
                scale: g.scale,
                animation: `grain-fall ${g.duration}ms linear ${g.delay}ms infinite`,
              }}
            />
          ))}
        </div>

        <div
          className="absolute inset-0 grid place-items-center px-6 transition-[opacity,transform] duration-500"
          style={{ opacity: opening ? 0 : 1, transform: opening ? 'scale(1.08)' : 'none' }}
        >
          <div className="text-center">
            <svg viewBox="0 0 100 100" className="mx-auto size-24 sm:size-28">
              <path
                d={STAR_PATH}
                fill="var(--color-accent)"
                fillOpacity={0}
                stroke="var(--color-accent)"
                strokeWidth={2}
                strokeLinejoin="round"
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1}
                style={{
                  animation:
                    'star-draw 1.1s cubic-bezier(0.65,0,0.35,1) 0.15s forwards, star-fill 0.5s ease 1.15s forwards',
                }}
              />
            </svg>
            <p className="mt-6 font-display text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
              {/* Letters animate one by one, but each word stays whole so phones break between words. */}
              {['ALAKBAR', 'TRADERS'].map((word, w) => (
                <span key={word}>
                  {w > 0 && ' '}
                  <span className="inline-block whitespace-nowrap">
                    {[...word].map((ch, i) => (
                      <span
                        key={i}
                        className="inline-block"
                        style={{
                          animation: `letter-in 0.7s cubic-bezier(0.16,1,0.3,1) ${900 + (w * 8 + i) * 45}ms both`,
                        }}
                      >
                        {ch}
                      </span>
                    ))}
                  </span>
                </span>
              ))}
            </p>
            <p
              className="mt-4 text-primary-100"
              style={{ animation: 'fade-up 0.8s cubic-bezier(0.16,1,0.3,1) 1.7s both' }}
            >
              Rice, dry fruits and milk cream in {site.city}
            </p>
          </div>
        </div>
      </div>

      {!opening && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setPhase('open')
          }}
          className="absolute bottom-6 right-6 rounded-full border border-white/30 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-primary-900"
        >
          Skip intro
        </button>
      )}
    </div>
  )
}
