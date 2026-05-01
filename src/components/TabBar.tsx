import type { ReactNode } from 'react'

type TabId = 'articles' | 'drill'

type Props = {
  active: TabId
  onChange: (id: TabId) => void
}

function ArticlesIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h12a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3V4z" />
      <path d="M8 8h8M8 12h8M8 16h5" />
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

const TABS: Array<{ id: TabId; label: string; Icon: () => ReactNode; aria: string }> = [
  { id: 'articles', label: 'articles', Icon: ArticlesIcon, aria: '記事' },
  { id: 'drill',    label: 'drill',    Icon: DrillIcon,    aria: '問題' },
]

export function TabBar({ active, onChange }: Props) {
  return (
    <nav
      role="tablist"
      aria-label="メインナビゲーション"
      className="fixed left-4 right-4 bottom-3 max-w-md mx-auto z-30 safe-bottom"
    >
      <div
        className="grid grid-cols-2 items-center px-1 h-16 rounded-3xl glass"
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
