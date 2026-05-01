import { CHAPTERS } from '../data/chapters'
import { questionsByChapter, availableQuestions, pickRandom } from '../data/questions'
import { settingsStore } from '../storage/settingsStore'
import { progressStore } from '../storage/progressStore'
import type { Question } from '../types'

type Props = {
  onStartSession: (questions: Question[], mode: 'chapter' | 'quick' | 'review', label: string) => void
}

export function DrillScreen({ onStartSession }: Props) {
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
    <div className="px-5 pt-5 pb-32">
      <span className="eyebrow">drill · 仕訳</span>
      <h1 className="font-serif text-[30px] mt-3 leading-tight">仕訳ドリル</h1>
      <p className="text-[12px] text-ink-soft mt-1.5">
        毎日の積み重ねが合格への近道。
      </p>

      {/* Paired editorial action cards — one filled, one outlined */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          onClick={startQuickDrill}
          className="bg-ink text-white py-5 px-4 rounded-card text-left flex flex-col justify-between min-h-[140px] transition-transform active:scale-[0.98]"
        >
          <div>
            <span className="numeral text-[10px] text-white/60">01</span>
            <div className="font-display text-2xl mt-2 tracking-tight italic">Quick</div>
          </div>
          <div>
            <div className="font-serif text-[15px]">クイック5問</div>
            <div className="text-[11px] text-white/60 mt-0.5">2-3分で1セット</div>
          </div>
        </button>
        <button
          onClick={startReview}
          className="bg-paper-deep border border-line py-5 px-4 rounded-card text-left flex flex-col justify-between min-h-[140px] transition-transform active:scale-[0.98]"
        >
          <div>
            <span className="numeral text-[10px]">02</span>
            <div className="font-display text-2xl mt-2 tracking-tight italic text-blush-deep">Review</div>
          </div>
          <div>
            <div className="font-serif text-[15px]">苦手復習</div>
            <div className="text-[11px] text-ink-soft mt-0.5">正答率50%未満から</div>
          </div>
        </button>
      </div>

      {/* Chapters TOC — magazine table-of-contents style */}
      <div className="mt-10 flex items-baseline justify-between mb-2">
        <span className="eyebrow">chapters</span>
        <span className="numeral text-[11px]">{CHAPTERS.length}章</span>
      </div>
      <ul className="border-t border-line">
        {CHAPTERS.map((ch, idx) => {
          const s = chapterStats(ch.id)
          const disabled = s.count === 0
          return (
            <li key={ch.id}>
              <button
                onClick={() => startChapter(ch.id)}
                className="w-full py-4 text-left flex items-start gap-4 border-b border-line disabled:opacity-50"
                disabled={disabled}
              >
                <span className="numeral text-lg shrink-0 mt-0.5 leading-none">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-serif text-[15px] leading-snug">{ch.name}</div>
                  <div className="text-[11px] text-ink-soft mt-1 leading-relaxed">
                    {ch.description}
                  </div>
                  <div className="mt-2 flex items-center gap-3 text-[10px] tracking-wider uppercase text-ink-faint">
                    <span>{s.count}問</span>
                    <span className="text-line-strong">·</span>
                    <span>{s.attempts}回</span>
                  </div>
                </div>
                <div className="text-right shrink-0 self-center">
                  <div className="amount text-base text-ink">
                    {s.rate === null ? '—' : `${s.rate}%`}
                  </div>
                  <div className="text-[9px] uppercase tracking-wider text-ink-faint mt-0.5">
                    {s.rate === null ? 'new' : 'rate'}
                  </div>
                </div>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
