import { NextRequest, NextResponse } from 'next/server';
import { defaultFormats, Format } from '@/lib/formats';

export const runtime = 'edge';

const formats: Format[] = [...defaultFormats];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const format = formats.find(f => f.id === id);
  
  if (!format) {
    return NextResponse.json(
      { error: 'Format not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({ format });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const { name, template } = body;

    if (!name || !template) {
      return NextResponse.json(
        { error: 'name and template are required' },
        { status: 400 }
      );
    }

    const formatIndex = formats.findIndex(f => f.id === id);
    
    if (formatIndex === -1) {
      return NextResponse.json(
        { error: 'Format not found' },
        { status: 404 }
      );
    }

    formats[formatIndex] = {
      ...formats[formatIndex],
      name,
      template,
    };

    return NextResponse.json({ format: formats[formatIndex] });
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const formatIndex = formats.findIndex(f => f.id === id);
  
  if (formatIndex === -1) {
    return NextResponse.json(
      { error: 'Format not found' },
      { status: 404 }
    );
  }

  const deletedFormat = formats[formatIndex];
  formats.splice(formatIndex, 1);

  return NextResponse.json({ format: deletedFormat });
}