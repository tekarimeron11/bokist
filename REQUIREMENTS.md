# Bokist 要件定義書 v2.3

> 日商簿記3級学習サイト
> 主人 → 先輩（20代女性）への個人プレゼント
> 2026-05-01 v1 起草 → v1.1〜v1.4 → v2.0 → v2.1 → v2.2 → v2.3（解説スキーマ拡張・用語ポップアップ・T字勘定・Soft Paper デザイン採用） / Stella

---

## 1. プロジェクト概要

### 1.1 背景
- ユーザー（先輩・20代女性）が日商簿記3級を受験予定。
- 主人が学習補助サイトを作って渡す。マネタイズなし、個人利用。
- 通学・通勤中のスキマ時間にスマホで使うことを想定。

### 1.2 ゴール
- 第1問（仕訳・配点45点）の**頻出論点26個を90%以上網羅**し、スキマ時間で反復練習できる状態にする。
- 第3問（決算問題・配点35点）対策を後追加し、合計80点超えを狙える学習ツールに育てる。
- 学習データはローカル保存しつつ、ブラウザデータ削除や端末変更でも先輩が自分でバックアップ取れるようにする。

### 1.3 非ゴール
- 不特定多数への配布・収益化はしない。
- 第2問（補助簿等・配点20点）対策は本アプリでは作らない（市販テキスト推奨）。
- アカウント機能・多端末同期は当初スコープ外（将来 Supabase 移行で対応可能性）。

---

## 2. 試験の前提（リサーチ結果サマリ）

### 2.1 試験概要
| 項目 | 内容 |
|------|------|
| 試験時間 | 60分 |
| 満点 | 100点 |
| 合格基準 | 70点以上 |
| 大問構成 | 第1問（45点・仕訳15問） / 第2問（20点） / 第3問（35点・決算） |
| 受験形式 | 統一試験（年3回・紙） / ネット試験（CBT・随時） |
| 受験料 | 3,300円（税込）+ ネット試験は事務手数料550円 |
| 合格率 | 統一試験 28〜42%、ネット試験 39〜41% |

### 2.2 戦略的配点（合格圏 65〜85点想定）
- 第1問: 45点中 38〜45点 ← **本アプリで全力対策**
- 第3問: 35点中 20〜25点 ← フェーズ2で対策
- 第2問: 20点中  7〜15点 ← 市販テキストで対応

### 2.3 受験タイミング前提（Q-04 確定）
- 先輩の受験予定は **2026年度試験（2026年6月 統一試験〜2027年2月 統一試験）または同期間のネット試験** を想定。
- 2027年4月1日施行の改定範囲は v1 ではターゲット外。
- ただし将来の改定対応のため、**問題に `syllabusVersion` メタデータを持たせて拡張余地を残す**（後述 §7.1）。

### 2.4 シラバス・プロファイル仕様（2027改定対応）
2027年改定の対象論点は以下：

| 論点 | 改定内容 | v1 での扱い |
|------|---------|-----------|
| 手形（受取・支払） | 廃止 | v1 では出題対象、syllabusVersion: "2026" |
| 電子記録債権・債務 | 維持・強化 | 全プロファイルで出題対象 |
| 普通預金 | 「現金預金」に明記 | 表現変更のみ。出題実質変化なし |
| クレジット売掛金 | キャッシュレス対応追記 | 文言追加のみ |
| 売上原価勘定 | 2級→3級へ | syllabusVersion: "2027" で出題 |
| 固定資産除却 | 2級→3級へ | syllabusVersion: "2027" で出題 |
| 定率法 | 2級→3級へ | syllabusVersion: "2027" で出題（基礎レベル） |

各問題に以下を付与する：
- `syllabusVersion: "2026" | "2027"` … 主たる適用シラバス（単一の列挙値で2値のみ。`"2027+"` は使わない）
- `validFrom?: string` … 適用開始日（ISO8601、省略時は全期間有効）
- `validUntil?: string` … 適用終了日（手形が2027/4で廃止等。比較は **半開区間 [validFrom, validUntil)** で評価）

ユーザー設定 `syllabusProfile: "2026" | "2027" | "both"` で表示対象を切替可能（v1 は "2026" 固定）。

### 問題の有効性判定アルゴリズム（採用ロジック）
出題候補 `Question q` が現時刻 `now: Date` で利用可能か判定する関数：

```ts
function isQuestionAvailable(q: Question, profile: SyllabusProfile, now: Date): boolean {
  // 1) プロファイル一致（"both" のみ全シラバス対象）
  if (profile !== 'both' && q.syllabusVersion !== profile) return false
  // 2) 有効期間（半開区間 [validFrom, validUntil) ）
  //    日付パースは parseSyllabusDate を使用（下記）
  //    Invalid Date を返した場合は出題候補から除外（false を返す）
  if (q.validFrom) {
    const from = parseSyllabusDate(q.validFrom)
    if (Number.isNaN(from.getTime())) return false
    if (from.getTime() > now.getTime()) return false
  }
  if (q.validUntil) {
    const until = parseSyllabusDate(q.validUntil)
    if (Number.isNaN(until.getTime())) return false
    if (until.getTime() <= now.getTime()) return false
  }
  return true
}
```

#### 日付パース仕様（`parseSyllabusDate`）
- 入力フォーマットは2種類のみ受け付け、それ以外は **検証エラー（Invalid Date）として扱い、その問題は出題候補から除外**:
  - **A. 日付のみ**: `YYYY-MM-DD`（例: `"2027-04-01"`） → **JST 00:00:00 (UTC+09:00) として正規化**
  - **B. 日時+オフセット**: ISO8601 with timezone（例: `"2027-04-01T00:00:00+09:00"` または `"...Z"`） → そのままパース
- 形式 A は `new Date(str)` の素のパース（UTC として解釈される実装が多い）に頼らず、**`new Date('${YYYY}-${MM}-${DD}T00:00:00+09:00')` 相当に変換**して生成する。
- 形式 B でタイムゾーン省略のローカル時刻（`"2027-04-01T00:00:00"`）は曖昧なため**禁止**（Invalid Date 扱い）。
- 結果が `Number.isNaN(date.getTime())` なら検証エラー（出題候補から除外）。
- 比較は半開区間 [validFrom, validUntil) で、左側包含・右側非包含。

#### 比較日基準（`now`）
- アプリ実行時の `Date.now()` をそのまま `Date` として使用（タイムゾーンは Date 内部表現で一意）。
- 比較は ms 単位の数値比較（`from.getTime() > now.getTime()`）で実施するため、JST/UTC 表現に依存しない（基準は世界時刻の絶対値）。

---

## 3. ユースケース

| UC-ID | ユースケース | 利用シーン |
|-------|------------|----------|
| UC-01 | 仕訳ドリルを5問だけサクッとやる | 通学電車の中（2〜3分） |
| UC-02 | 章を選んで集中的に練習 | 自宅・カフェで腰を据えて |
| UC-03 | 苦手論点だけ復習 | 試験直前 |
| UC-04 | 関連記事を読んで理解する | 間違えた直後・気になる論点を深掘り |
| UC-05 | 学習進捗を確認してモチベ維持 | 毎朝の習慣チェック |
| UC-06 | データをエクスポートしてバックアップ | 端末変更前・週次定期 |
| UC-07 | バックアップをインポートして復元 | 端末変更後・データ消失時 |

---

## 4. 機能要件

