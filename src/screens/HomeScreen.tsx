import { metaStore } from '../storage/metaStore'
import { ARTICLES } from '../data/articles'

type Props = {
  onOpenSettings: () => void
  onOpenArticles: () => void
}

function todayStamp(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}.${m}.${day}`
}

export function HomeScreen({ onOpenSettings, onOpenArticles }: Props) {
  const days = metaStore.daysSinceLastExport()
  const showBackupBanner = days === null || days >= 7
  const featured = ARTICLES.slice(0, 3)

  return (
    <div className="px-5 pt-5 pb-32">
      {/* Masthead — like a magazine */}
      <div className="flex items-baseline justify-between border-b border-line pb-2">
        <span className="numeral text-[11px]">No. 03</span>
        <span className="font-display text-[11px] tracking-[0.25em]">BOKIST</span>
        <span className="numeral text-[11px]">{todayStamp()}</span>
      </div>

      {/* Hero greeting */}
      <div className="flex items-end justify-between mt-7">
        <div>
          <span className="eyebrow">welcome back</span>
          <h1 className="font-serif text-[34px] leading-[1.1] mt-3 tracking-tight">
            おかえりなさい、
            <br />
            <span className="font-display italic text-ink-soft">先輩</span>
          </h1>
        </div>
        <div className="w-11 h-11 rounded-full border border-line bg-paper-deep flex items-center justify-center font-display text-base text-ink shrink-0">
          S
        </div>
      </div>

      {showBackupBanner && (
        <button
          onClick={onOpenSettings}
          className="w-full mt-7 px-4 py-3.5 rounded-card bg-blush-soft text-left flex items-center justify-between border border-blush/30"
        >
          <div>
            <div className="text-eyebrow uppercase text-blush-deep">backup</div>
            <div className="text-[13px] font-medium mt-1 text-blush-deep">
              {days === null ? 'まだバックアップしていません' : `最終バックアップから ${days} 日`}
            </div>
            <div className="text-[11px] mt-0.5 text-blush-deep/80">
              タップして設定を開く
            </div>
          </div>
          <span className="font-display text-blush-deep text-lg">→</span>
        </button>
      )}

      {/* Featured Articles editorial block */}
      <section className="mt-10">
        <div className="flex items-baseline justify-between mb-4">
          <span className="eyebrow">articles</span>
          <button
            onClick={onOpenArticles}
            className="text-[11px] tracking-wider text-ink-soft link-underline"
          >
            全て見る
          </button>
        </div>

        <button
          onClick={onOpenArticles}
          className="w-full text-left paper-card p-5 relative overflow-hidden"
        >
          <div className="numeral text-[11px]">vol. 01</div>
          <h2 className="font-serif text-lg mt-2 leading-snug">
            解説記事を読む
          </h2>
          <p className="text-[12px] text-ink-soft mt-1.5 leading-relaxed">
            {ARTICLES.length}本収録 · 試験概要から落とし穴まで
          </p>
          <div className="mt-4 flex items-center gap-2">
            <span className="font-display text-ink text-sm">読みはじめる</span>
            <span className="font-display text-ink">→</span>
          </div>
        </button>

        {featured.length > 0 && (
          <ul className="mt-3 flex flex-col">
            {featured.map((a, i) => (
              <li key={a.slug}>
                <button
                  onClick={onOpenArticles}
                  className="w-full text-left py-3.5 flex items-start gap-4 border-t border-line first:border-t-0"
                >
                  <span className="numeral text-base shrink-0 mt-0.5">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-serif text-[15px] leading-snug">{a.title}</div>
                    <div className="text-[11px] text-ink-soft mt-1 tracking-wider">
                      {a.readingMinutes}分で読める
                    </div>
                  </div>
                  <span className="font-display text-ink-faint mt-0.5">→</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
