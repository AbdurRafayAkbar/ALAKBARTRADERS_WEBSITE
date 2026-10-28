import type { CSSProperties } from 'react'

// Splits a line into masked words that rise in one after another.
// Screen readers and search get the plain sentence from the sr-only copy;
// the animated words are hidden from them, because some name calculations
// drop the spaces between separate word spans.
export function SplitWords({ text, delay = 0 }: { text: string; delay?: number }) {
  const words = text.split(' ')
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {words.map((word, i) => (
          <span key={`${word}-${i}`}>
            <span className="word-mask">
              <span style={{ '--i': i, '--d': `${delay}ms` } as CSSProperties}>{word}</span>
            </span>
            {i < words.length - 1 && ' '}
          </span>
        ))}
      </span>
    </>
  )
}
