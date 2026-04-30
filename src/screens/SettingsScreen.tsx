import { useState } from 'react'
import { buildExportPayload, importPayload, rollbackFromSnapshot } from '../storage/importExport'
import { metaStore } from '../storage/metaStore'

function downloadJson(filename: string, json: string) {
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function SettingsScreen() {
  const [message, setMessage] = useState<string | null>(null)
  const [snapshotKey, setSnapshotKey] = useState<string | null>(null)

  function handleExport() {
    const payload = buildExportPayload()
    const stamp = new Date().toISOString().slice(0, 10)
    downloadJson(`bokist-backup-${stamp}.json`, JSON.stringify(payload, null, 2))
    metaStore.markExported()
    setMessage('✓ エクスポート完了')
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const text = String(reader.result ?? '')
      const result = importPayload(text)
      if (result.ok) {
        setMessage(`✓ ${result.importedAttempts}件の履歴を復元しました`)
        setSnapshotKey(result.snapshotKey)
      } else {
        setMessage(`× ${result.error}`)
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  function handleUndo() {
    if (!snapshotKey) return
    const r = rollbackFromSnapshot(snapshotKey)
    setMessage(r.ok ? '✓ インポート前の状態に戻しました' : `× ${r.error ?? '失敗'}`)
    setSnapshotKey(null)
  }

  return (
    <div className="px-5 pt-4 pb-32">
      <div className="text-[10px] tracking-[0.2em] uppercase text-ink-soft">Settings</div>
      <h1 className="font-serif text-2xl mt-1">設定</h1>

      <section className="mt-6 p-5 rounded-2xl bg-white border border-line">
        <h2 className="font-serif text-base">データ管理</h2>
        <p className="text-xs text-ink-soft mt-1 leading-relaxed">
          学習履歴をJSONファイルとしてバックアップできます。
          <br />端末変更前や定期保存にどうぞ。
        </p>
        <div className="mt-4 flex flex-col gap-2">
          <button
            onClick={handleExport}
            className="bg-ink text-white py-3 rounded-full text-sm font-medium"
          >
            データをエクスポート
          </button>
          <label className="bg-white border border-line text-ink py-3 rounded-full text-sm font-medium text-center cursor-pointer">
            データをインポート
            <input type="file" accept="application/json" className="hidden" onChange={handleImport} />
          </label>
          {snapshotKey && (
            <button
              onClick={handleUndo}
              className="text-xs text-ink-soft underline mt-2"
            >
              直前のインポートを取り消す
            </button>
          )}
        </div>
        {message && (
          <div className="mt-3 text-xs text-ink-soft">{message}</div>
        )}
      </section>
    </div>
  )
}
