import { AccountPicker } from './AccountPicker'
import { parseYenInput } from '../lib/format'
import type { AccountId } from '../types'

export type LineDraft = { account: AccountId | ''; amountText: string }

type Props = {
  side: 'debit' | 'credit'
  lines: LineDraft[]
  onChange: (lines: LineDraft[]) => void
}

export function LineEditor({ side, lines, onChange }: Props) {
  function patch(i: number, partial: Partial<LineDraft>) {
    onChange(lines.map((l, idx) => (idx === i ? { ...l, ...partial } : l)))
  }
  function addLine() {
    onChange([...lines, { account: '', amountText: '' }])
  }
  function removeLine(i: number) {
    if (lines.length === 1) {
      onChange([{ account: '', amountText: '' }])
    } else {
      onChange(lines.filter((_, idx) => idx !== i))
    }
  }

  const sideLabel = side === 'debit' ? '借方' : '貸方'
  const sideRoman = side === 'debit' ? 'DR' : 'CR'

  return (
    <section>
      <div className="flex items-baseline gap-2 mb-2">
        <span className="font-display text-xl">{sideLabel}</span>
        <span className="text-[10px] text-ink-soft tracking-wider">{sideRoman}</span>
      </div>
      <div className="flex flex-col gap-2">
        {lines.map((line, i) => (
          <div key={i} className="flex items-center gap-2">
            <AccountPicker
              value={line.account}
              onChange={(account) => patch(i, { account })}
            />
            <input
              type="text"
              inputMode="numeric"
              placeholder="金額"
              value={line.amountText}
              onChange={(e) => {
                const cleaned = e.target.value.replace(/[^\d]/g, '')
                const n = parseYenInput(cleaned)
                patch(i, { amountText: n ? n.toLocaleString('ja-JP') : '' })
              }}
              className="w-24 px-2 py-2 rounded-xl border border-line bg-white text-right text-sm font-mono"
            />
            {lines.length > 1 && (
              <button
                onClick={() => removeLine(i)}
                aria-label="削除"
                className="text-ink-soft text-sm w-6"
              >
                ×
              </button>
            )}
          </div>
        ))}
        <button
          onClick={addLine}
          className="text-xs text-ink-soft border border-dashed border-line rounded-xl py-2"
        >
          + 行を追加
        </button>
      </div>
    </section>
  )
}
