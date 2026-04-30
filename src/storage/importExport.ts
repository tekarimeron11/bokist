import type { Attempt, ExportPayload, Meta, ProgressStore, Settings } from '../types'
import { CURRENT_SCHEMA_VERSION, STORAGE_KEYS } from './keys'
import { metaStore } from './metaStore'
import { progressStore } from './progressStore'
import { settingsStore } from './settingsStore'

/**
 * REQUIREMENTS.md §6.5 インポート/エクスポート契約
 */

export function buildExportPayload(): ExportPayload {
  return {
    app: 'bokist',
    schemaVersion: CURRENT_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    meta: metaStore.get(),
    progress: { version: 1, attempts: progressStore.getAll() },
    settings: settingsStore.get(),
  }
}

export type ImportResult =
  | { ok: true; importedAttempts: number; snapshotKey: string }
  | { ok: false; error: string; details?: string }

const SNAPSHOT_PREFIX = 'bokist:snapshot:before-import:'

function makeSnapshotKey(): string {
  return `${SNAPSHOT_PREFIX}${new Date().toISOString().replace(/[:.]/g, '-')}`
}

function takeSnapshot(): string {
  const key = makeSnapshotKey()
  const snapshot: ExportPayload = buildExportPayload()
  localStorage.setItem(key, JSON.stringify(snapshot))
  cleanupOldSnapshots(key)
  return key
}

function cleanupOldSnapshots(keepKey: string): void {
  const keep = new Set([keepKey])
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const k = localStorage.key(i)
    if (k && k.startsWith(SNAPSHOT_PREFIX) && !keep.has(k)) {
      const ts = k.slice(SNAPSHOT_PREFIX.length)
      const ageHours = (Date.now() - new Date(ts.replace(/-/g, ':').replace(/T(\d+)-(\d+)-(\d+)/, 'T$1:$2:$3')).getTime()) / 3_600_000
      if (Number.isFinite(ageHours) && ageHours > 24) {
        localStorage.removeItem(k)
      }
    }
  }
}

function isAttempt(x: unknown): x is Attempt {
  if (!x || typeof x !== 'object') return false
  const a = x as Record<string, unknown>
  return (
    typeof a.id === 'string' &&
    typeof a.questionId === 'string' &&
    typeof a.chapter === 'string' &&
    typeof a.correct === 'boolean' &&
    typeof a.answeredAt === 'string'
  )
}

export function importPayload(jsonText: string): ImportResult {
  let parsed: unknown
  try {
    parsed = JSON.parse(jsonText)
  } catch (e) {
    return { ok: false, error: 'JSONとして読み込めませんでした', details: e instanceof Error ? e.message : '' }
  }

  if (!parsed || typeof parsed !== 'object') {
    return { ok: false, error: 'データ形式が不正です' }
  }
  const p = parsed as Partial<ExportPayload>

  if (p.app !== 'bokist') {
    return { ok: false, error: 'Bokist のバックアップではないようです' }
  }
  if (typeof p.schemaVersion !== 'number') {
    return { ok: false, error: 'schemaVersion が見つかりません' }
  }
  if (p.schemaVersion > CURRENT_SCHEMA_VERSION) {
    return { ok: false, error: '新しい形式のデータです。アプリを更新してください' }
  }
  if (!p.progress || !Array.isArray(p.progress.attempts)) {
    return { ok: false, error: '学習履歴が見つかりません' }
  }

  const attempts = p.progress.attempts
  const invalid = attempts.findIndex((a) => !isAttempt(a))
  if (invalid >= 0) {
    return { ok: false, error: `学習履歴が破損しています（${invalid + 1}件目）` }
  }

  const snapshotKey = takeSnapshot()
  try {
    if (p.settings && typeof p.settings === 'object') {
      localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(p.settings as Settings))
    }
    const newProgress: ProgressStore = { version: 1, attempts: attempts as Attempt[] }
    localStorage.setItem(STORAGE_KEYS.progress, JSON.stringify(newProgress))
    if (p.meta && typeof p.meta === 'object') {
      localStorage.setItem(STORAGE_KEYS.meta, JSON.stringify(p.meta as Meta))
    }
    return { ok: true, importedAttempts: attempts.length, snapshotKey }
  } catch (e) {
    rollbackFromSnapshot(snapshotKey)
    return { ok: false, error: '保存に失敗しました', details: e instanceof Error ? e.message : '' }
  }
}

export function rollbackFromSnapshot(snapshotKey: string): { ok: boolean; error?: string } {
  try {
    const raw = localStorage.getItem(snapshotKey)
    if (!raw) return { ok: false, error: 'スナップショットが見つかりません' }
    const snap = JSON.parse(raw) as ExportPayload
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(snap.settings))
    localStorage.setItem(STORAGE_KEYS.progress, JSON.stringify(snap.progress))
    localStorage.setItem(STORAGE_KEYS.meta, JSON.stringify(snap.meta))
    localStorage.removeItem(snapshotKey)
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : '不明なエラー' }
  }
}
