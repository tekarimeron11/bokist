import { useState } from 'react'
import { TabBar, type TabId } from './components/TabBar'
import { DrillScreen } from './screens/DrillScreen'
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
  | { kind: 'article'; slug: string }
  | { kind: 'settings' }

function App() {
  const [tab, setTab] = useState<TabId>('articles')
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

  if (route.kind === 'article') {
    return (
      <ArticleScreen
        slug={route.slug}
        onBack={backToTab}
        onStartCta={(qs, label) => startSession(qs, 'article-cta', label)}
        onOpenArticle={(slug) => setRoute({ kind: 'article', slug })}
      />
    )
  }

  if (route.kind === 'settings') {
    return <SettingsScreen onBack={backToTab} />
  }

  return (
    <div className="min-h-screen">
      <main className="max-w-md mx-auto">
        {tab === 'articles' && (
          <ArticlesScreen
            onOpenArticle={(slug) => setRoute({ kind: 'article', slug })}
            onOpenSettings={() => setRoute({ kind: 'settings' })}
          />
        )}
        {tab === 'drill' && <DrillScreen onStartSession={startSession} />}
      </main>
      <TabBar active={tab} onChange={setTab} />
    </div>
  )
}

export default App