### 4.1 フェーズ1（MVP）— 第1問対策

#### 学習機能
| ID | 要件 | 優先度 |
|----|------|--------|
| R-001 | 仕訳問題を1問ずつ表示し、借方・貸方の勘定科目と金額をユーザーが入力できる | 必須 |
| R-002 | 勘定科目は5分類（資産・負債・純資産・収益・費用）でカラーコード化し、ピル形式から選択できる | 必須 |
| R-003 | 金額入力は数値キーボード起動（inputmode="numeric"）で、自動カンマ区切り表示する | 必須 |
| R-004 | 解答後に正誤判定と解説を表示する | 必須 |
| R-005 | 採点は §8.4 の正規化ルール適用後に「借方・貸方すべての勘定科目・金額が一致」した場合のみ正答（部分点なし） | 必須 |
| R-006 | 1セッションは10問構成（章選択時）または5問構成（クイックドリル時） | 必須 |
| R-007 | 章選択画面から各章を選んで出題できる | 必須 |
| R-008 | 「クイックドリル（全章ランダム5問）」「苦手復習」モードを提供する | 必須 |
| R-009 | 「苦手復習」は正答率50%未満の論点から優先出題（試行回数3回以上を母集団） | 必須 |
| R-010 | 各問題に1〜2行の解説テキストを付ける | 必須 |
| R-011 | 「ヒント」ボタンで部分的なヒント（カテゴリ表示など）を出せる | 任意 |
| R-012 | 学習モード：勘定科目をカラーピル選択。本番寄せモード：色分け薄め＋カテゴリ非表示で本番試験のUI寄せ | 任意 |

#### コンテンツ
| ID | 要件 | 優先度 |
|----|------|--------|
| R-020 | 仕訳問題は最低 52問（26論点 × 約2問）を v1 に初期搭載する | 必須 |
| R-021 | フェーズ1のコンテンツは **`research/journal-patterns.md` の26論点中90%以上を網羅** すること（§1.2 ゴール）| 必須 |
| R-022 | 章は §7.4 の10章で構成する | 必須 |
| R-023 | フェーズ1.5 で +52問（合計104問、26論点×各4問）を追加する | 任意 |

#### 進捗管理
| ID | 要件 | 優先度 |
|----|------|--------|
| R-030 | 解いた問題ID、正誤、解答日時、所要時間を全件 localStorage に記録する | 必須 |
| R-031 | 章ごとの正答率と全体の進捗率（％）を表示する | 必須 |
| R-032 | 連続学習日数（streak）をホーム画面に表示する | 必須 |
| R-033 | 週次の学習量（解いた問題数）をバーチャートで可視化する | 必須 |
| R-034 | 統計値は attempts から動的に集計する。キャッシュは v1 では持たない（パフォーマンス問題が出てから検討） | 必須 |

#### 解説記事（フェーズ1.5以降）
学習補助として、初学者向けの**読み物形式の解説記事**を提供する。
スライドではなく、スマホでスクロール読みできるブログ記事スタイル。

| ID | 要件 | 優先度 |
|----|------|--------|
| R-040 | 解説記事を `content/articles/*.md` に Markdown で執筆し、ビルド時に HTML 変換する | 必須 |
| R-041 | 記事はカテゴリ：(a) 試験概要・受験手続き、(b) 合格戦略、(c) 簿記の基本（5分類・借方/貸方）、(d) 各章の要点、(e) よくある落とし穴、(f) 試験前日チェックリスト の6カテゴリで提供 | 必須 |
| R-042 | 記事一覧画面 / 記事個別画面を提供する | 必須 |
| R-043 | **問題の結果画面**に、当該問題の `topicId` / `chapterId` で紐付く関連記事へのリンクを表示する（学習動線の中核）。優先順位は **topicId 一致 → chapterId 一致 → 0件で「準備中」表示**（§7.7 順方向アルゴリズム参照） | 必須 |
| R-044 | **記事個別画面**の末尾に、紐付く `topicIds` の練習問題への遷移ボタンを表示する。`topicIds` が空配列の章解説等では CTA 非表示（§7.7 逆方向アルゴリズム参照） | 必須 |
| R-045 | 記事のサポートライブラリは `marked`（軽量・約20KB）を採用、reveal.js は不採用 | 必須 |
| R-046 | 記事執筆優先度：**M4リリース時**に最低 6記事（試験概要・合格戦略・5分類入門・借方貸方の覚え方・10章のうち頻出3章の要点・試験前日チェックリスト）を含める | 必須（M4） |

> **R-040〜R-046 は v1 スコープ外**。M4（フェーズ1.5）でリリース。M2（フェーズ1完了）では問題ドリル＋結果画面のみで、結果画面の関連記事セクションは「準備中」表示のみ。

#### バックアップ・ITP対策
| ID | 要件 | 優先度 |
|----|------|--------|
| R-050 | 設定画面に「学習データをエクスポート（JSON）」ボタンを設置 | 必須 |
| R-051 | 設定画面に「学習データをインポート（JSON）」ボタンを設置 | 必須 |
| R-052 | エクスポートJSONには `schemaVersion`、エクスポート日時、attempts 全件、settings を含める | 必須 |
| R-053 | 初回起動時にPWAインストール案内モーダルを表示（ホーム画面追加でITP回避） | 必須 |
| R-054 | 最終エクスポート日から **7日経過した場合、ホーム画面にバックアップ提案バナー** を表示 | 必須 |
| R-055 | ホームの目立つ位置に「最終バックアップ：◯日前」表示 | 必須 |
| R-056 | エクスポートはホーム画面からワンタップで実行できる導線（設定経由でなく） | 必須 |

### 4.2 フェーズ2 — 第3問対策（後追加）

| ID | 要件 | 優先度 |
|----|------|--------|
| R-101 | 決算整理仕訳のドリルを提供する（10論点） | 必須 |
| R-102 | 精算表 / 財務諸表 / 後T/B の3形式の練習問題を提供する | 任意 |
| R-103 | 売上原価算定（しーくり、くりしー）専用ドリルを設ける | 必須 |
| R-104 | 計算が必要な論点は計算式の途中表示・誘導を行う | 任意 |

### 4.3 フェーズ3 — 補強（任意）

| ID | 要件 | 優先度 |
|----|------|--------|
| R-201 | 模擬試験モード（60分タイマー・第1問+第3問構成） | 任意 |
| R-202 | 勘定科目フラッシュカード機能 | 任意 |
| R-203 | 友達招待機能（URL共有のみ、データは独立） | 任意 |

---

## 5. 画面構成

```
┌─ Bottom Tab Navigation ─┐
│ 1. ホーム                │
│ 2. ドリル                │
│ 3. 進捗                  │
│ 4. 設定                  │
└──────────────────────────┘
（記事一覧/個別はフェーズ1.5以降。結果画面 S-04 から関連記事へ遷移）
```

| 画面ID | 画面名 | 主機能 |
|--------|-------|--------|
| S-01 | ホーム | 連続学習バッジ、今日の進捗、続きから再開、クイックドリル入口、最終バックアップ表示 |
| S-02 | 章一覧 | 章別の正答率と進捗、章選択 |
| S-03 | 問題（Quiz） | 取引文表示、勘定科目選択、金額入力、答え合わせ |
| S-04 | 結果 | 正誤、解説、関連記事リンク（R-043）、次の問題へ |
| S-05 | 進捗ダッシュボード | 週次バーチャート、章別正答率、苦手論点リスト |
| S-06 | 設定 | エクスポート/インポート、学習モード切替、シラバスプロファイル（拡張余地） |
| S-07 | 記事一覧 | カテゴリ別の記事リスト、検索（フェーズ1.5） |
| S-08 | 記事個別 | Markdown→HTML レンダリング、末尾に該当 `topicIds`（複数）の問題を統合した CTA（R-044・§7.7 逆方向アルゴリズム） |

