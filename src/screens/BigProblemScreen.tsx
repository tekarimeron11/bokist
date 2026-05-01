import { useMemo, useState } from 'react'
import { LineEditor, type LineDraft } from '../components/LineEditor'
import { TAccount } from '../components/TAccount'
import { gradeAdjustment } from '../lib/bigGrading'
import { parseYenInput, formatYen } from '../lib/format'
import { findAccount } from '../data/accounts'
import { bigProgressStore } from '../storage/bigProgressStore'
import type {
  BigProblem,
  FinancialAdjustmentItem,
  JournalLine,
  TrialBalanceRow,
} from '../types'

type Props = {
  problem: BigProblem
  onExit: () => void
}

type EntryDraft = {
  debit: LineDraft[]
  credit: LineDraft[]
}

type EntrySet = { debit: JournalLine[]; credit: JournalLine[] }

const emptyDraft = (): LineDraft[] => [{ account: '', amountText: '' }]
const emptyEntry = (): EntryDraft => ({ debit: emptyDraft(), credit: emptyDraft() })

function isLineFilled(d: LineDraft): boolean {
  return Boolean(d.account) && Boolean(d.amountText) && parseYenInput(d.amountText.replace(/,/g, '')) > 0
}

function toLines(draft: LineDraft[]): JournalLine[] {
  return draft
    .map((d) => ({ account: d.account, amount: parseYenInput(d.amountText.replace(/,/g, '')) }))
    .filter((l): l is JournalLine => Boolean(l.account) && l.amount > 0)
}

function isEntryFilled(e: EntryDraft): boolean {
  return e.debit.some(isLineFilled) && e.credit.some(isLineFilled)
}

function expectedSetsFor(adj: FinancialAdjustmentItem): EntrySet[] {
  if (adj.expectedAnswerMulti && adj.expectedAnswerMulti.length > 0) {
    return adj.expectedAnswerMulti
  }
  if (adj.expectedAnswer) return [adj.expectedAnswer]
  return []
}

