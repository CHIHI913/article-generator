import { streamText } from 'ai';
import { defaultFormats, Format } from '@/lib/formats';
import { models, getModelInstance } from '@/lib/models';
import { isObject, hasProperty, isString } from '@/lib/type-guards';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({
        error: 'リクエストの形式が正しくありません。',
        code: 'INVALID_JSON'
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!isObject(body)) {
      return new Response(JSON.stringify({
        error: 'リクエストボディが正しくありません。',
        code: 'INVALID_BODY'
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!hasProperty(body, 'formatId') || !isString(body.formatId)) {
      return new Response(JSON.stringify({
        error: 'フォーマットIDが指定されていません。',
        code: 'MISSING_FORMAT_ID'
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const overview = hasProperty(body, 'overview') && isString(body.overview) ? body.overview : '';
    const prompt = hasProperty(body, 'prompt') && isString(body.prompt) ? body.prompt : '';
    const modelId = hasProperty(body, 'modelId') && isString(body.modelId) ? body.modelId : undefined;
    const formatId = body.formatId;

    const ov = overview ?? prompt ?? '';

    if (ov.length < 10) {
      return new Response(JSON.stringify({
        error: '概要は10文字以上で入力してください。',
        code: 'OVERVIEW_TOO_SHORT'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    let formats: Format[] = [...defaultFormats];
    try {
      const formatsResponse = await fetch(`${process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : 'http://localhost:3000'}/api/formats`);
      if (formatsResponse.ok) {
        const data = await formatsResponse.json();
        formats = data.formats;
      }
    } catch (error) {
      console.warn('Failed to fetch formats, using defaults:', error);
    }

    const format = formats.find((f) => f.id === formatId) ?? formats[0];
    const modelConfig = models.find((m) => m.id === modelId) ?? models[0];
    
    if (!modelConfig) {
      return new Response(JSON.stringify({
        error: '指定されたAIモデルが見つかりません。',
        code: 'MODEL_NOT_FOUND'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    let model;
    try {
      model = getModelInstance(modelConfig);
    } catch (error) {
      console.error('Model instance creation failed:', error);
      return new Response(JSON.stringify({
        error: 'AIモデルの初期化に失敗しました。APIキーの設定を確認してください。',
        code: 'MODEL_INIT_FAILED'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    try {
      const result = streamText({
        model,
        system: 'You are a professional Japanese editor. Return content in Markdown.',
        prompt: `以下の概要を読み、指定のテンプレートに沿って日本語で記事ドラフトを作成してください。テンプレート内の {{placeholder}} を適切な内容で置き換えてください。\n\n## テンプレート\n${format.template}\n\n## 概要\n${ov}`,
        temperature: modelConfig.temperature,
        maxTokens: modelConfig.maxTokens,
      });

      return result.toTextStreamResponse();
    } catch (error: unknown) {
      console.error('Stream text failed:', error);
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStatus = (error as { status?: number })?.status;
      
      // APIキーエラーの検出
      if (errorMessage.includes('API key') || errorMessage.includes('authentication')) {
        return new Response(JSON.stringify({
          error: 'APIキーが設定されていないか、無効です。設定を確認してください。',
          code: 'API_KEY_ERROR'
        }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // レート制限エラーの検出
      if (errorMessage.includes('rate limit') || errorStatus === 429) {
        return new Response(JSON.stringify({
          error: 'リクエスト制限に達しました。しばらく待ってから再試行してください。',
          code: 'RATE_LIMIT_EXCEEDED'
        }), {
          status: 429,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // その他のAPIエラー
      return new Response(JSON.stringify({
        error: '記事の生成中にエラーが発生しました。しばらく待ってから再試行してください。',
        code: 'GENERATION_FAILED'
      }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (e: unknown) {
    console.error('Unexpected error:', e);
    return new Response(JSON.stringify({
      error: 'サーバーでエラーが発生しました。問題が続く場合は管理者にお問い合わせください。',
      code: 'INTERNAL_ERROR'
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
