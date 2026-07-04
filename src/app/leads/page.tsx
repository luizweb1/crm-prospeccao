"use client";

import { useEffect, useMemo, useState } from "react";
import type { Lead } from "@/types";
import LeadFilters, { DEFAULT_FILTERS, type LeadFiltersState } from "@/components/LeadFilters";
import { applyLeadFilters } from "@/lib/applyFilters";
import StatusBadge from "@/components/StatusBadge";
import PotentialBadge from "@/components/PotentialBadge";
import NextActionBadge from "@/components/NextActionBadge";
import InstagramLink from "@/components/InstagramLink";
import ExternalLink from "@/components/ExternalLink";
import CopyButton from "@/components/CopyButton";
import EmptyState from "@/components/EmptyState";
import ConfirmDialog from "@/components/ConfirmDialog";
import LeadFormModal from "@/components/LeadFormModal";
import ImportCsvModal from "@/components/ImportCsvModal";
import { calculateNextAction, daysSinceLastContact, formatMessageDate, getLastContactDate, isStale, needsActionToday } from "@/lib/nextAction";
import clsx from "@/lib/clsx";

type SortField = "createdAt" | "lastContact" | "nextAction" | "status" | "niche" | "potential" | "source";

const SORT_OPTIONS: { value: SortField; label: string }[] = [
  { value: "createdAt", label: "Data de cadastro" },
  { value: "lastContact", label: "Último contato" },
  { value: "nextAction", label: "Próxima ação" },
  { value: "status", label: "Situação" },
  { value: "niche", label: "Nicho" },
  { value: "potential", label: "Potencial do Lead" },
  { value: "source", label: "Origem do Lead" },
];

const POTENTIAL_ORDER: Record<string, number> = { Alto: 3, Médio: 2, Baixo: 1 };

