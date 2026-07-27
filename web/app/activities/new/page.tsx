import Link from 'next/link';
import { requireAuth } from '@/lib/auth';
import { Nav } from '@/components/Nav';
import { ActivityForm } from '@/components/ActivityForm';

export const dynamic = 'force-dynamic';

export default async function NewActivityPage() {
  await requireAuth();
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-3xl px-6 py-8">
        <Link href="/activities" className="text-sm text-ink-faint hover:text-ink">← Activities</Link>
        <h1 className="mt-2 text-2xl font-bold text-ink">New activity</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Authored here as a curated, public library activity.
        </p>
        <div className="mt-6">
          <ActivityForm initial={null} mode="create" />
        </div>
      </main>
    </>
  );
}