---

## 6. データモデル（localStorage）

### 6.1 ストレージ抽象化レイヤー
- `src/storage/` 配下に集約。直接 `localStorage` を呼ばない。
- 将来 Supabase 移行時はこの層だけ差し替える。

### 6.2 キー設計
```
bokist:meta              // バージョン情報・最終バックアップ日時
bokist:progress:v1       // 学習履歴（解答ログ全件）
bokist:settings:v1       // ユーザー設定
```

> **`bokist:stats:v1` は v1 では作らない**（attempts から動的算出。キャッシュ不整合リスク回避）

### 6.3 スキーマ（v1）

#### bokist:meta
```ts
{
  schemaVersion: 1,
  installedAt: "2026-05-01T00:00:00Z",
  lastOpenedAt: "2026-05-05T09:41:00Z",
  lastExportAt: "2026-05-04T20:00:00Z" | null
}
```

#### bokist:progress:v1
```ts
{
  version: 1,
  attempts: Array<{
    id: string,                  // UUID v4
    questionId: string,          // 例: "Q-shouhin-001"
    chapter: ChapterId,          // §7.4 の永続ID（10章 enum のいずれか）
    correct: boolean,
    answeredAt: string,          // ISO8601
    durationMs: number,          // 0以上の整数（ミリ秒）
    hintUsed: boolean,
    answer: {                    // ユーザーの解答（採点比較キー）
      debit: Array<{ account: AccountId, amount: number }>,   // AccountId は §7.2 の永続ID
      credit: Array<{ account: AccountId, amount: number }>   // amount は 0 以上の整数（円）
    }
  }>
}
```

> **採点比較は `AccountId` のみで行う**（§8.4）。表示用の勘定科目名はマスタ参照で動的解決。

#### bokist:settings:v1
```ts
{
  version: 1,
  syllabusProfile: "2026",      // "2026" | "2027" | "both"（v1 は "2026" 固定）
  excludePromissoryNotes: false, // 2027改定時のクイック除外
  reduceMotion: false,
  soundEnabled: true,
  studyMode: "guided"           // "guided"（学習向け）| "exam"（本番寄せ）
}
```

### 6.4 マイグレーション戦略
- 起動時に `bokist:meta.schemaVersion` を確認。
- 古いバージョンが見つかったら `migrations/v1-to-v2.ts` 等で順次変換。
- マイグレーション失敗時：
  1. 旧データをそのまま温存し、エラーをユーザーに通知（「データ移行に失敗しました。サポートに連絡してください」）。
  2. 移行完了マーカー（`schemaVersion` 更新）はマイグレーション全体が成功した場合のみ書き込む（原子的更新）。

---

## 6.5 インポート / エクスポート契約

### エクスポート JSON フォーマット
```ts
{
  app: "bokist",
  schemaVersion: 1,
  exportedAt: string,           // ISO8601
  meta: { ... },
  progress: { version: 1, attempts: [...] },
  settings: { version: 1, ... }
}
```

### インポート処理仕様（R-051）
**前提**: ユーザーが選んだJSONを安全に復元する。**いかなる失敗でも既存データを破損させない**（完全拒否方針）。

#### 検証フェーズ（全てパスした場合のみ書き込みフェーズへ進む）
```
1. ファイル読み込み:
   1.1 ファイルサイズが 5MB 以下（超過 → エラー表示「ファイルが大きすぎます（5MB以下にしてください）」、中断）
   1.2 FileReader で文字列読み込み（読み込み失敗 → エラー表示「ファイルを読み込めませんでした」、中断、再試行可能）
2. JSONパース（失敗 → エラー表示、中断）
3. ペイロード形式検証:
   3.1 root が object か
   3.2 app === "bokist"
   3.3 schemaVersion が number で 1 以上
   3.4 exportedAt が ISO8601 文字列
   3.5 meta / progress / settings が必須オブジェクトとして存在
4. schemaVersion 互換判定:
   - schemaVersion > CURRENT_SCHEMA_VERSION → 「新しい形式のデータです。アプリを更新してください」（中断）
   - schemaVersion < CURRENT → migration 関数経由で変換（migration 例外時はそのまま中断・既存データ温存）
   - schemaVersion === CURRENT → そのまま検証続行
5. meta スキーマ検証:
   - schemaVersion が一致
   - installedAt / lastOpenedAt が ISO8601
   - lastExportAt が ISO8601 または null
6. progress スキーマ検証:
   - version === 1
   - attempts が配列
   - 各 attempt について：
     - id: 非空 string
     - questionId: 非空 string（"Q-..." 形式の正規表現）
     - chapter: §7.4 の ChapterId enum 10値のいずれか
     - correct: boolean
     - answeredAt: ISO8601 文字列
     - durationMs: 0以上の整数
     - hintUsed: boolean
     - answer.debit / answer.credit: 配列。各要素 { account: AccountId, amount: 0以上の整数 }
       - **`account` は §7.2 の勘定科目マスタに存在する AccountId のみ許可**（未知IDは検証エラー）
   - 1件でも検証失敗 → エラー表示「学習履歴の○件目が破損しています」、全体中断（部分インポートしない）
7. settings スキーマ検証:
   - version === 1
   - syllabusProfile: "2026" | "2027" | "both"
   - excludePromissoryNotes / reduceMotion / soundEnabled: boolean
   - studyMode: "guided" | "exam"
   - 不明なキーは無視（前方互換）
8. ここまで全パス → 書き込みフェーズへ
```

#### 書き込みフェーズ（原子的置換）
```
9. スナップショット取得:
   - 現状の meta / progress / settings を `bokist:snapshot:before-import:{ISO8601_timestamp}` に1キーで保存
   - 失敗時（quota exceeded等）→ 書き込み開始禁止、エラー表示「バックアップを作成できませんでした」、既存データ温存、中断
10. 原子的置換: settings → progress → meta の順に書き込み
   - 各書き込み後に直後の読み戻し検証（書き込みが反映されているか）
11. 書き込み中の任意の例外 → 即時ロールバック:
   - スナップショットから meta / progress / settings を復元
   - ロールバック失敗時 → 安全停止モード移行：
     - 全画面エラー表示「データ復旧に失敗しました。スナップショット {key} が残っています。アプリを閉じずに主人に連絡してください」
     - 自動的な追加書き込みを停止
     - スナップショットキーは削除しない
12. 成功時:
   - 「✓ 復元完了（{N}件のあなたの履歴を反映しました）」表示
   - 「取り消す」ボタンを24時間表示（押下でスナップショットから自動復元）
   - 24時間経過後にスナップショット自動削除（次回インポートまで保持しても良い）
```

### 互換性ルール
- 同一 schemaVersion: そのまま反映
- 旧 schemaVersion: マイグレーション経由（成功時のみ続行、失敗時は既存データ温存し中断）
- 新 schemaVersion: 拒否（アプリ更新案内）
- データ重複: インポート側で完全置換（マージしない・v1 方針）

