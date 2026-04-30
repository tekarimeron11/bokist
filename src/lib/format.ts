export function formatYen(amount: number): string {
  return `¥${amount.toLocaleString('ja-JP')}`
}

export function parseYenInput(input: string): number {
  const sanitized = input.replace(/[^\d-]/g, '')
  if (!sanitized) return 0
  const n = Number(sanitized)
  return Number.isFinite(n) ? n : 0
}
