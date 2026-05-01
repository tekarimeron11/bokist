import { metaStore } from '../storage/metaStore'
import { ARTICLES } from '../data/articles'

type Props = {
  onOpenSettings: () => void
  onOpenArticles: () => void
}

export function HomeScreen({ onOpenSettings, onOpenArticles }: Props) {
  const days = metaStore.daysSinceLastExport()
  const showBackupBanner = days === null || days >= 7
  const featured = ARTICLES.slice(0, 3)

  return (
    <div className="px-5 pt-4 pb-32">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] tracking-[0.2em] uppercase text-ink-soft">Welcome</div>
          <h1 className="font-serif text-2xl mt-1 leading-tight">
            おかえりなさい<br />先輩
          </h1>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blush to-gold flex items-center justify-center text-white font-medium text-sm">
          S
        </div>
      </div>

      {showBackupBanner && (
        <button
          onClick={onOpenSettings}
          className="w-full mt-5 p-4 rounded-2xl bg-blush-soft text-left flex items-center justify-between"
        >
          <div>
            <div className="text-xs font-medium" style={{ color: '#8a4a4a' }}>
              {days === null ? 'まだバックアップしていません' : `最終バックアップから ${days} 日`}
            </div>
            <div className="text-[10px] mt-1" style={{ color: '#7a4040' }}>
              タップして設定を開く →
            </div>
          </div>
          <span className="text-xl">💾</span>
        </button>
      )}

      <button
        onClick={onOpenArticles}
        className="w-full mt-4 p-4 rounded-2xl bg-white border border-line text-left flex items-center justify-between"
      >
        <div>
          <div className="text-[10px] tracking-[0.2em] uppercase text-ink-soft">Articles</div>
          <div className="font-serif text-base mt-1">解説記事を読む</div>
          <div className="text-[10px] text-ink-soft mt-0.5">
            {ARTICLES.length}本 · 試験概要から落とし穴まで
          </div>
        </div>
        <span className="text-xl">📖</span>
      </button>

      {featured.length > 0 && (
        <section className="mt-6">
          <div className="text-[10px] tracking-[0.2em] uppercase text-ink-soft mb-2 px-1">
            Featured
          </div>
          <ul className="flex flex-col gap-2">
            {featured.map((a) => (
              <li key={a.slug}>
                <button
                  onClick={onOpenArticles}
                  className="w-full text-left bg-white border border-line rounded-2xl p-3"
                >
                  <div className="font-serif text-sm leading-snug">{a.title}</div>
                  <div className="text-[10px] text-ink-soft mt-1">{a.readingMinutes}分</div>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
