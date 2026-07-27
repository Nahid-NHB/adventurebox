export function StatCard({
  label, value, hint, tone = 'default',
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: 'default' | 'warn' | 'good';
}) {
  const valueTone =
    tone === 'warn' ? 'text-warn' : tone === 'good' ? 'text-good' : 'text-primary';
  return (
    <div className="rounded-card border border-line bg-surface p-4">
      <div className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
        {label}
      </div>
      <div className={`mt-1 text-3xl font-bold ${valueTone}`}>{value}</div>
      {hint ? <div className="mt-1 text-xs text-ink-soft">{hint}</div> : null}
    </div>
  );
}
