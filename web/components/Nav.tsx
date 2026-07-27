import Link from 'next/link';

const links = [
  { href: '/', label: 'Dashboard' },
  { href: '/moderation', label: 'Moderation' },
  { href: '/activities', label: 'Activities' },
];

export function Nav() {
  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-bold text-ink">
            AdventureBox <span className="text-ink-faint font-normal">admin</span>
          </Link>
          <nav className="flex gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-pill px-3 py-1.5 text-sm font-medium text-ink-soft hover:bg-primary-soft hover:text-primary"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <form action="/api/logout" method="post">
          <button className="text-sm text-ink-faint hover:text-bad">Sign out</button>
        </form>
      </div>
    </header>
  );
}
