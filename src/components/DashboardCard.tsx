import clsx from "@/lib/clsx";

const TONE_STYLES: Record<string, { text: string; iconBg: string }> = {
  default: { text: "text-white", iconBg: "bg-white/[0.08] text-white/50" },
  success: { text: "text-green-400", iconBg: "bg-green-500/15 text-green-400" },
  danger: { text: "text-red-400", iconBg: "bg-red-500/15 text-red-400" },
  warning: { text: "text-amber-400", iconBg: "bg-amber-500/15 text-amber-400" },
  brand: { text: "text-brand-400", iconBg: "bg-brand-500/15 text-brand-400" },
};

export default function DashboardCard({
  label,
  value,
  hint,
  icon,
  tone = "default",
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: string;
  tone?: "default" | "success" | "danger" | "warning" | "brand";
}) {
  const styles = TONE_STYLES[tone] ?? TONE_STYLES.default;

  return (
    <div className="card p-4 transition-shadow hover:shadow-card-hover">
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-white/40">{label}</p>
        {icon && (
          <span className={clsx("flex h-8 w-8 items-center justify-center rounded-lg text-sm", styles.iconBg)}>
            {icon}
          </span>
        )}
      </div>
      <p className={clsx("mt-2 text-3xl font-bold tracking-tight", styles.text)}>{value}</p>
      {hint && <p className="mt-1 text-xs text-white/40">{hint}</p>}
    </div>
  );
}
