import { formatPrice } from './money'

describe('formatPrice', () => {
  it('groups thousands and hides zero paisa', () => {
    expect(formatPrice('1250.00')).toBe('Rs 1,250')
    expect(formatPrice('1250000.00')).toBe('Rs 1,250,000')
  })

  it('keeps non-zero paisa', () => {
    expect(formatPrice('99.50')).toBe('Rs 99.50')
  })

  it('handles small amounts', () => {
    expect(formatPrice('0.00')).toBe('Rs 0')
    expect(formatPrice('450.00')).toBe('Rs 450')
  })
})
