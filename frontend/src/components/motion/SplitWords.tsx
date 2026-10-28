import type { CSSProperties } from 'react'

// Splits a line into masked words that rise in one after another.
// Screen readers and search get the plain sentence from the sr-only copy;
// the animated words are hidden from them, because some name calculations
// drop the spaces between separate word spans.
// Words from index `highlightFrom` on take the palette's spark colours.
export function SplitWords({ text, delay = 0, highlightFrom }: { text: string; delay?: number; highlightFrom?: number }) {
  const words = text.split(' ')
  const lit = highlightFrom ?? words.length
  const steps = Math.max(words.length - 1 - lit, 1)
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {words.map((word, i) => (
          <span key={`${word}-${i}`}>
            <span className="word-mask">
              <span
                className={i >= lit ? 'text-spark' : undefined}
                style={{ '--i': i, '--d': `${delay}ms`, '--t': i >= lit ? (i - lit) / steps : undefined } as CSSProperties}
              >
                {word}
              </span>
            </span>
            {i < words.length - 1 && ' '}
          </span>
        ))}
      </span>
    </>
  )
}
