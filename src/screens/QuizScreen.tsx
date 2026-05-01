import { useMemo, useState } from 'react'
import { LineEditor, type LineDraft } from '../components/LineEditor'
import { TAccount } from '../components/TAccount'
import { Term } from '../components/Term'
import { gradeJournal } from '../lib/grading'
import { parseYenInput } from '../lib/format'
import { progressStore } from '../storage/progressStore'
import { findAccount } from '../data/accounts'
import { relatedArticles, findArticleBySlug } from '../data/articles'
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
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 px-5 pt-4 pb-3 flex items-center gap-3 backdrop-blur"
              style={{ background: 'rgba(255,245,236,0.75)', borderBottom: '1px solid rgba(255,255,255,0.6)' }}>
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
              width: `${((index + (outcome ? 1 : 0)) / total) * 100}%`,
              background: 'linear-gradient(135deg, #ff9c8a, #ffb480)',
            }}
          />
        </div>
        <div className="text-[11px] tabular text-ink-soft tracking-wider">
          {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </div>
      </header>

      {!outcome ? (
        <div className="px-6 pb-32 pt-4 animate-rise">
          <StepBar step={step} />

          <div className="flex gap-1.5 mt-5 flex-wrap">
            <span className="peach-tag">{label}</span>
            <span className="pill badge-neutral">{q.topic}</span>
          </div>

          <div className="mt-6">
            <span className="eyebrow">Transaction</span>
            <p className="font-serif text-[19px] leading-[1.75] mt-3 tracking-[-0.005em]">
              {q.prompt}
            </p>
          </div>

          <div className="mt-7 grid grid-cols-1 gap-6">
            <LineEditor side="debit" lines={debit} onChange={setDebit} />
            <LineEditor side="credit" lines={credit} onChange={setCredit} disabled={!debitHasOne} />
          </div>

          {!debitHasOne && (
            <p className="text-[11.5px] font-serif italic text-ink-faint mt-4" role="status">
              まず借方の科目と金額を1行入力してください。
            </p>
          )}

          <div className="fixed bottom-0 left-0 right-0 px-4 pb-3 pt-3 safe-bottom z-20 backdrop-blur"
               style={{ background: 'linear-gradient(180deg, rgba(255,245,236,0.4), rgba(255,233,224,0.95))' }}>
            <div className="max-w-md mx-auto flex items-center gap-3">
              {q.hint && (
                <details className="flex-1 min-w-0">
                  <summary className="text-[11.5px] text-ink-soft cursor-pointer select-none">
                    💡 ヒント
                  </summary>
                  <p className="text-[12px] mt-2 text-ink-soft leading-relaxed font-serif">{q.hint}</p>
                </details>
              )}
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                aria-disabled={!canSubmit}
                className="peach-button ml-auto px-7 py-3 rounded-full text-[13px] font-medium tracking-wider"
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
  const steps: Array<{ id: Step; label: string }> = [
    { id: 1, label: '借方' },
    { id: 2, label: '貸方' },
    { id: 3, label: '答え合わせ' },
  ]
  return (
    <ol className="flex items-center gap-1.5" aria-label="進行状況">
      {steps.map((s, i) => {
        const active = step === s.id
        const done = step > s.id
        return (
          <li key={s.id} className="flex items-center gap-1.5">
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] tracking-wide transition-all ${
                active
                  ? 'peach-button text-white'
                  : done
                    ? 'bg-sage-soft text-sage-deep'
                    : 'glass-pill text-ink-faint'
              }`}
              aria-current={active ? 'step' : undefined}
            >
              <span className="font-serif text-[11px] leading-none italic">{s.id}</span>
              <span className="font-medium">{s.label}</span>
            </div>
            {i < steps.length - 1 && (
              <span className={`w-2 h-px ${done ? 'bg-sage' : 'bg-ink-faint/30'}`} aria-hidden />
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
    <div className="px-6 pb-32 pt-4 animate-rise">
      <div className="glass rounded-[22px] px-6 py-7 relative overflow-hidden">
        <div
          aria-hidden
          className="absolute -top-12 -right-12 w-44 h-44 rounded-full pointer-events-none"
          style={{
            background: outcome.correct
              ? 'radial-gradient(circle, rgba(143,177,120,0.5), transparent 70%)'
              : 'radial-gradient(circle, rgba(255,180,160,0.6), transparent 70%)',
          }}
        />
        <div className="relative">
          <div className="flex items-baseline justify-between gap-3">
            <div>
              <span
                className="text-[10px] uppercase tracking-[0.28em] font-medium"
                style={{ color: outcome.correct ? '#5d7a4a' : '#a04d3f' }}
              >
                {outcome.correct ? 'Correct' : 'Try again'}
              </span>
              <div
                className="font-serif italic font-light text-[40px] mt-1.5 leading-none animate-stamp"
                style={{ color: outcome.correct ? '#3a5b28' : '#a04d3f' }}
              >
                {outcome.correct ? '正解' : '再考'}
              </div>
            </div>
            <div className="text-right">
              <span className="eyebrow">Time</span>
              <div className="font-serif font-medium text-[22px] tabular mt-1 leading-none">
                {seconds}
                <small className="text-[11px] text-ink-faint font-light ml-0.5">s</small>
              </div>
            </div>
          </div>
          <p className="text-[12px] text-ink-soft mt-4 font-serif italic">{q.topic}</p>
        </div>
      </div>

      <section className="mt-7">
        <div className="flex justify-between items-baseline mb-3 px-1">
          <span className="eyebrow">Correct journal</span>
          <span className="text-[10px] text-ink-faint tracking-wider">正解仕訳</span>
        </div>
        <div className="glass-card rounded-[18px] p-3 overflow-x-auto">
          <TAccount
            debit={q.answer.debit.map((l) => ({ accountId: l.account, amount: l.amount }))}
            credit={q.answer.credit.map((l) => ({ accountId: l.account, amount: l.amount }))}
          />
        </div>
      </section>

      {!outcome.correct && (
        <section className="mt-5">
          <div className="flex justify-between items-baseline mb-3 px-1">
            <span className="eyebrow text-coral-deep">Your answer</span>
            <span className="text-[10px] text-coral-deep tracking-wider">あなたの解答</span>
          </div>
          <UserAnswerCompare user={outcome.user} />
        </section>
      )}

      {structured ? (
        <StructuredExplanationView data={structured} />
      ) : (
        <section className="mt-7 glass-card rounded-[18px] p-5">
          <div className="flex justify-between items-baseline mb-3">
            <span className="eyebrow">解説</span>
            <span className="text-[10px] text-ink-faint tracking-wider">commentary</span>
          </div>
          <p className="text-[14px] leading-[1.85] font-serif">{q.explanation}</p>
        </section>
      )}

      <TermChips q={q} />
      <RelatedArticles
        topicId={q.topicId}
        chapter={q.chapter}
        explicitSlugs={structured?.relatedSlugs}
        onOpen={onOpenArticle}
      />

      <div className="fixed bottom-0 left-0 right-0 px-4 pb-3 pt-3 safe-bottom z-20"
           style={{ background: 'linear-gradient(180deg, rgba(255,245,236,0.4), rgba(255,233,224,0.95))' }}>
        <div className="max-w-md mx-auto">
          <button
            onClick={onNext}
            className="peach-button w-full py-3.5 rounded-full text-sm font-medium tracking-wider"
          >
            {isLast ? '完了する' : '次の問題  →'}
          </button>
        </div>
      </div>
    </div>
  )
}

function StructuredExplanationView({ data }: { data: StructuredExplanation }) {
  const blocks: Array<{ eyebrow: string; jp: string; title: string; body: string; color: string }> = [
    { eyebrow: 'Essence',  jp: 'i',   title: '取引の本質', body: data.essence,   color: '#c66454' },
    { eyebrow: 'Debit',    jp: 'ii',  title: '借方の理由', body: data.debitWhy,  color: '#5d7a4a' },
    { eyebrow: 'Credit',   jp: 'iii', title: '貸方の理由', body: data.creditWhy, color: '#a04d3f' },
    { eyebrow: 'Take away',jp: 'iv',  title: 'ポイント',   body: data.takeaway,  color: '#9a6c1c' },
  ]
  return (
    <section className="mt-7 flex flex-col gap-2.5">
      <div className="flex justify-between items-baseline mb-1 px-1">
        <span className="eyebrow">Commentary</span>
        <span className="text-[10px] text-ink-faint tracking-wider">解説</span>
      </div>
      {blocks.map((b) => (
        <article key={b.eyebrow} className="glass-card rounded-[18px] p-4 flex gap-3">
          <span
            className="font-serif italic shrink-0 flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #ffd2c0, #ffe1b2)',
              color: b.color,
              width: 32, height: 32, borderRadius: 10,
              fontSize: 15,
            }}
          >
            {b.jp}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <h4 className="font-serif font-medium text-[15px]">{b.title}</h4>
              <span className="text-[9px] uppercase tracking-[0.18em] text-ink-faint">
                {b.eyebrow}
              </span>
            </div>
            <p className="text-[14px] leading-[1.8] mt-2 font-serif">{b.body}</p>
          </div>
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
      <div className="flex justify-between items-baseline mb-2 px-1">
        <span className="eyebrow">用語</span>
        <span className="text-[10px] text-ink-faint tracking-wider">glossary</span>
      </div>
      <ul className="flex flex-wrap gap-1.5">
        {candidates.map((t) => (
          <li key={t}>
            <Term term={t}>
              <span className="pill glass-pill text-ink hover:bg-white/85 transition-colors">
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
      <SideList title="借方" sub="DR" lines={user.debit} accent="#5d7a4a" />
      <SideList title="貸方" sub="CR" lines={user.credit} accent="#a04d3f" />
    </div>
  )
}

function SideList({ title, sub, lines, accent }: { title: string; sub: string; lines: JournalLine[]; accent: string }) {
  return (
    <div className="glass-card rounded-[16px] p-3">
      <div className="flex items-baseline gap-1.5 mb-2">
        <span className="font-serif font-medium text-[14px]" style={{ color: accent }}>{title}</span>
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

function RelatedArticles({
  topicId,
  chapter,
  explicitSlugs,
  onOpen,
}: {
  topicId: Question['topicId']
  chapter: Question['chapter']
  explicitSlugs?: string[]
  onOpen?: (slug: string) => void
}) {
  const articles = useMemo(() => {
    const seen = new Set<string>()
    const merged = []
    for (const slug of explicitSlugs ?? []) {
      if (seen.has(slug)) continue
      const a = findArticleBySlug(slug)
      if (!a) continue
      seen.add(a.slug)
      merged.push(a)
      if (merged.length >= 3) break
    }
    if (merged.length < 3) {
      for (const a of relatedArticles(topicId, chapter, 3)) {
        if (seen.has(a.slug)) continue
        seen.add(a.slug)
        merged.push(a)
        if (merged.length >= 3) break
      }
    }
    return merged
  }, [topicId, chapter, explicitSlugs])
  return (
    <section className="mt-6 glass-card rounded-[18px] p-5">
      <div className="flex justify-between items-baseline mb-2">
        <span className="eyebrow">関連記事</span>
        <span className="text-[10px] text-ink-faint tracking-wider">read more</span>
      </div>
      {articles.length === 0 ? (
        <p className="text-[12px] text-ink-soft mt-2 font-serif italic">準備中</p>
      ) : (
        <ul className="mt-1 flex flex-col">
          {articles.map((a, i) => (
            <li key={a.slug}>
              <button
                onClick={() => onOpen?.(a.slug)}
                className="w-full text-left py-2.5 flex items-center gap-3 border-t border-white/40 first:border-t-0"
                disabled={!onOpen}
              >
                <span
                  className="font-serif italic shrink-0 flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #ffd2c0, #ffe1b2)',
                    color: '#c66454',
                    width: 28, height: 28, borderRadius: 9,
                    fontSize: 13,
                  }}
                >
                  {['i', 'ii', 'iii', 'iv'][i]}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] font-serif font-medium leading-snug">{a.title}</div>
                  <div className="text-[10px] text-ink-faint mt-0.5 tracking-wider uppercase">
                    {a.readingMinutes} min
                  </div>
                </div>
                <span className="text-coral text-base">→</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
