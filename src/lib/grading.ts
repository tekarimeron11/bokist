import type { JournalLine } from '../types'

/**
 * REQUIREMENTS.md §8.4 採点正規化ルール
 * 1. 空行除去（account=空 or amount=0）
 * 2. 同一勘定の合算
 * 3. account ID の辞書順でソート
 */
export function normalizeLines(lines: JournalLine[]): JournalLine[] {
  const merged = new Map<string, number>()
  for (const line of lines) {
    if (!line.account || !line.amount) continue
    merged.set(line.account, (merged.get(line.account) ?? 0) + line.amount)
  }
  return Array.from(merged.entries())
    .map(([account, amount]) => ({ account, amount }))
    .sort((a, b) => a.account.localeCompare(b.account))
}

function linesEqual(a: JournalLine[], b: JournalLine[]): boolean {
  if (a.length !== b.length) return false
  return a.every((line, i) => line.account === b[i].account && line.amount === b[i].amount)
}

export function gradeJournal(
  user: { debit: JournalLine[]; credit: JournalLine[] },
  correct: { debit: JournalLine[]; credit: JournalLine[] },
): boolean {
  return (
    linesEqual(normalizeLines(user.debit), normalizeLines(correct.debit)) &&
    linesEqual(normalizeLines(user.credit), normalizeLines(correct.credit))
  )
}

export function isBalanced(lines: { debit: JournalLine[]; credit: JournalLine[] }): boolean {
  const sum = (xs: JournalLine[]) => xs.reduce((acc, l) => acc + (l.amount || 0), 0)
  return sum(lines.debit) === sum(lines.credit) && sum(lines.debit) > 0
}
