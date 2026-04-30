import type { Settings } from '../types'
import { STORAGE_KEYS } from './keys'

const DEFAULT: Settings = {
  version: 1,
  syllabusProfile: '2026',
  excludePromissoryNotes: false,
  reduceMotion: false,
  soundEnabled: true,
  studyMode: 'guided',
}

function read(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.settings)
    if (!raw) return DEFAULT
    const parsed = JSON.parse(raw) as Settings
    if (parsed.version !== 1) return DEFAULT
    return { ...DEFAULT, ...parsed }
  } catch {
    return DEFAULT
  }
}

function write(settings: Settings): void {
  localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings))
}

export const settingsStore = {
  get(): Settings {
    return read()
  },

  update(patch: Partial<Omit<Settings, 'version'>>): Settings {
    const next: Settings = { ...read(), ...patch, version: 1 }
    write(next)
    return next
  },

  reset(): void {
    write(DEFAULT)
  },
}
