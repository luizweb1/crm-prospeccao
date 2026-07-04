import clsx from "@/lib/clsx";
import type { FinanceType } from "@/types";

const TYPE_STYLES: Record<FinanceType, string> = {
  Dívida: "bg-purple-500/15 text-purple-300",
  Gasto: "bg-cyan-500/15 text-cyan-300",
};

export default function FinanceTypeBadge({ type }: { type: FinanceType }) {
  return (
    <span className={clsx("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap", TYPE_STYLES[type])}>
      {type}
    </span>
  );
}
