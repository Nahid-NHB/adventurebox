import Link from 'next/link';
import { requireAuth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { Nav } from '@/components/Nav';
import { CATEGORIES, ACTIVITY_SOURCES, ACTIVITY_STATUS } from '@/lib/enums';

export const dynamic = 'force-dynamic';

interface Row {
  id: string;
  title: string;
  category: string;
  source: string;
  status: string;
  min_age: number;
  max_age: number;
  premium_pack: string | null;
}

const statusTone: Record<string, string> = {
  approved: 'bg-good/10 text-good',
  draft: 'bg-warn/10 text-warn',
  rejected: 'bg-bad/10 text-bad',
};

export default async function ActivitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ source?: string; status?: string; category?: string; q?: string }>;
}) {
  await requireAuth();
  const sp = await searchParams;

  let query = supabaseAdmin()
    .from('activities')
    .select('id, title, category, source, status, min_age, max_age, premium_pack')
    .order('created_at', { ascending: false })
    .limit(300);

  if (sp.source) query = query.eq('source', sp.source);
  if (sp.status) query = query.eq('status', sp.status);
  if (sp.category) query = query.eq('category', sp.category);
  if (sp.q) query = query.ilike('title', `%${sp.q}%`);

  const { data } = await query;
  const rows = (data ?? []) as Row[];

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-ink">Activities</h1>
          <Link
            href="/activities/new"
            className="rounded-pill bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            + New activity
          </Link>
        </div>

        <form className="mt-5 flex flex-wrap gap-2" method="get">
          <input
            name="q"
            defaultValue={sp.q ?? ''}
            placeholder="Search title…"
            className="rounded-xl border border-line px-3 py-1.5 text-sm outline-none focus:border-primary"
          />
          <select name="source" defaultValue={sp.source ?? ''} className="rounded-xl border border-line px-3 py-1.5 text-sm">
            <option value="">Any source</option>
            {ACTIVITY_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select name="status" defaultValue={sp.status ?? ''} className="rounded-xl border border-line px-3 py-1.5 text-sm">
            <option value="">Any status</option>
            {ACTIVITY_STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select name="category" defaultValue={sp.category ?? ''} className="rounded-xl border border-line px-3 py-1.5 text-sm">
            <option value="">Any category</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <button className="rounded-pill border border-line px-4 py-1.5 text-sm font-medium hover:bg-canvas">
            Filter
          </button>
          <Link href="/activities" className="rounded-pill px-3 py-1.5 text-sm text-ink-faint hover:text-ink">
            Reset
          </Link>
        </form>

        <div className="mt-5 overflow-hidden rounded-card border border-line bg-surface">
          <table className="w-full text-sm">
            <thead className="border-b border-line text-left text-xs uppercase tracking-wider text-ink-faint">
              <tr>
                <th className="px-4 py-2.5">Title</th>
                <th className="px-4 py-2.5">Category</th>
                <th className="px-4 py-2.5">Ages</th>
                <th className="px-4 py-2.5">Source</th>
                <th className="px-4 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-ink-soft">
                    No activities match.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="border-b border-line/60 last:border-0 hover:bg-canvas/50">
                    <td className="px-4 py-2.5">
                      <Link href={`/activities/${encodeURIComponent(r.id)}`} className="font-medium text-primary hover:underline">
                        {r.title}
                      </Link>
                      {r.premium_pack ? (
                        <span className="ml-2 rounded-pill bg-primary-soft px-2 py-0.5 text-xs text-primary">
                          {r.premium_pack}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-2.5 capitalize text-ink-soft">{r.category.replace('_', ' ')}</td>
                    <td className="px-4 py-2.5 text-ink-soft">{r.min_age}-{r.max_age}</td>
                    <td className="px-4 py-2.5 text-ink-soft">{r.source}</td>
                    <td className="px-4 py-2.5">
                      <span className={`rounded-pill px-2 py-0.5 text-xs font-medium ${statusTone[r.status] ?? 'bg-canvas text-ink-soft'}`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-ink-faint">Showing up to 300 rows.</p>
      </main>
    </>
  );
}
