import type { BigProblemAttempt, BigProgressStore } from '../types'

const KEY = 'luca:big-progress:v1'
const EMPTY: BigProgressStore = { version: 1, attempts: [] }

function read(): BigProgressStore {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return EMPTY
    const parsed = JSON.parse(raw) as BigProgressStore
    if (parsed.version !== 1) return EMPTY
    if (!Array.isArray(parsed.attempts)) return EMPTY
    return parsed
  } catch {
    return EMPTY
  }
}

function write(store: BigProgressStore): void {
  localStorage.setItem(KEY, JSON.stringify(store))
}

export const bigProgressStore = {
  getAll(): BigProblemAttempt[] {
    return read().attempts
  },

  append(attempt: BigProblemAttempt): void {
    const store = read()
    store.attempts.push(attempt)
    write(store)
  },

  byProblem(problemId: string): BigProblemAttempt[] {
    return read().attempts.filter((a) => a.problemId === problemId)
  },

  clear(): void {
    write(EMPTY)
  },

  exportJson(): string {
    return JSON.stringify(read(), null, 2)
  },

  importJson(json: string): { ok: true } | { ok: false; error: string } {
    try {
      const parsed = JSON.parse(json) as BigProgressStore
      if (parsed.version !== 1) return { ok: false, error: '対応していないバージョンです' }
      if (!Array.isArray(parsed.attempts)) return { ok: false, error: 'データ形式が不正です' }
      write(parsed)
      return { ok: true }
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : 'パースに失敗しました' }
    }
  },
}
