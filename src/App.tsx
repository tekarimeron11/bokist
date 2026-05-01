import { useState } from 'react'
import { TabBar, type TabId } from './components/TabBar'
import { HomeScreen } from './screens/HomeScreen'
import { DrillScreen } from './screens/DrillScreen'
import { StatsScreen } from './screens/StatsScreen'
import { SettingsScreen } from './screens/SettingsScreen'
import { QuizScreen } from './screens/QuizScreen'
import { ArticlesScreen } from './screens/ArticlesScreen'
import { ArticleScreen } from './screens/ArticleScreen'
import type { Question } from './types'

type Session = {
  questions: Question[]
  mode: 'chapter' | 'quick' | 'review' | 'article-cta'
  label: string
}

type Route =
  | { kind: 'tab' }
  | { kind: 'quiz'; session: Session }
  | { kind: 'articles' }
  | { kind: 'article'; slug: string }

function App() {
  const [tab, setTab] = useState<TabId>('home')
  const [route, setRoute] = useState<Route>({ kind: 'tab' })

  function startSession(questions: Question[], mode: Session['mode'], label: string) {
    setRoute({ kind: 'quiz', session: { questions, mode, label } })
  }

  function backToTab() {
    setRoute({ kind: 'tab' })
  }

  if (route.kind === 'quiz') {
    return (
      <QuizScreen
        questions={route.session.questions}
        label={route.session.label}
        onExit={backToTab}
        onOpenArticle={(slug) => setRoute({ kind: 'article', slug })}
      />
    )
  }

  if (route.kind === 'articles') {
    return (
      <ArticlesScreen
        onOpenArticle={(slug) => setRoute({ kind: 'article', slug })}
        onBack={backToTab}
      />
    )
  }

  if (route.kind === 'article') {
    return (
      <ArticleScreen
        slug={route.slug}
        onBack={() => setRoute({ kind: 'articles' })}
        onStartCta={(qs, label) => startSession(qs, 'article-cta', label)}
        onOpenArticle={(slug) => setRoute({ kind: 'article', slug })}
      />
    )
  }

  return (
    <div className="min-h-screen">
      <main className="max-w-md mx-auto">
        {tab === 'home' && (
          <HomeScreen
            onOpenSettings={() => setTab('settings')}
            onOpenArticles={() => setRoute({ kind: 'articles' })}
          />
        )}
        {tab === 'drill' && <DrillScreen onStartSession={startSession} />}
        {tab === 'stats' && <StatsScreen />}
        {tab === 'settings' && <SettingsScreen />}
      </main>
      <TabBar active={tab} onChange={setTab} />
    </div>
  )
}

export default App
