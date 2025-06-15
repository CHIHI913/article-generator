# 頻用パターン・コマンド集

## 開発用コマンド

### 基本開発フロー
```bash
# 開発サーバー起動（Turbopack使用）
npm run dev --turbopack

# ビルド確認
npm run build

# Lint実行
npm run lint

# 依存関係更新
npm update
```

### Git操作パターン
```bash
# 機能ブランチ作成
git checkout -b feature/new-feature-name

# 変更確認
git status
git diff

# コミット
git add .
git commit -m "feat: 新機能の説明"

# プッシュ
git push origin feature/new-feature-name
```

## コーディングパターン

### API ルート作成テンプレート
```typescript
// /src/app/api/[endpoint]/route.ts
export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // バリデーション
    if (!body.requiredField) {
      return new Response('Missing required field', { status: 400 });
    }
    
    // 処理
    const result = await processRequest(body);
    return Response.json(result);
    
  } catch (error) {
    console.error('API Error:', error);
    return new Response('Internal Error', { status: 500 });
  }
}
```

### クライアントコンポーネントパターン
```typescript
'use client';
import { useState } from 'react';

export default function ComponentName() {
  const [state, setState] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // API呼び出し
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* JSX */}
    </form>
  );
}
```

### Vercel AI SDK 統合パターン
```typescript
// ストリーミング完了待ち
import { useCompletion } from '@ai-sdk/react';

const { completion, handleSubmit, isLoading } = useCompletion({
  api: '/api/generate',
  body: { additionalData },
  streamProtocol: 'text', // 重要: APIと一致させる
});

// API側
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

const result = streamText({
  model: openai('gpt-4o'),
  system: 'システムプロンプト',
  prompt: userPrompt,
  temperature: 0.8,
  maxTokens: 2048,
});

return result.toTextStreamResponse();
```

## デバッグパターン

### フロントエンドデバッグ
```typescript
// コンソールログ
console.log('State:', { state, isLoading, error });

// ネットワークリクエスト確認
// 1. Developer Tools > Network
// 2. フィルタ: Fetch/XHR
// 3. ストリーミングの場合 Response タブで確認
```

### バックエンドデバッグ
```typescript
// Edge Runtime でも使用可能
console.error('Error details:', error);
console.log('Request body:', await req.json());

// Vercelダッシュボードでログ確認
// Functions > Logs タブ
```

### AI応答デバッグ
```typescript
// プロンプト確認
console.log('Generated prompt:', prompt);

// ストリーミング途中確認
const result = streamText({
  model: openai('gpt-4o'),
  prompt,
  onFinish: (result) => {
    console.log('Generation finished:', {
      tokenCount: result.usage?.totalTokens,
      finishReason: result.finishReason
    });
  }
});
```

## ファイル構造パターン

### 新機能追加時のファイル配置
```
src/
├── app/
│   ├── [feature]/
│   │   └── page.tsx          # 機能のメインページ
│   └── api/
│       └── [feature]/
│           └── route.ts       # API エンドポイント
├── lib/
│   └── [feature].ts          # 機能固有のユーティリティ
└── types/
    └── [feature].ts          # 型定義（将来追加予定）
```

### インポートパス統一
```typescript
// 絶対パス使用（tsconfig.json設定済み）
import { defaultFormats } from '@/lib/formats';
import ComponentName from '@/app/components/ComponentName';

// 相対パスは避ける（メンテナンス性のため）
// import { formats } from '../../../lib/formats'; // ❌
```

## CSS/スタイリングパターン

### Tailwind CSS クラス組み合わせ
```tsx
// レスポンシブデザイン
<div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">

// フォーム要素
<input className="border p-2 w-full" />
<button className="bg-black text-white px-4 py-2 disabled:opacity-50">

// レイアウト
<main className="max-w-3xl mx-auto p-6 flex flex-col gap-6">
```

## エラーハンドリングパターン

### API エラーレスポンス統一
```typescript
// 400番台: クライアントエラー
return new Response('Invalid input: ' + reason, { status: 400 });

// 500番台: サーバーエラー  
return new Response('Internal Error', { status: 500 });

// JSON エラーレスポンス（詳細情報必要時）
return Response.json({ 
  error: 'Validation failed',
  details: validationErrors 
}, { status: 400 });
```

### フロントエンドエラー表示
```tsx
{error && (
  <div className="text-red-600 bg-red-50 p-3 rounded">
    {error.message}
  </div>
)}
```

## テストパターン（将来実装予定）

### Jest + Testing Library セットアップ予定
```bash
# 将来のテスト環境構築
npm install --save-dev jest @testing-library/react @testing-library/jest-dom

# テスト実行
npm test
npm run test:coverage
```

### テストファイル配置予定
```
__tests__/
├── api/
│   └── generate.test.ts      # API テスト
├── components/
│   └── ArticlePage.test.tsx  # コンポーネントテスト
└── lib/
    └── formats.test.ts       # ユーティリティテスト
```

## 環境変数管理

### 開発環境設定
```bash
# .env.local (gitignore済み)
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_APP_URL=http://localhost:3000

# .env.example (テンプレート)
OPENAI_API_KEY=your_openai_api_key_here
NEXT_PUBLIC_APP_URL=your_app_url_here
```

### Vercel デプロイ時設定
- Environment Variables セクションで設定
- Production / Preview / Development 環境別設定可能