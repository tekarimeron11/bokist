import { CHAPTERS } from '../data/chapters'
import { questionsByChapter, availableQuestions, pickRandom } from '../data/questions'
import { BIG_PROBLEMS } from '../data/bigProblems'
import { settingsStore } from '../storage/settingsStore'
import { progressStore } from '../storage/progressStore'
import { bigProgressStore } from '../storage/bigProgressStore'
import type { Question } from '../types'

type Props = {
  onStartSession: (questions: Question[], mode: 'chapter' | 'quick' | 'review', label: string) => void
  onOpenBigProblems: () => void
}

export function DrillScreen({ onStartSession, onOpenBigProblems }: Props) {
  const profile = settingsStore.get().syllabusProfile

  function startChapter(chapterId: string) {
    const all = questionsByChapter(chapterId as never).filter((q) =>
      availableQuestions(profile).includes(q),
    )
    if (all.length === 0) return
    const picked = pickRandom(all, 10)
    onStartSession(picked, 'chapter', CHAPTERS.find((c) => c.id === chapterId)?.name ?? '')
  }

  function startQuickDrill() {
    const all = availableQuestions(profile)
    if (all.length === 0) return
    onStartSession(pickRandom(all, 5), 'quick', 'クイックドリル')
  }

  function startReview() {
    const all = availableQuestions(profile)
    const attempts = progressStore.getAll()
    const byQ = new Map<string, { tries: number; correct: number }>()
    for (const a of attempts) {
      const cur = byQ.get(a.questionId) ?? { tries: 0, correct: 0 }
      cur.tries += 1
      if (a.correct) cur.correct += 1
      byQ.set(a.questionId, cur)
    }
    const weak = all.filter((q) => {
      const s = byQ.get(q.id)
      return s && s.tries >= 3 && s.correct / s.tries < 0.5
    })
    if (weak.length === 0) {
      onStartSession(pickRandom(all, 5), 'review', '苦手復習（候補不足のためランダム）')
      return
    }
    onStartSession(pickRandom(weak, Math.min(5, weak.length)), 'review', '苦手復習')
  }

  function chapterStats(chapterId: string) {
    const qs = questionsByChapter(chapterId as never)
    const ids = new Set(qs.map((q) => q.id))
    const attempts = progressStore.getAll().filter((a) => ids.has(a.questionId))
    const correct = attempts.filter((a) => a.correct).length
    const rate = attempts.length === 0 ? null : Math.round((correct / attempts.length) * 100)
    return { count: qs.length, attempts: attempts.length, rate }
  }

  return (
    <div className="px-6 pt-6 pb-32">
      {/* Top bar header echo */}
      <div className="flex justify-between items-baseline pt-1.5">
        <span className="eyebrow">Drill</span>
        <span className="eyebrow-soft">{CHAPTERS.length} chapters</span>
      </div>
      <h1 className="font-serif font-normal text-[32px] leading-[1.1] tracking-[-0.015em] mt-2">
        仕訳ドリル
      </h1>

      {/* Two action cards */}
      <div className="grid grid-cols-2 gap-3 mt-6 animate-rise">
        <button
          onClick={startQuickDrill}
          className="peach-button rounded-[22px] py-5 px-4 text-left flex flex-col justify-between min-h-[140px]"
        >
          <div>
            <span className="text-[10px] tracking-[0.18em] uppercase font-semibold text-white/85">
              ⚡ Quick
            </span>
            <div className="font-serif italic font-light text-[26px] mt-1.5 leading-none">
              5 問
            </div>
          </div>
          <div>
            <div className="font-serif text-[14px] text-white/95">クイックドリル</div>
            <div className="text-[10.5px] text-white/75 tracking-wide mt-0.5">
              2-3 min · all chapters
            </div>
          </div>
        </button>
        <button
          onClick={startReview}
          className="glass-card rounded-[22px] py-5 px-4 text-left flex flex-col justify-between min-h-[140px]"
        >
          <div>
            <span className="text-[10px] tracking-[0.18em] uppercase font-semibold text-coral-deep">
              Review
            </span>
            <div className="font-serif italic font-light text-[26px] mt-1.5 leading-none text-coral-deep">
              苦手
            </div>
          </div>
          <div>
            <div className="font-serif text-[14px]">苦手復習</div>
            <div className="text-[10.5px] text-ink-faint mt-0.5 tracking-wide">
              under 50% accuracy
            </div>
          </div>
        </button>
      </div>

      {/* Chapters */}
      <div className="flex justify-between items-baseline mt-9 mb-3.5 px-1">
        <h2 className="font-serif font-medium text-[19px] tracking-[-0.01em]">
          章を <i className="italic font-normal text-coral">えらぶ</i>
        </h2>
        <span className="eyebrow-soft">all chapters</span>
      </div>

      <ul className="flex flex-col gap-2.5">
        {CHAPTERS.map((ch) => {
          const s = chapterStats(ch.id)
          const disabled = s.count === 0
          return (
            <li key={ch.id}>
              <button
                onClick={() => startChapter(ch.id)}
                disabled={disabled}
                className="w-full glass-row rounded-[18px] px-4 py-3.5 flex items-center gap-3 text-left disabled:opacity-50"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-serif font-medium text-[15px] leading-[1.35]">
                    {ch.name}
                  </div>
                  <div className="text-[11px] text-ink-soft mt-1 leading-[1.5] line-clamp-1">
                    {ch.description}
                  </div>
                  <div className="mt-1.5 flex items-center gap-2 text-[10px] tracking-[0.14em] uppercase text-ink-faint">
                    <span>{s.count} 問</span>
                    <span>·</span>
                    <span>{s.attempts} attempts</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-serif text-[20px] font-medium tabular leading-none">
                    {s.rate === null ? '—' : `${s.rate}`}
                    {s.rate !== null && (
                      <span className="text-[12px] text-ink-faint font-light ml-0.5">%</span>
                    )}
                  </div>
                  <div className="text-[9px] tracking-[0.18em] uppercase text-ink-faint mt-1">
                    {s.rate === null ? 'new' : 'rate'}
                  </div>
                </div>
              </button>
            </li>
          )
        })}
      </ul>

      <BigProblemsSection onOpen={onOpenBigProblems} />
    </div>
  )
}

