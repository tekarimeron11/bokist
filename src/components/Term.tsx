import { useState, type ReactNode } from 'react'
import { findTerm } from '../data/glossary'

type Props = {
  term: string
  children?: ReactNode
}

export function Term({ term, children }: Props) {
  const [open, setOpen] = useState(false)
  const entry = findTerm(term)
  const label = children ?? term

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline text-ink underline decoration-dotted decoration-ink-soft underline-offset-2 hover:decoration-ink"
        aria-label={`${term}の意味を見る`}
      >
        {label}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-40 flex items-end bg-ink/30"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={`${term}の用語解説`}
        >
          <div
            className="bg-paper w-full max-h-[75vh] rounded-t-3xl shadow-2xl p-5 overflow-y-auto safe-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-3 gap-3">
              <h3 className="font-serif text-lg leading-tight">{term}</h3>
              <button
                onClick={() => setOpen(false)}
                className="text-ink-soft text-sm shrink-0"
                aria-label="閉じる"
              >
                閉じる
              </button>
            </div>
            {entry ? (
              <p className="text-sm leading-relaxed text-ink">{entry.definition}</p>
            ) : (
              <p className="text-sm leading-relaxed text-ink-soft">
                この用語の解説は準備中です。
              </p>
            )}
          </div>
        </div>
      )}
    </>
  )
}
