type TabId = 'home' | 'drill' | 'stats' | 'settings'

type Props = {
  active: TabId
  onChange: (id: TabId) => void
}

const TABS: Array<{ id: TabId; label: string; index: string }> = [
  { id: 'home',     label: 'ホーム', index: '01' },
  { id: 'drill',    label: 'ドリル', index: '02' },
  { id: 'stats',    label: '進捗',   index: '03' },
  { id: 'settings', label: '設定',   index: '04' },
]

export function TabBar({ active, onChange }: Props) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-paper/95 backdrop-blur border-t border-line safe-bottom z-20"
      role="tablist"
      aria-label="メインナビゲーション"
    >
      <div className="grid grid-cols-4 max-w-md mx-auto px-2 pt-2 pb-1">
        {TABS.map((tab) => {
          const isActive = active === tab.id
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-label={tab.label}
              onClick={() => onChange(tab.id)}
              className="relative flex flex-col items-center pt-2 pb-2 transition-colors"
            >
              {isActive && (
                <span
                  aria-hidden
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-7 h-px bg-ink animate-underline origin-center"
                />
              )}
              <span
                className={`numeral text-[10px] mb-1 transition-colors ${
                  isActive ? 'text-ink' : 'text-ink-faint'
                }`}
              >
                {tab.index}
              </span>
              <span
                className={`text-[12px] tracking-wider transition-all ${
                  isActive
                    ? 'font-serif font-semibold text-ink'
                    : 'font-sans text-ink-soft'
                }`}
              >
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export type { TabId }
