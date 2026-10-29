// Fixed, decorative background behind every page: soft colour fields that
// drift slowly, taken from the brand colours, over a faint dot grid.
export function PageBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            'radial-gradient(color-mix(in oklab, var(--color-primary-900) 14%, transparent) 1px, transparent 1.4px)',
          backgroundSize: '26px 26px',
          maskImage: 'radial-gradient(ellipse at 50% 0%, black 20%, transparent 75%)',
        }}
      />
      <div
        className="absolute -left-[10vw] -top-[10vh] size-[55vw] max-h-[720px] max-w-[720px] rounded-full blur-3xl"
        style={{
          background: 'color-mix(in oklab, var(--color-primary) 30%, transparent)',
          animation: 'drift 26s ease-in-out infinite',
        }}
      />
      <div
        className="absolute right-[-12vw] top-[30vh] size-[45vw] max-h-[620px] max-w-[620px] rounded-full blur-3xl"
        style={{
          background: 'color-mix(in oklab, var(--color-glow) 18%, transparent)',
          animation: 'drift 32s ease-in-out -8s infinite reverse',
        }}
      />
      <div
        className="absolute bottom-[-15vh] left-[25vw] size-[40vw] max-h-[560px] max-w-[560px] rounded-full blur-3xl"
        style={{
          background: 'color-mix(in oklab, var(--color-primary-100) 70%, transparent)',
          animation: 'drift 38s ease-in-out -16s infinite',
        }}
      />
    </div>
  )
}
