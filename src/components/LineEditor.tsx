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
  const accentBorder = side === 'debit' ? 'border-l-sage' : 'border-l-blush'
  const accentDot = side === 'debit' ? 'bg-sage' : 'bg-blush'

  return (
    <section
      aria-disabled={disabled}
      className={disabled ? 'opacity-50 pointer-events-none transition-opacity duration-200' : 'transition-opacity duration-200'}
    >
      <div className="flex items-baseline gap-2 mb-2">
        <span className={`inline-block w-1.5 h-1.5 rounded-full ${accentDot}`} aria-hidden />
        <span className="font-display text-xl">{sideLabel}</span>
        <span className="text-[10px] text-ink-soft tracking-wider">{sideRoman}</span>
      </div>
      <div className="flex flex-col gap-2">
        {lines.map((line, i) => {
          const filled = Boolean(line.account) && Boolean(line.amountText)
          return (
            <div
              key={i}
              className={`flex items-center gap-2 pl-2 border-l-4 rounded-md transition-colors ${
                filled ? accentBorder : 'border-l-transparent'
              }`}
            >
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
                className="w-24 px-2 py-2 rounded-lg border border-line bg-white text-right text-sm font-mono"
              />
              {lines.length > 1 ? (
                <button
                  onClick={() => removeLine(i)}
                  aria-label={`${sideLabel} ${i + 1} 行目を削除`}
                  className="text-ink-soft text-base w-7 h-7 rounded-full hover:bg-line transition-colors"
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
          className="text-xs text-ink-soft border border-dashed border-line rounded-lg py-2 hover:border-ink hover:text-ink transition-colors"
        >
          + もう1つの科目を追加
        </button>
      </div>
    </section>
  )
}
