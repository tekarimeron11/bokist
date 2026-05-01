import { ARTICLES } from '../data/articles'

type Props = {
  onOpenArticle: (slug: string) => void
  onBack: () => void
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

export function ArticlesScreen({ onOpenArticle, onBack }: Props) {
  return (
    <div className="min-h-screen">
      <header
        className="sticky top-0 z-20 px-5 pt-4 pb-3 backdrop-blur"
        style={{ background: 'rgba(255,245,236,0.75)', borderBottom: '1px solid rgba(255,255,255,0.6)' }}
      >
        <button onClick={onBack} className="text-coral text-[13px] tracking-wider" aria-label="戻る">
          ← 戻る
        </button>
      </header>
      <main className="px-6 pb-32 pt-5 max-w-md mx-auto animate-rise">
        <span className="eyebrow">Articles</span>
        <h1 className="font-serif font-normal text-[32px] mt-2 leading-[1.1] tracking-[-0.015em]">
          記事
        </h1>
        <p className="text-[12px] text-ink-faint mt-2 tracking-[0.14em] uppercase">
          {ARTICLES.length} articles
        </p>

        {CATEGORIES.map((cat) => {
          const items = ARTICLES.filter((a) => a.category === cat.id)
          if (items.length === 0) return null
          return (
            <section key={cat.id} className="mt-7">
              <div className="flex items-baseline justify-between mb-3 px-1">
                <h2 className="font-serif font-medium text-[17px] tracking-[-0.01em]">
                  {cat.label}
                </h2>
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
                        {a.description && (
                          <p className="text-[11.5px] text-ink-soft mt-1 leading-[1.5] line-clamp-2 font-serif">
                            {a.description}
                          </p>
                        )}
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
