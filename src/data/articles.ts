import type { Article, ArticleCategory, ChapterId, TopicId } from '../types'

const rawArticles = import.meta.glob<string>('../../content/articles/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
})

function parseFrontmatter(raw: string): { meta: Record<string, unknown>; body: string } {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)
  if (!m) return { meta: {}, body: raw }
  const yaml = m[1]
  const body = m[2]
  const meta: Record<string, unknown> = {}
  for (const line of yaml.split(/\r?\n/)) {
    const kv = line.match(/^([a-zA-Z_][\w-]*):\s*(.*)$/)
    if (!kv) continue
    const key = kv[1]
    const valueRaw = kv[2].trim()
    meta[key] = parseYamlValue(valueRaw)
  }
  return { meta, body }
}

function parseYamlValue(s: string): unknown {
  if (s === 'null' || s === '') return null
  if (s === 'true') return true
  if (s === 'false') return false
  if (/^\[.*\]$/.test(s)) {
    const inner = s.slice(1, -1).trim()
    if (!inner) return []
    return inner
      .split(',')
      .map((x) => x.trim())
      .map((x) => x.replace(/^['"]|['"]$/g, ''))
  }
  if (/^-?\d+$/.test(s)) return Number(s)
  return s.replace(/^['"]|['"]$/g, '')
}

function buildArticle(raw: string): Article {
  const { meta, body } = parseFrontmatter(raw)
  return {
    slug: String(meta.slug ?? ''),
    title: String(meta.title ?? ''),
    description: meta.description ? String(meta.description) : undefined,
    category: meta.category as ArticleCategory,
    chapter: meta.chapter ? (meta.chapter as ChapterId) : undefined,
    topicIds: (Array.isArray(meta.topicIds) ? meta.topicIds : []) as TopicId[],
    body,
    readingMinutes: Number(meta.readingMinutes ?? 5),
    publishedAt: String(meta.publishedAt ?? ''),
    updatedAt: String(meta.updatedAt ?? ''),
  }
}

export const ARTICLES: Article[] = Object.values(rawArticles)
  .map(buildArticle)
  .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))

export const articlesByTopicId = new Map<TopicId, Article[]>()
export const articlesByChapterId = new Map<ChapterId, Article[]>()

for (const a of ARTICLES) {
  for (const tid of a.topicIds) {
    const arr = articlesByTopicId.get(tid) ?? []
    arr.push(a)
    articlesByTopicId.set(tid, arr)
  }
  if (a.chapter) {
    const arr = articlesByChapterId.get(a.chapter) ?? []
    arr.push(a)
    articlesByChapterId.set(a.chapter, arr)
  }
}

/**
 * REQUIREMENTS.md §7.7 順方向アルゴリズム（R-043）
 */
export function relatedArticles(topicId: TopicId, chapter: ChapterId, limit = 3): Article[] {
  const seen = new Set<string>()
  const result: Article[] = []
  for (const a of articlesByTopicId.get(topicId) ?? []) {
    if (!seen.has(a.slug)) {
      seen.add(a.slug)
      result.push(a)
    }
    if (result.length >= limit) break
  }
  if (result.length < limit) {
    for (const a of articlesByChapterId.get(chapter) ?? []) {
      if (!seen.has(a.slug)) {
        seen.add(a.slug)
        result.push(a)
      }
      if (result.length >= limit) break
    }
  }
  return result.slice(0, limit)
}

export function findArticleBySlug(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug)
}
