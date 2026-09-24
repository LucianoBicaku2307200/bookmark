# Project Context — bookmarks

## Last Updated
2026-09-24

## Stack
- Next.js 16.1.5 (App Router) + React 19
- Supabase (Postgres + Auth + RLS) via @supabase/ssr
- Zustand 5 (5 stores: bookmarks, collections, tags, notes, daily-track)
- Tailwind CSS v4 (no config file)
- shadcn/ui (Radix primitives in components/ui/)
- PWA via @ducanh2912/next-pwa
- sonner (toasts), date-fns 4, lucide-react
- Recharts 3.10 (charts; added for Daily Track)

## Codebase Conventions
- File naming: kebab-case
- Component naming: PascalCase
- Variable naming: camelCase; handle* events, get* getters, fetch* async
- CSS: Tailwind utility-first + cn() from lib/utils
- Indentation: 2 spaces under app/ and components/ui/; 4 spaces under components/<feature>/
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

### Notes Feature — 2026-05-26
Goal: Add full CRUD Notes feature with title, plain-text body, shared global tags, Sheet editor, and tag filtering.
Deliverables:
- supabase/notes-migration.sql (notes + note_tags tables, RLS, indexes)
- types/index.ts — Note type added
- store/notes-store.ts — Zustand store
- app/api/notes/route.ts — GET + POST
- app/api/notes/[id]/route.ts — PATCH + DELETE
- components/notes/note-sheet.tsx — create/edit Sheet
- components/notes/note-card.tsx — card with edit action
- components/notes/notes-content.tsx — filtered grid + empty state
- components/notes/notes-header.tsx — search + new note button
- app/notes/page.tsx — route page
Decisions: shared tags (not separate); Sheet editor; plain textarea body
Files modified: components/dashboard/sidebar.tsx, hooks/use-initialize-data.ts, app/api/tags/route.ts

### Daily Track — 2026-09-21
Goal: Port the standalone "Daily Track" spec (prompt.md) into this app — number activities as an area chart, checkbox habits as a combined heatmap, per-day logging, per-chart filters, global date range.
Deliverables:
- supabase/daily-track-migration.sql (activities + entries, RLS, unique day index)
- lib/daily-track/chart-data.ts (pure helpers), lib/daily-track/colors.ts (ACTIVITY_COLORS)
- app/api/daily-track/{activities,activities/[id],entries}/route.ts
- store/daily-track-store.ts
- components/ui/{card,checkbox,chart}.tsx
- components/daily-track/ (header, content, number-chart, habit-heatmap, daily-entry-form, activity-manager, color-picker, activity-select, date-range-picker, month-grid, segmented-toggle)
- app/daily-track/page.tsx
Decisions:
- Spec assumed Server Actions + Base UI; translated to this repo's Zustand → REST → Supabase and Radix (spec §10 authorizes this).
- Only new dep is recharts. No react-day-picker/popover/select/cmdk — DropdownMenu stands in for popovers (checkbox items need onSelect preventDefault; calendar grid must not be DropdownMenuItems), and the date pickers use a hand-built MonthGrid with date-fns.
- ActivitySelect is a checkbox dropdown, not a searchable combobox.
- ACTIVITY_COLORS is a feature-local 5-hue constant, not var(--chart-1..5): the theme's chart tokens are five near-blues identical in light and dark. globals.css untouched.
- `range` lives in the store (shared header↔content), matching how notes-store holds searchQuery; `hidden`/`cumulative` stay local to the dashboard.
- entries GET is deliberately unfiltered by date range (totalsBefore + entryBounds need full history).
- num_value is double precision, not numeric (PostgREST returns numeric as a string).
- daily-entry-form's draft-reset effect keys on [activityKey, date, mode] and reads entries/activities through refs. Depending on the entries/stored object identity instead wipes typed input whenever a recolor/save replaces those arrays, and suppresses the "Saved" note.
Files modified: types/index.ts, hooks/use-initialize-data.ts, components/dashboard/sidebar.tsx, components/dashboard/error-toaster.tsx, proxy.ts, package.json
Open item: migration was run; `entry_value_matches_one_kind` shipped unparenthesized (`num_value IS NULL <> bool_value IS NULL`), which Postgres parses as `((num_value IS NULL) <> bool_value) IS NULL` — number rows pass, every checkbox row is rejected. Fixed in the migration; existing DBs need supabase/daily-track-fix-entry-check.sql run manually.
Known pre-existing issue: `npm run lint` fails at ESLint config load (circular structure in eslint-config-next under ESLint 9.39) — unrelated to this work, reproduces on untouched files.

