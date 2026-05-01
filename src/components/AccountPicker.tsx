import { useState } from 'react'
import { ACCOUNTS_BY_CATEGORY, findAccount } from '../data/accounts'
import type { AccountCategory, AccountId } from '../types'

const CATEGORIES: Array<{ id: AccountCategory; label: string; klass: string }> = [
  { id: 'asset',     label: '資産',   klass: 'badge-asset' },
  { id: 'liability', label: '負債',   klass: 'badge-liability' },
  { id: 'equity',    label: '純資産', klass: 'badge-equity' },
  { id: 'revenue',   label: '収益',   klass: 'badge-revenue' },
  { id: 'expense',   label: '費用',   klass: 'badge-expense' },
]

type Props = {
  value: AccountId | ''
  onChange: (id: AccountId) => void
}

export function AccountPicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [cat, setCat] = useState<AccountCategory>('asset')
  const selected = value ? findAccount(value) : undefined

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="px-3 py-2 rounded-xl border border-line bg-white text-sm flex-1 text-left"
      >
        {selected ? (
          <span>
            <span className={`pill ${categoryBadge(selected.category)}`}>
              {categoryLabel(selected.category)}
            </span>
            <span className="ml-2">{selected.name}</span>
          </span>
        ) : (
          <span className="text-ink-soft">勘定科目を選ぶ</span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-30 flex items-end" onClick={() => setOpen(false)}>
          <div
            className="bg-white w-full max-h-[75vh] rounded-t-3xl shadow-2xl p-5 overflow-y-auto safe-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-base">勘定科目</h3>
              <button onClick={() => setOpen(false)} className="text-ink-soft text-sm">閉じる</button>
            </div>
            <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCat(c.id)}
                  className={`pill ${c.klass} ${cat === c.id ? 'ring-2 ring-ink' : 'opacity-60'}`}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {ACCOUNTS_BY_CATEGORY[cat].map((a) => (
                <button
                  key={a.id}
                  onClick={() => {
                    onChange(a.id)
                    setOpen(false)
                  }}
                  className="text-left px-3 py-2 rounded-xl border border-line text-sm hover:border-ink"
                >
                  {a.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function categoryLabel(c: AccountCategory): string {
  return ({ asset: '資産', liability: '負債', equity: '純資産', revenue: '収益', expense: '費用' } as const)[c]
}

function categoryBadge(c: AccountCategory): string {
  return ({
    asset: 'badge-asset',
    liability: 'badge-liability',
    equity: 'badge-equity',
    revenue: 'badge-revenue',
    expense: 'badge-expense',
  } as const)[c]
}
