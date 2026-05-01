import type { JournalLine } from '../types'
import { gradeJournal } from './grading'

type EntrySet = { debit: JournalLine[]; credit: JournalLine[] }

/**
 * Grade a single 決算整理 adjustment against the expected answer set.
 * - Each user entry set must match exactly one (unused) expected entry set.
 * - Set-equality: order of user entries vs expected entries does not matter.
 */
export function gradeAdjustment(user: EntrySet[], expected: EntrySet[]): boolean {
  if (user.length !== expected.length) return false
  const usedExpected = new Set<number>()
  for (const u of user) {
    let matched = false
    for (let i = 0; i < expected.length; i++) {
      if (usedExpected.has(i)) continue
      if (gradeJournal(u, expected[i])) {
        usedExpected.add(i)
        matched = true
        break
      }
    }
    if (!matched) return false
  }
  return true
}