### Daily Track Fixes — 2026-09-21
Goal: Fix checkbox saves failing, float noise in the Total-mode delta, and the invisible dark-mode check icon.
Deliverables:
- supabase/daily-track-fix-entry-check.sql (ALTER for already-migrated DBs)
- migration constraint parenthesized
Decisions:
- Deltas rounded via `Number(v.toFixed(6))` in daily-entry-form, applied to the saved value too so noise never reaches Postgres.
- `dark:bg-input/30` in components/ui/checkbox.tsx scoped to `data-[state=unchecked]`: it ties on specificity with `data-[state=checked]:bg-primary` and Tailwind emits `dark:` last, so checked boxes kept the dark bg and the primary-foreground icon vanished. Affects every checkbox in the app.
Files touched: supabase/daily-track-migration.sql, supabase/daily-track-fix-entry-check.sql, components/daily-track/daily-entry-form.tsx, components/ui/checkbox.tsx

### Daily Track UX Pass — 2026-09-24
Goal: Total-only logging, select-all activity filters, log-day moved into a header-triggered dialog, recent-days list with edit/delete.
Deliverables:
- components/daily-track/log-day-dialog.tsx (store-driven Dialog wrapping DailyEntryForm)
- components/daily-track/recent-days.tsx (last 7 logged days in range, edit + delete)
Decisions:
- "Change" mode removed from daily-entry-form; inputs are always running totals and `toStored` keeps subtracting `totalsBefore` — storage is still a per-day delta, only the UI changed.
- Dialog state (`logDate` + openLogDay/closeLogDay) lives in daily-track-store so the header CTA and the recent-days edit button drive the same dialog; the form is remounted with `key={logDate}` because its date is internal state.
- `toggleAll` in daily-track-content is scoped to the passed group: `hidden` is one Set shared by both ActivitySelects, so a blanket clear/fill would wipe the other chart's filter.
- Delete = saveDay(date, all-null values); the entries POST turns nulls into a scoped delete and the store drops an entry whose values come back empty.
- RecentDays filters by resolveRange(range, entries) then slice(-7).reverse() — entries are stored ascending.
Files touched: store/daily-track-store.ts, components/daily-track/{daily-entry-form,daily-track-header,daily-track-content,activity-select}.tsx, + the two new files

### Daily Track Layout Pass — 2026-09-24
Goal: Wider two-column log dialog with activity search and mobile scrolling, accordion log rows, wrapping chart legend.
Decisions:
- Log dialog is `sm:max-w-2xl` + `max-h-[90vh]`; the field grid (`sm:grid-cols-2`, `max-h-[55vh] overflow-y-auto`) is the only scroll region — nesting a second one on DialogContent pushed Save below the fold on short viewports.
- The dialog search filters rendered fields only; `dirty` and submit still iterate every activity, so a filtered-out field is never wiped.
- RecentDays rows collapse to date + edit/delete; values live in the expanded panel (plain useState toggle — no Radix accordion in components/ui).
- Chart legend gets `flex-wrap` via ChartLegendContent's className rather than editing components/ui/chart.tsx; recharts measures the rendered legend box, so the wrapped rows reserve their own height.
Files touched: components/daily-track/{daily-entry-form,log-day-dialog,recent-days,number-chart}.tsx

### Recent Days Title — 2026-09-24
Goal: The logged-days card title follows the header range picker instead of being fixed at 7.
Decisions:
- `recentDaysTitle(range)` in recent-days.tsx: preset ranges ending today read "Last N logged days", any other from/to pair reads "Jun 1 – Jun 20", an empty range reads "All logged days".
- The list no longer slices to 7 — it shows every logged day inside the range, capped visually by `max-h-[420px] overflow-y-auto`.
Files touched: components/daily-track/{recent-days,daily-track-content}.tsx
- Follow-up: with no range picked the card falls back to the last 7 logged days (`DEFAULT_DAYS`), title included; an explicit range shows every day inside it.

### Auth Redirects — 2026-09-24
Goal: Unauthenticated page requests redirect to /login.
Decisions:
- proxy.ts inverted from an allowlist of protected routes to "everything except /login, /signup, /api" (old list missed /notes, /schedule); /api routes keep returning 401 JSON instead of redirecting.
- getSession() → getUser() so the cookie is verified server-side.
- Matcher now also skips .js/.json/.ico/.webmanifest so the PWA service worker and manifest aren't redirected.
Files touched: proxy.ts
