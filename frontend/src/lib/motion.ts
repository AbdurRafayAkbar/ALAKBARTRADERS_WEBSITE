import type { PointerEvent } from 'react'

// Shared motion helpers. Browsers without matchMedia (tests) count as reduced
// motion, so nothing animated or WebGL runs there.
export const prefersReducedMotion = () =>
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? true

// Pointer handlers that feed CSS variables: --mx/--my for .spotlight and,
// when tilt > 0, --rx/--ry for .tilt. Only a mouse tilts; touch would jitter.
export function pointerGlow(tilt = 0) {
  return {
    onPointerMove(event: PointerEvent<HTMLElement>) {
      const el = event.currentTarget
      const rect = el.getBoundingClientRect()
      const x = (event.clientX - rect.left) / rect.width
      const y = (event.clientY - rect.top) / rect.height
      el.style.setProperty('--mx', `${x * 100}%`)
      el.style.setProperty('--my', `${y * 100}%`)
      if (tilt && event.pointerType === 'mouse') {
        el.style.setProperty('--rx', `${(0.5 - y) * tilt}deg`)
        el.style.setProperty('--ry', `${(x - 0.5) * tilt}deg`)
      }
    },
    onPointerLeave(event: PointerEvent<HTMLElement>) {
      event.currentTarget.style.setProperty('--rx', '0deg')
      event.currentTarget.style.setProperty('--ry', '0deg')
    },
  }
}
