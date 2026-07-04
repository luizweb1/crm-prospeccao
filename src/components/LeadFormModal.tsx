"use client";

import { useEffect, useState } from "react";
import type { DuplicateMatch } from "@/lib/duplicates";
import type { Lead, LeadPotential, LeadSource, LeadStatus, MessageChannel } from "@/types";
import { LEAD_POTENTIALS, LEAD_SOURCES, LEAD_STATUSES } from "@/types";
import MessageFieldGroup, { type MessageFieldValue } from "@/components/MessageFieldGroup";
import DuplicateWarningDialog from "@/components/DuplicateWarningDialog";
import { daysSince } from "@/lib/nextAction";
import { NICHE_SUGGESTIONS } from "@/lib/niches";
import { generateFirstMessage } from "@/lib/messageGenerator";

const EMPTY_MESSAGE: MessageFieldValue = { text: "", sentAt: "", channel: "" };

function toMessageValue(text: string | null, sentAt: string | null, channel: string | null): MessageFieldValue {
  return {
    text: text ?? "",
    sentAt: sentAt ? sentAt.slice(0, 10) : "",
    channel: (channel as MessageChannel) ?? "",
  };
}

export interface LeadFormValues {
  contactName: string;
  instagramUsername: string;
  niche: string;
  websiteUrl: string;
  whatsappUrl: string;
  improvementOpportunity: string;
  notes: string;
  status: LeadStatus;
  potential: LeadPotential;
  source: LeadSource;
  firstMessage: MessageFieldValue;
  secondMessage: MessageFieldValue;
  thirdMessage: MessageFieldValue;
}

function leadToFormValues(lead?: Lead | null): LeadFormValues {
  return {
    contactName: lead?.contactName ?? "",
    instagramUsername: lead?.instagramUsername ?? "",
    niche: lead?.niche ?? "",
    websiteUrl: lead?.websiteUrl ?? "",
    whatsappUrl: lead?.whatsappUrl ?? "",
    improvementOpportunity: lead?.improvementOpportunity ?? "",
    notes: lead?.notes ?? "",
    status: lead?.status ?? "Gerando conexão",
    potential: lead?.potential ?? "Médio",
    source: lead?.source ?? "Outro",
    firstMessage: toMessageValue(lead?.firstMessageText ?? null, lead?.firstMessageSentAt ?? null, lead?.firstMessageChannel ?? null),
    secondMessage: toMessageValue(lead?.secondMessageText ?? null, lead?.secondMessageSentAt ?? null, lead?.secondMessageChannel ?? null),
    thirdMessage: toMessageValue(lead?.thirdMessageText ?? null, lead?.thirdMessageSentAt ?? null, lead?.thirdMessageChannel ?? null),
  };
}

function buildPayload(values: LeadFormValues, force: boolean) {
  return {
    force,
    contactName: values.contactName,
    instagramUsername: values.instagramUsername,
    niche: values.niche,
    websiteUrl: values.websiteUrl,
    whatsappUrl: values.whatsappUrl,
    improvementOpportunity: values.improvementOpportunity,
    notes: values.notes,
    status: values.status,
    potential: values.potential,
    source: values.source,
    firstMessageText: values.firstMessage.text,
    firstMessageSentAt: values.firstMessage.sentAt || null,
    firstMessageChannel: values.firstMessage.channel || null,
    secondMessageText: values.secondMessage.text,
    secondMessageSentAt: values.secondMessage.sentAt || null,
    secondMessageChannel: values.secondMessage.channel || null,
    thirdMessageText: values.thirdMessage.text,
    thirdMessageSentAt: values.thirdMessage.sentAt || null,
    thirdMessageChannel: values.thirdMessage.channel || null,
  };
}

