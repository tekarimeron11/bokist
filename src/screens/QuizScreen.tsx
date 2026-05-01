import { useMemo, useState } from 'react'
import { LineEditor, type LineDraft } from '../components/LineEditor'
import { TAccount } from '../components/TAccount'
import { Term } from '../components/Term'
import { gradeJournal } from '../lib/grading'
import { parseYenInput } from '../lib/format'
import { progressStore } from '../storage/progressStore'
import { findAccount } from '../data/accounts'
import { relatedArticles } from '../data/articles'
import { findTerm } from '../data/glossary'
import type { JournalLine, Question, StructuredExplanation } from '../types'

type Props = {
  questions: Question[]
  label: string
  onExit: () => void
  onOpenArticle?: (slug: string) => void
}

type Outcome = {
  correct: boolean
  user: { debit: JournalLine[]; credit: JournalLine[] }
  durationMs: number
}

type Step = 1 | 2 | 3

const emptyDraft = (): LineDraft[] => [{ account: '', amountText: '' }]

function isLineFilled(d: LineDraft): boolean {
  return Boolean(d.account) && Boolean(d.amountText) && parseYenInput(d.amountText.replace(/,/g, '')) > 0
}

export function QuizScreen({ questions, label, onExit, onOpenArticle }: Props) {
  const [index, setIndex] = useState(0)
  const [debit, setDebit] = useState<LineDraft[]>(emptyDraft())
  const [credit, setCredit] = useState<LineDraft[]>(emptyDraft())
  const [outcome, setOutcome] = useState<Outcome | null>(null)
  const [startedAt, setStartedAt] = useState<number>(() => Date.now())

  const q = questions[index]
  const total = questions.length
  const isLast = index >= total - 1

  const debitHasOne = debit.some(isLineFilled)
  const creditHasOne = credit.some(isLineFilled)

  const step: Step = outcome ? 3 : !debitHasOne ? 1 : 2
  const canSubmit = debitHasOne && creditHasOne

  function toLines(draft: LineDraft[]): JournalLine[] {
    return draft
      .map((d) => ({ account: d.account, amount: parseYenInput(d.amountText.replace(/,/g, '')) }))
      .filter((l): l is JournalLine => Boolean(l.account) && l.amount > 0)
  }

  function handleSubmit() {
    if (!canSubmit) return
    const userDebit = toLines(debit)
    const userCredit = toLines(credit)
    const correct = gradeJournal(
      { debit: userDebit, credit: userCredit },
      q.answer,
    )
    const durationMs = Date.now() - startedAt
    progressStore.append({
      id: crypto.randomUUID(),
      questionId: q.id,
      chapter: q.chapter,
      correct,
      answeredAt: new Date().toISOString(),
      durationMs,
      hintUsed: false,
      answer: { debit: userDebit, credit: userCredit },
    })
    setOutcome({ correct, user: { debit: userDebit, credit: userCredit }, durationMs })
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
      {/* Editorial sticky header — hairline progress, numeral counter */}
      <header className="px-5 pt-4 pb-3 flex items-center gap-3 sticky top-0 bg-paper/95 backdrop-blur z-10 border-b border-line">
        <button
          onClick={onExit}
          aria-label="閉じる"
          className="font-display text-xl w-7 h-7 leading-none text-ink"
        >
          ←
        </button>
        <div className="flex-1 relative">
          <div className="h-px bg-line" />
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-ink rounded-full transition-[width] duration-300"
            style={{ width: `${((index + (outcome ? 1 : 0)) / total) * 100}%` }}
          />
        </div>
        <div className="numeral text-[11px]">
          {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </div>
      </header>

      {!outcome ? (
        <div className="px-5 pb-32 pt-4 animate-reveal">
          <StepBar step={step} />

          <div className="flex gap-1.5 mt-5 flex-wrap">
            <span className="pill badge-asset">{label}</span>
            <span className="pill badge-neutral">{q.topic}</span>
          </div>

          <div className="mt-6 flex items-baseline gap-3">
            <span className="numeral text-3xl leading-none">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className="eyebrow">transaction</span>
          </div>
          <p className="font-serif text-[18px] leading-[1.8] mt-3">{q.prompt}</p>

          <div className="mt-7 grid grid-cols-1 gap-7">
            <LineEditor side="debit" lines={debit} onChange={setDebit} />
            <LineEditor side="credit" lines={credit} onChange={setCredit} disabled={!debitHasOne} />
          </div>

          {!debitHasOne && (
            <p className="text-micro text-ink-soft mt-4 italic" role="status">
              まず借方の科目と金額を1行入力してください。
            </p>
          )}

          <div className="fixed bottom-0 left-0 right-0 p-4 bg-paper/95 backdrop-blur border-t border-line safe-bottom">
            <div className="max-w-md mx-auto flex items-center gap-3">
              {q.hint && (
                <details className="flex-1 min-w-0">
                  <summary className="text-micro text-ink-soft cursor-pointer select-none link-underline inline-block">
                    ヒントを見る
                  </summary>
                  <p className="text-xs mt-2 text-ink-soft leading-relaxed">{q.hint}</p>
                </details>
              )}
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                aria-disabled={!canSubmit}
                className={`ml-auto px-7 py-3 rounded-full text-sm font-medium tracking-wider transition-all ${
                  canSubmit
                    ? 'bg-ink text-white shadow-press hover:bg-ink-soft active:scale-95'
                    : 'bg-line text-ink-faint cursor-not-allowed'
                }`}
              >
                答え合わせ
              </button>
            </div>
          </div>
        </div>
      ) : (
        <ResultSection
          q={q}
          outcome={outcome}
          isLast={isLast}
          onNext={next}
          onOpenArticle={onOpenArticle}
        />
      )}
    </div>
  )
}

function StepBar({ step }: { step: Step }) {
  const steps: Array<{ id: Step; label: string; index: string }> = [
    { id: 1, label: '借方', index: '01' },
    { id: 2, label: '貸方', index: '02' },
    { id: 3, label: '答え合わせ', index: '03' },
  ]
  return (
    <ol className="flex items-center gap-2" aria-label="進行状況">
      {steps.map((s, i) => {
        const active = step === s.id
        const done = step > s.id
        return (
          <li key={s.id} className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] tracking-wide transition-colors ${
                active
                  ? 'bg-ink text-white'
                  : done
                    ? 'bg-sage-soft text-sage-deep'
                    : 'bg-paper-deep text-ink-faint border border-line'
              }`}
              aria-current={active ? 'step' : undefined}
            >
              <span className={`numeral text-[10px] leading-none ${active ? 'text-white/70' : ''}`}>
                {s.index}
              </span>
              <span className="font-medium">{s.label}</span>
            </div>
            {i < steps.length - 1 && (
              <span className={`w-2.5 h-px ${done ? 'bg-sage' : 'bg-line'}`} aria-hidden />
            )}
          </li>
        )
      })}
    </ol>
  )
}

function ResultSection({
  q,
  outcome,
  isLast,
  onNext,
  onOpenArticle,
}: {
  q: Question
  outcome: Outcome
  isLast: boolean
  onNext: () => void
  onOpenArticle?: (slug: string) => void
}) {
  const seconds = Math.max(1, Math.round(outcome.durationMs / 1000))
  const structured: StructuredExplanation | undefined = q.explanationStructured

  return (
    <div className="px-5 pb-32 pt-4 animate-reveal">
      {/* 朱印 ink-seal moment — signature aesthetic */}
      <div className="relative paper-card-deep px-5 py-8 text-center overflow-hidden">
        <svg
          aria-hidden
          className="absolute inset-0 w-full h-full opacity-[0.05] pointer-events-none"
          viewBox="0 0 200 200"
          preserveAspectRatio="xMidYMid meet"
        >
          <line x1="100" y1="20" x2="100" y2="180" stroke="currentColor" strokeWidth="1.5" />
          <line x1="20" y1="64" x2="180" y2="64" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        <div className="relative">
          <div className="ink-seal mx-auto animate-stamp">
            {outcome.correct ? '正解' : '再考'}
          </div>
          <p
            className="font-serif text-[15px] mt-5 text-ink tracking-wide animate-reveal"
            style={{ animationDelay: '0.25s' }}
          >
            {outcome.correct ? 'よくできました。' : 'もう一度仕訳を確認しましょう。'}
          </p>
          <div className="mt-3 flex items-center justify-center gap-4 text-[11px] text-ink-soft tracking-wider">
            <span>{q.topic}</span>
            <span className="w-1 h-1 rounded-full bg-line-strong" aria-hidden />
            <span className="amount">{seconds}s</span>
          </div>
        </div>
      </div>

      <section className="mt-8">
        <div className="flex items-baseline justify-between mb-3">
          <span className="eyebrow">correct journal</span>
          <span className="numeral text-[10px]">正解仕訳</span>
        </div>
        <div className="paper-card p-3 overflow-x-auto">
          <TAccount
            debit={q.answer.debit.map((l) => ({ accountId: l.account, amount: l.amount }))}
            credit={q.answer.credit.map((l) => ({ accountId: l.account, amount: l.amount }))}
          />
        </div>
      </section>

      {!outcome.correct && (
        <section className="mt-6">
          <div className="flex items-baseline justify-between mb-3">
            <span className="eyebrow text-blush-deep">your answer</span>
            <span className="numeral text-[10px] text-blush-deep">あなたの解答</span>
          </div>
          <UserAnswerCompare user={outcome.user} />
        </section>
      )}

      {structured ? (
        <StructuredExplanationView data={structured} />
      ) : (
        <section className="mt-7 paper-card p-5">
          <div className="flex items-baseline justify-between mb-3">
            <span className="eyebrow">解説</span>
            <span className="numeral text-[10px]">commentary</span>
          </div>
          <p className="text-[14px] leading-[1.85] text-ink">{q.explanation}</p>
        </section>
      )}

      <TermChips q={q} />
      <RelatedArticles topicId={q.topicId} chapter={q.chapter} onOpen={onOpenArticle} />

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-paper/95 backdrop-blur border-t border-line safe-bottom">
        <div className="max-w-md mx-auto">
          <button
            onClick={onNext}
            className="w-full bg-ink text-white py-3.5 rounded-full text-sm font-medium tracking-wider shadow-press hover:bg-ink-soft transition-all active:scale-[0.98]"
          >
            {isLast ? '完了する' : '次の問題  →'}
          </button>
        </div>
      </div>
    </div>
  )
}

function StructuredExplanationView({ data }: { data: StructuredExplanation }) {
  const blocks: Array<{ eyebrow: string; jpLabel: string; title: string; body: string; accent: string }> = [
    { eyebrow: 'essence',  jpLabel: '01', title: '取引の本質', body: data.essence,   accent: 'border-l-ink' },
    { eyebrow: 'debit',    jpLabel: '02', title: '借方の理由', body: data.debitWhy,  accent: 'border-l-sage' },
    { eyebrow: 'credit',   jpLabel: '03', title: '貸方の理由', body: data.creditWhy, accent: 'border-l-blush' },
    { eyebrow: 'take away',jpLabel: '04', title: 'ポイント',   body: data.takeaway,  accent: 'border-l-gold' },
  ]
  return (
    <section className="mt-7 flex flex-col gap-2.5">
      <div className="flex items-baseline justify-between mb-1">
        <span className="eyebrow">commentary</span>
        <span className="numeral text-[10px]">解説</span>
      </div>
      {blocks.map((b) => (
        <article
          key={b.eyebrow}
          className={`paper-card border-l-2 ${b.accent} p-4`}
        >
          <div className="flex items-baseline gap-2.5">
            <span className="numeral text-[11px]">{b.jpLabel}</span>
            <span className="eyebrow !before:hidden" style={{ ['--tw-content' as string]: 'none' } as React.CSSProperties}>
              {b.eyebrow}
            </span>
          </div>
          <h4 className="font-serif text-[15px] mt-1.5">{b.title}</h4>
          <p className="text-[14px] leading-[1.8] mt-2 text-ink">{b.body}</p>
        </article>
      ))}
    </section>
  )
}

function TermChips({ q }: { q: Question }) {
  const candidates = useMemo(() => collectTermCandidates(q), [q])
  if (candidates.length === 0) return null
  return (
    <section className="mt-6">
      <div className="flex items-baseline justify-between mb-2">
        <span className="eyebrow">用語</span>
        <span className="numeral text-[10px]">glossary</span>
      </div>
      <ul className="flex flex-wrap gap-1.5">
        {candidates.map((t) => (
          <li key={t}>
            <Term term={t}>
              <span className="pill bg-paper-deep text-ink hover:bg-line transition-colors border border-line">
                {t}
              </span>
            </Term>
          </li>
        ))}
      </ul>
    </section>
  )
}

function collectTermCandidates(q: Question): string[] {
  const seen = new Set<string>()
  const push = (t: string) => {
    if (findTerm(t) && !seen.has(t)) seen.add(t)
  }
  q.tags?.forEach(push)
  const haystack = [
    q.explanation,
    q.explanationStructured?.essence,
    q.explanationStructured?.debitWhy,
    q.explanationStructured?.creditWhy,
    q.explanationStructured?.takeaway,
  ]
    .filter((s): s is string => Boolean(s))
    .join(' ')
  ;['借方', '貸方', '相手勘定', '諸掛り', '仕入諸掛り', '振替', '諸口', '三分法', '当座借越', '貸倒引当金', '差額補充法', '経過勘定', '決算整理', '法人税等', '減価償却', '間接法', '電子記録債権', '受取手形', '仮払消費税', '仮受消費税']
    .forEach((t) => {
      if (haystack.includes(t)) push(t)
    })
  return Array.from(seen)
}

function UserAnswerCompare({ user }: { user: { debit: JournalLine[]; credit: JournalLine[] } }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <SideList title="借方" sub="DR" lines={user.debit} accent="border-l-sage" />
      <SideList title="貸方" sub="CR" lines={user.credit} accent="border-l-blush" />
    </div>
  )
}

function SideList({ title, sub, lines, accent }: { title: string; sub: string; lines: JournalLine[]; accent: string }) {
  return (
    <div className={`paper-card border-l-2 ${accent} p-3`}>
      <div className="flex items-baseline gap-1.5 mb-2">
        <span className="font-display text-[15px] leading-none">{title}</span>
        <span className="numeral text-[9px] tracking-[0.2em] text-ink-soft">{sub}</span>
      </div>
      <ul className="text-[12px] space-y-1.5">
        {lines.map((l, i) => (
          <li key={i} className="flex justify-between gap-2 items-baseline">
            <span className="truncate">{findAccount(l.account)?.name ?? l.account}</span>
            <span className="amount text-ink-soft">¥{l.amount.toLocaleString('ja-JP')}</span>
          </li>
        ))}
        {lines.length === 0 && <li className="text-ink-faint">—</li>}
      </ul>
    </div>
  )
}

function RelatedArticles({
  topicId,
  chapter,
  onOpen,
}: {
  topicId: Question['topicId']
  chapter: Question['chapter']
  onOpen?: (slug: string) => void
}) {
  const articles = relatedArticles(topicId, chapter, 3)
  return (
    <section className="mt-6 paper-card p-5">
      <div className="flex items-baseline justify-between mb-2">
        <span className="eyebrow">関連記事</span>
        <span className="numeral text-[10px]">read more</span>
      </div>
      {articles.length === 0 ? (
        <p className="text-[12px] text-ink-soft mt-2">準備中</p>
      ) : (
        <ul className="mt-1 flex flex-col">
          {articles.map((a, i) => (
            <li key={a.slug}>
              <button
                onClick={() => onOpen?.(a.slug)}
                className="w-full text-left py-2.5 flex items-start gap-3 border-t border-line first:border-t-0 group"
                disabled={!onOpen}
              >
                <span className="numeral text-[12px] shrink-0 mt-0.5">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] font-serif leading-snug group-hover:underline decoration-ink-soft">{a.title}</div>
                  <div className="text-[10px] text-ink-soft mt-1 tracking-wider">{a.readingMinutes}分</div>
                </div>
                <span className="font-display text-ink-faint mt-0.5">→</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
