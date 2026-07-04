export default function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 bg-white/[0.03] py-16 px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-500/15 text-2xl mb-3">🗒️</div>
      <p className="text-base font-semibold text-white/90">{title}</p>
      {description && <p className="mt-1 text-sm text-white/50 max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
