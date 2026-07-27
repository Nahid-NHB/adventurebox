/**
 * AdventureBox admin CMS (moderation CLI).
 *
 * Lightweight moderation for AI-generated activities that were inserted as
 * `draft` and need human review before they go public. Uses the Supabase
 * service-role key (server-side only, never shipped in the app).
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/cms/moderate.ts list
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/cms/moderate.ts approve <activityId>
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/cms/moderate.ts reject  <activityId>
 *
 * This is the MVP of the admin surface described in the architecture. A full web
 * CMS (create/edit/tag/analytics) would wrap the same tables and RLS.
 */
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the environment.');
  process.exit(1);
}

const sb = createClient(url, key, { auth: { persistSession: false } });

async function list() {
  const { data, error } = await sb
    .from('activities')
    .select('id, title, category, min_age, max_age, created_at')
    .eq('source', 'ai')
    .eq('status', 'draft')
    .order('created_at', { ascending: true });
  if (error) throw error;
  if (!data || data.length === 0) {
    console.log('No AI activities pending moderation.');
    return;
  }
  console.log(`${data.length} pending:\n`);
  for (const a of data) {
    console.log(`  ${a.id}  [${a.category} ${a.min_age}-${a.max_age}]  ${a.title}`);
  }
}

async function setStatus(id: string, status: 'approved' | 'rejected') {
  const { error } = await sb.from('activities').update({ status }).eq('id', id).eq('source', 'ai');
  if (error) throw error;
  console.log(`${id} -> ${status}`);
}

async function main() {
  const [cmd, arg] = process.argv.slice(2);
  switch (cmd) {
    case 'list':
      await list();
      break;
    case 'approve':
      if (!arg) throw new Error('approve needs an activity id');
      await setStatus(arg, 'approved');
      break;
    case 'reject':
      if (!arg) throw new Error('reject needs an activity id');
      await setStatus(arg, 'rejected');
      break;
    default:
      console.log('Commands: list | approve <id> | reject <id>');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