### 失敗パス一覧（網羅）
| パス | 検出タイミング | 既存データ | ユーザー通知 | 再試行 |
|------|---------------|-----------|------------|------|
| ファイルサイズ超過（>5MB） | 検証フェーズ #1.1 | 温存 | 「ファイルが大きすぎます（5MB以下にしてください）」 | 別ファイルで再試行可 |
| ファイル読込失敗（FileReader 失敗） | 検証フェーズ #1.2 | 温存 | 「ファイルを読み込めませんでした」 | 同ファイルで再試行可 |
| JSONパース失敗 | 検証フェーズ #2 | 温存 | 「ファイルが壊れています」 | 別ファイルで再試行可 |
| スキーマ不一致 | 検証フェーズ #3〜#7 | 温存 | 具体的な不一致箇所を表示 | 別ファイルで再試行可 |
| 未知 AccountId | 検証フェーズ #6 | 温存 | 「データに未知の勘定科目が含まれています」 | 別ファイルで再試行可 |
| migration 例外 | 検証フェーズ #4 | 温存 | 「データ移行に失敗しました」 | 主人へ連絡 |
| スナップショット取得失敗 | 書き込みフェーズ #9 | 温存 | 「バックアップを作成できませんでした」 | 不要なデータ削除後に再試行 |
| 書き込み中例外 | 書き込みフェーズ #10〜#11 | スナップショットから復元 | 「復元失敗、ロールバックしました」 | 主人へ連絡 |
| ロールバック失敗 | 書き込みフェーズ #11 | **不確定（安全停止）** | スナップショットキー表示・連絡案内 | アプリを閉じない、主人へ連絡 |

---

## 7. コンテンツ仕様

### 7.1 問題JSONスキーマ
```ts
type Question = {
  id: string;                       // "Q-shouhin-001"
  chapter: ChapterId;               // §7.4 のEnum
  topic: string;                    // "三分法による仕入"（表示用日本語名）
  topicId: TopicId;                 // §7.7 の literal union（"shouhin-sanbunpou-shiire" 等）
  difficulty: 1 | 2 | 3;
  frequency: 1 | 2 | 3;
  syllabusVersion: "2026" | "2027"; // 主シラバス
  validFrom?: string;               // ISO8601 適用開始
  validUntil?: string;              // ISO8601 適用終了
  prompt: string;                   // 取引文
  hint?: string;                    // 短いヒント
  answer: {
    debit: Array<{ account: AccountId, amount: number }>;
    credit: Array<{ account: AccountId, amount: number }>;
  };
  explanation: string;              // 1〜2行の解説（後方互換用・必須）
  structured?: StructuredExplanation; // 構造化解説（§8.5 解説仕様、推奨・任意）
  tags?: string[];                  // ["手形", "改定対象"] など
};

type StructuredExplanation = {
  essence:   string;  // 取引の本質（1文・50〜80字）
  debitWhy:  string;  // 借方の理由（50〜80字）
  creditWhy: string;  // 貸方の理由（50〜80字）
  takeaway:  string;  // ポイント（≦30字）
};
```

#### 構造化解説の運用方針
- `explanation`（既存・必須）と `structured`（新規・任意）は併存。レンダリング側は `structured` があればそちらを優先表示し、無ければ `explanation` をフォールバック表示する。
- `structured` の各フィールド本文中には **`<Term>用語名</Term>` インラインタグ** を埋め込める（§8.5）。タグは glossary（§7.8）の `term` と完全一致する文字列のみ有効。
- 文字数バリデーション（ビルド時）：
  - `essence` / `debitWhy` / `creditWhy`: 各 30〜120字（半角換算ではなくコードポイント数）。50〜80字を推奨レンジ。
  - `takeaway`: 1〜30字。
  - 範囲逸脱はビルドエラー（`scripts/validate-content.ts` で検出）。
- 同一テンプレ内で同じ用語が複数回登場する場合、`<Term>` タグは **最初の1回のみ** 適用する（読みづらさ回避）。ビルド時に2回目以降のタグ化を検出して警告。

### 7.8 用語集（Glossary）スキーマ

`<Term>` タグの参照先となる用語マスタ。`src/data/glossary.ts` に literal union として定義。

```ts
export type GlossaryTerm = {
  term: string;           // 表示名（例: "三分法"）。<Term>のテキストと完全一致
  reading?: string;       // ふりがな（任意）。例: "さんぶんぽう"
  definition: string;     // 初学者向け定義（1〜2文・最大160字）
  category?:              // 任意の分類タグ
    | "principle"         // 原理・考え方（例: 三分法、発生主義）
    | "account"           // 勘定科目の補足（例: 買掛金、貸倒引当金）
    | "method"            // 処理方法（例: 差額補充法、間接法）
    | "instrument";       // 具体的な道具・媒介（例: 他人振出小切手、商品券）
  relatedTopicIds?: TopicId[];  // 関連論点（任意。任意のCTA表示に利用）
};

export type GlossaryTermName = string;  // ビルド時に literal union として narrow（後述）
```

**ビルド時バリデーション**:
1. `term` の重複禁止（全 GlossaryTerm 内で一意）。
2. `definition` の最大長 160 文字。
3. すべての `Question.structured.<field>` に含まれる `<Term>X</Term>` の `X` が、`GlossaryTerm.term` の集合に含まれること（孤立Termを禁止）。違反時はビルドエラー。
4. `glossary.ts` から `GlossaryTermName = "三分法" | "掛け" | ...` の literal union 型を自動生成（`scripts/build-glossary-types.ts`）し、`<Term>` レンダラに型レベル制約を与える（任意・MVPでは省略可）。

### 7.2 勘定科目マスタ
```ts
type Account = {
  id: AccountId;                    // "cash"
  name: string;                     // "現金"
  category: "asset" | "liability" | "equity" | "revenue" | "expense";
  isContra?: boolean;               // 評価勘定（貸倒引当金、減価償却累計額）
  chapters?: ChapterId[];           // 主に使われる章
};
```

### 7.3 章ID Enum（§全コンポーネント・データで共通使用）
```ts
type ChapterId =
  | "shouhin"      // 商品売買
  | "genkin"       // 現金・預金
  | "tegata"       // 手形・電子記録債権/債務
  | "urikake"      // 売掛・買掛・貸倒引当金
  | "kotei"        // 有形固定資産
  | "kyuryou"      // 給料・社会保険料
  | "keika"        // 経過勘定
  | "zeikin"       // 消費税・法人税
  | "shihon"       // 資本金・繰越利益剰余金
  | "sonota";      // その他（訂正・商品券・立替/仮払）
```

### 7.4 章マスタ（v1 確定 = 10章）

`research/journal-patterns.md` の26論点を全網羅。Q-02 確定。

```ts
const CHAPTERS: Chapter[] = [
  { id: "shouhin",  name: "商品売買",            order: 1 },
  { id: "genkin",   name: "現金・預金",          order: 2 },
  { id: "tegata",   name: "手形・電子記録",       order: 3 },
  { id: "urikake",  name: "売掛・買掛・貸倒",     order: 4 },
  { id: "kotei",    name: "有形固定資産",         order: 5 },
  { id: "kyuryou",  name: "給料・社会保険",       order: 6 },
  { id: "keika",    name: "経過勘定",             order: 7 },
  { id: "zeikin",   name: "消費税・法人税",       order: 8 },
  { id: "shihon",   name: "資本・剰余金",         order: 9 },
  { id: "sonota",   name: "その他",               order: 10 },
];
```

