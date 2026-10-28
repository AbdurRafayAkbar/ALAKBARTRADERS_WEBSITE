// The API sends money as strings ("1250.00"), never JS numbers (rules.md §5).
// This helper only formats for display. It never does arithmetic.
export function formatPrice(amount: string): string {
  const [whole, fraction = '00'] = amount.split('.')
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return fraction === '00' ? `Rs ${grouped}` : `Rs ${grouped}.${fraction.padEnd(2, '0')}`
}
