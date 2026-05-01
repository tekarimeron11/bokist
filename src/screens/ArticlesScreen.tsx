import { ARTICLES } from '../data/articles'

type Props = {
  onOpenArticle: (slug: string) => void
  onBack: () => void
}

const CATEGORIES: Array<{ id: string; label: string }> = [
  { id: 'exam-overview',  label: '試験概要' },
  { id: 'strategy',       label: '合格戦略' },
  { id: 'basics',         label: '基本' },
  { id: 'chapter-guide',  label: '章解説' },
  { id: 'pitfalls',       label: '落とし穴' },
  { id: 'checklist',      label: 'チェックリスト' },
]

export function ArticlesScreen({ onOpenArticle, onBack }: Props) {
  return (
    <div className="min-h-screen bg-paper">
      <header className="px-5 pt-4 pb-3 sticky top-0 bg-paper/90 backdrop-blur z-10 border-b border-line">
        <button onClick={onBack} className="text-sm text-ink-soft" aria-label="戻る">← 戻る</button>
      </header>
      <main className="px-5 pb-32 pt-3 max-w-md mx-auto">
        <div className="text-[10px] tracking-[0.2em] uppercase text-ink-soft">Articles</div>
        <h1 className="font-serif text-2xl mt-1">解説記事</h1>
        <p className="text-xs text-ink-soft mt-2">
          初学者向けの読み物。仕訳の例とイラスト付き。
        </p>

        {CATEGORIES.map((cat) => {
          const items = ARTICLES.filter((a) => a.category === cat.id)
          if (items.length === 0) return null
          return (
            <section key={cat.id} className="mt-6">
              <h2 className="font-serif text-sm text-ink-soft">{cat.label}</h2>
              <ul className="mt-2 flex flex-col gap-2">
                {items.map((a) => (
                  <li key={a.slug}>
                    <button
                      onClick={() => onOpenArticle(a.slug)}
                      className="w-full text-left bg-white border border-line rounded-2xl p-4"
                    >
                      <div className="font-serif text-base leading-snug">{a.title}</div>
                      {a.description && (
                        <p className="text-xs text-ink-soft mt-1 leading-relaxed line-clamp-2">
                          {a.description}
                        </p>
                      )}
                      <div className="text-[10px] text-ink-soft mt-2">
                        {a.readingMinutes}分で読める
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
