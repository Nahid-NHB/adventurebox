# AdventureBox admin CMS

Web dashboard for the people running AdventureBox: moderate AI-generated
activities, author and tag the curated library, and see how the app is being
used. It's a small Next.js app that talks to the same Supabase project as the
mobile app, using the service-role key server-side (so it bypasses RLS the same
way the `scripts/cms/moderate.ts` CLI does).

This is separate from the Expo app. It has its own `package.json` and does not
ship in the mobile bundle.

## What's here

- **Dashboard** (`/`) - families, children, activity counts, completion rate,
  weekly-challenge completions, and a category breakdown of the library.
- **Moderation** (`/moderation`) - the queue of AI activities sitting in
  `draft`. Approve to publish, reject to hide. Same rule as the CLI: only
  `source = 'ai'` rows are touched.
- **Activities** (`/activities`) - the full library with search + source/status/
  category filters. Create, edit, tag, and delete curated activities. The editor
  writes the exact shape the app reads (mirrors `ActivityDraftSchema`), validated
  with zod on the server before it hits the database.

## Auth

One shared operator password (`ADMIN_PASSWORD`). Signing in sets an httpOnly
session cookie whose value is `ADMIN_SESSION_TOKEN`. `middleware.ts` gates every
route except `/login`, and each page re-checks server-side. It's deliberately
simple: this is an internal tool for a small team, not a multi-tenant product.

## Run it

```bash
cd web
cp .env.example .env.local   # fill in the four values
npm install
npm run dev                  # http://localhost:3000
```

Point it at the same Supabase project the app uses. You need the **service-role**
key (Project Settings → API), not the anon key. Keep it server-side only.

```bash
npm run build && npm start   # production
npm run typecheck            # tsc, no emit
```

## Deploy

Any Node host works (Vercel is the obvious one). Set the four env vars from
`.env.example` in the host's dashboard. Nothing here is edge-specific except the
auth middleware, which only reads the session cookie.

## Notes

- The activity enums (`lib/enums.ts`) are copied by hand from the app's
  `src/types/domain.ts`. If those change, update both.
- Editing an AI row through the activity editor rewrites it as curated content.
  For plain approve/reject, use the moderation queue instead.
