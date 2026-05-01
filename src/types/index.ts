export type AccountCategory = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense'

export type TopicId =
  | 'shouhin-sanbunpou-shiire' | 'shouhin-sanbunpou-uriage'
  | 'shouhin-henpin'           | 'shouhin-credit'
  | 'genkin-kabusoku'          | 'genkin-kogucchi' | 'genkin-tozakarikoshi'
  | 'tegata-yakusoku'          | 'tegata-denshi'
  | 'urikake-kessai'           | 'urikake-hikiate-settei' | 'urikake-hikiate-shiyou'
  | 'kotei-shutoku'            | 'kotei-genkashoukyaku'   | 'kotei-baikyaku'
  | 'kyuryou-kyuryou'          | 'kyuryou-shahoken-nouhu'
  | 'keika-kurinobe'           | 'keika-mikoshi'
  | 'zeikin-shouhi'            | 'zeikin-houjin'
  | 'shihon-haitou'            | 'shihon-kabushiki'
  | 'sonota-teisei'            | 'sonota-shouhinken' | 'sonota-tatekae'
  | 'kessan-uriagegenka'
  | 'kessan-tanaorosi'
  | 'kessan-shoumouhin'
  | 'kessan-songshi-furikae'
  | 'kessan-kuriostsuekirieki'

export type ArticleCategory =
  | 'exam-overview'
  | 'strategy'
  | 'basics'
  | 'chapter-guide'
  | 'pitfalls'
  | 'checklist'

export type Article = {
  slug: string
  title: string
  description?: string
  category: ArticleCategory
  chapter?: ChapterId
  topicIds: TopicId[]
  body: string
  readingMinutes: number
  publishedAt: string
  updatedAt: string
}

export type AccountId = string

export type Account = {
  id: AccountId
  name: string
  category: AccountCategory
  isContra?: boolean
  chapters?: ChapterId[]
}

export type ChapterId =
  | 'shouhin'
  | 'genkin'
  | 'tegata'
  | 'urikake'
  | 'kotei'
  | 'kyuryou'
  | 'keika'
  | 'zeikin'
  | 'shihon'
  | 'sonota'
  | 'kessan'

export type Chapter = {
  id: ChapterId
  name: string
  order: number
  description?: string
}

export type SyllabusVersion = '2026' | '2027'
export type SyllabusProfile = '2026' | '2027' | 'both'

export type JournalLine = {
  account: AccountId
  amount: number
}

export type StructuredExplanation = {
  essence: string
  debitWhy: string
  creditWhy: string
  takeaway: string
  relatedSlugs?: string[]
}

export type Question = {
  id: string
  chapter: ChapterId
  topic: string
  topicId: TopicId
  difficulty: 1 | 2 | 3
  frequency: 1 | 2 | 3
  syllabusVersion: SyllabusVersion
  validFrom?: string
  validUntil?: string
  prompt: string
  hint?: string
  answer: {
    debit: JournalLine[]
    credit: JournalLine[]
  }
  explanation: string
  explanationStructured?: StructuredExplanation
  tags?: string[]
}

export type Attempt = {
  id: string
  questionId: string
  chapter: ChapterId
  correct: boolean
  answeredAt: string
  durationMs: number
  hintUsed: boolean
  answer: {
    debit: JournalLine[]
    credit: JournalLine[]
  }
}

export type ProgressStore = {
  version: 1
  attempts: Attempt[]
}

export type StudyMode = 'guided' | 'exam'

export type Settings = {
  version: 1
  syllabusProfile: SyllabusProfile
  excludePromissoryNotes: boolean
  reduceMotion: boolean
  soundEnabled: boolean
  studyMode: StudyMode
}

export type Meta = {
  schemaVersion: 1
  installedAt: string
  lastOpenedAt: string
  lastExportAt: string | null
}

export type ExportPayload = {
  app: 'bokist'
  schemaVersion: 1
  exportedAt: string
  meta: Meta
  progress: ProgressStore
  settings: Settings
}

// ─────────────────────────────────────────────────────────
// M5.A2 — 大型決算問題（第3問対策）
// ─────────────────────────────────────────────────────────

export type FinancialAdjustmentItem = {
  id: string
  prompt: string
  hint?: string
  expectedAnswer?: {
    debit: JournalLine[]
    credit: JournalLine[]
  }
  expectedAnswerMulti?: Array<{
    debit: JournalLine[]
    credit: JournalLine[]
  }>
  explanation: string
  topicId?: TopicId
}

export type TrialBalanceRow = {
  account: AccountId
  debit?: number
  credit?: number
}

export type BigProblem = {
  id: string
  title: string
  description?: string
  difficulty: 1 | 2 | 3
  trialBalance: TrialBalanceRow[]
  adjustments: FinancialAdjustmentItem[]
  estimatedMinutes: number
}

export type BigProblemAttempt = {
  id: string
  problemId: string
  startedAt: string
  finishedAt?: string
  answers: Record<string, Array<{ debit: JournalLine[]; credit: JournalLine[] }>>
  results: Record<string, boolean>
}

export type BigProgressStore = {
  version: 1
  attempts: BigProblemAttempt[]
}
