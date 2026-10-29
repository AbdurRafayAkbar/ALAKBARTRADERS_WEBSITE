import { useEffect, useRef, useState } from 'react'
import aSrc from '../../assets/brand/intro-a.webp'
import markSrc from '../../assets/brand/intro-mark.webp'
import tSrc from '../../assets/brand/intro-t.webp'
import { prefersReducedMotion } from '../../lib/motion'

const SEEN_KEY = 'intro-seen'
// The timeline below is written in "authored" seconds (3.6 s long) and played
// 1.44x faster, so the whole intro takes 2.5 s.
const LENGTH = 3.6
const SPEED = LENGTH / 2.5
const HOLD_MS = 350 // the finished mark breathes this long before the page shows
const FADE_MS = 600
const LOAD_TIMEOUT_MS = 1500
const NAME = 'ALAKBAR'

function shouldPlay() {
  if (prefersReducedMotion()) return false
  try {
    return sessionStorage.getItem(SEEN_KEY) !== '1'
  } catch {
    return true
  }
}

// Seeded random numbers, so the particles and the letter order look the same
// on every visit.
function rng(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rand = rng(11)
const particles = Array.from({ length: 90 }, (_, i) => ({
  gold: i % 2 === 1,
  off: rand(),
  amp: 4 + rand() * 10,
  wave: 6 + rand() * 10,
  angle: rand() * Math.PI * 2,
  radius: 40 + rand() * 120,
  size: 0.8 + rand() * 1.6,
}))

// Each letter of the name gets a random slot in the stagger.
const letterSlot = (() => {
  const order = [...NAME].map((_, i) => i)
  const r = rng(7)
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1))
    ;[order[i], order[j]] = [order[j], order[i]]
  }
  return order
})()

const progress = (t: number, start: number, duration: number) =>
  Math.min(1, Math.max(0, (t - start) / duration))
const quadOut = (p: number) => 1 - (1 - p) ** 2
const cubicOut = (p: number) => 1 - (1 - p) ** 3
const sineInOut = (p: number) => -(Math.cos(Math.PI * p) - 1) / 2
const quintIn = (p: number) => p ** 5

// How far A and T sit from the centre, in percent of their own width.
// They slide in, drift closer while the particles reach out, then snap shut.
function pieceOffset(t: number) {
  if (t < 0.6) return 200 - 35 * cubicOut(progress(t, 0.1, 0.5))
  if (t < 1.6) return 165 - 30 * sineInOut(progress(t, 0.6, 1.1))
  const atSnap = 165 - 30 * sineInOut(1 / 1.1)
  return atSnap * (1 - quintIn(progress(t, 1.6, 0.42)))
}

// A yoyo from 0 to 1 and back, used for the slow breathing after the snap.
function breath(seconds: number) {
  const phase = (seconds / 1.8) % 2
  return sineInOut(phase < 1 ? phase : 2 - phase)
}

function drawParticles(
  ctx: CanvasRenderingContext2D,
  t: number,
  a: DOMRect,
  tee: DOMRect,
  mark: DOMRect,
) {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
  if (t < 0.5 || t > 2.65) return
  const unit = mark.width / 200
  const dot = (x: number, y: number, size: number, gold: boolean, alpha: number) => {
    ctx.fillStyle = gold ? `rgba(255,214,110,${alpha})` : `rgba(120,240,180,${alpha})`
    ctx.beginPath()
    ctx.arc(x, y, size, 0, 7)
    ctx.fill()
  }
  if (t < 2.02) {
    // Tendrils reach from the tip of A and the tip of T toward each other.
    const ax = a.right - a.width * 0.12
    const ay = a.top + a.height * 0.42
    const bx = tee.left + tee.width * 0.1
    const by = tee.top + tee.height * 0.3
    const reach = Math.min(1, (t - 0.5) / 0.8)
    const dx = bx - ax
    const dy = by - ay
    const len = Math.hypot(dx, dy) || 1
    for (const p of particles) {
      const phase = (t * 0.8 + p.off) % 1
      const along = phase * reach * 0.55
      const s = p.gold ? 1 - along : along
      const w = Math.sin(along * p.wave + t * 5 + p.off * 20) * p.amp * unit * along * 2
      dot(
        ax + dx * s - (dy / len) * w,
        ay + dy * s + (dx / len) * w,
        p.size,
        p.gold,
        (1 - phase) * reach,
      )
    }
  } else {
    // After the flash every loose particle is pulled into the mark.
    const k = Math.min(1, (t - 2.02) / 0.6)
    const e = k * k
    const cx = mark.left + mark.width / 2
    const cy = mark.top + mark.height * 0.44
    for (const p of particles) {
      const sx = cx + Math.cos(p.angle) * p.radius * unit
      const sy = cy + Math.sin(p.angle) * p.radius * unit
      dot(sx + (cx - sx) * e, sy + (cy - sy) * e, p.size, p.gold, 1 - k)
    }
  }
}