### 7.5 論点 ↔ 章マッピング（research/journal-patterns.md 由来）

| 章 | 論点ID（topicId） | 論点名 | 頻出度 |
|----|----------------|-------|------|
| shouhin | shouhin-sanbunpou-shiire | 三分法による仕入 | ★★★ |
| shouhin | shouhin-sanbunpou-uriage | 三分法による売上 | ★★★ |
| shouhin | shouhin-henpin           | 返品・値引       | ★★★ |
| shouhin | shouhin-credit           | クレジット売掛金 | ★★★ |
| genkin  | genkin-kabusoku          | 現金過不足       | ★★★ |
| genkin  | genkin-kogucchi          | 小口現金         | ★★★ |
| genkin  | genkin-tozakarikoshi     | 当座借越         | ★★ |
| tegata  | tegata-yakusoku          | 約束手形         | ★★★ |
| tegata  | tegata-denshi            | 電子記録債権・債務 | ★★★ |
| urikake | urikake-kessai           | 売掛・買掛の決済 | ★★★ |
| urikake | urikake-hikiate-settei   | 貸倒引当金の設定 | ★★★ |
| urikake | urikake-hikiate-shiyou   | 貸倒れの処理     | ★★★ |
| kotei   | kotei-shutoku            | 固定資産の取得   | ★★★ |
| kotei   | kotei-genkashoukyaku     | 減価償却（定額法）| ★★★ |
| kotei   | kotei-baikyaku           | 固定資産の売却   | ★★★ |
| kyuryou | kyuryou-kyuryou          | 給料の支払い     | ★★★ |
| kyuryou | kyuryou-shahoken-nouhu   | 社会保険料の納付 | ★★ |
| keika   | keika-kurinobe           | 繰延べ（前払・前受）| ★★★ |
| keika   | keika-mikoshi            | 見越し（未払・未収）| ★★★ |
| zeikin  | zeikin-shouhi            | 消費税（税抜方式）| ★★★ |
| zeikin  | zeikin-houjin            | 法人税等         | ★★ |
| shihon  | shihon-haitou            | 繰越利益剰余金・配当 | ★★ |
| shihon  | shihon-kabushiki         | 株式の発行       | ★ |
| sonota  | sonota-teisei            | 訂正仕訳         | ★★ |
| sonota  | sonota-shouhinken        | 商品券           | ★★ |
| sonota  | sonota-tatekae           | 立替金・仮払金   | ★★ |

**v1 で 52問搭載 = 26論点 × 各2問**。フェーズ1.5 で +52問 = 各論点4問。

#### topicId 命名規則
- ASCII 小文字 + ハイフン（kebab-case）のみ
- 形式: `{chapterId}-{識別子}` （例: `shouhin-sanbunpou-shiire`）
- 識別子は日本語のローマ字表記（ヘボン式または訓令式）。長音は省略（例: `kogucchi`、`shouhin`）。
- 数字・アンダースコア・非ASCII文字は禁止

### 7.6 記事スキーマ（フェーズ1.5）

```ts
type ArticleCategory =
  | "exam-overview"   // (a) 試験概要・受験手続き
  | "strategy"        // (b) 合格戦略
  | "basics"          // (c) 簿記の基本
  | "chapter-guide"   // (d) 各章の要点
  | "pitfalls"        // (e) よくある落とし穴
  | "checklist";      // (f) 試験前日チェックリスト

type Article = {
  slug: string;             // ASCII kebab-case（URLパス）。**全記事間で一意（不変条件）**
  title: string;            // 記事タイトル
  description?: string;     // 1行サマリ
  category: ArticleCategory;
  chapter?: ChapterId;      // 章解説の場合
  topicIds: TopicId[];      // §7.7 の TopicId（複数可、配列空でも可）
  body: string;             // Markdown 本文
  readingMinutes: number;   // 推定読了時間（分）
  publishedAt: string;      // ISO8601
  updatedAt: string;        // ISO8601
};
```

**不変条件**: `Article.slug` は全記事間で一意（重複禁止）。ビルド時に重複検出する。

### 7.7 記事 ↔ 問題の双方向リンク仕様

#### 索引構造（アプリ初期化時に1度だけ構築）
```ts
// すべて O(N+M) で初期化、取得時 O(1) + 結果件数 k のみ
articlesByTopicId:   Map<TopicId,   Article[]>   // updatedAt 降順で保持
articlesByChapterId: Map<ChapterId, Article[]>   // updatedAt 降順で保持
questionsByTopicId:  Map<TopicId,   Question[]>  // 元配列順
```
N: 全記事数、M: 全問題数。索引はメモリ上の immutable マップ。

#### 結果画面 (S-04) からの順方向リンク（R-043）
解いた問題 `q` に対する関連記事の取得アルゴリズム（最大3件）：

```
1. topic 候補取得:
   const topicCandidates = articlesByTopicId.get(q.topicId) ?? []
2. slug 重複除去（同一 slug は1件に圧縮）
3. 先頭から最大3件を採用（既に updatedAt 降順）
   const result: Article[] = topicCandidates.slice(0, 3) [重複除去後]
4. 残り枠 N = 3 - result.length が > 0 のとき:
   4.1 chapter 候補取得: articlesByChapterId.get(q.chapter) ?? []
   4.2 result 内の slug を除外
   4.3 N 件まで先頭から補充
5. 全体を最大3件で truncate（不変条件として redundant、保守的に実施）
6. 件数 0 の場合、UI に「関連記事は準備中」と表示
```

優先順位は **topicId 一致 ＞ chapterId 一致**。
不変条件 `Article.slug 一意` により step 2 / step 4.2 の重複除去は同一 slug 検出のみで十分。

#### 記事画面 (S-08) からの逆方向リンク（R-044）
記事 `a` から練習問題への遷移：

```
1. a.topicIds が空配列の場合 → CTA 非表示（章解説等のため）
2. それ以外：
   2.1 各 topicId について questionsByTopicId.get(topicId) を取得
   2.2 すべて連結（重複は q.id で除去）
   2.3 「この記事の例題に挑戦（N問）」ボタン表示、N = 連結後の件数
   2.4 タップで問題ドリルセッション開始
```

#### 共通 `TopicId` 型
将来の typo 検知のため、`src/types/index.ts` に literal union として定義：

```ts
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
  | 'sonota-teisei'            | 'sonota-shouhinken'      | 'sonota-tatekae'
```

`Question.topicId` と `Article.topicIds[]` の両方でこの型を採用し、ビルド時に typo を検出。
ビルド時バリデーションで `article.topicIds ⊆ Set(全問題の topicId)` を検証する。

---

## 8. 出題ロジック

### 8.1 章学習モード
- 章を選択 → §2.4 の `isQuestionAvailable(q, settings.syllabusProfile, now)` で利用可能な問題に絞り、その中から10問ランダム抽出（候補が10問未満なら候補全問）
- セッション内で同じ問題は出さない

### 8.2 クイックドリルモード
- 全章から `isQuestionAvailable` を通過した5問をランダム抽出
- 章重みは均等（章サイズに比例しない）
- 通学・通勤の2〜3分用

### 8.3 苦手復習モード
- 利用可能な問題のうち、ユーザーの試行回数3回以上 × 正答率50%未満を母集団に抽出
- 重み付けランダム選出（重み = 1 - 正答率）

