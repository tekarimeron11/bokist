# Bokist

日商簿記3級 学習サイト（モバイルファースト PWA）

## 概要

簿記3級を勉強する友人向けに作った個人プロジェクト。
配点45点を占める第1問（仕訳問題）対策に特化したスキマ時間学習ツール。

## 技術スタック

- Vite 8 + React 19 + TypeScript
- Tailwind CSS 3
- vite-plugin-pwa（オフライン対応 + ホーム画面追加）
- localStorage（バージョニング + エクスポート/インポート対応）

## 開発

```bash
npm install
npm run dev      # ローカル開発
npm run build    # プロダクションビルド
npm run preview  # ビルド結果のプレビュー
```

## デプロイ

GitHub Pages に自動デプロイ（後ほど Actions 設定）。

## ディレクトリ

```
bokist/
├── REQUIREMENTS.md    # 要件定義書
├── research/          # 試験リサーチ資料
├── content/           # 問題データ・解説・スライド原稿
├── plans/             # 実装計画
└── src/
    ├── storage/       # localStorage抽象化レイヤー
    ├── types/         # 型定義
    ├── data/          # 静的データ（勘定科目マスタ等）
    ├── components/    # 再利用コンポーネント
    ├── screens/       # 画面コンポーネント
    └── lib/           # ユーティリティ
```
