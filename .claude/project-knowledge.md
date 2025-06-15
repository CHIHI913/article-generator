# 技術的知見・パターン

## Vercel AI SDK の重要な知見

### ストリーミング設定の対応関係
```typescript
// フロントエンド側
const { completion } = useCompletion({
  streamProtocol: 'text',  // 重要: APIのレスポンス形式と一致させる
});

// バックエンド側
return result.toTextStreamResponse();  // streamProtocol: 'text' に対応
```

**注意点**: `streamProtocol` と `to*StreamResponse()` の組み合わせミスは無音エラーの原因となる

### Edge Runtime での制約
- `console.log` は本番環境で制限される
- ファイルシステムアクセス不可
- 一部のNode.js APIが使用不可
- 冷起動時間が短い（重要なメリット）

## Next.js App Router パターン

### APIルート設計
```typescript
export const runtime = 'edge';  // 必須: パフォーマンス向上

export async function POST(req: Request) {
  // エラーハンドリングは必須
  try {
    const body = await req.json();
    // バリデーション
    if (!body.overview || body.overview.length < 10) {
      return new Response('Invalid input', { status: 400 });
    }
    // 処理...
  } catch (error) {
    return new Response('Internal Error', { status: 500 });
  }
}
```

### クライアントコンポーネントの状態管理
```typescript
'use client';
import { useState } from 'react';
import { useCompletion } from '@ai-sdk/react';

// bodyパラメータで動的データを渡す
const { completion, handleSubmit } = useCompletion({
  api: '/api/generate',
  body: { formatId }, // 動的に変わる値
});
```

## プロンプトエンジニアリング知見

### 日本語記事生成のコツ
1. **システムプロンプトの重要性**: 「日本語で」「プロの編集者として」を明記
2. **テンプレート構造**: `{{placeholder}}` 形式で置換可能な構造化テンプレート
3. **温度設定**: `temperature: 0.8` で創造性と一貫性のバランス

### 効果的なプロンプト構造
```typescript
const prompt = `以下の概要を読み、指定のテンプレートに沿って日本語で記事ドラフトを作成してください。
テンプレート内の {{placeholder}} を適切な内容で置き換えてください。

## テンプレート
${format.template}

## 概要  
${overview}`;
```

## パフォーマンス最適化

### フロントエンド最適化
- `'use client'` を必要最小限に留める
- 状態管理は最上位コンポーネントで行う
- 不要な再レンダリングを避ける

### バックエンド最適化
- Edge Runtime活用で冷起動時間短縮
- ストリーミングで体感速度向上
- maxTokensでコスト制御

## TypeScript パターン

### 型定義の一元管理
```typescript
// /src/lib/formats.ts
export type Format = {
  id: string;
  name: string;
  template: string;
};

// 他ファイルからimport
import type { Format } from '@/lib/formats';
```

### APIレスポンスの型安全性
```typescript
const { overview, formatId } = (await req.json()) as {
  overview?: string;
  formatId: string;
};
```

## セキュリティ考慮事項

### 入力検証
- 文字数制限（最小10文字）
- HTMLエスケープ（XSS対策）
- レート制限（将来実装予定）

### APIキー管理
- 環境変数での管理必須
- クライアント側での露出禁止
- 将来的な暗号化保存対応

## デバッグ・トラブルシューティング

### よくある問題
1. **ストリーミングが動作しない**: `streamProtocol` と API レスポンス形式の不一致
2. **日本語が文字化け**: システムプロンプトでの言語指定不足
3. **Edge Runtime エラー**: Node.js API の使用

### デバッグ手法
- 開発環境では `console.error` を活用
- ネットワークタブでストリーミング確認
- Vercel Functions ログで本番デバッグ