### 8.4 採点正規化ルール

**採点比較キーは `AccountId` のみ**（表示名・カテゴリは比較に使わない）。

採点前に **借方ライン・貸方ライン** に対してそれぞれ以下の正規化を順に適用する：

1. **空行除去**: `account` が空文字 / 未定義 または `amount <= 0` の行を削除
2. **同一勘定の合算**: 同じライン内（debit / credit）に同一 `account`（AccountId）が複数あれば、`amount` を合算して1行に
3. **ソート**: `account` （AccountId）の辞書順で安定ソート

正規化後の `debit` 配列・`credit` 配列をそれぞれ正解と完全一致比較（要素数・各要素の `account` と `amount` が全て一致）。

正規化前の例：
```
debit:  [{ account: "purchase", amount: 50000 }, { account: "purchase", amount: 30000 }, { account: "cash", amount: 0 }]
credit: [{ account: "accounts_payable", amount: 80000 }]
```
正規化後：
```
debit:  [{ account: "purchase", amount: 80000 }]
credit: [{ account: "accounts_payable", amount: 80000 }]
```

学習効果を上げるため、**正規化前のユーザー入力も `attempts.answer` にそのまま記録**（不正解時のフィードバック分析用）。採点判定そのものは正規化後の比較で行う。

### 8.5 解説仕様（結果画面 S-04）

結果画面に表示する解説は、初学者が「読んだのに意味がわからない」状態に陥らないことを最優先する。本仕様は §7.1 `Question.structured`（StructuredExplanation）の表示・操作・検証を定義する。

#### 8.5.1 4要素表示モデル
1問の解説は **4ブロック** で構成する：

| ブロック | 見出し（UI） | フィールド | 推奨字数 |
|---------|------------|----------|---------|
| 取引の本質 | どんな取引？ | `essence`   | 50〜80字 |
| 借方の理由 | 借方の理由   | `debitWhy`  | 50〜80字 |
| 貸方の理由 | 貸方の理由   | `creditWhy` | 50〜80字 |
| ポイント   | ポイント     | `takeaway`  | ≦30字 |

- **ブロック間の縦余白** は等間隔（推奨 12〜16px）。各ブロックは **paper-warm** 背景の小カード or 区切り線で分離する。
- `essence` には借方・貸方という用語を出さない。`debitWhy` / `creditWhy` で初出させる（読者の認知負荷を下げる）。
- `takeaway` は **font-display（Marcellus + Noto Serif JP）** で1.1〜1.2倍サイズ、左に小さな印章モチーフ（`shadow-seal` 風）を添えてもよい。

#### 8.5.2 用語ポップアップ仕様（`<Term>` タグ）

`structured` の各フィールド本文中に埋め込まれた `<Term>用語名</Term>` を、レンダリング時に **インタラクティブな用語チップ** に変換する。

##### 表示
- ベース文字列に **下線（dotted underline 1px、color: `cocoa`）** を付与し、ポインタカーソルを変える。
- スクリーンリーダー向けに `<button>` 要素として実装し、`aria-describedby` で説明領域を関連づける。`role="button"`、`tabindex="0"` を担保。
- `prefers-reduced-motion: reduce` 時はアニメーション無効。

##### インタラクション
- **タップ / クリック / Enter / Space** でポップオーバー開閉（トグル）。
- ポップオーバーは画面下端から **底面シート（bottom sheet, 高さ自動）** で出現。背景は `paper-deep`、文字は `ink`。
- ポップオーバーの内容：
  1. 用語名（h3、`font-serif`）
  2. ふりがな（小さく `ink-faint`、`reading` がある場合のみ）
  3. 定義（`definition`、本文 14px）
  4. 関連論点リンク（`relatedTopicIds` がある場合、`pill` 形式で最大3件）
  5. 閉じるボタン（右上 ×）
- 閉じる手段：背景タップ / × ボタン / Esc キー / 別の `<Term>` タップ（自動的に新しい用語へ差し替え）。

##### グルーピング
- 同一画面内で同じ用語を複数回タップしても、表示する内容は同じ（毎回 fresh に開く）。
- ただし `structured` 1セット内では `<Term>` タグ化は **最初の1回のみ**（§7.1 ルール）。2回目以降は素のテキスト。

##### フォールバック
- `<Term>X</Term>` の `X` が glossary に存在しない場合（ビルド検証を通り抜けた場合の保険）、レンダラは **タグを除去した素のテキスト** を表示し、`console.warn` でログ出力。クラッシュしない。

#### 8.5.3 T字勘定（T-account）レンダリング

仕訳の構造を視覚化するため、結果画面の解説直下に **T字勘定の図** を表示する。これは **正解仕訳のみ** を可視化する読み物的補助で、入力UIではない。

##### 表示要件
- 各勘定科目について、横に並ぶ **T字** を1つ描画する。形式：

```
        勘定科目名
       ┌──────────┐
       │   ¥xxx   │  ← 借方残高側
   ────┼──────────┼────
       │          │  ← 貸方残高側
       └──────────┘
```

- **借方科目**（資産・費用）は左側に金額を、**貸方科目**（負債・純資産・収益）は右側に金額を表示する。仕訳1行に対して該当する側へ「+¥金額」を立てるアニメーションを順次実行（`anim-slide-up` 220ms / 行ごと60msスタガー）。
- 評価勘定（`isContra: true`、貸倒引当金・減価償却累計額）は通常の貸方扱い（資産のマイナスを貸方に立てる挙動）で描画。
- 借方ライン・貸方ラインを **§8.4 の正規化適用後** に描画する（同一勘定の合算後）。
- 色味は `sage`（借方）と `blush`（貸方）で薄く塗り分け、文字は `ink`、罫線は `line-strong`。

##### 文字・寸法
- 勘定科目名: `font-serif`、太字、14px、`ink`。
- 金額: `font-ledger`（DM Mono）、13px、右揃え、`tabular-nums`。
- T字の幅は最大 200px、高さ 56px を上限。複数勘定がある場合は横スクロール可（`overflow-x-auto`、最低タッチターゲット幅 56px）。

##### 簡略表示（small viewport）
- 画面幅 360px 未満では T字図を **横並び表ライン1本** のシンプル描画にダウングレード（折り畳み式の disclosure に格納）。

##### アクセシビリティ
- T字図には `<figure>` + `<figcaption>` を使い、`aria-label` に「{勘定科目名}: 借方 ¥X / 貸方 ¥Y」のテキストサマリを必ず添える。スクリーンリーダーは図ではなくこの要約を読み上げる。

#### 8.5.4 段階的ロールアウト
- **M2（フェーズ1完了）**: 4要素表示（8.5.1）と T字勘定（8.5.3）を実装。`<Term>` タグはビルド検証のみ通し、UI 上では下線スタイルのみ・タップ無効でフォールバック（無タグテキスト同等）。
- **M4（フェーズ1.5）**: `<Term>` ポップオーバー（8.5.2）と glossary（§7.8）を本格稼働。記事機能と同タイミング。
- 各 `Question.structured` は M2 リリース時に全52問で必須化。M2 の `<Term>` タグは「将来用にマークアップは入れておくが押せない」状態を許容する。

---

## 9. 非機能要件

### 9.1 PWA
- `vite-plugin-pwa` で Service Worker・Web App Manifest を生成
- ホーム画面追加対応（特に Safari ITP 対策）
- 初回起動時にインストール案内モーダル（R-053）
- オフラインでも問題を解ける（静的アセットのみキャッシュ）

