import { useMemo } from 'react'
import { marked } from 'marked'
import { findArticleBySlug } from '../data/articles'
import { questionsByTopic } from '../data/questions'
import type { Question } from '../types'

type Props = {
  slug: string
  onBack: () => void
  onStartCta: (questions: Question[], label: string) => void
  onOpenArticle?: (slug: string) => void
}

export function ArticleScreen({ slug, onBack, onStartCta, onOpenArticle }: Props) {
  function handleBodyClick(e: React.MouseEvent<HTMLElement>) {
    if (!onOpenArticle) return
    const target = e.target as HTMLElement
    const a = target.closest('a')
    if (!a) return
    const href = a.getAttribute('href') ?? ''
    const m = href.match(/^\/articles\/([\w-]+)\/?$/)
    if (m) {
      e.preventDefault()
      onOpenArticle(m[1])
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
  }

  const article = findArticleBySlug(slug)
  const html = useMemo(() => {
    if (!article) return ''
    return marked.parse(article.body, { async: false }) as string
  }, [article])

  if (!article) {
    return (
      <div className="min-h-screen px-6 py-8">
        <button onClick={onBack} className="text-coral text-sm">← 戻る</button>
        <p className="mt-4 font-serif italic">記事が見つかりません</p>
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
    <div className="min-h-screen">
      <header
        className="sticky top-0 z-20 px-5 pt-4 pb-3 backdrop-blur"
        style={{ background: 'rgba(255,245,236,0.75)', borderBottom: '1px solid rgba(255,255,255,0.6)' }}
      >
        <button onClick={onBack} className="text-coral text-[13px] tracking-wider" aria-label="戻る">
          ← 戻る
        </button>
      </header>
      <main className="px-6 pb-32 pt-5 max-w-md mx-auto animate-rise">
        <span className="eyebrow">
          {categoryLabel(article.category)} · {article.readingMinutes} min
        </span>
        <h1 className="font-serif font-normal text-[32px] mt-3 leading-[1.15] tracking-[-0.015em]">
          {article.title}
        </h1>
        {article.description && (
          <p className="text-[14px] font-serif italic text-ink-soft mt-3 leading-[1.65]">
            {article.description}
          </p>
        )}
        <article
          className="prose-bokist mt-6"
          dangerouslySetInnerHTML={{ __html: html }}
          onClick={handleBodyClick}
        />
        {ctaQuestions.length > 0 && (
          <button
            onClick={() => onStartCta(ctaQuestions.slice(0, 10), `${article.title} の例題`)}
            className="peach-button mt-8 w-full py-4 rounded-[18px] text-sm font-medium tracking-wider"
          >
            この記事の例題に挑戦（{Math.min(ctaQuestions.length, 10)}問）→
          </button>
        )}
      </main>
    </div>
  )
}

function categoryLabel(c: string): string {
  return ({
    'exam-overview': '試験概要',
    'strategy':      '合格戦略',
    'basics':        '基本',
    'chapter-guide': '章解説',
    'pitfalls':      '落とし穴',
    'checklist':     'チェックリスト',
  } as Record<string, string>)[c] ?? c
}
