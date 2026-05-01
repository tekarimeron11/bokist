import journalsData from '../../content/journals.json'
import type { ChapterId, Question } from '../types'
import { isQuestionAvailable } from '../lib/syllabus'
import type { SyllabusProfile } from '../types'

const raw = journalsData as { version: number; questions: Question[] }

export const QUESTIONS: Question[] = raw.questions

export function questionsByChapter(chapterId: ChapterId): Question[] {
  return QUESTIONS.filter((q) => q.chapter === chapterId)
}

export function questionsByTopic(topicId: string): Question[] {
  return QUESTIONS.filter((q) => q.topicId === topicId)
}

export function availableQuestions(profile: SyllabusProfile, now: Date = new Date()): Question[] {
  return QUESTIONS.filter((q) => isQuestionAvailable(q, profile, now))
}

export function pickRandom<T>(items: T[], n: number, rng: () => number = Math.random): T[] {
  if (items.length <= n) return [...items].sort(() => rng() - 0.5)
  const pool = [...items]
  const result: T[] = []
  for (let i = 0; i < n; i++) {
    const idx = Math.floor(rng() * pool.length)
    result.push(pool.splice(idx, 1)[0])
  }
  return result
}
