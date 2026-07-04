import clsx from "@/lib/clsx";
import type { PaymentStatus } from "@/types";

const STATUS_STYLES: Record<PaymentStatus, { bg: string; text: string; dot: string }> = {
  Recebido: { bg: "bg-green-500/15", text: "text-green-300", dot: "bg-green-400" },
  "A receber": { bg: "bg-amber-500/15", text: "text-amber-300", dot: "bg-amber-400" },
};

export default function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const styles = STATUS_STYLES[status];

  return (
    <span className={clsx("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap", styles.bg, styles.text)}>
      <span className={clsx("h-1.5 w-1.5 rounded-full", styles.dot)} />
      {status}
    </span>
  );
}
