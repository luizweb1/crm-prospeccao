"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Deal, Lead } from "@/types";
import DealFormModal from "@/components/DealFormModal";
import ConfirmDialog from "@/components/ConfirmDialog";
import EmptyState from "@/components/EmptyState";
import InstagramLink from "@/components/InstagramLink";
import PaymentStatusBadge from "@/components/PaymentStatusBadge";
import { formatCurrency } from "@/lib/currency";
import { formatMonthLabel, getMonthKey, listMonthKeys, totalPending, totalReceived } from "@/lib/deals";

type DealWithLead = Deal & { lead: { id: string; instagramUsername: string; contactName: string | null } | null };

export default function ClientesPage() {
  return (
    <Suspense fallback={<div className="p-4 md:p-8 text-sm text-white/50">Carregando...</div>}>
      <ClientesPageContent />
    </Suspense>
  );
}

function ClientesPageContent() {
  const searchParams = useSearchParams();
  const [deals, setDeals] = useState<DealWithLead[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [monthFilter, setMonthFilter] = useState<string>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [deletingDeal, setDeletingDeal] = useState<Deal | null>(null);
  const [defaultLeadId, setDefaultLeadId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const [dealsRes, leadsRes] = await Promise.all([fetch("/api/deals"), fetch("/api/leads")]);
    const dealsData = await dealsRes.json();
    const leadsData = await leadsRes.json();
    setDeals(dealsData.deals);
    setLeads(leadsData.leads);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const leadIdFromUrl = searchParams.get("novoLeadId");
    if (leadIdFromUrl) {
      setDefaultLeadId(leadIdFromUrl);
      setEditingDeal(null);
      setFormOpen(true);
    }
  }, [searchParams]);

  const monthKeys = useMemo(() => listMonthKeys(deals), [deals]);

  const filtered = useMemo(() => {
    if (monthFilter === "all") return deals;
    return deals.filter((d) => getMonthKey(d.closedAt) === monthFilter);
  }, [deals, monthFilter]);

  const received = useMemo(() => totalReceived(filtered), [filtered]);
  const pending = useMemo(() => totalPending(filtered), [filtered]);

  async function handleDelete() {
    if (!deletingDeal) return;
    await fetch(`/api/deals/${deletingDeal.id}`, { method: "DELETE" });
    setDeletingDeal(null);
    load();
  }

  function openCreate() {
    setEditingDeal(null);
    setDefaultLeadId(null);
    setFormOpen(true);
  }

  function openEdit(deal: Deal) {
    setEditingDeal(deal);
    setDefaultLeadId(null);
    setFormOpen(true);
  }

  return (
    <div className="p-4 md:p-8 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Clientes fechados</h1>
          <p className="text-sm text-white/50">Controle de quem fechou, tipo de serviço e valor.</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          + Novo cliente fechado
        </button>
      </div>

      <div className="card p-4 flex flex-wrap items-center gap-3">
        <label className="text-xs font-semibold text-white/50">Mês:</label>
        <select value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} className="field-input w-auto">
          <option value="all">Todos os meses</option>
          {monthKeys.map((key) => (
            <option key={key} value={key}>
              {formatMonthLabel(key)}
            </option>
          ))}
        </select>
        <div className="ml-auto flex flex-wrap gap-4 text-sm text-white/70">
          <span>
            Recebido: <span className="text-lg font-bold text-green-400">{formatCurrency(received)}</span>
          </span>
          <span>
            A receber: <span className="text-lg font-bold text-amber-400">{formatCurrency(pending)}</span>
          </span>
        </div>
      </div>

      {loading && <p className="text-sm text-white/50">Carregando...</p>}

      {!loading && filtered.length === 0 && (
        <EmptyState
          title={deals.length === 0 ? "Nenhum cliente fechado ainda" : "Nenhum cliente fechado nesse mês"}
          description="Registre aqui os clientes que fecharam com você, vindos do funil de leads ou de projetos avulsos."
          action={
            deals.length === 0 && (
              <button onClick={openCreate} className="btn-primary">
                + Registrar cliente fechado
              </button>
            )
          }
        />
      )}

      {!loading && filtered.length > 0 && (
        <>
          <div className="hidden md:block overflow-x-auto card">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-xs font-semibold uppercase tracking-wide text-white/40">
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Serviço</th>
                  <th className="px-4 py-3">Valor</th>
                  <th className="px-4 py-3">Pagamento</th>
                  <th className="px-4 py-3">Fechamento</th>
                  <th className="px-4 py-3">Lead de origem</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((deal) => (
                  <tr
                    key={deal.id}
                    onClick={() => openEdit(deal)}
                    className="cursor-pointer border-b border-white/10 last:border-0 hover:bg-white/[0.08] transition-colors"
                  >
                    <td className="px-4 py-3.5 font-medium text-white/90">{deal.clientName}</td>
                    <td className="px-4 py-3.5 text-white/70">{deal.serviceType}</td>
                    <td className="px-4 py-3.5 font-semibold text-brand-400">{formatCurrency(deal.value)}</td>
                    <td className="px-4 py-3.5">
                      <PaymentStatusBadge status={deal.paymentStatus} />
                    </td>
                    <td className="px-4 py-3.5 text-white/50 whitespace-nowrap">
                      {new Date(deal.closedAt).toLocaleDateString("pt-BR", { timeZone: "UTC" })}
                    </td>
                    <td className="px-4 py-3.5">
                      {deal.lead ? <InstagramLink username={deal.lead.instagramUsername} /> : <span className="text-white/25">projeto avulso</span>}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingDeal(deal);
                        }}
                        className="text-xs font-medium text-white/40 hover:text-red-400"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-3">
            {filtered.map((deal) => (
              <div key={deal.id} onClick={() => openEdit(deal)} className="card p-4 space-y-1.5">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-white/90">{deal.clientName}</p>
                  <p className="font-bold text-brand-400">{formatCurrency(deal.value)}</p>
                </div>
                <p className="text-sm text-white/50">{deal.serviceType}</p>
                <PaymentStatusBadge status={deal.paymentStatus} />
                <div className="flex items-center justify-between text-xs text-white/40">
                  <span>{new Date(deal.closedAt).toLocaleDateString("pt-BR", { timeZone: "UTC" })}</span>
                  {deal.lead ? <InstagramLink username={deal.lead.instagramUsername} /> : <span>projeto avulso</span>}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <DealFormModal
        open={formOpen}
        deal={editingDeal}
        leads={leads}
        defaultLeadId={defaultLeadId}
        onClose={() => setFormOpen(false)}
        onSaved={() => {
          setFormOpen(false);
          load();
        }}
      />

      <ConfirmDialog
        open={!!deletingDeal}
        title="Excluir cliente fechado?"
        description={deletingDeal ? `O registro de "${deletingDeal.clientName}" será removido permanentemente.` : undefined}
        confirmLabel="Excluir"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeletingDeal(null)}
      />
    </div>
  );
}
