import { BIG_PROBLEMS } from '../data/bigProblems'
import { bigProgressStore } from '../storage/bigProgressStore'
import type { BigProblem } from '../types'

type Props = {
  onBack: () => void
  onOpen: (id: string) => void
}

export function BigProblemListScreen({ onBack, onOpen }: Props) {
  return (
    <div className="min-h-screen">
      <header
        className="sticky top-0 z-20 px-5 pt-4 pb-3 flex items-center gap-3 backdrop-blur"
        style={{ background: 'rgba(255,245,236,0.75)', borderBottom: '1px solid rgba(255,255,255,0.6)' }}
      >
        <button
          onClick={onBack}
          aria-label="戻る"
          className="text-coral text-xl w-7 h-7 flex items-center justify-center"
        >
          ←
        </button>
        <div className="flex-1">
          <span className="eyebrow">Big problem</span>
          <div className="font-serif font-medium text-[16px] tracking-[-0.005em] mt-0.5">
            第3問対策<i className="italic font-normal text-coral">.</i>
          </div>
        </div>
        <span className="eyebrow-soft">{BIG_PROBLEMS.length} sets</span>
      </header>

      <div className="px-6 pt-6 pb-32 animate-rise">
        <div className="flex justify-between items-baseline pt-1.5">
          <span className="eyebrow">Mock exam</span>
          <span className="eyebrow-soft">35 pt section</span>
        </div>
        <h1 className="font-serif font-normal text-[28px] leading-[1.15] tracking-[-0.015em] mt-2">
          大型決算問題
        </h1>
        <p className="text-[12.5px] text-ink-soft mt-3 leading-[1.7] font-serif">
          1つの会社の期末残高試算表と決算整理事項を順番に解いていく問題。
          仕訳ドリルで覚えた論点を、本番形式で総合的に練習できます。
        </p>

        <ul className="flex flex-col gap-3 mt-7">
          {BIG_PROBLEMS.map((p, idx) => (
            <li key={p.id}>
              <ProblemCard problem={p} index={idx} onOpen={() => onOpen(p.id)} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function ProblemCard({
  problem,
  index,
  onOpen,
}: {
  problem: BigProblem
  index: number
  onOpen: () => void
}) {
  const attempts = bigProgressStore.byProblem(problem.id)
  const last = attempts.at(-1)
  const lastScore = last
    ? `${Object.values(last.results).filter(Boolean).length} / ${problem.adjustments.length}`
    : null
  const stars = '★'.repeat(problem.difficulty) + '☆'.repeat(3 - problem.difficulty)
  const romans = ['i', 'ii', 'iii', 'iv', 'v']

  return (
    <button
      onClick={onOpen}
      className="w-full glass-card rounded-[20px] px-5 py-4 text-left flex items-start gap-4 hover:bg-white/85 transition-colors"
    >
      <span
        className="font-serif italic shrink-0 flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, #ffd2c0, #ffe1b2)',
          color: '#c66454',
          width: 40,
          height: 40,
          borderRadius: 12,
          fontSize: 18,
        }}
      >
        {romans[index] ?? index + 1}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          <h3 className="font-serif font-medium text-[16px] leading-[1.4]">{problem.title}</h3>
        </div>
        {problem.description && (
          <p className="text-[11.5px] text-ink-soft mt-1 leading-[1.55] line-clamp-2">
            {problem.description}
          </p>
        )}
        <div className="mt-2 flex items-center gap-2 flex-wrap text-[10px] tracking-[0.14em] uppercase text-ink-faint">
          <span className="text-coral-deep tracking-normal">{stars}</span>
          <span>·</span>
          <span>{problem.adjustments.length} 整理</span>
          <span>·</span>
          <span>{problem.estimatedMinutes} min</span>
          {lastScore && (
            <>
              <span>·</span>
              <span className="text-sage-deep tabular">last {lastScore}</span>
            </>
          )}
        </div>
      </div>
      <span className="text-coral text-base shrink-0 mt-1">→</span>
    </button>
  )
}
