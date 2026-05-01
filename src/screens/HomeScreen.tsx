import { metaStore } from '../storage/metaStore'
import { progressStore } from '../storage/progressStore'
import { ARTICLES } from '../data/articles'

type Props = {
  onOpenSettings: () => void
  onOpenArticles: () => void
}

const ROMAN = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x']

function computeStreak(): number {
  const attempts = progressStore.getAll()
  if (attempts.length === 0) return 0
  const days = new Set<string>()
  for (const a of attempts) {
    days.add(a.answeredAt.slice(0, 10))
  }
  let streak = 0
  const today = new Date()
  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    if (days.has(key)) {
      streak++
    } else if (i === 0) {
      // allow today to be empty if streak was active yesterday
      continue
    } else {
      break
    }
  }
  return streak
}

function todayDate(): string {
  const d = new Date()
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

function computeProgress(): number {
  const attempts = progressStore.getAll()
  if (attempts.length === 0) return 0
  const recent = attempts.slice(-30)
  const correct = recent.filter((a) => a.correct).length
  return Math.round((correct / recent.length) * 100)
}

export function HomeScreen({ onOpenSettings, onOpenArticles }: Props) {
  const days = metaStore.daysSinceLastExport()
  const showBackupBanner = days === null || days >= 7
  const featured = ARTICLES[0]
  const list = ARTICLES.slice(1, 4)
  const streak = computeStreak()
  const progress = computeProgress()

  return (
    <div className="px-6 pt-6 pb-32">
      {/* Top bar */}
      <div className="flex justify-between items-center pt-1.5 pb-4">
        <div className="brand-wordmark text-[22px]">Bokist.</div>
        <div className="peach-orb w-[38px] h-[38px] rounded-full flex items-center justify-center font-serif italic text-base">
          S
        </div>
      </div>

      {/* Hero glass card */}
      <section className="glass rounded-[28px] px-6 pt-7 pb-6 relative overflow-hidden animate-rise">
        <div
          aria-hidden
          className="absolute -top-10 -right-10 w-40 h-40 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(255,180,160,0.6), transparent 70%)' }}
        />
        <div className="relative">
          <span className="eyebrow">Today</span>
          <h1 className="font-serif font-normal text-[32px] leading-[1.1] tracking-[-0.015em] mt-2.5">
            {todayDate()}
          </h1>

          <div className="grid grid-cols-2 gap-3 mt-5">
            <div className="glass-pill rounded-2xl px-3.5 py-3">
              <div className="font-serif font-medium text-[24px] leading-none tabular">
                {streak}
                <small className="text-[12px] text-ink-faint font-light ml-0.5">days</small>
              </div>
              <div className="text-[10px] text-ink-faint tracking-[0.18em] uppercase mt-1">streak</div>
            </div>
            <div className="glass-pill rounded-2xl px-3.5 py-3">
              <div className="font-serif font-medium text-[24px] leading-none tabular">
                {progress}
                <small className="text-[12px] text-ink-faint font-light ml-0.5">%</small>
              </div>
              <div className="text-[10px] text-ink-faint tracking-[0.18em] uppercase mt-1">to pass</div>
            </div>
          </div>
        </div>
      </section>

      {/* Backup banner (conditional) */}
      {showBackupBanner && (
        <button
          onClick={onOpenSettings}
          className="w-full mt-4 glass-row rounded-2xl px-4 py-3 text-left flex items-center justify-between"
        >
          <div className="min-w-0">
            <div className="eyebrow text-coral-deep">backup</div>
            <div className="text-[13px] font-medium mt-1 text-ink">
              {days === null ? 'まだバックアップしていません' : `最終バックアップから ${days} 日`}
            </div>
            <div className="text-[11px] text-ink-faint mt-0.5">タップして設定を開く</div>
          </div>
          <span className="text-coral text-lg">→</span>
        </button>
      )}

      {/* Section header */}
      <div className="flex justify-between items-baseline mt-7 mb-3.5 px-1">
        <h2 className="font-serif font-medium text-[19px] tracking-[-0.01em]">記事</h2>
        <button
          onClick={onOpenArticles}
          className="text-[11px] tracking-[0.16em] uppercase font-medium text-rose"
        >
          all {ARTICLES.length} →
        </button>
      </div>

      {/* Featured glass card */}
      {featured && (
        <button
          onClick={onOpenArticles}
          className="w-full text-left glass-card rounded-[22px] px-6 pt-5 pb-5 mb-3.5 relative overflow-hidden"
        >
          <span className="peach-tag">Featured</span>
          <h3 className="font-serif font-normal text-[22px] leading-[1.22] tracking-[-0.01em] mt-3.5">
            {featured.title}
          </h3>
          {featured.description && (
            <p className="text-[12px] leading-[1.55] text-ink-soft mt-2 line-clamp-2">
              {featured.description}
            </p>
          )}
          <div className="mt-4 flex justify-between items-center">
            <span className="text-[10px] text-ink-faint tracking-[0.16em] uppercase">
              vol. 01 · {categoryLabel(featured.category)}
            </span>
            <span className="read-more">read →</span>
          </div>
        </button>
      )}

      {/* Article rows with roman chips */}
      {list.length > 0 && (
        <ul className="flex flex-col gap-2.5">
          {list.map((a, i) => (
            <li key={a.slug}>
              <button
                onClick={onOpenArticles}
                className="w-full glass-row rounded-[18px] px-4 py-3.5 flex items-center gap-3 text-left"
              >
                <span className="roman-chip text-base">{ROMAN[i]}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-serif font-medium text-[14px] leading-[1.4] tracking-[-0.005em] line-clamp-2">
                    {a.title}
                  </div>
                  <div className="text-[10px] text-ink-faint mt-1 tracking-[0.14em] uppercase">
                    {a.readingMinutes} min · {categoryLabel(a.category)}
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function categoryLabel(c: string): string {
  return ({
    'exam-overview': 'overview',
    'strategy':      'strategy',
    'basics':        'basics',
    'chapter-guide': 'guide',
    'pitfalls':      'pitfalls',
    'checklist':     'checklist',
  } as Record<string, string>)[c] ?? c
}
