import { metaStore } from '../storage/metaStore'

type Props = {
  onOpenSettings: () => void
}

export function HomeScreen({ onOpenSettings }: Props) {
  const days = metaStore.daysSinceLastExport()
  const showBackupBanner = days === null || days >= 7

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

      <div className="mt-6 p-6 rounded-2xl bg-white border border-line text-center">
        <div className="text-[10px] tracking-[0.2em] uppercase text-ink-soft">Coming Soon</div>
        <div className="font-display text-3xl mt-2">問題準備中</div>
        <div className="text-xs text-ink-soft mt-2">
          Round 2 でコンテンツ生成 → 有効化
        </div>
      </div>
    </div>
  )
}
