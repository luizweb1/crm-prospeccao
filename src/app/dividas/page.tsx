"use client";

import { useEffect, useMemo, useState } from "react";
import type { Debt, Deal } from "@/types";
import DebtFormModal from "@/components/DebtFormModal";
import RegisterPaymentModal from "@/components/RegisterPaymentModal";
import DebtStatusBadge from "@/components/DebtStatusBadge";
import ConfirmDialog from "@/components/ConfirmDialog";
import EmptyState from "@/components/EmptyState";
import { formatCurrency } from "@/lib/currency";
import { formatMonthLabel, getMonthKey, totalValue } from "@/lib/deals";
import { getDebtStatus, listDebtMonthKeys, paidAmountOf, remainingAmountOf, totalOutstanding } from "@/lib/debts";
import clsx from "@/lib/clsx";

export default function DividasPage() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [monthFilter, setMonthFilter] = useState<string>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [payingDebt, setPayingDebt] = useState<Debt | null>(null);
  const [deletingDebt, setDeletingDebt] = useState<Debt | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const [debtsRes, dealsRes] = await Promise.all([fetch("/api/debts"), fetch("/api/deals")]);
    const debtsData = await debtsRes.json();
    const dealsData = await dealsRes.json();
    setDebts(debtsData.debts);
    setDeals(dealsData.deals);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const monthKeys = useMemo(() => listDebtMonthKeys(debts), [debts]);

  const filtered = useMemo(() => {
    if (monthFilter === "all") return debts;
    return debts.filter((d) => d.dueDate && getMonthKey(d.dueDate) === monthFilter);
  }, [debts, monthFilter]);

  const outstandingTotal = useMemo(() => totalOutstanding(debts), [debts]);

  const monthBalance = useMemo(() => {
    if (monthFilter === "all") return null;
    const revenue = totalValue(deals.filter((d) => getMonthKey(d.closedAt) === monthFilter));
    const debtDue = totalValue(
      filtered.map((d) => ({ value: d.totalAmount }) as Deal),
    );
    return { revenue, debtDue, balance: revenue - debtDue };
  }, [monthFilter, deals, filtered]);

  async function handleDelete() {
    if (!deletingDebt) return;
    await fetch(`/api/debts/${deletingDebt.id}`, { method: "DELETE" });
    setDeletingDebt(null);
    load();
  }

  function openCreate() {
    setEditingDebt(null);
    setFormOpen(true);
  }

  function openEdit(debt: Debt) {
    setEditingDebt(debt);
    setFormOpen(true);
  }

  async function handleDeletePayment(paymentId: string, debtId: string) {
    await fetch(`/api/debts/${debtId}/payments/${paymentId}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="p-4 md:p-8 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Controle financeiro</h1>
          <p className="text-sm text-white/50">Suas dívidas, vencimentos e pagamentos.</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          + Nova dívida
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-white/40">Total em aberto</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-red-400">{formatCurrency(outstandingTotal)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-white/40">Dívidas cadastradas</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white">{debts.length}</p>
        </div>
      </div>

      <div className="card p-4 flex flex-wrap items-center gap-3">
        <label className="text-xs font-semibold text-white/50">Mês de vencimento:</label>
        <select value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} className="field-input w-auto">
          <option value="all">Todas as dívidas</option>
          {monthKeys.map((key) => (
            <option key={key} value={key}>
              {formatMonthLabel(key)}
            </option>
          ))}
        </select>

        {monthBalance && (
          <div className="ml-auto text-xs text-white/50">
            Saldo do mês (faturamento em Clientes menos dívidas com vencimento neste mês):{" "}
            <span className={clsx("font-semibold", monthBalance.balance >= 0 ? "text-green-400" : "text-red-400")}>
              {formatCurrency(monthBalance.balance)}
            </span>
          </div>
        )}
      </div>

      {loading && <p className="text-sm text-white/50">Carregando...</p>}

      {!loading && filtered.length === 0 && (
        <EmptyState
          title={debts.length === 0 ? "Nenhuma dívida cadastrada" : "Nenhuma dívida nesse mês"}
          description="Cadastre suas dívidas aqui para acompanhar quanto deve e ir quitando aos poucos."
          action={
            debts.length === 0 && (
              <button onClick={openCreate} className="btn-primary">
                + Cadastrar dívida
              </button>
            )
          }
        />
      )}

      {!loading && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((debt) => {
            const status = getDebtStatus(debt);
            const paid = paidAmountOf(debt);
            const remaining = remainingAmountOf(debt);
            const expanded = expandedId === debt.id;

            return (
              <div key={debt.id} className="card p-4 space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-white/90">{debt.description}</p>
                      <DebtStatusBadge status={status} />
                    </div>
                    <p className="text-sm text-white/50">
                      {debt.category}
                      {debt.dueDate && ` · vence em ${new Date(debt.dueDate).toLocaleDateString("pt-BR", { timeZone: "UTC" })}`}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold text-white">{formatCurrency(remaining)}</p>
                    <p className="text-xs text-white/40">
                      pago {formatCurrency(paid)} de {formatCurrency(debt.totalAmount)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {status !== "Pago" && (
                    <button onClick={() => setPayingDebt(debt)} className="btn-secondary text-xs px-3 py-1.5">
                      Registrar pagamento
                    </button>
                  )}
                  <button onClick={() => setExpandedId(expanded ? null : debt.id)} className="btn-ghost text-xs px-3 py-1.5">
                    {expanded ? "Ocultar pagamentos" : `Ver pagamentos (${debt.payments.length})`}
                  </button>
                  <button onClick={() => openEdit(debt)} className="btn-ghost text-xs px-3 py-1.5">
                    Editar
                  </button>
                  <button onClick={() => setDeletingDebt(debt)} className="btn-ghost text-xs px-3 py-1.5 hover:text-red-400">
                    Excluir
                  </button>
                </div>

                {expanded && (
                  <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 space-y-1.5">
                    {debt.payments.length === 0 && <p className="text-xs text-white/40">Nenhum pagamento registrado ainda.</p>}
                    {debt.payments.map((p) => (
                      <div key={p.id} className="flex items-center justify-between text-sm">
                        <span className="text-white/70">{new Date(p.paidAt).toLocaleDateString("pt-BR", { timeZone: "UTC" })}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white/90">{formatCurrency(p.amount)}</span>
                          <button
                            onClick={() => handleDeletePayment(p.id, debt.id)}
                            className="text-xs text-white/30 hover:text-red-400"
                          >
                            remover
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <DebtFormModal
        open={formOpen}
        debt={editingDebt}
        onClose={() => setFormOpen(false)}
        onSaved={() => {
          setFormOpen(false);
          load();
        }}
      />

      <RegisterPaymentModal
        open={!!payingDebt}
        debt={payingDebt}
        onClose={() => setPayingDebt(null)}
        onSaved={() => {
          setPayingDebt(null);
          load();
        }}
      />

      <ConfirmDialog
        open={!!deletingDebt}
        title="Excluir dívida?"
        description={deletingDebt ? `A dívida "${deletingDebt.description}" e seu histórico de pagamentos serão removidos permanentemente.` : undefined}
        confirmLabel="Excluir"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeletingDebt(null)}
      />
    </div>
  );
}
