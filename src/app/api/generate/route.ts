import { streamText } from 'ai';
import { defaultFormats, Format } from '@/lib/formats';
import { models, getModelInstance } from '@/lib/models';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { overview, prompt, formatId, modelId } = (await req.json()) as {
      overview?: string;
      prompt?: string;
      formatId: string;
      modelId?: string;
    };

    const ov = overview ?? prompt ?? '';

    if (ov.length < 10) {
      return new Response('overview must be at least 10 characters', {
        status: 400,
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
    const model = getModelInstance(modelConfig);

    const result = streamText({
      model,
      system: 'You are a professional Japanese editor. Return content in Markdown.',
      prompt: `以下の概要を読み、指定のテンプレートに沿って日本語で記事ドラフトを作成してください。テンプレート内の {{placeholder}} を適切な内容で置き換えてください。\n\n## テンプレート\n${format.template}\n\n## 概要\n${ov}`,
      temperature: modelConfig.temperature,
      maxTokens: modelConfig.maxTokens,
    });

    return result.toTextStreamResponse();
  } catch (e: unknown) {
    console.error(e);
    return new Response('Internal Error', { status: 500 });
  }
}
