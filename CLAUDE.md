# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev --turbopack` - Start development server (uses Turbopack for faster builds)
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Architecture

This is a Next.js 15 article generator application that uses Vercel AI SDK to generate Japanese articles from text overviews.

### Core Components

- **API Route**: `/src/app/api/generate/route.ts` - Edge function that streams article generation using OpenAI GPT-4o
- **Format System**: `/src/lib/formats.ts` - Defines article templates (blog, news, SEO landing page)
- **Main UI**: `/src/app/article/page.tsx` - Article generation interface with format selection and streaming output

### Key Dependencies

- `@ai-sdk/openai` and `@ai-sdk/react` - Vercel AI SDK for OpenAI integration
- Uses Edge Runtime for fast response times
- Streaming text generation with `useCompletion` hook

### Data Flow

1. User inputs Japanese overview (min 10 characters) and selects format
2. Frontend sends request to `/api/generate` with overview and formatId
3. Backend constructs prompt using format template and overview
4. Streams GPT-4o response back to frontend in real-time
5. Generated article displayed in preview section

### Format Templates

Templates use `{{placeholder}}` syntax for dynamic content replacement. Current formats:
- `blog` - Standard blog post structure
- `news` - News article format
- `seo` - SEO landing page template

The system prompt instructs the AI to generate Japanese content in Markdown format and replace template placeholders appropriately.