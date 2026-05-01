import { useState } from 'react'
import { LineEditor, type LineDraft } from '../components/LineEditor'
import { gradeJournal } from '../lib/grading'
import { parseYenInput, formatYen } from '../lib/format'
import { progressStore } from '../storage/progressStore'
import { findAccount } from '../data/accounts'
import type { JournalLine, Question } from '../types'

type Props = {
  questions: Question[]
  label: string
  onExit: () => void
}

type Outcome = {
  correct: boolean
  user: { debit: JournalLine[]; credit: JournalLine[] }
}

const emptyDraft = (): LineDraft[] => [{ account: '', amountText: '' }]

export function QuizScreen({ questions, label, onExit }: Props) {
  const [index, setIndex] = useState(0)
  const [debit, setDebit] = useState<LineDraft[]>(emptyDraft())
  const [credit, setCredit] = useState<LineDraft[]>(emptyDraft())
  const [outcome, setOutcome] = useState<Outcome | null>(null)
  const [startedAt, setStartedAt] = useState<number>(() => Date.now())

  const q = questions[index]
  const total = questions.length
  const isLast = index >= total - 1

  function toLines(draft: LineDraft[]): JournalLine[] {
    return draft
      .map((d) => ({ account: d.account, amount: parseYenInput(d.amountText.replace(/,/g, '')) }))
      .filter((l): l is JournalLine => Boolean(l.account) && l.amount > 0)
  }

  function handleSubmit() {
    const userDebit = toLines(debit)
    const userCredit = toLines(credit)
    const correct = gradeJournal(
      { debit: userDebit, credit: userCredit },
      q.answer,
    )
    progressStore.append({
      id: crypto.randomUUID(),
      questionId: q.id,
      chapter: q.chapter,
      correct,
      answeredAt: new Date().toISOString(),
      durationMs: Date.now() - startedAt,
      hintUsed: false,
      answer: { debit: userDebit, credit: userCredit },
    })
    setOutcome({ correct, user: { debit: userDebit, credit: userCredit } })
  }

  function next() {
    if (isLast) {
      onExit()
      return
    }
    setIndex((i) => i + 1)
    setDebit(emptyDraft())
    setCredit(emptyDraft())
    setOutcome(null)
    setStartedAt(Date.now())
  }

  return (
    <div className="min-h-screen bg-paper">
      <header className="px-5 pt-4 pb-2 flex items-center gap-3 sticky top-0 bg-paper z-10">
        <button onClick={onExit} aria-label="閉じる" className="text-lg">←</button>
        <div className="flex-1">
          <div className="h-1.5 rounded-full bg-line overflow-hidden">
            <div
              className="h-full bg-sage rounded-full"
              style={{ width: `${((index + (outcome ? 1 : 0)) / total) * 100}%` }}
            />
          </div>
        </div>
        <div className="text-[11px] text-ink-soft">
          {index + 1} / {total}
        </div>
      </header>

      {!outcome ? (
        <div className="px-5 pb-32 pt-2">
          <div className="flex gap-2 mt-2">
            <span className="pill badge-asset" style={{ background: '#d9e4dd', color: '#6b8e7f' }}>
              {label}
            </span>
            <span className="pill" style={{ background: '#f5efe6', color: '#6b6660' }}>
              {q.topic}
            </span>
          </div>
          <div className="text-[10px] tracking-[0.2em] uppercase text-ink-soft mt-4">
            Transaction
          </div>
          <p className="font-serif text-lg leading-relaxed mt-2">{q.prompt}</p>

          <div className="mt-6 grid grid-cols-1 gap-6">
            <LineEditor side="debit" lines={debit} onChange={setDebit} />
            <LineEditor side="credit" lines={credit} onChange={setCredit} />
          </div>

          <div className="fixed bottom-0 left-0 right-0 p-4 bg-paper/95 backdrop-blur border-t border-line safe-bottom">
            <div className="max-w-md mx-auto flex items-center gap-2">
              {q.hint && (
                <details className="flex-1">
                  <summary className="text-xs text-ink-soft cursor-pointer">💡 ヒント</summary>
                  <p className="text-xs mt-1">{q.hint}</p>
                </details>
              )}
              <button
                onClick={handleSubmit}
                className="bg-ink text-white px-7 py-3 rounded-full text-sm font-medium ml-auto"
              >
                答え合わせ
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="px-5 pb-32 pt-2">
          <div className={`mt-2 p-5 rounded-2xl ${outcome.correct ? 'bg-sage-soft' : 'bg-blush-soft'}`}>
            <div className="font-display text-3xl">{outcome.correct ? '正解' : '不正解'}</div>
            <p className="text-xs text-ink-soft mt-1">{q.topic}</p>
          </div>

          <div className="mt-6">
            <div className="text-[10px] tracking-[0.2em] uppercase text-ink-soft">Correct</div>
            <JournalDisplay journal={q.answer} />
          </div>

          {!outcome.correct && (
            <div className="mt-4">
              <div className="text-[10px] tracking-[0.2em] uppercase text-ink-soft">Your answer</div>
              <JournalDisplay journal={outcome.user} />
            </div>
          )}

          <div className="mt-6 p-4 rounded-2xl bg-white border border-line">
            <div className="text-[10px] tracking-[0.2em] uppercase text-ink-soft mb-2">解説</div>
            <p className="text-sm leading-relaxed">{q.explanation}</p>
          </div>

          <div className="mt-4 p-4 rounded-2xl bg-white border border-line">
            <div className="text-[10px] tracking-[0.2em] uppercase text-ink-soft">関連記事</div>
            <p className="text-xs text-ink-soft mt-2">準備中（フェーズ1.5で公開）</p>
          </div>

          <div className="fixed bottom-0 left-0 right-0 p-4 bg-paper/95 backdrop-blur border-t border-line safe-bottom">
            <div className="max-w-md mx-auto">
              <button
                onClick={next}
                className="w-full bg-ink text-white py-3 rounded-full text-sm font-medium"
              >
                {isLast ? '完了' : '次の問題 →'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function JournalDisplay({ journal }: { journal: { debit: JournalLine[]; credit: JournalLine[] } }) {
  return (
    <div className="grid grid-cols-2 gap-2 mt-2">
      <div className="bg-white border border-line rounded-2xl p-3">
        <div className="font-display text-sm mb-2">借方</div>
        <ul className="text-xs space-y-1">
          {journal.debit.map((l, i) => (
            <li key={i} className="flex justify-between">
              <span>{findAccount(l.account)?.name ?? l.account}</span>
              <span className="font-mono text-ink-soft">{formatYen(l.amount)}</span>
            </li>
          ))}
          {journal.debit.length === 0 && <li className="text-ink-soft">—</li>}
        </ul>
      </div>
      <div className="bg-white border border-line rounded-2xl p-3">
        <div className="font-display text-sm mb-2">貸方</div>
        <ul className="text-xs space-y-1">
          {journal.credit.map((l, i) => (
            <li key={i} className="flex justify-between">
              <span>{findAccount(l.account)?.name ?? l.account}</span>
              <span className="font-mono text-ink-soft">{formatYen(l.amount)}</span>
            </li>
          ))}
          {journal.credit.length === 0 && <li className="text-ink-soft">—</li>}
        </ul>
      </div>
    </div>
  )
}
