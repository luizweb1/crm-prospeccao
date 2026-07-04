import clsx from "@/lib/clsx";
import type { DebtStatus } from "@/types";

const STATUS_STYLES: Record<DebtStatus, { bg: string; text: string; dot: string }> = {
  Pendente: { bg: "bg-blue-500/15", text: "text-blue-300", dot: "bg-blue-400" },
  Parcial: { bg: "bg-amber-500/15", text: "text-amber-300", dot: "bg-amber-400" },
  Pago: { bg: "bg-green-500/15", text: "text-green-300", dot: "bg-green-400" },
  Atrasada: { bg: "bg-rose-500/15", text: "text-rose-300", dot: "bg-rose-400" },
};

export default function DebtStatusBadge({ status }: { status: DebtStatus }) {
  const styles = STATUS_STYLES[status];

  return (
    <span className={clsx("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap", styles.bg, styles.text)}>
      <span className={clsx("h-1.5 w-1.5 rounded-full", styles.dot)} />
      {status}
    </span>
  );
}
