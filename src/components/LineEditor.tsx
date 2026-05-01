import { AccountPicker } from './AccountPicker'
import { parseYenInput } from '../lib/format'
import type { AccountId } from '../types'

export type LineDraft = { account: AccountId | ''; amountText: string }

type Props = {
  side: 'debit' | 'credit'
  lines: LineDraft[]
  onChange: (lines: LineDraft[]) => void
  disabled?: boolean
}

export function LineEditor({ side, lines, onChange, disabled = false }: Props) {
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
  const accentColor = side === 'debit' ? '#5d7a4a' : '#a04d3f'
  const accentDot = side === 'debit' ? 'bg-sage' : 'bg-blush'

  return (
    <section
      aria-disabled={disabled}
      className={`glass-card rounded-[18px] p-4 transition-opacity duration-200 ${
        disabled ? 'opacity-50 pointer-events-none' : ''
      }`}
    >
      <div className="flex items-baseline gap-2 mb-3">
        <span className={`inline-block w-1.5 h-1.5 rounded-full ${accentDot}`} aria-hidden />
        <span className="font-serif italic font-medium text-[18px]" style={{ color: accentColor }}>
          {sideLabel}
        </span>
        <span className="text-[10px] text-ink-faint tracking-[0.18em] uppercase">{sideRoman}</span>
      </div>
      <div className="flex flex-col gap-2">
        {lines.map((line, i) => {
          return (
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
                className="w-24 px-2.5 py-2 rounded-[14px] border border-white/70 bg-white/60 backdrop-blur text-right text-sm tabular focus:outline-none focus:border-coral/50 focus:bg-white/85 transition-colors"
              />
              {lines.length > 1 ? (
                <button
                  onClick={() => removeLine(i)}
                  aria-label={`${sideLabel} ${i + 1} 行目を削除`}
                  className="text-ink-soft text-base w-7 h-7 rounded-full hover:bg-white/60 transition-colors"
                >
                  ×
                </button>
              ) : (
                <span className="w-7" aria-hidden />
              )}
            </div>
          )
        })}
        <button
          onClick={addLine}
          className="text-[11.5px] text-ink-soft border border-dashed border-white/70 rounded-[14px] py-2 hover:border-coral hover:text-coral transition-colors"
        >
          + もう1つの科目を追加
        </button>
      </div>
    </section>
  )
}