// Plays once per browser session on the home page: the A and the T of the logo
// pull toward each other, snap together in a gold-green flash and become the
// mark, then the name fades in and the overlay lifts to show the page.
// The page underneath stays in the accessibility tree the whole time.
export function LogoIntro() {
  const [phase, setPhase] = useState<'play' | 'exit' | 'done'>(() =>
    shouldPlay() ? 'play' : 'done',
  )
  const active = phase !== 'done'
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  const aRef = useRef<HTMLImageElement>(null)
  const tRef = useRef<HTMLImageElement>(null)
  const markRef = useRef<HTMLImageElement>(null)
  const flashRef = useRef<HTMLDivElement>(null)
  const flareRef = useRef<SVGCircleElement>(null)
  const lettersRef = useRef<(HTMLSpanElement | null)[]>([])
  const tagRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (phase === 'exit') {
      const timer = window.setTimeout(() => setPhase('done'), FADE_MS)
      return () => window.clearTimeout(timer)
    }
    if (phase === 'done') {
      try {
        sessionStorage.setItem(SEEN_KEY, '1')
      } catch {
        // Private mode: the intro may play again next visit, which is fine.
      }
    }
  }, [phase])

  // One animation frame loop for the whole intro. Every value is worked out
  // from the clock and written straight to the elements, so React does not
  // re-render 60 times a second.
  useEffect(() => {
    if (!active) return
    const box = boxRef.current
    const a = aRef.current
    const tee = tRef.current
    const mark = markRef.current
    const canvas = canvasRef.current
    if (!box || !a || !tee || !mark || !canvas) return
    const ctx = canvas.getContext('2d')
    const html = document.documentElement
    html.style.overflow = 'hidden'
    let frame = 0
    let start = 0
    let leaving = false
    let cancelled = false

    const fitCanvas = () => {
      const dpr = window.devicePixelRatio || 1
      canvas.width = Math.round(window.innerWidth * dpr)
      canvas.height = Math.round(window.innerHeight * dpr)
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const render = (t: number, breathing: number) => {
      // On narrow screens the starting gap is shrunk so A and T stay on screen.
      const width = box.offsetWidth
      const room = window.innerWidth / 2 - 12
      const fit = Math.min(
        1,
        (room - 0.5 * width) / (1.65 * width),
        (room - 0.464 * width) / (1.53 * width),
      )
      const offset = (pieceOffset(t) / 100) * fit
      const entry = cubicOut(progress(t, 0.1, 0.5))
      const scale = 0.6 + 0.4 * entry
      const pieces = entry * (1 - quadOut(progress(t, 2.03, 0.08)))
      a.style.transform = `translateX(${-offset * a.offsetWidth}px) scale(${scale})`
      tee.style.transform = `translateX(${offset * tee.offsetWidth}px) scale(${scale})`
      a.style.opacity = tee.style.opacity = String(pieces)
      mark.style.opacity = String(quadOut(progress(t, 2.03, 0.08)))
      mark.style.transform = `translateY(${-5 * breathing}px) scale(${1 + 0.025 * breathing})`

      const bump =
        t < 2.1 ? cubicOut(progress(t, 2.02, 0.08)) : cubicOut(1 - progress(t, 2.1, 0.08))
      box.style.transform = `scale(${1 + 0.08 * bump})`

      if (flashRef.current) {
        flashRef.current.style.opacity = String(
          t < 2.08
            ? 0.95 * quadOut(progress(t, 2.02, 0.06))
            : 0.95 * (1 - cubicOut(progress(t, 2.08, 0.8))),
        )
      }
      if (flareRef.current) {
        const rise = quadOut(progress(t, 2.02, 0.15))
        const fade = quadOut(progress(t, 2.17, 0.6))
        flareRef.current.style.opacity = String(t < 2.17 ? rise : 1 - fade)
        flareRef.current.style.transform = `scale(${t < 2.17 ? 0.3 + 1.5 * rise : 1.8 + 0.6 * fade})`
      }
      lettersRef.current.forEach((letter, i) => {
        if (!letter) return
        const e = quadOut(progress(t, 2.6 + letterSlot[i] * 0.05, 0.6))
        letter.style.opacity = String(e)
        letter.style.filter = `blur(${10 * (1 - e)}px)`
      })
      if (tagRef.current) {
        const e = quadOut(progress(t, 2.9, 0.7))
        tagRef.current.style.opacity = String(e)
        tagRef.current.style.filter = `blur(${8 * (1 - e)}px)`
      }
      if (ctx) {
        drawParticles(
          ctx,
          t,
          a.getBoundingClientRect(),
          tee.getBoundingClientRect(),
          box.getBoundingClientRect(),
        )
      }
    }

    const tick = (now: number) => {
      start ||= now
      const real = (now - start) / 1000
      const t = Math.min(LENGTH, real * SPEED)
      render(t, t < LENGTH ? 0 : breath(real - LENGTH / SPEED))
      if (!leaving && real * 1000 >= (LENGTH / SPEED) * 1000 + HOLD_MS) {
        leaving = true
        setPhase((p) => (p === 'play' ? 'exit' : p))
      }
      frame = requestAnimationFrame(tick)
    }

    const onResize = () => fitCanvas()
    fitCanvas()
    render(0, 0)
    window.addEventListener('resize', onResize)

    // Start the clock only once the logo pieces are ready to paint, so a slow
    // phone does not miss the start. If they never load, skip to the page.
    const ready = Promise.all(
      [a, tee, mark].map((img) => (img.decode ? img.decode() : Promise.resolve())),
    )
    const timeout = new Promise((_, reject) => window.setTimeout(reject, LOAD_TIMEOUT_MS))
    Promise.race([ready, timeout]).then(
      () => {
        if (!cancelled) frame = requestAnimationFrame(tick)
      },
      () => {
        if (!cancelled) setPhase('exit')
      },
    )

    return () => {
      cancelled = true
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', onResize)
      html.style.overflow = ''
    }
  }, [active])

  if (!active) return null
  const leaving = phase === 'exit'
  const glow = (rgb: string) => ({ filter: `drop-shadow(0 0 10px rgba(${rgb},.65))` })

  return (
    <div
      className="fixed inset-0 z-[70] cursor-pointer overflow-hidden bg-ink"
      style={{
        backgroundImage:
          'radial-gradient(60% 50% at 50% 42%, color-mix(in oklab, var(--color-primary-900) 70%, transparent), transparent 75%)',
        opacity: leaving ? 0 : 1,
        transition: `opacity ${FADE_MS}ms ease`,
      }}
      onClick={() => setPhase('exit')}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 flex flex-col items-center justify-center gap-[clamp(1.25rem,5vh,2.5rem)] px-4"
      >
        <div
          ref={boxRef}
          className="relative w-[clamp(120px,32vmin,300px)]"
          style={{ aspectRatio: '370 / 364' }}
        >
          <div
            ref={flashRef}
            className="pointer-events-none absolute left-1/2 top-[44%] size-[340%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0"
            style={{
              background:
                'radial-gradient(closest-side, rgba(255,250,230,.95), rgba(243,199,86,.55) 35%, rgba(47,191,122,.25) 60%, transparent 80%)',
            }}
          />
          <img
            ref={aRef}
            src={aSrc}
            alt=""
            decoding="async"
            className="absolute left-[3.6%] top-0 w-[92.7%] opacity-0"
            style={glow('47,191,122')}
          />
          <img
            ref={tRef}
            src={tSrc}
            alt=""
            decoding="async"
            className="absolute left-0 top-[24%] w-full opacity-0"
            style={glow('227,179,65')}
          />
          <img
            ref={markRef}
            src={markSrc}
            alt=""
            decoding="async"
            className="absolute left-0 top-0 w-full opacity-0"
          />
          <svg
            viewBox="0 0 180 180"
            className="pointer-events-none absolute -inset-[40%] size-[180%]"
          >
            <defs>
              <radialGradient id="logo-intro-flare">
                <stop offset="0" stopColor="#FFF7DC" />
                <stop offset=".3" stopColor="#F3C756" stopOpacity=".9" />
                <stop offset=".65" stopColor="#2FBF7A" stopOpacity=".35" />
                <stop offset="1" stopColor="#2FBF7A" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle
              ref={flareRef}
              cx="90"
              cy="84"
              r="30"
              fill="url(#logo-intro-flare)"
              opacity="0"
              style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
            />
          </svg>
        </div>
        <p className="text-center font-display leading-none">
          <span className="block text-[clamp(1.6rem,7vw,3rem)] font-extrabold tracking-[0.06em] text-white">
            {[...NAME].map((letter, i) => (
              <span
                key={i}
                ref={(el) => {
                  lettersRef.current[i] = el
                }}
                className="inline-block opacity-0"
              >
                {letter}
              </span>
            ))}
          </span>
          <span
            ref={tagRef}
            className="mt-[0.55em] block pl-[0.5em] text-[clamp(0.7rem,2.4vw,1.1rem)] font-semibold tracking-[0.5em] text-spark-to opacity-0"
          >
            TRADERS
          </span>
        </p>
      </div>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 size-full"
      />
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          setPhase('exit')
        }}
        className="absolute bottom-6 right-6 rounded-full border border-white/30 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-primary-900"
      >
        Skip intro
      </button>
    </div>
  )
}
