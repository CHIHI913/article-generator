# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚨 開発開始時の必須確認事項

**開発作業を開始する前に、必ず以下を確認してください:**

1. **`PROJECT-TODO.md`** - プロジェクト全体の開発タスク一覧を確認
2. **`.claude/development-workflow.md`** - 開発ワークフロー規則を確認
3. **`temp/current-task.md`** - 現在の作業タスクを作成・更新

## Project Knowledge System

This project uses a structured knowledge management system. For detailed information, refer to:

- `.claude/context.md` - Project background, constraints, and current status
- `.claude/project-knowledge.md` - Technical insights and implementation patterns
- `.claude/project-improvements.md` - Development history and planned improvements
- `.claude/common-patterns.md` - Frequently used code patterns and commands
- `.claude/debug-log.md` - Troubleshooting guides and known issues
- `.claude/development-workflow.md` - **開発ワークフロー規則**

## Commands

- `npm run dev --turbopack` - Start development server (uses Turbopack for faster builds)
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Architecture Overview

**記事生成アプリケーション** - A Next.js 15 application that generates Japanese articles from user-provided overviews using Vercel AI SDK and OpenAI GPT-4o.

### Core System Flow
1. User inputs overview (10+ chars) + selects format → Frontend (`/src/app/article/page.tsx`)
2. API request to `/api/generate` → Edge Function (`/src/app/api/generate/route.ts`)
3. Format template + overview → Structured prompt for GPT-4o
4. Streaming response → Real-time article generation display

### Critical Implementation Details

**Streaming Configuration** (Most Important):
```typescript
// Frontend: useCompletion hook
streamProtocol: 'text'  // Must match API response type

// Backend: API route  
return result.toTextStreamResponse();  // Matches 'text' protocol
```

**Format System**: Templates in `/src/lib/formats.ts` use `{{placeholder}}` syntax for dynamic content replacement.

**Edge Runtime**: All API routes use `export const runtime = 'edge'` for optimal performance.

## Current Status
- ✅ MVP article generation (blog, news, SEO formats)
- ✅ Japanese-optimized prompts and UI
- ❌ Multi-model support (planned)
- ❌ User authentication (planned)
- ❌ Article history/export (planned)

Read `.claude/context.md` for complete project context and constraints.