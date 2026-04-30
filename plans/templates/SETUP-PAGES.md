# GitHub Pages 自動デプロイのセットアップ

Stella の auto モードでは `workflow` scope が token に含まれていなかったため、
`.github/workflows/deploy.yml` を直接 push できませんでした。
主人が起床後、以下を1回だけ実行してください。

## 手順

### 1. workflow scope を追加（ブラウザ認証）

```bash
gh auth refresh -h github.com -s workflow
```

ブラウザが開くので、表示された認証コードを貼って Authorize します。

### 2. workflow ファイルを正規の場所にコピー

```bash
cd ~/app-work/bokist
mkdir -p .github/workflows
cp plans/templates/deploy.yml .github/workflows/deploy.yml
git add .github/workflows/deploy.yml
git commit -m "ci: add GitHub Pages deploy workflow"
git push
```

### 3. GitHub Pages の設定（GitHub 側）

ブラウザで `https://github.com/tekarimeron11/bokist/settings/pages` を開き：

- Source: **GitHub Actions** を選択

これで main への push をトリガーに自動的に Pages にデプロイされます。

公開URL: `https://tekarimeron11.github.io/bokist/`

### トラブルシュート

- もしビルドが失敗するなら Actions タブでログを確認
- `npm ci --legacy-peer-deps` のオプションを忘れずに（vite-plugin-pwa の peer dep 問題）
