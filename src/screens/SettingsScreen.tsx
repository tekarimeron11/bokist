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

type Props = {
  onBack: () => void
}

export function SettingsScreen({ onBack }: Props) {
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
    <div className="min-h-screen">
      <header className="px-6 pt-6 pb-3 flex items-center gap-3">
        <button onClick={onBack} aria-label="戻る" className="text-coral text-[13px] tracking-wider">
          ← 戻る
        </button>
      </header>
      <div className="px-6 pb-32">
      <span className="eyebrow">Settings</span>
      <h1 className="font-serif font-normal text-[32px] mt-2 leading-[1.1] tracking-[-0.015em]">
        設定
      </h1>

      <section className="glass-card rounded-[22px] p-6 mt-6">
        <span className="eyebrow">Data</span>
        <h2 className="font-serif font-medium text-[19px] mt-1.5">
          データ管理
        </h2>
        <p className="text-[12.5px] text-ink-soft mt-2 leading-[1.7] font-serif">
          学習履歴をJSONファイルとしてバックアップできます。
          端末変更前や定期保存にどうぞ。
        </p>
        <div className="mt-5 flex flex-col gap-2.5">
          <button
            onClick={handleExport}
            className="peach-button py-3 rounded-full text-[13px] font-medium tracking-wider"
          >
            データをエクスポート
          </button>
          <label className="glass-pill py-3 rounded-full text-[13px] font-medium text-ink text-center cursor-pointer hover:bg-white/85 transition-colors">
            データをインポート
            <input type="file" accept="application/json" className="hidden" onChange={handleImport} />
          </label>
          {snapshotKey && (
            <button
              onClick={handleUndo}
              className="text-[11.5px] text-coral underline mt-1.5"
            >
              直前のインポートを取り消す
            </button>
          )}
        </div>
        {message && (
          <div className="mt-4 text-[12px] text-ink-soft font-serif italic">{message}</div>
        )}
      </section>

      <footer className="mt-12 text-center text-[10px] text-ink-faint tracking-[0.18em] uppercase">
        <span className="font-serif italic text-coral mr-1.5">Luca.</span>
        Made for Ruka · 2026
      </footer>
      </div>
    </div>
  )
}
