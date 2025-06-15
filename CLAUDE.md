# CLAUDE.md

このファイルは、このリポジトリでコードを扱う際のClaude Code（claude.ai/code）向けのガイダンスを提供します。

## 🚨 開発開始時の必須確認事項

**開発作業を開始する前に、必ず以下を確認してください:**

1. **`PROJECT-TODO.md`** - プロジェクト全体の開発タスク一覧を確認
2. **`.claude/development-workflow.md`** - 開発ワークフロー規則を確認
3. **`temp/current-task.md`** - 現在の作業タスクを作成・更新

## プロジェクト知識管理システム

このプロジェクトは構造化された知識管理システムを使用しています。詳細については以下を参照してください：

- `.claude/context.md` - プロジェクトの背景、制約、現在の状況
- `.claude/project-knowledge.md` - 技術的洞察と実装パターン
- `.claude/project-improvements.md` - 開発履歴と改善計画
- `.claude/common-patterns.md` - よく使用されるコードパターンとコマンド
- `.claude/debug-log.md` - トラブルシューティングガイドと既知の問題
- `.claude/development-workflow.md` - **開発ワークフロー規則**

## コマンド

- `npm run dev --turbopack` - 開発サーバー起動（高速ビルドのためTurbopackを使用）
- `npm run build` - 本番用ビルド
- `npm start` - 本番サーバー起動
- `npm run lint` - ESLint実行

## アーキテクチャ概要

**記事生成アプリケーション** - Vercel AI SDKとOpenAI GPT-4oを使用して、ユーザー提供の概要から日本語記事を生成するNext.js 15アプリケーション。

### コアシステムフロー
1. ユーザーが概要入力（10文字以上）+ フォーマット選択 → フロントエンド（`/src/app/article/page.tsx`）
2. `/api/generate`へのAPIリクエスト → Edge Function（`/src/app/api/generate/route.ts`）
3. フォーマットテンプレート + 概要 → GPT-4o用構造化プロンプト
4. ストリーミングレスポンス → リアルタイム記事生成表示

### 重要な実装詳細

**ストリーミング設定**（最重要）:
```typescript
// フロントエンド: useCompletion hook
streamProtocol: 'text'  // APIレスポンスタイプと一致させる必要あり

// バックエンド: APIルート  
return result.toTextStreamResponse();  // 'text'プロトコルと一致
```

**フォーマットシステム**: `/src/lib/formats.ts`のテンプレートは動的コンテンツ置換に`{{placeholder}}`構文を使用。

**Edge Runtime**: 最適なパフォーマンスのため、全APIルートで`export const runtime = 'edge'`を使用。

## 現在の状況
- ✅ MVP記事生成機能（ブログ、ニュース、SEOフォーマット）
- ✅ 日本語最適化されたプロンプトとUI
- ❌ マルチモデル対応（予定）
- ❌ ユーザー認証（予定）
- ❌ 記事履歴・エクスポート機能（予定）

完全なプロジェクトコンテキストと制約については`.claude/context.md`を参照してください。