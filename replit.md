# Luffy AI - Academic Co-Pilot

## Overview

Luffy AI is a futuristic, Jarvis-inspired academic co-pilot for BCA students. Built with React + Vite frontend and Express API backend, powered by Gemini AI via Replit AI Integrations.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **AI**: Google Gemini (via Replit AI Integrations)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Features

- AI Chat with streaming responses (SSE)
- Conversation history management
- Markdown rendering with syntax-highlighted code blocks
- Voice output (Web Speech API - SpeechSynthesis)
- Voice input (Web Speech API - SpeechRecognition)
- Futuristic JARVIS-inspired dark UI with neon cyan accents
- Created by Abhay Sir and Dipanshu Sir

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Architecture

- `artifacts/luffy-ai/` — React + Vite frontend (futuristic chat UI)
- `artifacts/api-server/` — Express backend with Gemini AI integration
- `lib/integrations-gemini-ai/` — Gemini AI SDK wrapper
- `lib/db/` — PostgreSQL database with Drizzle ORM (conversations + messages tables)
- `lib/api-spec/` — OpenAPI specification
- `lib/api-client-react/` — Generated React Query hooks
- `lib/api-zod/` — Generated Zod validation schemas

## API Endpoints

- `GET /api/gemini/conversations` — List conversations
- `POST /api/gemini/conversations` — Create conversation
- `GET /api/gemini/conversations/:id` — Get conversation with messages
- `DELETE /api/gemini/conversations/:id` — Delete conversation
- `GET /api/gemini/conversations/:id/messages` — List messages
- `POST /api/gemini/conversations/:id/messages` — Send message (SSE streaming response)

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
