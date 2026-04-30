type TabId = 'home' | 'drill' | 'stats' | 'settings'

type Props = {
  active: TabId
  onChange: (id: TabId) => void
}

const TABS: Array<{ id: TabId; label: string; icon: string }> = [
  { id: 'home',     label: 'ホーム',   icon: '⌂' },
  { id: 'drill',    label: 'ドリル',   icon: '📝' },
  { id: 'stats',    label: '進捗',     icon: '📊' },
  { id: 'settings', label: '設定',     icon: '⚙' },
]

export function TabBar({ active, onChange }: Props) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-paper/90 backdrop-blur border-t border-line safe-bottom"
      role="tablist"
      aria-label="メインナビゲーション"
    >
      <div className="grid grid-cols-4 max-w-md mx-auto px-3 py-3">
        {TABS.map((tab) => {
          const isActive = active === tab.id
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-label={tab.label}
              onClick={() => onChange(tab.id)}
              className={`flex flex-col items-center gap-1 py-1 ${
                isActive ? 'text-ink' : 'text-ink-soft'
              }`}
            >
              <span
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm transition-colors ${
                  isActive ? 'bg-ink text-white' : 'bg-line'
                }`}
              >
                {tab.icon}
              </span>
              <span className="text-[10px]">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export type { TabId }