### 9.2 デザイン

#### 9.2.1 全体方針 — Soft Paper / Editorial
- モバイルファースト（iPhone 14: 390×844 基準）。max-width 448px の中央揃え。
- **テーマ名**: Soft Paper（紙の温度感のあるエディトリアルスタイル）。レイアウトは雑誌の目次・印刷物に近い佇まい。
- 余白は広め（章カードの上下 padding 16〜20px、画面の左右パディング 20px）。
- 数字・金額は **tabular-nums** を強制。和文と欧文（数字）を混在させる箇所では和文側を `font-sans`、数字側を `font-ledger`（DM Mono）で書き分ける。

#### 9.2.2 カラーパレット（Tailwind 拡張色）

| トークン | 用途 | 値 |
|---------|------|---|
| `paper.DEFAULT` | 既定背景 | `#fdfaf6` |
| `paper.deep`    | カード背景・差別化背景 | `#f7f1e6` |
| `paper.warm`    | アクセント背景 | `#f3ebd9` |
| `ink.DEFAULT`   | 主要テキスト | `#2d2a26` |
| `ink.soft`      | 二次テキスト | `#5a544c` |
| `ink.faint`     | キャプション・補助 | `#8b8275` |
| `blush.DEFAULT` | 貸方アクセント / 注意系 | `#c98a8a` |
| `blush.soft` / `blush.deep` | バックアップバナー等 | `#f3e1e1` / `#8a4a4a` |
| `sage.DEFAULT`  | 借方アクセント / 成功系 | `#5a7d6f` |
| `sage.soft` / `sage.deep` | T字勘定の借方・正答ステップ | `#d9e4dd` / `#3a5a4d` |
| `iris.*` / `gold.*` / `cocoa.*` | カテゴリ補助・引用枠 | `#7a6593` / `#b08a3e` / `#7a5a45` 系 |
| `line.DEFAULT` / `line.strong` | 罫線・区切り | `#ebe4d9` / `#c9bfae` |
| `seal` | スタンプ・印章モチーフ | `#a83838` |

**5分類バッジ**（`badge-asset` / `liability` / `equity` / `revenue` / `expense`）は §6.x の独立クラスで定義し、上記パレットに含めない（タスク的な分類色のため）。

#### 9.2.3 タイポグラフィ
- `font-sans`: Noto Sans JP（300/400/500/700）。本文・UI ラベルの既定。
- `font-serif`: Noto Serif JP（500/700）。見出し・取引文の本文。
- `font-display`: Marcellus →（fallback）Noto Serif JP。雑誌的な大見出し・数字エンブレム。
- `font-ledger`: DM Mono → JetBrains Mono → ui-monospace。金額・T字勘定・通し番号。
- 小書きスタイル: `eyebrow`（10px / letter-spacing 0.22em / uppercase）、`micro`（11px）。両方ともセクションラベルや小カテゴリ表示に使う。

#### 9.2.4 レイアウト・コンポーネント
- **paper-card**: `bg-paper-deep`、`border border-line`、`rounded-card`（0.75rem）、`shadow-paper`。情報カードの基本形。
- **shadow-paper**: `0 1px 0 rgba(45,42,38,0.04), 0 8px 24px -12px rgba(45,42,38,0.10)`。紙の影に近い柔らかな2段影。
- **shadow-press**: ボタン押下感（凹み）。`0 1px 0 rgba(45,42,38,0.06)`。
- **shadow-seal**: 正答時のスタンプ演出に使用（`stamp` アニメと併用）。
- **rounded-card / rounded-field / rounded-sheet**: 0.75 / 0.5 / 1.5 rem。カード・フォーム・ボトムシート用に使い分け。
- **grid-bg**: 背景にうっすら `line` カラーのドット格子（22×22px）。設定画面など補助用途のみ。

#### 9.2.5 アニメーション
- `reveal` (0.5s) / `stamp` (0.45s) / `underline` (0.4s) / `pulse-soft` (1.6s loop) を Tailwind の `animation` 拡張で定義。
- `prefers-reduced-motion: reduce` 時、`reveal` / `stamp` / `pulse-soft` は **transform を消した opacity のみ** に縮約、または完全停止させる（CSS メディアクエリで上書き）。
- スタッガ表示は **60〜80ms 間隔** を上限とする（連打感を出さない）。

#### 9.2.6 学習モード切替（R-012 と整合）
- `studyMode: "guided"` 時は本仕様のフルカラー（資産/負債/純資産/収益/費用バッジ可視・<Term> 下線可視）。
- `studyMode: "exam"` 時はバッジを `badge-*` の彩度を 70% 程度に落とし、`<Term>` の dotted underline を非表示にして本番試験 UI に寄せる。色分けがゼロにはならないが、視認的な誘導を控える。

#### 9.2.7 アクセシビリティ補強
- すべての非テキスト UI（T字勘定、印章、バッジ）に **テキスト等価表現** を `aria-label` または `<figcaption>` で付与する（§9.4 と整合）。
- 数字の **OpenType `palt`**（プロポーショナルメトリクス）は和文ボディに適用、欧文数字には適用しない（読み間違い防止）。

### 9.3 性能
- 初回ロード 3秒以内（4G想定）
- バンドルサイズ 200KB gzipped 以内（初期目標）
- 60fps スクロール（特に低スペック端末で）

### 9.4 アクセシビリティ
- WCAG 2.1 AA 準拠を目指す
- カラーコントラスト比 4.5:1 以上
- フォーカスリング表示
- スクリーンリーダー対応（aria-label）
- `prefers-reduced-motion` 尊重

### 9.5 ブラウザ対応
- iOS Safari 16+
- Android Chrome 120+
- Desktop: Chrome / Safari / Firefox 最新版

### 9.6 ホスティング
- GitHub Pages（無料、HTTPS自動）
- リポジトリ: `tekarimeron11/bokist`（public）
- 公開URL: `https://tekarimeron11.github.io/bokist/`

---

## 10. 技術スタック

| 種別 | 技術 | 備考 |
|------|------|------|
| ビルド | Vite 8 | 高速HMR |
| UI | React 19 + TypeScript | 関数コンポーネント・hooks |
| スタイル | Tailwind CSS 3 | 抽象化なし、直接クラス |
| ルーティング | 自作（useState） | 画面数少ない |
| 状態管理 | useState + Context | Redux/Zustandは不採用 |
| ストレージ | localStorage（抽象化レイヤー越し） | 将来 Supabase 移行余地 |
| PWA | vite-plugin-pwa | manifest + SW |
| アイコン | 自作SVG / 絵文字 | 軽量重視 |
| Markdown→HTML | marked（約20KB gzipped） | 記事レンダリング用、フェーズ1.5 |

---

## 11. リリース計画

| マイルストーン | フェーズ | 必須機能 | 任意・延期項目 |
|---------------|---------|---------|--------------|
| M0 | 準備 | 要件定義 v2.x 確定（codex-review クリア） | — |
| M1 | コンテンツ | 仕訳問題52問（26論点 × 各2問） | 解説の文体磨き |
| M2 | フェーズ1 完了 | ホーム / ドリル / 結果（解説） / 進捗 / 設定。エクスポート/インポート、PWA、採点正規化、syllabus判定 | 関連記事セクションは「準備中」表示のみ |
| M3 | リリース | GitHub Pages デプロイ・先輩に共有 | — |
| M4 | フェーズ1.5 | **記事機能（R-040〜R-046、最低6記事）**、結果画面に関連記事リンク、記事画面のCTA、苦手復習の重み調整 | フェーズ1.5 で +52問 |
| M5 | フェーズ2 | 第3問（決算問題）対策 | 模擬試験モード |

