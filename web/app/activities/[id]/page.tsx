import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAuth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { Nav } from '@/components/Nav';
import { ActivityForm } from '@/components/ActivityForm';
import { rowToInput } from '@/lib/activitySchema';

export const dynamic = 'force-dynamic';

export default async function EditActivityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAuth();
  const { id } = await params;

  const { data } = await supabaseAdmin()
    .from('activities')
    .select('*')
    .eq('id', decodeURIComponent(id))
    .maybeSingle();

  if (!data) notFound();
  const initial = rowToInput(data);

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-3xl px-6 py-8">
        <Link href="/activities" className="text-sm text-ink-faint hover:text-ink">← Activities</Link>
        <div className="mt-2 flex items-center gap-3">
          <h1 className="text-2xl font-bold text-ink">Edit activity</h1>
          <span className="rounded-pill bg-canvas px-2 py-0.5 text-xs text-ink-soft">
            {data.source} · {data.status}
          </span>
        </div>
        {data.source !== 'curated' ? (
          <p className="mt-2 rounded-xl bg-warn/10 px-3 py-2 text-sm text-warn">
            This is an {data.source} row. Saving here rewrites it as curated content. For
            AI drafts, prefer the moderation queue.
          </p>
        ) : null}
        <div className="mt-6">
          <ActivityForm initial={initial} mode="edit" />
        </div>
      </main>
    </>
  );
}
