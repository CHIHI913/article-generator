# Vercel AI SDK 利用ガイド

このドキュメントでは、記事生成アプリで利用する **Vercel AI SDK** の基本的な使い方をまとめます。

## 1. 概要
Vercel AI SDK は複数の AI モデルプロバイダー（OpenAI, Anthropic など）を共通 API で扱える TypeScript ツールキットです。フック（UI）とコア（生成）で構成されています。

- **ai** … コア API (`generateText`, `streamText`, `generateObject` など)
- **@ai-sdk/react** … フック (`useCompletion`, `useChat`, `useObject` など)
- **@ai-sdk/<provider>** … 各プロバイダーアダプター

## 2. 依存パッケージの追加
```bash
# ルートで一度だけ
npm install ai @ai-sdk/openai @ai-sdk/react
```

## 3. 環境変数
`.env.local` に OpenAI キーを追加してください。
```
OPENAI_API_KEY=sk-...
```

## 4. API ルート実装例
`src/app/api/generate/route.ts`
```ts
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

export const runtime = 'edge'; // Vercel Edge Functions

export async function POST(req: Request) {
  const { overview, formatPrompt } = await req.json();

  const result = streamText({
    model: openai('gpt-4o'),
    system: 'あなたはプロの編集者です。',
    prompt: `${formatPrompt}\n---\n概要: ${overview}`,
    temperature: 0.8,
    maxTokens: 2048,
  });

  // Next.js 用 SSE 変換
  return result.toDataStreamResponse();
}
```

## 5. クライアント側 (useCompletion)
`src/app/(pages)/article/page.tsx`
```tsx
'use client';
import { useCompletion } from '@ai-sdk/react';

export default function ArticleGenerator() {
  const { completion, input, handleInputChange, handleSubmit, status } =
    useCompletion({
      api: '/api/generate',
      body: { formatPrompt: 'ブログ書式' },
      onError: console.error,
    });

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <textarea
        value={input}
        onChange={handleInputChange}
        placeholder="記事概要を入力 (10文字以上)"
        minLength={10}
      />
      <button disabled={status !== 'ready'}>生成</button>
      <pre className="whitespace-pre-wrap border p-4 max-h-96 overflow-auto">
        {completion}
      </pre>
    </form>
  );
}
```

## 6. JSON 構造化出力 (generateObject)
```ts
import { generateObject } from 'ai';
import { z } from 'zod';

const schema = z.object({
  title: z.string(),
  body: z.string(),
  tags: z.array(z.string()),
});

const { object } = await generateObject({
  model: openai('gpt-4o'),
  schema,
  prompt: '...' // 詳細プロンプト
});
```

## 7. 複数モデルの切替
```ts
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';

const model = selectedProvider === 'anthropic'
  ? anthropic('claude-3')
  : openai('gpt-4o');
```

## 8. よくあるエラー
|状況|対応策|
|---|---|
|401 Unauthorized|API キーが正しいか、環境変数がデプロイに反映されているか確認|
|429 Rate limit|リトライ、トークン量削減、プロンプト短縮|

---
以上