function BigProblemsSection({ onOpen }: { onOpen: () => void }) {
  const totalAttempts = bigProgressStore.getAll().length

  return (
    <section className="mt-10">
      <div className="flex justify-between items-baseline mb-3.5 px-1">
        <h2 className="font-serif font-medium text-[19px] tracking-[-0.01em]">
          大問題 — <i className="italic font-normal text-coral">第3問対策</i>
        </h2>
        <span className="eyebrow-soft">{BIG_PROBLEMS.length} sets</span>
      </div>

      <button
        onClick={onOpen}
        className="w-full glass-card rounded-[20px] px-5 py-5 text-left flex items-start gap-4 hover:bg-white/85 transition-colors"
      >
        <span
          className="font-serif italic shrink-0 flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #ffd2c0, #ffe1b2)',
            color: '#c66454',
            width: 44,
            height: 44,
            borderRadius: 14,
            fontSize: 20,
          }}
        >
          §3
        </span>
        <div className="flex-1 min-w-0">
          <div className="font-serif font-medium text-[16px] leading-[1.4]">
            大型決算問題ドリル
          </div>
          <p className="text-[11.5px] text-ink-soft mt-1 leading-[1.55]">
            期末残高試算表＋決算整理事項を順番に解く本番形式
          </p>
          <div className="mt-2 flex items-center gap-2 text-[10px] tracking-[0.14em] uppercase text-ink-faint">
            <span>{BIG_PROBLEMS.length} 問</span>
            <span>·</span>
            <span>{totalAttempts} attempts</span>
          </div>
        </div>
        <span className="text-coral text-base shrink-0 mt-1">→</span>
      </button>
    </section>
  )
}
