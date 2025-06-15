import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { defaultFormats } from '@/lib/formats';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { overview, prompt, formatId } = (await req.json()) as {
      overview?: string;
      prompt?: string;
      formatId: string;
    };

    const ov = overview ?? prompt ?? '';

    if (ov.length < 10) {
      return new Response('overview must be at least 10 characters', {
        status: 400,
      });
    }

    const format = defaultFormats.find((f) => f.id === formatId) ?? defaultFormats[0];

    const result = streamText({
      model: openai('gpt-4o'),
      system: 'You are a professional Japanese editor. Return content in Markdown.',
      prompt: `以下の概要を読み、指定のテンプレートに沿って日本語で記事ドラフトを作成してください。テンプレート内の {{placeholder}} を適切な内容で置き換えてください。\n\n## テンプレート\n${format.template}\n\n## 概要\n${ov}`,
      temperature: 0.8,
      maxTokens: 2048,
    });

    return result.toTextStreamResponse();
  } catch (e: unknown) {
    console.error(e);
    return new Response('Internal Error', { status: 500 });
  }
}
