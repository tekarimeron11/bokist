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
    <div className="px-5 pt-4 pb-32">
      <div className="text-[10px] tracking-[0.2em] uppercase text-ink-soft">Drill</div>
      <h1 className="font-serif text-2xl mt-1">仕訳ドリル</h1>

      <div className="mt-5 grid grid-cols-2 gap-2">
        <button
          onClick={startQuickDrill}
          className="card-btn bg-ink text-white py-4 rounded-2xl text-left px-4"
        >
          <div className="text-lg">⚡️</div>
          <div className="font-serif text-sm mt-1">クイック5問</div>
          <div className="text-[10px] opacity-70 mt-0.5">通学・通勤の2-3分用</div>
        </button>
        <button
          onClick={startReview}
          className="card-btn bg-blush-soft py-4 rounded-2xl text-left px-4 text-ink"
        >
          <div className="text-lg">🎯</div>
          <div className="font-serif text-sm mt-1">苦手復習</div>
          <div className="text-[10px] opacity-70 mt-0.5">正答率50%未満から</div>
        </button>
      </div>

      <div className="text-[10px] tracking-[0.2em] uppercase text-ink-soft mt-8 mb-2 px-1">
        Chapters
      </div>
      <ul className="flex flex-col gap-2">
        {CHAPTERS.map((ch) => {
          const s = chapterStats(ch.id)
          return (
            <li key={ch.id}>
              <button
                onClick={() => startChapter(ch.id)}
                className="w-full bg-white border border-line rounded-2xl p-4 text-left flex items-center justify-between"
                disabled={s.count === 0}
              >
                <div>
                  <div className="font-serif text-base">{ch.name}</div>
                  <div className="text-[11px] text-ink-soft mt-0.5">
                    {ch.description} · {s.count}問
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-ink-soft">
                    {s.rate === null ? '未挑戦' : `${s.rate}%`}
                  </div>
                  <div className="text-[10px] text-ink-soft mt-0.5">{s.attempts}回</div>
                </div>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
