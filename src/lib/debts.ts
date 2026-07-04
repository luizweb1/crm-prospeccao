import type { Debt, DebtStatus } from "@/types";
import { getMonthKey } from "@/lib/deals";

export function paidAmountOf(debt: Pick<Debt, "payments">): number {
  return debt.payments.reduce((sum, p) => sum + p.amount, 0);
}

export function remainingAmountOf(debt: Pick<Debt, "totalAmount" | "payments">): number {
  return Math.max(0, debt.totalAmount - paidAmountOf(debt));
}

function isOverdue(debt: Pick<Debt, "dueDate">): boolean {
  if (!debt.dueDate) return false;
  const due = new Date(debt.dueDate);
  const todayUTC = new Date(Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()));
  return due.getTime() < todayUTC.getTime();
}

/**
 * Calcula o status de uma dívida com base no valor pago e no vencimento.
 * "Atrasada" tem prioridade sobre "Pendente"/"Parcial" quando o vencimento já passou.
 */
export function getDebtStatus(debt: Pick<Debt, "totalAmount" | "payments" | "dueDate">): DebtStatus {
  const remaining = remainingAmountOf(debt);

  if (remaining <= 0) return "Pago";
  if (isOverdue(debt)) return "Atrasada";
  if (paidAmountOf(debt) > 0) return "Parcial";
  return "Pendente";
}

export function totalOutstanding(debts: Debt[]): number {
  return debts.reduce((sum, d) => sum + remainingAmountOf(d), 0);
}

/** Lista de meses (chave "YYYY-MM") presentes nos vencimentos das dívidas, do mais recente para o mais antigo. */
export function listDebtMonthKeys(debts: Debt[]): string[] {
  const keys = new Set(debts.filter((d) => d.dueDate).map((d) => getMonthKey(d.dueDate!)));
  return Array.from(keys).sort((a, b) => b.localeCompare(a));
}