function sortLeads(leads: Lead[], field: SortField): Lead[] {
  const copy = [...leads];
  copy.sort((a, b) => {
    switch (field) {
      case "lastContact": {
        const da = getLastContactDate(a);
        const db = getLastContactDate(b);
        return (db ? new Date(db).getTime() : 0) - (da ? new Date(da).getTime() : 0);
      }
      case "nextAction":
        return calculateNextAction(a).localeCompare(calculateNextAction(b));
      case "status":
        return a.status.localeCompare(b.status);
      case "niche":
        return a.niche.localeCompare(b.niche);
      case "potential":
        return (POTENTIAL_ORDER[b.potential] ?? 0) - (POTENTIAL_ORDER[a.potential] ?? 0);
      case "source":
        return a.source.localeCompare(b.source);
      case "createdAt":
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });
  return copy;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<LeadFiltersState>(DEFAULT_FILTERS);
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [formOpen, setFormOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [deletingLead, setDeletingLead] = useState<Lead | null>(null);
  const [importOpen, setImportOpen] = useState(false);

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

  const niches = useMemo(() => Array.from(new Set(leads.map((l) => l.niche))).sort(), [leads]);

  const filtered = useMemo(() => sortLeads(applyLeadFilters(leads, filters), sortField), [leads, filters, sortField]);

  async function handleDelete() {
    if (!deletingLead) return;
    await fetch(`/api/leads/${deletingLead.id}`, { method: "DELETE" });
    setDeletingLead(null);
    loadLeads();
  }

  function openCreate() {
    setEditingLead(null);
    setFormOpen(true);
  }

  function openEdit(lead: Lead) {
    setEditingLead(lead);
    setFormOpen(true);
  }

  return (
    <div className="p-4 md:p-8 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Leads</h1>
          <p className="text-sm text-white/50">
            <span className="font-semibold text-white/90">{filtered.length}</span> de {leads.length} leads
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setImportOpen(true)} className="btn-secondary">
            Importar CSV
          </button>
          <a href="/api/leads/export" className="btn-secondary">
            Exportar CSV
          </a>
          <button onClick={openCreate} className="btn-primary">
            + Novo lead
          </button>
        </div>
      </div>

      <div className="card p-4">
        <LeadFilters filters={filters} onChange={setFilters} niches={niches} />

        <div className="mt-3 flex items-center gap-2 border-t border-white/10 pt-3">
          <label className="text-xs font-semibold text-white/50">Ordenar por:</label>
          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value as SortField)}
            className="rounded-lg border border-white/15 bg-white/[0.04] px-2 py-1 text-xs text-white/90 focus:border-brand-400 focus:outline-none"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && <p className="text-sm text-white/50">Carregando leads...</p>}

      {!loading && filtered.length === 0 && (
        <EmptyState
          title={leads.length === 0 ? "Nenhum lead cadastrado ainda" : "Nenhum lead encontrado"}
          description={
            leads.length === 0
              ? "Cadastre seu primeiro lead frio para começar a prospecção."
              : "Ajuste os filtros ou a busca para encontrar leads."
          }
          action={
            leads.length === 0 && (
              <button onClick={openCreate} className="btn-primary">
                + Cadastrar lead
              </button>
            )
          }
        />
      )}

      {!loading && filtered.length > 0 && (
        <>
          {/* Tabela — desktop */}
          <div className="hidden md:block overflow-x-auto card">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-xs font-semibold uppercase tracking-wide text-white/40">
                  <th className="px-4 py-3">Nome</th>
                  <th className="px-4 py-3">@</th>
                  <th className="px-4 py-3">Nicho</th>
                  <th className="px-4 py-3">Site</th>
                  <th className="px-4 py-3">WhatsApp</th>
                  <th className="px-4 py-3">Potencial</th>
                  <th className="px-4 py-3">Situação</th>
                  <th className="px-4 py-3">Próxima ação</th>
                  <th className="px-4 py-3">Cadastro</th>
                  <th className="px-4 py-3">Último contato</th>
                  <th className="px-4 py-3">Dias</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((lead) => {
                  const days = daysSinceLastContact(lead);
                  const needsAction = needsActionToday(lead);
                  const stale = isStale(lead);
                  return (
                    <tr
                      key={lead.id}
                      onClick={() => openEdit(lead)}
                      className={clsx(
                        "cursor-pointer border-b border-white/10 last:border-0 hover:bg-white/[0.08] transition-colors",
                        needsAction && "bg-brand-500/10",
                      )}
                    >
                      <td className="px-4 py-3.5 text-white/70">{lead.contactName || <span className="text-white/25">—</span>}</td>
                      <td className="px-4 py-3.5 font-medium">
                        <InstagramLink username={lead.instagramUsername} />
                      </td>
                      <td className="px-4 py-3.5 text-white/70">{lead.niche}</td>
                      <td className="px-4 py-3.5">
                        {lead.websiteUrl ? (
                          <ExternalLink href={lead.websiteUrl}>Abrir site</ExternalLink>
                        ) : (
                          <span className="text-white/25">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        {lead.whatsappUrl ? (
                          <ExternalLink href={lead.whatsappUrl}>WhatsApp</ExternalLink>
                        ) : (
                          <span className="text-white/25">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <PotentialBadge potential={lead.potential} />
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={lead.status} />
                      </td>
                      <td className="px-4 py-3.5">
                        <NextActionBadge action={calculateNextAction(lead)} />
                      </td>
                      <td className="px-4 py-3.5 text-white/50 whitespace-nowrap">
                        {new Date(lead.createdAt).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-4 py-3.5 text-white/50 whitespace-nowrap">
                        {formatMessageDate(getLastContactDate(lead))}
                      </td>
                      <td className={clsx("px-4 py-3.5 whitespace-nowrap", stale ? "text-red-400 font-semibold" : "text-white/50")}>
                        {days !== null ? `${days}d` : "—"}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingLead(lead);
                          }}
                          className="text-xs font-medium text-white/40 hover:text-red-400"
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Cards — mobile */}
          <div className="md:hidden space-y-3">
            {filtered.map((lead) => {
              const days = daysSinceLastContact(lead);
              const needsAction = needsActionToday(lead);
              return (
                <div
                  key={lead.id}
                  onClick={() => openEdit(lead)}
                  className={clsx(
                    "card p-4 space-y-2",
                    needsAction && "border-brand-800 bg-brand-500/10",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      {lead.contactName && <p className="text-sm font-semibold text-white">{lead.contactName}</p>}
                      <InstagramLink username={lead.instagramUsername} className={lead.contactName ? "text-xs" : "text-base font-semibold"} />
                    </div>
                    <PotentialBadge potential={lead.potential} />
                  </div>
                  <p className="text-sm text-white/50">{lead.niche}</p>
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <StatusBadge status={lead.status} />
                    <NextActionBadge action={calculateNextAction(lead)} />
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm pt-1">
                    {lead.websiteUrl && <ExternalLink href={lead.websiteUrl}>Site</ExternalLink>}
                    {lead.whatsappUrl && <ExternalLink href={lead.whatsappUrl}>WhatsApp</ExternalLink>}
                    <CopyButton text={`@${lead.instagramUsername}`} label="Copiar @" />
                  </div>
                  <div className="flex items-center justify-between text-xs text-white/40">
                    <span>Cadastrado em {new Date(lead.createdAt).toLocaleDateString("pt-BR")}</span>
                    <span>{days !== null ? `${days} dia(s) desde o último contato` : "Sem contato ainda"}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <LeadFormModal
        open={formOpen}
        lead={editingLead}
        onClose={() => setFormOpen(false)}
        onSaved={() => {
          setFormOpen(false);
          loadLeads();
        }}
      />

      <ImportCsvModal open={importOpen} onClose={() => setImportOpen(false)} onImported={loadLeads} />

      <ConfirmDialog
        open={!!deletingLead}
        title="Excluir lead?"
        description={deletingLead ? `O lead @${deletingLead.instagramUsername} será removido permanentemente.` : undefined}
        confirmLabel="Excluir"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeletingLead(null)}
      />
    </div>
  );
}
