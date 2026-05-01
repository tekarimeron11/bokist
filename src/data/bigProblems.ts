import bigProblemsData from '../../content/big-problems.json'
import type { BigProblem } from '../types'

const raw = bigProblemsData as { version: number; problems: BigProblem[] }

export const BIG_PROBLEMS: BigProblem[] = raw.problems

export function findBigProblem(id: string): BigProblem | undefined {
  return BIG_PROBLEMS.find((p) => p.id === id)
}
