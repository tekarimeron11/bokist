import { useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
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
        className="inline text-ink underline decoration-dotted decoration-coral/60 underline-offset-2 hover:decoration-coral"
        aria-label={`${term}の意味を見る`}
      >
        {label}
      </button>

      {open && createPortal(
        <div
          className="fixed inset-0 z-40 flex items-end animate-fade-in"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={`${term}の用語解説`}
          style={{ background: 'rgba(42,31,42,0.35)' }}
        >
          <div
            className="glass w-full max-h-[75vh] rounded-t-[28px] p-6 overflow-y-auto safe-bottom animate-rise"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-3 gap-3">
              <div>
                <span className="eyebrow">Glossary</span>
                <h3 className="font-serif font-medium text-[20px] leading-tight mt-1">
                  {term}
                </h3>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-coral text-[12px] tracking-wider shrink-0"
                aria-label="閉じる"
              >
                閉じる
              </button>
            </div>
            {entry ? (
              <p className="text-[14px] leading-[1.85] text-ink font-serif mt-2">
                {entry.definition}
              </p>
            ) : (
              <p className="text-[14px] leading-relaxed text-ink-soft font-serif italic mt-2">
                この用語の解説は準備中です。
              </p>
            )}
          </div>
        </div>,
        document.body,
      )}
    </>
  )
}