export default function LeadFormModal({
  open,
  lead,
  onClose,
  onSaved,
}: {
  open: boolean;
  lead?: Lead | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [values, setValues] = useState<LeadFormValues>(() => leadToFormValues(lead));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duplicates, setDuplicates] = useState<DuplicateMatch[] | null>(null);

  useEffect(() => {
    if (open) {
      setValues(leadToFormValues(lead));
      setError(null);
      setDuplicates(null);
    }
  }, [open, lead]);

  if (!open) return null;

  const isEdit = !!lead;
  const daysSinceFirst = daysSince(values.firstMessage.sentAt || null);
  const daysSinceSecond = daysSince(values.secondMessage.sentAt || null);

  async function submit(force: boolean) {
    if (!values.instagramUsername.trim() || !values.niche.trim()) {
      setError("Preencha ao menos o @ do lead e o nicho.");
      return;
    }
    setSaving(true);
    setError(null);

    const url = isEdit ? `/api/leads/${lead!.id}` : "/api/leads";
    const method = isEdit ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildPayload(values, force)),
    });

    setSaving(false);

    if (res.status === 409) {
      const data = await res.json();
      setDuplicates(data.duplicates);
      return;
    }

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Erro ao salvar o lead.");
      return;
    }

    setDuplicates(null);
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-black/80 backdrop-blur-sm px-4 py-6 md:py-10">
      <div className="w-full max-w-2xl rounded-2xl bg-white/[0.04] shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-2xl border-b border-white/10 bg-black/90 backdrop-blur px-5 py-4">
          <p className="text-lg font-semibold text-white">{isEdit ? "Editar lead" : "Novo lead"}</p>
          <button onClick={onClose} className="text-white/40 hover:text-white/80 text-xl leading-none">
            ×
          </button>
        </div>

        <div className="max-h-[75vh] overflow-y-auto px-5 py-4 space-y-6">
          {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}

          <section className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wide text-brand-400">Dados do lead</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="field-label">Nome real da pessoa</label>
                <input
                  value={values.contactName}
                  onChange={(e) => setValues({ ...values, contactName: e.target.value })}
                  placeholder="Ex: Ana, João, Mariana..."
                  className="mt-1 field-input"
                />
              </div>
              <div>
                <label className="field-label">@ do lead *</label>
                <input
                  value={values.instagramUsername}
                  onChange={(e) => setValues({ ...values, instagramUsername: e.target.value })}
                  placeholder="@nomedolead ou instagram.com/nomedolead"
                  className="mt-1 field-input"
                />
              </div>
              <div>
                <label className="field-label">Nicho *</label>
                <input
                  value={values.niche}
                  onChange={(e) => setValues({ ...values, niche: e.target.value })}
                  placeholder="Selecione ou digite um nicho..."
                  list="niche-suggestions"
                  className="mt-1 field-input"
                />
                <datalist id="niche-suggestions">
                  {NICHE_SUGGESTIONS.map((n) => (
                    <option key={n} value={n} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className="field-label">Link do site ou página</label>
                <input
                  value={values.websiteUrl}
                  onChange={(e) => setValues({ ...values, websiteUrl: e.target.value })}
                  placeholder="site.com.br"
                  className="mt-1 field-input"
                />
              </div>
              <div>
                <label className="field-label">Link WhatsApp</label>
                <input
                  value={values.whatsappUrl}
                  onChange={(e) => setValues({ ...values, whatsappUrl: e.target.value })}
                  placeholder="(11) 99999-0000"
                  className="mt-1 field-input"
                />
              </div>
              <div>
                <label className="field-label">Origem do lead</label>
                <select
                  value={values.source}
                  onChange={(e) => setValues({ ...values, source: e.target.value as LeadSource })}
                  className="mt-1 field-input"
                >
                  {LEAD_SOURCES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="field-label">Potencial do lead</label>
                <select
                  value={values.potential}
                  onChange={(e) => setValues({ ...values, potential: e.target.value as LeadPotential })}
                  className="mt-1 field-input"
                >
                  {LEAD_POTENTIALS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wide text-brand-400">Análise comercial</h3>
            <div>
              <label className="field-label">O que você pode fazer pra melhorar?</label>
              <textarea
                value={values.improvementOpportunity}
                onChange={(e) => setValues({ ...values, improvementOpportunity: e.target.value })}
                rows={2}
                placeholder="Página lenta, sem CTA, copy fraca..."
                className="mt-1 field-input"
              />
            </div>
            <div>
              <label className="field-label">Observações</label>
              <textarea
                value={values.notes}
                onChange={(e) => setValues({ ...values, notes: e.target.value })}
                rows={2}
                placeholder="Anotações gerais sobre o lead..."
                className="mt-1 field-input"
              />
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wide text-brand-400">Mensagens</h3>
            <MessageFieldGroup
              title="1º mensagem"
              value={values.firstMessage}
              onChange={(v) => setValues({ ...values, firstMessage: v })}
              onGenerate={() =>
                setValues({
                  ...values,
                  firstMessage: {
                    ...values.firstMessage,
                    text: generateFirstMessage(values.contactName, values.niche, values.improvementOpportunity),
                  },
                })
              }
            />
            <MessageFieldGroup
              title="2º mensagem [após 2 dias]"
              highlight={!values.secondMessage.sentAt && !!values.firstMessage.sentAt && (daysSinceFirst ?? 0) >= 2}
              value={values.secondMessage}
              onChange={(v) => setValues({ ...values, secondMessage: v })}
            />
            <MessageFieldGroup
              title="3º mensagem [após 2 dias]"
              highlight={!values.thirdMessage.sentAt && !!values.secondMessage.sentAt && (daysSinceSecond ?? 0) >= 2}
              value={values.thirdMessage}
              onChange={(v) => setValues({ ...values, thirdMessage: v })}
            />
          </section>

          <section className="space-y-3 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wide text-brand-400">Situação e acompanhamento</h3>
            <div>
              <label className="field-label">Situação</label>
              <select
                value={values.status}
                onChange={(e) => setValues({ ...values, status: e.target.value as LeadStatus })}
                className="mt-1 field-input"
              >
                {LEAD_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </section>
        </div>

        <div className="sticky bottom-0 flex justify-end gap-2 rounded-b-2xl border-t border-white/10 bg-black/90 backdrop-blur px-5 py-3">
          <button onClick={onClose} className="btn-ghost">
            Cancelar
          </button>
          <button onClick={() => submit(false)} disabled={saving} className="btn-primary">
            {saving ? "Salvando..." : "Salvar lead"}
          </button>
        </div>
      </div>

      <DuplicateWarningDialog
        open={!!duplicates && duplicates.length > 0}
        duplicates={duplicates ?? []}
        onCancel={() => setDuplicates(null)}
        onContinueAnyway={() => submit(true)}
      />
    </div>
  );
}
