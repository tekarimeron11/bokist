import type { ReactNode } from 'react'

type TabId = 'home' | 'drill' | 'stats' | 'settings'

type Props = {
  active: TabId
  onChange: (id: TabId) => void
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11l9-7 9 7v9a2 2 0 0 1-2 2h-4v-7H9v7H5a2 2 0 0 1-2-2v-9z" />
    </svg>
  )
}
function DrillIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 4l6 6-9 9H5v-6z" />
      <path d="M13 5l6 6" />
    </svg>
  )
}
function StatsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" />
      <path d="M18 17V9" />
      <path d="M13 17V5" />
      <path d="M8 17v-3" />
    </svg>
  )
}
function MoreIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="5" cy="12" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="19" cy="12" r="1.6" />
    </svg>
  )
}

const TABS: Array<{ id: TabId; label: string; Icon: () => ReactNode; aria: string }> = [
  { id: 'home',     label: 'home',  Icon: HomeIcon,  aria: 'ホーム' },
  { id: 'drill',    label: 'drill', Icon: DrillIcon, aria: 'ドリル' },
  { id: 'stats',    label: 'stats', Icon: StatsIcon, aria: '進捗' },
  { id: 'settings', label: 'more',  Icon: MoreIcon,  aria: '設定' },
]

export function TabBar({ active, onChange }: Props) {
  return (
    <nav
      role="tablist"
      aria-label="メインナビゲーション"
      className="fixed left-4 right-4 bottom-3 max-w-md mx-auto z-30 safe-bottom"
    >
      <div
        className="grid grid-cols-4 items-center px-1 h-16 rounded-3xl glass"
        style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
      >
        {TABS.map((tab) => {
          const isActive = active === tab.id
          const { Icon } = tab
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-label={tab.aria}
              onClick={() => onChange(tab.id)}
              className={`mx-1 flex flex-col items-center justify-center gap-1 py-2 rounded-2xl transition-all duration-300 ${
                isActive
                  ? 'peach-button text-white'
                  : 'text-ink-faint hover:text-ink-soft'
              }`}
            >
              <span className="w-[18px] h-[18px]"><Icon /></span>
              <span className="text-[10px] font-medium tracking-[0.06em] lowercase">
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
