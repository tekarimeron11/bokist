# Bokist — 簿記3級 学習サイト

## Overview
簿記3級学習サイト。先輩（20代女性）に向けて主人が作る個人プロジェクト。
- 配布: GitHub Pages 公開URL を渡す
- 利用: スマホメイン（PWA でホーム画面追加してもらう）
- マネタイズなし、個人利用

## Stack
- **Frontend**: Vite + React + TypeScript + Tailwind CSS
- **State / Storage**: localStorage（スキーマバージョニング前提、抽象化レイヤー越し）
- **PWA**: vite-plugin-pwa（ITP対策・ホーム画面追加対応）
- **Hosting**: GitHub Pages
- **DB**: なし（将来必要になれば Supabase 移行）
- **External deps**: 最小限（Apple/Google エコシステム外でも純正寄り）

## Strategy
- 第1問（仕訳・配点45点）対策に全振り
- 第3問（決算整理・配点35点）対策は後追加
- 第2問（補助簿・配点20点）はアプリで作らない（市販テキスト推奨）
- 段階的リリース: 問1 → 問3 の順

## Plan Creation
Whenever you create a markdown file in the ./plans directory,
please make sure to have it reviewed by Codex using the codex-review skill.

## Review gate (codex-review)
At key milestones—after updating specs/plans, after major implementation steps
(≥5 files / public API / infra-config), and before commit/PR/release—run
the codex-review SKILL and iterate review→fix→re-review until clean.

## Task Management
When implementing features or making code changes, use the Tasks feature
to manage and track progress. Break down the work into clear steps and
update task status as you proceed.

## Other
When asking for a decision, use "AskUserQuestion".

## Data Layer Rule
全てのストレージアクセスは `src/storage/` 配下の抽象化レイヤー経由。
直接 `localStorage.setItem/getItem` を呼ばない。
将来 Supabase/Firestore に移行する場合、この層だけ差し替える。

## Schema Versioning
localStorage に保存するデータは必ず `version` フィールドを持つ。
スキーマ変更時は migration 関数を書いて旧バージョンを読み込めるようにする。

## Backup
設定画面に「データをエクスポート（JSON）/ インポート」を必ず実装。
ブラウザデータ削除や端末変更でも先輩が自分でバックアップ取れるように。

## Directory Layout
```
bokist/
├── CLAUDE.md             # このファイル
├── REQUIREMENTS.md       # 要件定義書（v1 → v2）
├── plans/                # 実装計画ファイル
├── research/             # 試験リサーチ結果
├── content/              # 問題データ・解説文・スライド原稿
└── src/                  # 実装（Vite初期化後）
```
