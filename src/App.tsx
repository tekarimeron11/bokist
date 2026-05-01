import { useState } from 'react'
import { TabBar, type TabId } from './components/TabBar'
import { HomeScreen } from './screens/HomeScreen'
import { DrillScreen } from './screens/DrillScreen'
import { StatsScreen } from './screens/StatsScreen'
import { SettingsScreen } from './screens/SettingsScreen'
import { QuizScreen } from './screens/QuizScreen'
import type { Question } from './types'

type Session = {
  questions: Question[]
  mode: 'chapter' | 'quick' | 'review'
  label: string
}

function App() {
  const [tab, setTab] = useState<TabId>('home')
  const [session, setSession] = useState<Session | null>(null)

  function startSession(questions: Question[], mode: Session['mode'], label: string) {
    setSession({ questions, mode, label })
  }

  if (session) {
    return (
      <QuizScreen
        questions={session.questions}
        label={session.label}
        onExit={() => setSession(null)}
      />
    )
  }

  return (
    <div className="min-h-screen bg-paper">
      <main className="max-w-md mx-auto">
        {tab === 'home'     && <HomeScreen onOpenSettings={() => setTab('settings')} />}
        {tab === 'drill'    && <DrillScreen onStartSession={startSession} />}
        {tab === 'stats'    && <StatsScreen />}
        {tab === 'settings' && <SettingsScreen />}
      </main>
      <TabBar active={tab} onChange={setTab} />
    </div>
  )
}

export default App
