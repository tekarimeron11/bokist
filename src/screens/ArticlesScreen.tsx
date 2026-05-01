import { ARTICLES } from '../data/articles'
import { metaStore } from '../storage/metaStore'
import { progressStore } from '../storage/progressStore'

type Props = {
  onOpenArticle: (slug: string) => void
  onOpenSettings: () => void
}

const CATEGORIES: Array<{ id: string; label: string; en: string }> = [
  { id: 'exam-overview',  label: '試験概要',         en: 'overview' },
  { id: 'strategy',       label: '合格戦略',         en: 'strategy' },
  { id: 'basics',         label: '基本',             en: 'basics' },
  { id: 'chapter-guide',  label: '章解説',           en: 'guide' },
  { id: 'pitfalls',       label: '落とし穴',         en: 'pitfalls' },
  { id: 'checklist',      label: 'チェックリスト',   en: 'checklist' },
]

const ROMAN = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x']

function computeStreak(): number {
  const attempts = progressStore.getAll()
  if (attempts.length === 0) return 0
  const days = new Set<string>()
  for (const a of attempts) days.add(a.answeredAt.slice(0, 10))
  let streak = 0
  const today = new Date()
  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    if (days.has(key)) streak++
    else if (i === 0) continue
    else break
  }
  return streak
}

function computeAccuracy(): number | null {
  const attempts = progressStore.getAll()
  if (attempts.length === 0) return null
  const recent = attempts.slice(-30)
  return Math.round((recent.filter((a) => a.correct).length / recent.length) * 100)
}

function GearIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.01a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

export function ArticlesScreen({ onOpenArticle, onOpenSettings }: Props) {
  const streak = computeStreak()
  const accuracy = computeAccuracy()
  const days = metaStore.daysSinceLastExport()
  const showBackupBanner = days === null || days >= 7
  const featured = ARTICLES[0]
  const rest = ARTICLES.slice(1)

  return (
    <div className="min-h-screen pb-32">
      {/* Top bar */}
      <header className="px-6 pt-6 flex items-center justify-between">
        <div className="brand-wordmark text-[22px]">Bokist.</div>
        <button
          onClick={onOpenSettings}
          aria-label="設定"
          className="w-10 h-10 rounded-full glass-row flex items-center justify-center text-ink-soft hover:text-ink transition-colors"
        >
          <GearIcon />
        </button>
      </header>

      {/* Compact stats strip */}
      <section className="px-6 pt-5">
        <div className="glass-pill rounded-2xl px-5 py-3 flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="font-serif font-medium text-[20px] leading-none tabular">{streak}</span>
            <span className="text-[10px] text-ink-faint tracking-[0.16em] uppercase">streak</span>
          </div>
          <span className="w-px h-5 bg-line/60" />
          <div className="flex items-baseline gap-1.5">
            <span className="font-serif font-medium text-[20px] leading-none tabular">
              {accuracy === null ? '—' : accuracy}
            </span>
            <span className="text-[10px] text-ink-faint tracking-[0.16em] uppercase">
              {accuracy === null ? 'accuracy' : '% accuracy'}
            </span>
          </div>
        </div>

        {showBackupBanner && (
          <button
            onClick={onOpenSettings}
            className="w-full mt-3 glass-row rounded-2xl px-4 py-3 text-left flex items-center justify-between"
          >
            <div className="min-w-0">
              <div className="eyebrow text-coral-deep">backup</div>
              <div className="text-[13px] mt-1 text-ink">
                {days === null ? 'まだバックアップしていません' : `最終バックアップから ${days} 日`}
              </div>
            </div>
            <span className="text-coral text-lg">→</span>
          </button>
        )}
      </section>

      {/* Section header */}
      <div className="px-6 mt-7 flex items-baseline justify-between">
        <h1 className="font-serif font-normal text-[28px] leading-[1.1] tracking-[-0.015em]">記事</h1>
        <span className="text-[11px] text-ink-faint tracking-[0.16em] uppercase">
          {ARTICLES.length} articles
        </span>
      </div>

      {/* Featured card */}
      {featured && (
        <button
          onClick={() => onOpenArticle(featured.slug)}
          className="w-full text-left glass-card rounded-[22px] mx-6 mt-4 px-6 pt-5 pb-5 relative overflow-hidden"
          style={{ width: 'calc(100% - 48px)' }}
        >
          <span className="peach-tag">Featured</span>
          <h2 className="font-serif font-normal text-[22px] leading-[1.22] tracking-[-0.01em] mt-3.5">
            {featured.title}
          </h2>
          {featured.description && (
            <p className="text-[12px] leading-[1.55] text-ink-soft mt-2 line-clamp-2">
              {featured.description}
            </p>
          )}
          <div className="mt-4 flex justify-between items-center">
            <span className="text-[10px] text-ink-faint tracking-[0.16em] uppercase">
              {categoryLabel(featured.category)} · {featured.readingMinutes} min
            </span>
            <span className="read-more">read →</span>
          </div>
        </button>
      )}

      {/* Article list grouped by category */}
      <main className="px-6 mt-7">
        {CATEGORIES.map((cat) => {
          const items = rest.filter((a) => a.category === cat.id)
          if (items.length === 0) return null
          return (
            <section key={cat.id} className="mt-6 first:mt-0">
              <div className="flex items-baseline justify-between mb-3 px-1">
                <h3 className="font-serif font-medium text-[15px] tracking-[-0.01em]">
                  {cat.label}
                </h3>
                <span className="eyebrow-soft">{cat.en}</span>
              </div>
              <ul className="flex flex-col gap-2.5">
                {items.map((a, i) => (
                  <li key={a.slug}>
                    <button
                      onClick={() => onOpenArticle(a.slug)}
                      className="w-full glass-row rounded-[18px] px-4 py-3.5 flex items-center gap-3 text-left"
                    >
                      <span className="roman-chip text-base">{ROMAN[i] ?? String(i + 1)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-serif font-medium text-[14.5px] leading-[1.4] tracking-[-0.005em]">
                          {a.title}
                        </div>
                        <div className="text-[10px] text-ink-faint mt-1.5 tracking-[0.14em] uppercase">
                          {a.readingMinutes} min
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )
        })}
      </main>
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