---

## 12. リスクと対応

| リスク | 影響 | 対応 |
|-------|------|------|
| Safari ITP で localStorage が7日で消える | 学習履歴消失 | (1)PWA化＆ホーム画面追加案内 (2)7日未エクスポート警告 (3)起動時に最終バックアップ日表示 (4)ワンタップエクスポート導線 |
| ブラウザデータ削除で進捗消失 | 学習履歴消失 | エクスポート機能で先輩自身がバックアップ可能に |
| 2027年改定で出題範囲変更 | 古い論点が無駄になる | syllabusVersion 仕様で問題プロファイル切替（§2.4） |
| 問題データの正確性 | 誤った仕訳を覚える | Stella 監修+主人レビュー、issue 報告経路を用意 |
| インポート失敗でデータ破損 | 学習履歴消失 | スナップショット+原子的置換+取消機能（§6.5） |
| バンドルサイズ肥大 | 初回ロード遅延 | 章別問題JSONを動的import |

---

## 13. 確定事項（v1.1 で確定）

| ID | 項目 | 決定 |
|----|------|------|
| Q-01 | スライド機能を v1 に含めるか | **B: 後追加（フェーズ1.5）→ v2.0で解説記事に変更**（§4.1 R-040〜R-046） |
| Q-02 | 章構成 | **B: 26論点全網羅 = 10章構成**（§7.4） |
| Q-03 | 問題数 | **v1 は52問、フェーズ1.5 で+52問の段階リリース** |
| Q-04 | 受験タイミング | **2026年度試験（〜2027年2月）想定**。syllabusVersion で将来対応（§2.3） |
| Q-05 | リポジトリ公開設定 | **A: public**（`tekarimeron11/bokist`） |
| Q-06 | 学習補助コンテンツの実装 | **解説記事（Markdown + marked）**（v2.0で確定） |

---

## 14. 出典

リサーチ結果は以下に格納：
- `research/exam-overview.md`
- `research/journal-patterns.md`
- `research/closing-patterns.md`

---

## 15. 改版履歴

| バージョン | 日付 | 変更内容 |
|----------|------|---------|
| v1.0 | 2026-05-01 | 初版起草。Round 1 リサーチ反映。 |
| v1.1 | 2026-05-01 | codex-review v1 反映：章ID統一、論点網羅、Q-01〜Q-06確定、syllabusVersion仕様、インポート契約、バックアップリマインダー、採点正規化ルール追加。 |
| v1.2 | 2026-05-01 | codex-review v1.1 反映：(1)論点数を26に統一（journal-patterns.md整合）、(2)topicId 命名規則明文化＋ASCII違反修正（kuriノベ→kurinobe）、(3)syllabusVersion値を `2026/2027` 単一仕様化＋有効性判定アルゴリズム明記、(4)インポート検証を全フィールド網羅・enum検証強化、(5)失敗パス6種を網羅表で明文化、(6)採点ルールをAccountIdベースに型整合・borrow→debit 修正。 |
| v1.3 | 2026-05-01 | codex-review v1.2 反映：(1)R-023 の問題数を「+52問（合計104問）」に揃えて Q-03/§7.5 と整合、(2)`parseSyllabusDate` 仕様を新設し YYYY-MM-DD は JST 00:00 へ明示正規化、Invalid Date は出題候補から除外を明記、(3)失敗パス一覧にファイルサイズ超過・ファイル読込失敗・未知 AccountId を追加、再試行方針列を追加、(4)attempt 検証で `account` を勘定科目マスタ既知 AccountId のみ許可と明文化。 |
| v1.4 | 2026-05-01 | codex-review v1.3 反映：`isQuestionAvailable` 疑似コードに `Number.isNaN(parsed.getTime())` の Invalid Date 判定を明示追加（仕様文と一致）。 |
| v2.0 | 2026-05-01 | 大規模変更。詳細は下記 v2.0 内訳：<br>**(機能)** スライド機能を解説記事に置換、R-040〜R-046 を新設、§7.6 Article 型、§7.7 双方向リンク、結果画面 S-04 に関連記事セクション、画面 S-07/S-08 を追加、marked 採用<br>**(データ)** Round 2 コンテンツ生成結果 52問（26論点×2問）を反映、journals.json 確定<br>**(運用)** Q-01/Q-06 を記事化に変更、Q-05 を `tekarimeron11/bokist` に確定 |
| v2.1 | 2026-05-01 | codex-review v2.0 反映：<br>**(blocking)** (1) R-043 関連記事検索の優先順位を topicId→chapterId→0件「準備中」へ明文化、最大3件・updatedAt 降順・重複除去のルール追加。(2) §7.7 索引構造（articlesByTopicId / articlesByChapterId / questionsByTopicId）の構築タイミング・計算量保証を契約化。(3) M2/M4 の必須/任意境界を表で再定義（記事機能は M4 必須、M2 では「準備中」表示）。<br>**(advisory)** (4) `TopicId` literal union 型を §7.7 に追加し Question/Article で共通使用＋ビルド時集合検証を要件化。(5) R-044 で `topicIds` 空配列時のCTA非表示を明記。(6) 改版履歴 v2.0 を機能/データ/運用に分割。 |
| v2.2 | 2026-05-01 | codex-review v2.1 反映：<br>(1) §7.1 `Question.topicId` と §7.6 `Article.topicIds[]` の型契約を `string` から `TopicId` に統一（v2.1 で §7.7 に union 追加したが本文の型未更新だった）。<br>(2) §7.7 順方向アルゴリズムの順序を「候補取得→slug重複除去→3件採用→不足分のみ chapter 補充→再除去→3件 truncate」に修正、上位3件内に重複があった際の取りこぼしを解消。`Article.slug` 一意性を不変条件として §7.6 に明記。 |
| v2.3 | 2026-05-01 | 解説体験の本格化と新デザイン採用：<br>**(機能・スキーマ)** (1) §7.1 `Question.structured?: StructuredExplanation` を新設（essence / debitWhy / creditWhy / takeaway の4要素）。`explanation` は後方互換用に残す。(2) §7.8 `GlossaryTerm` 型と `<Term>` インラインタグ参照ルール、ビルド時の孤立Term検証を新設。<br>**(UI)** (3) §8.5「解説仕様」を新設し、4要素表示モデル、用語ポップアップ（底面シート・キーボード操作・スクリーンリーダー対応）、T字勘定レンダリング（借方/貸方の左右配置、`isContra` 評価勘定の扱い、small viewport ダウングレード、figure+figcaption によるa11yサマリ）、M2/M4 のロールアウト境界を定義。<br>**(デザイン)** (4) §9.2 を全面改訂し Soft Paper / Editorial テーマを正式採用。Tailwind 拡張カラー（paper / ink / blush / sage / iris / gold / cocoa / line / seal）、フォントスタック（Marcellus + Noto Sans JP / Noto Serif JP + DM Mono）、shadow / rounded / animation トークン、`studyMode: "exam"` 時の挙動、`prefers-reduced-motion` 縮約ルールを明文化。 |
