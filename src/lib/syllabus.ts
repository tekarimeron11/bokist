import type { Question, SyllabusProfile } from '../types'

/**
 * REQUIREMENTS.md §2.4 日付パース仕様
 *
 * 受け付けるフォーマット:
 *  - 'YYYY-MM-DD'                 → JST 00:00 として正規化
 *  - ISO8601 with timezone        → そのままパース
 * その他は Invalid Date を返す（呼び出し側で除外）。
 */
export function parseSyllabusDate(input: string): Date {
  const dateOnly = input.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (dateOnly) {
    return new Date(`${dateOnly[1]}-${dateOnly[2]}-${dateOnly[3]}T00:00:00+09:00`)
  }
  if (/T.*([+-]\d{2}:?\d{2}|Z)$/i.test(input)) {
    return new Date(input)
  }
  return new Date(NaN)
}

/**
 * REQUIREMENTS.md §2.4 問題の有効性判定
 * 半開区間 [validFrom, validUntil) で評価
 * パース失敗（Invalid Date）の場合は出題候補から除外
 */
export function isQuestionAvailable(
  q: Question,
  profile: SyllabusProfile,
  now: Date = new Date(),
): boolean {
  if (profile !== 'both' && q.syllabusVersion !== profile) return false

  if (q.validFrom) {
    const from = parseSyllabusDate(q.validFrom)
    if (Number.isNaN(from.getTime())) return false
    if (from.getTime() > now.getTime()) return false
  }
  if (q.validUntil) {
    const until = parseSyllabusDate(q.validUntil)
    if (Number.isNaN(until.getTime())) return false
    if (until.getTime() <= now.getTime()) return false
  }
  return true
}
