import type { Deal } from "@/types";

/**
 * Chave de mês (ex: "2026-07") a partir de uma data de fechamento. Usa os
 * componentes UTC porque a data vem de um <input type="date">, salva como
 * meia-noite UTC (mesma lógica de formatMessageDate em lib/nextAction.ts).
 */
export function getMonthKey(date: string | Date): string {
  const d = new Date(date);
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

/** Formata uma chave "YYYY-MM" para "Julho de 2026". */
export function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split("-").map(Number);
  return `${MONTH_NAMES[month - 1]} de ${year}`;
}

/** Lista de meses (chave "YYYY-MM") presentes nos deals, do mais recente para o mais antigo. */
export function listMonthKeys(deals: Deal[]): string[] {
  const keys = new Set(deals.map((d) => getMonthKey(d.closedAt)));
  return Array.from(keys).sort((a, b) => b.localeCompare(a));
}

export function totalValue(deals: Deal[]): number {
  return deals.reduce((sum, d) => sum + d.value, 0);
}

/** Soma só o valor dos clientes com pagamento já recebido (o que realmente entrou). */
export function totalReceived(deals: Deal[]): number {
  return totalValue(deals.filter((d) => d.paymentStatus === "Recebido"));
}

/** Soma o valor dos clientes fechados mas com pagamento ainda pendente. */
export function totalPending(deals: Deal[]): number {
  return totalValue(deals.filter((d) => d.paymentStatus === "A receber"));
}
