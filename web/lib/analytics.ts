import 'server-only';
import { supabaseAdmin } from './supabaseAdmin';

// Aggregate counts for the dashboard. Uses head+count queries so we never pull
// row data just to size it. All read-only.

async function count(table: string, filter?: (q: any) => any): Promise<number> {
  const sb = supabaseAdmin();
  let q = sb.from(table).select('*', { count: 'exact', head: true });
  if (filter) q = filter(q);
  const { count: c } = await q;
  return c ?? 0;
}

export interface Overview {
  families: number;
  children: number;
  activitiesCurated: number;
  activitiesAi: number;
  pendingModeration: number;
  assignments: number;
  completions: number;
  challengeCompletions: number;
  byCategory: { category: string; count: number }[];
}

export async function getOverview(): Promise<Overview> {
  const sb = supabaseAdmin();

  const [
    families, children, activitiesCurated, activitiesAi, pendingModeration,
    assignments, completions, challengeCompletions,
  ] = await Promise.all([
    count('families'),
    count('children'),
    count('activities', (q) => q.eq('source', 'curated')),
    count('activities', (q) => q.eq('source', 'ai')),
    count('activities', (q) => q.eq('source', 'ai').eq('status', 'draft')),
    count('assignments'),
    count('assignments', (q) => q.eq('status', 'completed')),
    count('weekly_challenge_progress', (q) => q.not('completed_at', 'is', null)),
  ]);

  // Category breakdown across approved activities. Small table, so pull the
  // category column and tally in memory.
  const { data: cats } = await sb
    .from('activities')
    .select('category')
    .eq('status', 'approved');
  const tally = new Map<string, number>();
  for (const r of cats ?? []) {
    tally.set(r.category, (tally.get(r.category) ?? 0) + 1);
  }
  const byCategory = [...tally.entries()]
    .map(([category, c]) => ({ category, count: c }))
    .sort((a, b) => b.count - a.count);

  return {
    families, children, activitiesCurated, activitiesAi, pendingModeration,
    assignments, completions, challengeCompletions, byCategory,
  };
}
