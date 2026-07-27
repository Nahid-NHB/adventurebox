import { requireAuth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { Nav } from '@/components/Nav';
import { moderate } from '../actions';

export const dynamic = 'force-dynamic';

interface DraftRow {
  id: string;
  title: string;
  category: string;
  min_age: number;
  max_age: number;
  story_intro: string;
  mission: string;
  steps: string[];
  safety_tips: string[];
  created_at: string;
}

export default async function ModerationPage() {
  await requireAuth();
  const { data } = await supabaseAdmin()
    .from('activities')
    .select('id, title, category, min_age, max_age, story_intro, mission, steps, safety_tips, created_at')
    .eq('source', 'ai')
    .eq('status', 'draft')
    .order('created_at', { ascending: true });
  const drafts = (data ?? []) as DraftRow[];

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-5xl px-6 py-8">
        <h1 className="text-2xl font-bold text-ink">Moderation queue</h1>
        <p className="mt-1 text-sm text-ink-soft">
          AI activities inserted as <code>draft</code>. Approve to publish, reject to hide.
        </p>

        {drafts.length === 0 ? (
          <div className="mt-6 rounded-card border border-line bg-surface p-8 text-center text-ink-soft">
            Nothing pending. All caught up.
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {drafts.map((d) => (
              <article key={d.id} className="rounded-card border border-line bg-surface p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-ink">{d.title}</h2>
                    <div className="mt-0.5 text-xs text-ink-faint">
                      <span className="capitalize">{d.category.replace('_', ' ')}</span>
                      {' · '}ages {d.min_age}-{d.max_age}
                      {' · '}
                      {new Date(d.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <form action={moderate}>
                      <input type="hidden" name="id" value={d.id} />
                      <input type="hidden" name="status" value="approved" />
                      <button className="rounded-pill bg-good px-4 py-1.5 text-sm font-semibold text-white hover:opacity-90">
                        Approve
                      </button>
                    </form>
                    <form action={moderate}>
                      <input type="hidden" name="id" value={d.id} />
                      <input type="hidden" name="status" value="rejected" />
                      <button className="rounded-pill border border-line px-4 py-1.5 text-sm font-semibold text-bad hover:bg-bad/5">
                        Reject
                      </button>
                    </form>
                  </div>
                </div>

                <p className="mt-3 text-sm text-ink-soft">{d.story_intro}</p>
                <p className="mt-2 text-sm font-medium text-ink">Mission: {d.mission}</p>

                {d.steps?.length ? (
                  <ol className="mt-2 list-decimal space-y-0.5 pl-5 text-sm text-ink-soft">
                    {d.steps.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ol>
                ) : null}

                {d.safety_tips?.length ? (
                  <p className="mt-2 text-xs text-warn">
                    Safety: {d.safety_tips.join(' · ')}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
