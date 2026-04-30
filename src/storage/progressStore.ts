import type { Attempt, ProgressStore } from '../types'
import { STORAGE_KEYS } from './keys'

const EMPTY: ProgressStore = { version: 1, attempts: [] }

function read(): ProgressStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.progress)
    if (!raw) return EMPTY
    const parsed = JSON.parse(raw) as ProgressStore
    if (parsed.version !== 1) return EMPTY
    return parsed
  } catch {
    return EMPTY
  }
}

function write(store: ProgressStore): void {
  localStorage.setItem(STORAGE_KEYS.progress, JSON.stringify(store))
}

export const progressStore = {
  getAll(): Attempt[] {
    return read().attempts
  },

  append(attempt: Attempt): void {
    const store = read()
    store.attempts.push(attempt)
    write(store)
  },

  byChapter(chapterId: string): Attempt[] {
    return read().attempts.filter((a) => a.chapter === chapterId)
  },

  byQuestion(questionId: string): Attempt[] {
    return read().attempts.filter((a) => a.questionId === questionId)
  },

  clear(): void {
    write(EMPTY)
  },

  exportJson(): string {
    return JSON.stringify(read(), null, 2)
  },

  importJson(json: string): { ok: true } | { ok: false; error: string } {
    try {
      const parsed = JSON.parse(json) as ProgressStore
      if (parsed.version !== 1) {
        return { ok: false, error: '対応していないバージョンです' }
      }
      if (!Array.isArray(parsed.attempts)) {
        return { ok: false, error: 'データ形式が不正です' }
      }
      write(parsed)
      return { ok: true }
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : 'パースに失敗しました' }
    }
  },
}
