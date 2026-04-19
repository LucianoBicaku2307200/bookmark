# Project Context — bookmarks

## Last Updated
2026-04-19

## Stack
- Next.js 16.1.5 (App Router) + React 19
- Supabase (Postgres + Auth + RLS) via @supabase/ssr
- Zustand 5 (3 stores: bookmarks, collections, tags)
- Tailwind CSS v4 (no config file)
- shadcn/ui (Radix primitives in components/ui/)
- PWA via @ducanh2912/next-pwa
- sonner (toasts), date-fns 4, lucide-react

## Codebase Conventions
- File naming: kebab-case
- Component naming: PascalCase
- Variable naming: camelCase; handle* events, get* getters, fetch* async
- CSS: Tailwind utility-first + cn() from lib/utils
- Indentation: 2 spaces
- Quotes: double
- Semicolons: yes
- Import order: React/Next → components → lib → store → types
- All client-side data fetching: Zustand stores → REST API routes → Supabase server client
- No RSC data fetching — all stores use "use client"
- shadcn primitives preferred over custom HTML

## Active Skills
- prompt-optimizer
- tech-detector
- codebase-reader
- nextjs
- caveman

## Plan History

### Project Analysis — 2026-04-19
Goal: Comprehensive read-only analysis of bookmarks app — stack, architecture, component structure, data flow.
Deliverables: Analysis plan at /home/luciano/.claude/plans/analyze-the-project-velvet-karp.md
Decisions: No ambiguities — pure analysis
Files touched: none (read-only)
