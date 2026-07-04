"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { ActivityLog, Lead } from "@/types";
import InstagramLink from "@/components/InstagramLink";
import ExternalLink from "@/components/ExternalLink";
import CopyButton from "@/components/CopyButton";
import StatusBadge from "@/components/StatusBadge";
import PotentialBadge from "@/components/PotentialBadge";
import NextActionBadge from "@/components/NextActionBadge";
import LeadFormModal from "@/components/LeadFormModal";
import { calculateNextAction, daysSince, formatMessageDate } from "@/lib/nextAction";
import { getInstagramUrl } from "@/lib/normalize";

function MessageHistoryItem({
  title,
  text,
  sentAt,
  channel,
}: {
  title: string;
  text: string | null;
  sentAt: string | null;
  channel: string | null;
}) {
  return (
    <div className="rounded-lg border border-white/15 p-3 space-y-1">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-white/90">{title}</p>
        {sentAt ? (
          <span className="text-xs text-white/40">
            {formatMessageDate(sentAt)} · {channel ?? "canal não informado"}
          </span>
        ) : (
          <span className="text-xs text-white/25">não enviada</span>
        )}
      </div>
      {text && (
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm text-white/70 whitespace-pre-wrap">{text}</p>
          <CopyButton text={text} label="Copiar" />
        </div>
      )}
    </div>
  );
}

export default function LeadDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [lead, setLead] = useState<Lead | null>(null);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [notFound, setNotFound] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/leads/${params.id}`);
    if (res.status === 404) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    const data = await res.json();
    setLead(data.lead);
    setActivities(data.activities);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  if (loading) return <div className="p-8 text-sm text-white/50">Carregando lead...</div>;
  if (notFound || !lead) {
    return (
      <div className="p-8">
        <p className="text-sm text-white/50">Lead não encontrado.</p>
        <button onClick={() => router.push("/leads")} className="mt-2 text-sm font-medium text-brand-400 hover:underline">
          Voltar para leads
        </button>
      </div>
    );
  }

  const nextAction = calculateNextAction(lead);
  const daysSinceCreated = daysSince(lead.createdAt);

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-4xl">
      <button onClick={() => router.push("/leads")} className="text-sm font-medium text-white/50 hover:text-brand-400 transition-colors">
        ← Voltar para leads
      </button>

      <div className="card p-5 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            {lead.contactName && <p className="text-lg font-bold text-white">{lead.contactName}</p>}
            <div className="flex items-center gap-2">
              <InstagramLink username={lead.instagramUsername} className={lead.contactName ? "text-sm" : "text-xl font-bold"} />
              <CopyButton text={`@${lead.instagramUsername}`} label="Copiar @" />
              <CopyButton text={getInstagramUrl(lead.instagramUsername)} label="Copiar link" />
            </div>
            <p className="text-sm text-white/50 mt-0.5">{lead.niche}</p>
          </div>
          <div className="flex gap-2">
            {lead.status === "Venda Fechada" && (
              <button onClick={() => router.push(`/clientes?novoLeadId=${lead.id}`)} className="btn-secondary">
                💰 Registrar fechamento
              </button>
            )}
            <button onClick={() => setEditOpen(true)} className="btn-primary">
              Editar lead
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <StatusBadge status={lead.status} />
          <PotentialBadge potential={lead.potential} />
          <NextActionBadge action={nextAction} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs font-medium text-white/40">Site ou página</p>
            {lead.websiteUrl ? <ExternalLink href={lead.websiteUrl}>{lead.websiteUrl}</ExternalLink> : <p className="text-white/25">—</p>}
          </div>
          <div>
            <p className="text-xs font-medium text-white/40">WhatsApp</p>
            {lead.whatsappUrl ? <ExternalLink href={lead.whatsappUrl}>{lead.whatsappUrl}</ExternalLink> : <p className="text-white/25">—</p>}
          </div>
          <div>
            <p className="text-xs font-medium text-white/40">Origem do lead</p>
            <p className="text-white/90">{lead.source}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-white/40">Data de cadastro</p>
            <p className="text-white/90">
              {new Date(lead.createdAt).toLocaleDateString("pt-BR")}
              {daysSinceCreated !== null && (
                <span className="text-white/40"> · há {daysSinceCreated} dia(s)</span>
              )}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-white/40">Última atualização</p>
            <p className="text-white/90">{new Date(lead.updatedAt).toLocaleDateString("pt-BR")}</p>
          </div>
        </div>
      </div>

      <div className="card p-5 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wide text-white/40">Análise comercial</h3>
        <div>
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-medium text-white/40 mb-1">O que você pode fazer pra melhorar?</p>
            {lead.improvementOpportunity && <CopyButton text={lead.improvementOpportunity} label="Copiar" />}
          </div>
          <p className="text-sm text-white/90 whitespace-pre-wrap">{lead.improvementOpportunity || "—"}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-white/40 mb-1">Observações</p>
          <p className="text-sm text-white/90 whitespace-pre-wrap">{lead.notes || "—"}</p>
        </div>
      </div>

      <div className="card p-5 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wide text-white/40">Histórico de mensagens</h3>
        <MessageHistoryItem
          title="1º mensagem"
          text={lead.firstMessageText}
          sentAt={lead.firstMessageSentAt}
          channel={lead.firstMessageChannel}
        />
        <MessageHistoryItem
          title="2º mensagem"
          text={lead.secondMessageText}
          sentAt={lead.secondMessageSentAt}
          channel={lead.secondMessageChannel}
        />
        <MessageHistoryItem
          title="3º mensagem"
          text={lead.thirdMessageText}
          sentAt={lead.thirdMessageSentAt}
          channel={lead.thirdMessageChannel}
        />
      </div>

      <div className="card p-5 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wide text-white/40">Histórico de atividade</h3>
        {activities.length === 0 && <p className="text-sm text-white/40">Nenhuma atividade registrada.</p>}
        <ul className="space-y-2">
          {activities.map((a) => (
            <li key={a.id} className="flex items-start justify-between gap-3 text-sm border-b border-white/10 pb-2">
              <span className="text-white/70">{a.description}</span>
              <span className="text-xs text-white/40 whitespace-nowrap">
                {new Date(a.createdAt).toLocaleString("pt-BR")}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <LeadFormModal
        open={editOpen}
        lead={lead}
        onClose={() => setEditOpen(false)}
        onSaved={() => {
          setEditOpen(false);
          load();
        }}
      />
    </div>
  );
}
