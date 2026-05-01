import { useMemo } from 'react'
import { marked } from 'marked'
import { findArticleBySlug } from '../data/articles'
import { questionsByTopic } from '../data/questions'
import type { Question } from '../types'

type Props = {
  slug: string
  onBack: () => void
  onStartCta: (questions: Question[], label: string) => void
}

export function ArticleScreen({ slug, onBack, onStartCta }: Props) {
  const article = findArticleBySlug(slug)
  const html = useMemo(() => {
    if (!article) return ''
    return marked.parse(article.body, { async: false }) as string
  }, [article])

  if (!article) {
    return (
      <div className="min-h-screen bg-paper px-5 py-8">
        <button onClick={onBack} className="text-sm text-ink-soft">← 戻る</button>
        <p className="mt-4">記事が見つかりません</p>
      </div>
    )
  }

  const ctaQuestions: Question[] = (() => {
    if (article.topicIds.length === 0) return []
    const seen = new Set<string>()
    const out: Question[] = []
    for (const tid of article.topicIds) {
      for (const q of questionsByTopic(tid)) {
        if (!seen.has(q.id)) {
          seen.add(q.id)
          out.push(q)
        }
      }
    }
    return out
  })()

  return (
    <div className="min-h-screen bg-paper">
      <header className="px-5 pt-4 pb-3 sticky top-0 bg-paper/90 backdrop-blur z-10 border-b border-line">
        <button onClick={onBack} className="text-sm text-ink-soft" aria-label="戻る">← 戻る</button>
      </header>
      <main className="px-5 pb-32 max-w-md mx-auto">
        <div className="text-[10px] tracking-[0.2em] uppercase text-ink-soft mt-4">
          {categoryLabel(article.category)} · {article.readingMinutes}分
        </div>
        <h1 className="font-serif text-2xl mt-2 leading-tight">{article.title}</h1>
        {article.description && (
          <p className="text-sm text-ink-soft mt-2 leading-relaxed">{article.description}</p>
        )}
        <article
          className="prose-bokist mt-6"
          dangerouslySetInnerHTML={{ __html: html }}
        />
        {ctaQuestions.length > 0 && (
          <button
            onClick={() => onStartCta(ctaQuestions.slice(0, 10), `${article.title} の例題`)}
            className="mt-8 w-full bg-ink text-white py-4 rounded-2xl text-sm font-medium"
          >
            この記事の例題に挑戦（{Math.min(ctaQuestions.length, 10)}問）
          </button>
        )}
      </main>
    </div>
  )
}

function categoryLabel(c: string): string {
  return ({
    'exam-overview': '試験概要',
    'strategy': '合格戦略',
    'basics': '基本',
    'chapter-guide': '章解説',
    'pitfalls': '落とし穴',
    'checklist': 'チェックリスト',
  } as Record<string, string>)[c] ?? c
}
