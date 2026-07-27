import Link from 'next/link';
import { requireAuth } from '@/lib/auth';
import { getOverview } from '@/lib/analytics';
import { Nav } from '@/components/Nav';
import { StatCard } from '@/components/StatCard';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  await requireAuth();
  const o = await getOverview();
  const maxCat = Math.max(1, ...o.byCategory.map((c) => c.count));
  const completionRate = o.assignments
    ? Math.round((o.completions / o.assignments) * 100)
    : 0;

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-ink">Dashboard</h1>
          {o.pendingModeration > 0 ? (
            <Link
              href="/moderation"
              className="rounded-pill bg-warn/10 px-3 py-1.5 text-sm font-semibold text-warn hover:bg-warn/20"
            >
              {o.pendingModeration} awaiting review →
            </Link>
          ) : null}
        </div>

        <section className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Families" value={o.families} />
          <StatCard label="Children" value={o.children} />
          <StatCard label="Curated" value={o.activitiesCurated} hint="public library" />
          <StatCard
            label="AI activities"
            value={o.activitiesAi}
            hint={`${o.pendingModeration} draft`}
            tone={o.pendingModeration > 0 ? 'warn' : 'default'}
          />
          <StatCard label="Assignments" value={o.assignments} />
          <StatCard
            label="Completed"
            value={o.completions}
            hint={`${completionRate}% completion`}
            tone="good"
          />
          <StatCard label="Challenges done" value={o.challengeCompletions} tone="good" />
          <StatCard
            label="Pending review"
            value={o.pendingModeration}
            tone={o.pendingModeration > 0 ? 'warn' : 'default'}
          />
        </section>

        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-faint">
            Approved activities by category
          </h2>
          <div className="mt-3 space-y-2 rounded-card border border-line bg-surface p-4">
            {o.byCategory.length === 0 ? (
              <p className="text-sm text-ink-soft">No approved activities yet.</p>
            ) : (
              o.byCategory.map((c) => (
                <div key={c.category} className="flex items-center gap-3">
                  <div className="w-28 shrink-0 text-sm capitalize text-ink-soft">
                    {c.category.replace('_', ' ')}
                  </div>
                  <div className="h-3 flex-1 rounded-pill bg-canvas">
                    <div
                      className="h-3 rounded-pill bg-primary"
                      style={{ width: `${Math.round((c.count / maxCat) * 100)}%` }}
                    />
                  </div>
                  <div className="w-8 text-right text-sm font-medium text-ink">
                    {c.count}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </>
  );
}
