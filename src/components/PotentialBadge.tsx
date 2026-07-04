import clsx from "@/lib/clsx";
import type { LeadPotential } from "@/types";

const POTENTIAL_STYLES: Record<LeadPotential, string> = {
  Alto: "bg-emerald-500/15 text-emerald-300",
  Médio: "bg-yellow-500/15 text-yellow-300",
  Baixo: "bg-white/10 text-white/50",
};

const POTENTIAL_ICON: Record<LeadPotential, string> = {
  Alto: "🔥",
  Médio: "➖",
  Baixo: "❄️",
};

export default function PotentialBadge({ potential }: { potential: LeadPotential }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap",
        POTENTIAL_STYLES[potential] ?? POTENTIAL_STYLES.Médio,
      )}
    >
      {POTENTIAL_ICON[potential]} {potential}
    </span>
  );
}
