import clsx from "@/lib/clsx";
import type { LeadStatus } from "@/types";

const STATUS_STYLES: Record<LeadStatus, { bg: string; text: string; dot: string }> = {
  "Gerando conexão": { bg: "bg-sky-500/15", text: "text-sky-300", dot: "bg-sky-400" },
  "Conexão gerada": { bg: "bg-teal-500/15", text: "text-teal-300", dot: "bg-teal-400" },
  "Mensagem Enviada": { bg: "bg-blue-500/15", text: "text-blue-300", dot: "bg-blue-400" },
  "Em processo": { bg: "bg-amber-500/15", text: "text-amber-300", dot: "bg-amber-400" },
  "Venda Negada": { bg: "bg-rose-500/15", text: "text-rose-300", dot: "bg-rose-400" },
  "Venda Fechada": { bg: "bg-green-500/15", text: "text-green-300", dot: "bg-green-400" },
  Ignorado: { bg: "bg-white/10", text: "text-white/50", dot: "bg-white/40" },
};

export default function StatusBadge({ status }: { status: LeadStatus }) {
  const styles = STATUS_STYLES[status] ?? STATUS_STYLES.Ignorado;

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap",
        styles.bg,
        styles.text,
      )}
    >
      <span className={clsx("h-1.5 w-1.5 rounded-full", styles.dot)} />
      {status}
    </span>
  );
}
