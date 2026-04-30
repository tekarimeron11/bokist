import { useState } from 'react'
import { TabBar, type TabId } from './components/TabBar'
import { HomeScreen } from './screens/HomeScreen'
import { DrillScreen } from './screens/DrillScreen'
import { StatsScreen } from './screens/StatsScreen'
import { SettingsScreen } from './screens/SettingsScreen'

function App() {
  const [tab, setTab] = useState<TabId>('home')

  return (
    <div className="min-h-screen bg-paper">
      <main className="max-w-md mx-auto">
        {tab === 'home'     && <HomeScreen onOpenSettings={() => setTab('settings')} />}
        {tab === 'drill'    && <DrillScreen />}
        {tab === 'stats'    && <StatsScreen />}
        {tab === 'settings' && <SettingsScreen />}
      </main>
      <TabBar active={tab} onChange={setTab} />
    </div>
  )
}

export default App
