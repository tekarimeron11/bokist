import type { Meta } from '../types'
import { CURRENT_SCHEMA_VERSION, STORAGE_KEYS } from './keys'

const initial = (): Meta => ({
  schemaVersion: CURRENT_SCHEMA_VERSION,
  installedAt: new Date().toISOString(),
  lastOpenedAt: new Date().toISOString(),
  lastExportAt: null,
})

function read(): Meta {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.meta)
    if (!raw) {
      const fresh = initial()
      write(fresh)
      return fresh
    }
    const parsed = JSON.parse(raw) as Meta
    return { ...initial(), ...parsed }
  } catch {
    return initial()
  }
}

function write(meta: Meta): void {
  localStorage.setItem(STORAGE_KEYS.meta, JSON.stringify(meta))
}

export const metaStore = {
  get(): Meta {
    return read()
  },

  touch(): Meta {
    const next: Meta = { ...read(), lastOpenedAt: new Date().toISOString() }
    write(next)
    return next
  },

  markExported(): Meta {
    const next: Meta = { ...read(), lastExportAt: new Date().toISOString() }
    write(next)
    return next
  },

  daysSinceLastExport(): number | null {
    const m = read()
    if (!m.lastExportAt) return null
    const ms = Date.now() - new Date(m.lastExportAt).getTime()
    return Math.floor(ms / (1000 * 60 * 60 * 24))
  },

  set(meta: Meta): void {
    write(meta)
  },
}
