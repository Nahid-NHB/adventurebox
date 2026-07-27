# AdventureBox

AI-powered, offline-first activity planner for parents of kids aged 3 to 12. Open the app, get a personalized real-world activity in under 15 seconds, then put the phone down. The phone is a mission planner, not the toy.

## Why it's built this way

"Offline-first + instant" is in tension with "AI-generated daily." The resolution: a curated, tagged activity library lives in local SQLite and is the source of truth. The matching engine ranks it synchronously, so the home screen never waits on the network or an LLM. When online, a background pipeline generates fresh personalized activities through OpenRouter, runs them through a safety gate, and inserts them into the same local library. If the network is down or the model is slow, the user never notices.

## Running it

```bash
npm install
npm start        # Expo dev server
npm test         # jest (pure logic: matching, safety, streaks, sync, seed)
npm run typecheck
```

The app runs fully offline with zero credentials. Every external service (AI, auth, sync, subscription, weather) has a stub implementation selected by default. Flip the `EXPO_PUBLIC_USE_REAL_*` flags in `.env` (see `.env.example`) to wire real backends.

## Architecture map

| Concern | Where |
| --- | --- |
| Domain model + zod schemas | `src/types/domain.ts` |
| Matching engine (pure, deterministic) | `src/lib/matchingEngine.ts` |
| Child-safety gate | `src/lib/safety.ts` |
| Streaks / explorer levels | `src/lib/streak.ts` |
| Offline sync outbox logic | `src/lib/syncQueue.ts` |
| AI prompt architecture | `src/lib/prompt.ts` |
| Curated activity library (seed) | `src/database/seed/activities.ts` |
| SQLite schema + migrations | `src/database/schema.ts` |
| Repositories | `src/database/repositories/*` |
| Service abstractions (stub + real) | `src/services/{ai,auth,sync,subscription,weather,notifications}` |
| AI generation pipeline | `src/services/ai/pipeline.ts` |
| State (Zustand) | `src/store/*` |
| Data hooks (React Query) | `src/hooks/*` |
| Screens / navigation | `src/app/*` (Expo Router) |
| Design tokens | `src/theme/tokens.ts` + `tailwind.config.js` |

The full architecture writeup (database schema, Supabase RLS, subscription flow, notification strategy, security, roadmap) lives in the plan file that generated this project.

## The 15-second path

`src/app/(app)/index.tsx` renders `useTodaysAdventure`, which builds a `GenContext` from local child + settings + weather + history and calls the pure `pickActivity` over the cached SQLite library. Seeded on `date + childId` so today's pick is stable across launches; the "Another" button advances a per-child offset. No AI on this path.

## Safety and privacy

Parent-only accounts (no child login), no ads, no chat, no social, no public profiles. COPPA-aware: the only child data stored is a first name and age. OpenRouter keys are never bundled; real AI calls go through a server proxy. Every activity, curated or AI-generated, passes `checkSafety` before it can reach a child.

## What's built

Runs offline with zero credentials (stubs): onboarding, home, activity detail, curated library (28 activities incl. cooperative/premium), matching, streaks, weekly challenges (deterministic per-week rotation, gentle progress), journal with photo capture, family, settings, paywall, full local SQLite persistence, and the sync outbox.

Real integrations, selected by the `EXPO_PUBLIC_USE_REAL_*` flags:

| Capability | Real implementation | File |
| --- | --- | --- |
| Auth (Google/Apple/email) | Supabase OAuth + OTP | `src/services/auth/supabase.ts` |
| Cloud sync | Supabase push/pull over the outbox | `src/services/sync/supabase.ts` + `manager.ts` |
| AI generation | OpenRouter via a server proxy | `src/services/ai/openrouter.ts` + `supabase/functions/ai-generate` |
| Background generation | Throttled, online-only, off the render path | `src/hooks/useBackgroundGeneration.ts` |
| Subscription | RevenueCat | `src/services/subscription/revenuecat.ts` |
| Weather | Open-Meteo + device location | `src/services/weather/openmeteo.ts` |
| Notifications | expo-notifications (local, daily) | `src/services/notifications/expo.ts` |
| Photo storage | Supabase Storage (family-scoped) | `src/services/media.ts` |
| Backend schema + RLS | Postgres migration | `supabase/migrations/0001_init.sql` |
| Admin / moderation | Service-role CLI + web CMS | `scripts/cms/moderate.ts`, `web/` |

See `supabase/README.md` to provision the backend. Everything degrades gracefully: if the network, a key, or the backend is missing, the app falls back to the local curated experience without an error surface.

## Web admin CMS

`web/` is a standalone Next.js dashboard for operators: moderate AI drafts, author and tag the curated library (with server-side zod validation matching the app schema), and view usage analytics. It talks to the same Supabase project via the service-role key, server-side only. See `web/README.md` to run it. The `scripts/cms/moderate.ts` CLI still works for quick command-line moderation on the same tables.
