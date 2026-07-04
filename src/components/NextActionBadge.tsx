import clsx from "@/lib/clsx";
import type { NextAction } from "@/types";

const URGENT_ACTIONS: NextAction[] = ["Enviar 1º mensagem", "Enviar 2º mensagem", "Enviar 3º mensagem", "Marcar como Ignorado"];

export default function NextActionBadge({ action }: { action: NextAction }) {
  if (action === "-") return <span className="text-white/25">—</span>;

  const urgent = URGENT_ACTIONS.includes(action);

  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        urgent ? "bg-brand-500/15 text-brand-300 ring-1 ring-brand-800" : "bg-white/[0.04] text-white/70 ring-1 ring-white/15",
      )}
    >
      {urgent && "⚡ "}
      {action}
    </span>
  );
}
