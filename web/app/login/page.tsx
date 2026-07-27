import { redirect } from 'next/navigation';
import { checkPassword, grantSession, isAuthed } from '@/lib/auth';

async function login(formData: FormData) {
  'use server';
  const password = String(formData.get('password') ?? '');
  const next = String(formData.get('next') ?? '/') || '/';
  if (!checkPassword(password)) {
    redirect(`/login?error=1&next=${encodeURIComponent(next)}`);
  }
  await grantSession();
  redirect(next.startsWith('/') ? next : '/');
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  if (await isAuthed()) redirect('/');
  const { error, next } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <form
        action={login}
        className="w-full max-w-sm rounded-card border border-line bg-surface p-6 shadow-sm"
      >
        <h1 className="text-xl font-bold text-ink">AdventureBox admin</h1>
        <p className="mt-1 text-sm text-ink-soft">Enter the operator password.</p>

        <input type="hidden" name="next" value={next ?? '/'} />
        <input
          type="password"
          name="password"
          autoFocus
          required
          placeholder="Password"
          className="mt-4 w-full rounded-xl border border-line px-3 py-2 outline-none focus:border-primary"
        />
        {error ? (
          <p className="mt-2 text-sm text-bad">Wrong password.</p>
        ) : null}
        <button className="mt-4 w-full rounded-pill bg-primary px-4 py-2 font-semibold text-white hover:opacity-90">
          Sign in
        </button>
      </form>
    </main>
  );
}
