"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Lead, LeadStatus } from "@/types";
import { LEAD_STATUSES } from "@/types";
import KanbanCard from "@/components/KanbanCard";
import EmptyState from "@/components/EmptyState";
import clsx from "@/lib/clsx";

export default function KanbanPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<LeadStatus | null>(null);

  async function loadLeads() {
    setLoading(true);
    const res = await fetch("/api/leads");
    const data = await res.json();
    setLeads(data.leads);
    setLoading(false);
  }

  useEffect(() => {
    loadLeads();
  }, []);

  const columns = useMemo(() => {
    const map: Record<LeadStatus, Lead[]> = {
      "Gerando conexão": [],
      "Conexão gerada": [],
      "Mensagem Enviada": [],
      "Em processo": [],
      "Venda Negada": [],
      "Venda Fechada": [],
      Ignorado: [],
    };
    for (const lead of leads) {
      map[lead.status]?.push(lead);
    }
    return map;
  }, [leads]);

  async function updateStatus(lead: Lead, status: LeadStatus) {
    if (lead.status === status) return;
    setLeads((prev) => prev.map((l) => (l.id === lead.id ? { ...l, status } : l)));
    await fetch(`/api/leads/${lead.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, force: true }),
    });
  }

  if (loading) return <div className="p-8 text-sm text-white/50">Carregando kanban...</div>;

  if (leads.length === 0) {
    return (
      <div className="p-4 md:p-8">
        <EmptyState
          title="Nenhum lead cadastrado ainda"
          description="Cadastre leads na página de Leads para vê-los aqui no Kanban."
        />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Kanban</h1>
        <p className="text-sm text-white/50">Arraste os cards ou use o seletor para mudar a situação</p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {LEAD_STATUSES.map((status) => (
          <div
            key={status}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverColumn(status);
            }}
            onDragLeave={() => setDragOverColumn(null)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOverColumn(null);
              const lead = leads.find((l) => l.id === draggingId);
              if (lead) updateStatus(lead, status);
              setDraggingId(null);
            }}
            className={clsx(
              "w-72 shrink-0 rounded-2xl border p-3 space-y-3 transition-colors",
              dragOverColumn === status ? "border-brand-400 bg-brand-500/15" : "border-white/15 bg-white/[0.04]",
            )}
          >
            <div className="flex items-center justify-between px-0.5 shrink-0">
              <p className="text-sm font-semibold text-white/90">{status}</p>
              <span className="rounded-full bg-white/[0.04] px-2 py-0.5 text-xs font-semibold text-white/50 shadow-sm">
                {columns[status].length}
              </span>
            </div>

            <div className="space-y-2 min-h-[60px] max-h-[60vh] overflow-y-auto pr-1">
              {columns[status].map((lead) => (
                <KanbanCard
                  key={lead.id}
                  lead={lead}
                  onOpen={() => router.push(`/leads/${lead.id}`)}
                  onStatusChange={(newStatus) => updateStatus(lead, newStatus)}
                  onDragStart={() => setDraggingId(lead.id)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
