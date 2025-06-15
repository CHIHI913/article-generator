# デバッグ・トラブルシューティングログ

## 重要な問題・解決済み

### 2025-06-15: ストリーミングレスポンス不具合
**症状**: フロントエンドでストリーミングが開始されない  
**エラー**: 無音エラー（コンソールログなし）  
**調査過程**:
1. ネットワークタブ確認 → HTTPステータス200、レスポンス受信
2. `useCompletion`の設定確認 → `api`パス正常
3. APIルート確認 → `streamText`実行、`toTextStreamResponse()`使用

**根本原因**: `streamProtocol`不一致
- フロントエンド: `streamProtocol`未設定（デフォルト: `data`）  
- バックエンド: `toTextStreamResponse()`（`text`プロトコル）

**解決策**:
```typescript
// フロントエンド
const { completion } = useCompletion({
  streamProtocol: 'text', // 追加
  api: '/api/generate',
});

// バックエンド（変更なし）
return result.toTextStreamResponse();
```

**教訓**: Vercel AI SDKのストリーミングプロトコルは明示的に指定が必要

### 2025-06-15: リクエストボディキー不一致
**症状**: バックエンドで`undefined`エラー  
**原因**: フロントエンド`prompt`、バックエンド`overview`のキー不一致  
**解決策**: 後方互換性を保つため両方対応
```typescript
const { overview, prompt } = await req.json();
const ov = overview ?? prompt ?? '';
```

## 頻出デバッグケース

### ケース1: 生成結果が空
**チェック項目**:
1. APIキー設定確認: `process.env.OPENAI_API_KEY`
2. プロンプト内容確認: 文字数、言語指定
3. モデル設定確認: `openai('gpt-4o')`
4. ネットワーク確認: Vercel関数ログ

**デバッグ手順**:
```typescript
// プロンプト確認
console.log('Generated prompt:', prompt);

// APIキー確認（マスク表示）
console.log('API Key present:', !!process.env.OPENAI_API_KEY);

// レスポンス確認
const result = streamText({
  model: openai('gpt-4o'),
  prompt,
  onFinish: (result) => {
    console.log('Finish reason:', result.finishReason);
    console.log('Token usage:', result.usage);
  }
});
```

### ケース2: 日本語出力の問題
**症状**: 英語で生成される、文字化け  
**チェック項目**:
1. システムプロンプトの言語指定
2. 入力テキストの文字エンコーディング  
3. ブラウザの表示設定

**解決方法**:
```typescript
system: 'You are a professional Japanese editor. Return content in Markdown format. 必ず日本語で回答してください。'
```

### ケース3: Edge Runtime エラー
**よくあるエラー**:
- `fs`モジュール使用エラー
- `path`モジュール使用エラー  
- `crypto`モジュール一部機能エラー

**対処法**: Edge Runtime対応のAPIのみ使用
```typescript
// ❌ 使用不可
import fs from 'fs';
import path from 'path';

// ✅ 使用可能
const data = JSON.stringify(object);
const response = await fetch(url);
```

## パフォーマンス関連

### 問題: 冷起動時間が長い
**原因**: 大きな依存関係、初期化重い処理  
**対策**:
- Edge Runtime使用継続
- 不要な依存関係削除
- レイジー初期化パターン適用

### 問題: ストリーミング遅延
**原因**: プロンプトサイズ、モデル負荷  
**対策**:
- プロンプト最適化（不要部分削除）
- `temperature`調整
- `maxTokens`制限

## 今後の監視項目

### メトリクス収集予定
- 生成時間（P50, P95, P99）
- エラー率（4xx, 5xx）
- トークン使用量
- 同時リクエスト数

### アラート設定予定
- 応答時間 > 30秒
- エラー率 > 5%
- API使用量上限近い

## デバッグツール・環境

### 開発環境
- Chrome DevTools Network タブ
- Vercel CLI (`vercel dev`)
- Next.js Dev Server ログ

### 本番環境
- Vercel Dashboard Functions ログ
- Real-time logs (`vercel logs`)
- OpenAI API Usage dashboard

### ローカルデバッグ設定
```bash
# 詳細ログ有効化
DEBUG=ai:* npm run dev

# Vercel CLI使用
vercel dev --debug
```

## トラブルシューティング手順書

### 1. 生成が開始されない場合
1. ブラウザコンソール確認
2. Network タブでリクエスト確認
3. API Response内容確認
4. Vercel Functions ログ確認

### 2. 生成途中で停止する場合  
1. トークン制限確認
2. OpenAI APIステータス確認
3. ネットワーク接続確認
4. Vercel Functions timeout確認

### 3. 想定外の出力の場合
1. プロンプト内容検証
2. テンプレート構造確認
3. システムプロンプト調整
4. temperature パラメータ調整

## 既知の制限・回避策

### OpenAI API制限
- レート制限: リクエスト間隔調整
- コンテキスト制限: プロンプト分割
- コスト制限: maxTokens設定

### Vercel Edge Functions制限
- 実行時間: 30秒上限
- メモリ: 128MB上限  
- 同時実行: プランによる制限

### Next.js App Router制約
- Server Actions: 現在未使用
- Dynamic Routes: 現在単純な構造