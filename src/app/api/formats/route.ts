import { NextRequest, NextResponse } from 'next/server';
import { defaultFormats, Format } from '@/lib/formats';

export const runtime = 'edge';

const formats: Format[] = [...defaultFormats];

export async function GET() {
  return NextResponse.json({ formats });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, template } = body;

    if (!name || !template) {
      return NextResponse.json(
        { error: 'name and template are required' },
        { status: 400 }
      );
    }

    const newFormat: Format = {
      id: crypto.randomUUID(),
      name,
      template,
    };

    formats.push(newFormat);

    return NextResponse.json({ format: newFormat }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    );
  }
}