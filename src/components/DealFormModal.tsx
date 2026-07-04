"use client";

import { useEffect, useState } from "react";
import type { Deal, Lead } from "@/types";
import { SERVICE_TYPE_SUGGESTIONS } from "@/lib/serviceTypes";

export default function DealFormModal({
  open,
  deal,
  leads,
  defaultLeadId,
  onClose,
  onSaved,
}: {
  open: boolean;
  deal?: Deal | null;
  leads: Lead[];
  defaultLeadId?: string | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [leadId, setLeadId] = useState("");
  const [clientName, setClientName] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [value, setValue] = useState("");
  const [closedAt, setClosedAt] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      const initialLeadId = deal?.leadId ?? defaultLeadId ?? "";
      setLeadId(initialLeadId);
      setClientName(deal?.clientName ?? (initialLeadId ? leadDisplayName(leads, initialLeadId) : ""));
      setServiceType(deal?.serviceType ?? "");
      setValue(deal ? String(deal.value) : "");
      setClosedAt(deal?.closedAt ? deal.closedAt.slice(0, 10) : new Date().toISOString().slice(0, 10));
      setNotes(deal?.notes ?? "");
      setError(null);
    }
  }, [open, deal, defaultLeadId, leads]);

  if (!open) return null;

  function handleLeadChange(newLeadId: string) {
    setLeadId(newLeadId);
    if (newLeadId && !clientName.trim()) {
      setClientName(leadDisplayName(leads, newLeadId));
    }
  }

  async function handleSave() {
    if (!clientName.trim() || !serviceType.trim() || !value || !closedAt) {
      setError("Preencha cliente, tipo de serviço, valor e data de fechamento.");
      return;
    }
    setSaving(true);
    setError(null);

    const url = deal ? `/api/deals/${deal.id}` : "/api/deals";
    const method = deal ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        leadId: leadId || null,
        clientName,
        serviceType,
        value: Number(value.replace(",", ".")),
        closedAt,
        notes,
      }),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Erro ao salvar o cliente fechado.");
      return;
    }

    onSaved();
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white/[0.04] p-5 shadow-2xl space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold text-white">{deal ? "Editar cliente fechado" : "Novo cliente fechado"}</p>
          <button onClick={onClose} className="text-white/40 hover:text-white/80 text-xl leading-none">
            ×
          </button>
        </div>

        {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}

        <div>
          <label className="field-label">Vincular a um lead do funil (opcional)</label>
          <select value={leadId} onChange={(e) => handleLeadChange(e.target.value)} className="mt-1 field-input">
            <option value="">Nenhum, projeto avulso</option>
            {leads.map((l) => (
              <option key={l.id} value={l.id}>
                {leadDisplayName(leads, l.id)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="field-label">Nome do cliente *</label>
          <input value={clientName} onChange={(e) => setClientName(e.target.value)} className="mt-1 field-input" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="field-label">Tipo de serviço *</label>
            <input
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              placeholder="Selecione ou digite..."
              list="service-type-suggestions"
              className="mt-1 field-input"
            />
            <datalist id="service-type-suggestions">
              {SERVICE_TYPE_SUGGESTIONS.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </div>
          <div>
            <label className="field-label">Valor (R$) *</label>
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              inputMode="decimal"
              placeholder="0,00"
              className="mt-1 field-input"
            />
          </div>
        </div>

        <div>
          <label className="field-label">Data de fechamento *</label>
          <input
            type="date"
            value={closedAt}
            onChange={(e) => setClosedAt(e.target.value)}
            className="mt-1 field-input"
          />
        </div>

        <div>
          <label className="field-label">Observações</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="mt-1 field-input" />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="btn-ghost">
            Cancelar
          </button>
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function leadDisplayName(leads: Lead[], leadId: string): string {
  const lead = leads.find((l) => l.id === leadId);
  if (!lead) return "";
  return lead.contactName ? `${lead.contactName} (@${lead.instagramUsername})` : `@${lead.instagramUsername}`;
}
