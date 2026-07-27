# AdventureBox backend (Supabase)

Everything here is optional. The app runs fully offline with stubs. Wire this up
when you want cloud sync, real auth, and live AI generation.

## Setup

```bash
# 1. Create a project at supabase.com, then link the CLI
supabase link --project-ref <your-ref>

# 2. Apply the schema + RLS
supabase db push        # runs migrations/0001_init.sql

# 3. Deploy the AI proxy and set the key server-side
supabase functions deploy ai-generate
supabase secrets set OPENROUTER_API_KEY=sk-or-...

# 4. Point the app at the backend (.env)
EXPO_PUBLIC_USE_REAL_AUTH=true
EXPO_PUBLIC_USE_REAL_SYNC=true
EXPO_PUBLIC_USE_REAL_AI=true
EXPO_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
EXPO_PUBLIC_AI_PROXY_URL=https://<ref>.functions.supabase.co/ai-generate
```

## What the schema gives you

- A `families` row is auto-created on signup (trigger `handle_new_user`), along
  with `family_settings` and `streaks`. Parent-only, one family per user.
- Row Level Security on every family-owned table via `owns_family()`, keyed on
  `families.owner_user_id = auth.uid()`.
- Curated activities are world-readable; AI/user activities are family-scoped.
- A private `journal` storage bucket, scoped by the `families/<family_id>/` path
  prefix so a parent can only read/write their own photos.

## Moderation / admin

AI-generated activities land with `status = 'approved'` on-device (already gated
by the client-side safety check). If you want human moderation before they sync
publicly, insert them as `draft` and use `scripts/cms/moderate.ts` to review and
approve. See that script's header for usage.