export function BigProblemScreen({ problem, onExit }: Props) {
  const [index, setIndex] = useState(0)
  const total = problem.adjustments.length
  const adj = problem.adjustments[index]
  const expectedCount = useMemo(() => expectedSetsFor(adj).length, [adj])

  const [entriesByAdj, setEntriesByAdj] = useState<Record<string, EntryDraft[]>>(() => {
    const init: Record<string, EntryDraft[]> = {}
    for (const a of problem.adjustments) {
      const ec = expectedSetsFor(a).length
      init[a.id] = Array.from({ length: Math.max(1, ec) }, emptyEntry)
    }
    return init
  })

  const [phase, setPhase] = useState<'input' | 'results'>('input')
  const [results, setResults] = useState<Record<string, boolean>>({})
  const [startedAt] = useState<string>(() => new Date().toISOString())

  const entries = entriesByAdj[adj.id]
  const allEntriesFilled = entries.every(isEntryFilled)

  const isLast = index >= total - 1

  function patchEntry(entryIdx: number, partial: Partial<EntryDraft>) {
    setEntriesByAdj((prev) => ({
      ...prev,
      [adj.id]: prev[adj.id].map((e, i) => (i === entryIdx ? { ...e, ...partial } : e)),
    }))
  }

  function addEntrySet() {
    setEntriesByAdj((prev) => ({
      ...prev,
      [adj.id]: [...prev[adj.id], emptyEntry()],
    }))
  }

  function removeEntrySet(entryIdx: number) {
    setEntriesByAdj((prev) => {
      const cur = prev[adj.id]
      if (cur.length <= 1) return prev
      return { ...prev, [adj.id]: cur.filter((_, i) => i !== entryIdx) }
    })
  }

  function goNext() {
    if (!allEntriesFilled) return
    if (isLast) {
      finish()
      return
    }
    setIndex((i) => i + 1)
  }

  function goPrev() {
    if (index <= 0) return
    setIndex((i) => i - 1)
  }

  function finish() {
    const finalResults: Record<string, boolean> = {}
    const answers: Record<string, EntrySet[]> = {}
    for (const a of problem.adjustments) {
      const userSets: EntrySet[] = entriesByAdj[a.id].map((e) => ({
        debit: toLines(e.debit),
        credit: toLines(e.credit),
      }))
      const expected = expectedSetsFor(a)
      finalResults[a.id] = gradeAdjustment(userSets, expected)
      answers[a.id] = userSets
    }
    bigProgressStore.append({
      id: crypto.randomUUID(),
      problemId: problem.id,
      startedAt,
      finishedAt: new Date().toISOString(),
      answers,
      results: finalResults,
    })
    setResults(finalResults)
    setPhase('results')
  }

  function retry() {
    const reset: Record<string, EntryDraft[]> = {}
    for (const a of problem.adjustments) {
      const ec = expectedSetsFor(a).length
      reset[a.id] = Array.from({ length: Math.max(1, ec) }, emptyEntry)
    }
    setEntriesByAdj(reset)
    setResults({})
    setIndex(0)
    setPhase('input')
  }

  if (phase === 'results') {
    const correctCount = Object.values(results).filter(Boolean).length
    return (
      <BigResultsView
        problem={problem}
        results={results}
        userAnswers={entriesByAdj}
        correctCount={correctCount}
        onExit={onExit}
        onRetry={retry}
      />
    )
  }

  return (
    <div className="min-h-screen">
      <header
        className="sticky top-0 z-20 px-5 pt-4 pb-3 flex items-center gap-3 backdrop-blur"
        style={{ background: 'rgba(255,245,236,0.75)', borderBottom: '1px solid rgba(255,255,255,0.6)' }}
      >
        <button
          onClick={onExit}
          aria-label="閉じる"
          className="text-coral text-xl w-7 h-7 flex items-center justify-center"
        >
          ←
        </button>
        <div className="flex-1 relative h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.5)' }}>
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-500"
            style={{
              width: `${((index + (allEntriesFilled ? 1 : 0)) / total) * 100}%`,
              background: 'linear-gradient(135deg, #ff9c8a, #ffb480)',
            }}
          />
        </div>
        <div className="text-[11px] tabular text-ink-soft tracking-wider">
          {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </div>
      </header>

      <div className="px-6 pb-32 pt-4 animate-rise">
        <div className="mt-1">
          <span className="eyebrow">Big problem</span>
          <h1 className="font-serif text-[22px] leading-[1.35] mt-2 tracking-[-0.005em]">
            {problem.title}
          </h1>
        </div>

        <TrialBalancePanel rows={problem.trialBalance} />

        <section className="mt-6 glass-card rounded-[18px] p-5">
          <div className="flex justify-between items-baseline mb-2">
            <span className="eyebrow">Adjustment {String(index + 1).padStart(2, '0')}</span>
            <span className="text-[10px] text-ink-faint tracking-wider">決算整理事項</span>
          </div>
          <p className="font-serif text-[15.5px] leading-[1.85] tracking-[-0.003em]">
            {adj.prompt}
          </p>
          {adj.hint && (
            <details className="mt-3">
              <summary className="text-[11.5px] text-ink-soft cursor-pointer select-none">
                💡 ヒント
              </summary>
              <p className="text-[12px] mt-2 text-ink-soft leading-relaxed font-serif">{adj.hint}</p>
            </details>
          )}
        </section>

        {entries.map((entry, entryIdx) => (
          <section key={entryIdx} className="mt-5">
            {entries.length > 1 && (
              <div className="flex items-baseline justify-between mb-2 px-1">
                <span className="eyebrow">Entry {entryIdx + 1}</span>
                {entries.length > expectedCount && (
                  <button
                    onClick={() => removeEntrySet(entryIdx)}
                    className="text-[10px] text-ink-faint hover:text-coral tracking-wider"
                  >
                    削除
                  </button>
                )}
              </div>
            )}
            <div className="grid grid-cols-1 gap-4">
              <LineEditor
                side="debit"
                lines={entry.debit}
                onChange={(d) => patchEntry(entryIdx, { debit: d })}
              />
              <LineEditor
                side="credit"
                lines={entry.credit}
                onChange={(c) => patchEntry(entryIdx, { credit: c })}
                disabled={!entry.debit.some(isLineFilled)}
              />
            </div>
          </section>
        ))}

        {expectedCount > 1 && entries.length < expectedCount && (
          <button
            onClick={addEntrySet}
            className="mt-4 w-full text-[12px] text-ink-soft border border-dashed border-white/70 rounded-[14px] py-3 hover:border-coral hover:text-coral transition-colors"
          >
            + 仕訳をもう1セット追加（{entries.length} / {expectedCount}）
          </button>
        )}

        <div
          className="fixed bottom-0 left-0 right-0 px-4 pb-3 pt-3 safe-bottom z-20 backdrop-blur"
          style={{ background: 'linear-gradient(180deg, rgba(255,245,236,0.4), rgba(255,233,224,0.95))' }}
        >
          <div className="max-w-md mx-auto flex items-center gap-3">
            <button
              onClick={goPrev}
              disabled={index === 0}
              aria-disabled={index === 0}
              className="text-[12px] text-ink-soft tracking-wider px-3 py-2 rounded-full hover:text-coral disabled:opacity-30"
            >
              ← 前へ
            </button>
            <button
              onClick={goNext}
              disabled={!allEntriesFilled}
              aria-disabled={!allEntriesFilled}
              className="peach-button ml-auto px-7 py-3 rounded-full text-[13px] font-medium tracking-wider"
            >
              {isLast ? '答え合わせ' : '次へ →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function TrialBalancePanel({ rows }: { rows: TrialBalanceRow[] }) {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? rows : rows.slice(0, 6)
  const totalDr = rows.reduce((s, r) => s + (r.debit ?? 0), 0)
  const totalCr = rows.reduce((s, r) => s + (r.credit ?? 0), 0)

  return (
    <section className="mt-6 glass-card rounded-[18px] p-4">
      <div className="flex justify-between items-baseline mb-2">
        <span className="eyebrow">Trial balance</span>
        <span className="text-[10px] text-ink-faint tracking-wider">期末残高試算表</span>
      </div>
      <div className="overflow-x-auto -mx-1 px-1">
        <table className="w-full text-[12px] tabular">
          <thead>
            <tr className="text-[10px] text-ink-faint uppercase tracking-[0.14em]">
              <th className="text-right py-1 pr-3 font-medium">借方</th>
              <th className="text-left py-1 px-2 font-medium">勘定科目</th>
              <th className="text-right py-1 pl-3 font-medium">貸方</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((r, i) => (
              <tr key={`${r.account}-${i}`} className="border-t border-white/40">
                <td className="text-right py-1.5 pr-3">{r.debit ? formatYen(r.debit) : ''}</td>
                <td className="py-1.5 px-2 text-ink truncate">
                  {findAccount(r.account)?.name ?? r.account}
                </td>
                <td className="text-right py-1.5 pl-3">{r.credit ? formatYen(r.credit) : ''}</td>
              </tr>
            ))}
            {expanded && (
              <tr className="border-t border-ink/30 font-medium">
                <td className="text-right py-1.5 pr-3">{formatYen(totalDr)}</td>
                <td className="py-1.5 px-2 text-ink-soft text-[10px] tracking-[0.18em] uppercase">合計</td>
                <td className="text-right py-1.5 pl-3">{formatYen(totalCr)}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {rows.length > 6 && (
        <button
          onClick={() => setExpanded((e) => !e)}
          className="mt-2 text-[11px] text-coral tracking-wider"
        >
          {expanded ? '▲ 折りたたむ' : `▼ もっと見る（残り ${rows.length - 6} 行）`}
        </button>
      )}
    </section>
  )
}

function BigResultsView({
  problem,
  results,
  userAnswers,
  correctCount,
  onExit,
  onRetry,
}: {
  problem: BigProblem
  results: Record<string, boolean>
  userAnswers: Record<string, EntryDraft[]>
  correctCount: number
  onExit: () => void
  onRetry: () => void
}) {
  const total = problem.adjustments.length
  const pct = Math.round((correctCount / total) * 100)
  const allCorrect = correctCount === total

  return (
    <div className="min-h-screen">
      <header
        className="sticky top-0 z-20 px-5 pt-4 pb-3 flex items-center gap-3 backdrop-blur"
        style={{ background: 'rgba(255,245,236,0.75)', borderBottom: '1px solid rgba(255,255,255,0.6)' }}
      >
        <button
          onClick={onExit}
          aria-label="戻る"
          className="text-coral text-xl w-7 h-7 flex items-center justify-center"
        >
          ←
        </button>
        <div className="flex-1">
          <span className="eyebrow">Results</span>
          <div className="font-serif font-medium text-[14px] mt-0.5 truncate">{problem.title}</div>
        </div>
      </header>

      <div className="px-6 pb-32 pt-4 animate-rise">
        <div className="glass rounded-[22px] px-6 py-7 relative overflow-hidden">
          <div
            aria-hidden
            className="absolute -top-12 -right-12 w-44 h-44 rounded-full pointer-events-none"
            style={{
              background: allCorrect
                ? 'radial-gradient(circle, rgba(143,177,120,0.5), transparent 70%)'
                : 'radial-gradient(circle, rgba(255,180,160,0.6), transparent 70%)',
            }}
          />
          <div className="relative">
            <span
              className="text-[10px] uppercase tracking-[0.28em] font-medium"
              style={{ color: allCorrect ? '#5d7a4a' : '#a04d3f' }}
            >
              Score
            </span>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span
                className="font-serif italic font-light text-[52px] leading-none"
                style={{ color: allCorrect ? '#3a5b28' : '#a04d3f' }}
              >
                {correctCount}
              </span>
              <span className="font-serif text-[20px] text-ink-faint">/ {total}</span>
              <span className="ml-auto eyebrow tabular">{pct}%</span>
            </div>
            <p className="text-[12px] text-ink-soft mt-3 font-serif italic">
              {allCorrect
                ? '満点。仕訳を完全に押さえています。'
                : '間違えた論点は下のリストで確認しましょう。'}
            </p>
          </div>
        </div>

        <ul className="mt-6 flex flex-col gap-2.5">
          {problem.adjustments.map((adj, idx) => (
            <li key={adj.id}>
              <AdjustmentResultRow
                adj={adj}
                index={idx}
                correct={results[adj.id]}
                userEntries={userAnswers[adj.id]}
              />
            </li>
          ))}
        </ul>

        <div
          className="fixed bottom-0 left-0 right-0 px-4 pb-3 pt-3 safe-bottom z-20"
          style={{ background: 'linear-gradient(180deg, rgba(255,245,236,0.4), rgba(255,233,224,0.95))' }}
        >
          <div className="max-w-md mx-auto flex items-center gap-3">
            <button
              onClick={onRetry}
              className="flex-1 glass-card rounded-full py-3 text-[13px] font-medium tracking-wider text-coral-deep"
            >
              もう一度
            </button>
            <button
              onClick={onExit}
              className="peach-button flex-1 rounded-full py-3 text-[13px] font-medium tracking-wider"
            >
              戻る
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function AdjustmentResultRow({
  adj,
  index,
  correct,
  userEntries,
}: {
  adj: FinancialAdjustmentItem
  index: number
  correct: boolean
  userEntries: EntryDraft[]
}) {
  const [open, setOpen] = useState(false)
  const expected = expectedSetsFor(adj)

  return (
    <div className="glass-card rounded-[18px] overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full px-4 py-3.5 flex items-center gap-3 text-left"
      >
        <span
          className="font-serif italic shrink-0 flex items-center justify-center"
          style={{
            background: correct
              ? 'linear-gradient(135deg, #d8e7c5, #b9d29e)'
              : 'linear-gradient(135deg, #ffd2c0, #ffb8a8)',
            color: correct ? '#3a5b28' : '#a04d3f',
            width: 32,
            height: 32,
            borderRadius: 10,
            fontSize: 15,
          }}
          aria-label={correct ? '正解' : '不正解'}
        >
          {correct ? '✓' : '×'}
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] tracking-[0.18em] uppercase text-ink-faint">
            Adjustment {String(index + 1).padStart(2, '0')}
          </div>
          <div className="text-[13px] font-serif leading-snug mt-0.5 line-clamp-2">
            {adj.prompt}
          </div>
        </div>
        <span className="text-coral text-base shrink-0">{open ? '▾' : '▸'}</span>
      </button>

      {open && (
        <div className="px-4 pb-4 pt-1 border-t border-white/40">
          {!correct && userEntries && (
            <section className="mt-3">
              <div className="flex justify-between items-baseline mb-2 px-1">
                <span className="eyebrow text-coral-deep">Your answer</span>
                <span className="text-[10px] text-coral-deep tracking-wider">あなたの解答</span>
              </div>
              <div className="flex flex-col gap-2">
                {userEntries.map((e, i) => (
                  <UserAnswerCompare
                    key={i}
                    user={{ debit: toLines(e.debit), credit: toLines(e.credit) }}
                  />
                ))}
              </div>
            </section>
          )}

          <section className="mt-3">
            <div className="flex justify-between items-baseline mb-2 px-1">
              <span className="eyebrow">Correct journal</span>
              <span className="text-[10px] text-ink-faint tracking-wider">正解仕訳</span>
            </div>
            <div className="flex flex-col gap-2">
              {expected.map((set, i) => (
                <div key={i} className="glass-card rounded-[16px] p-3 overflow-x-auto">
                  <TAccount
                    debit={set.debit.map((l) => ({ accountId: l.account, amount: l.amount }))}
                    credit={set.credit.map((l) => ({ accountId: l.account, amount: l.amount }))}
                  />
                </div>
              ))}
            </div>
          </section>

          <p className="text-[13px] leading-[1.85] font-serif mt-3 px-1">{adj.explanation}</p>
        </div>
      )}
    </div>
  )
}

function UserAnswerCompare({ user }: { user: EntrySet }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <SideList title="借方" sub="DR" lines={user.debit} accent="#5d7a4a" />
      <SideList title="貸方" sub="CR" lines={user.credit} accent="#a04d3f" />
    </div>
  )
}

function SideList({ title, sub, lines, accent }: { title: string; sub: string; lines: JournalLine[]; accent: string }) {
  return (
    <div className="glass-card rounded-[16px] p-3">
      <div className="flex items-baseline gap-1.5 mb-2">
        <span className="font-serif font-medium text-[14px]" style={{ color: accent }}>
          {title}
        </span>
        <span className="text-[9px] tracking-[0.2em] text-ink-faint">{sub}</span>
      </div>
      <ul className="text-[12px] space-y-1.5">
        {lines.map((l, i) => (
          <li key={i} className="flex justify-between gap-2 items-baseline">
            <span className="truncate">{findAccount(l.account)?.name ?? l.account}</span>
            <span className="tabular text-ink-soft">¥{l.amount.toLocaleString('ja-JP')}</span>
          </li>
        ))}
        {lines.length === 0 && <li className="text-ink-faint">—</li>}
      </ul>
    </div>
  )
}
