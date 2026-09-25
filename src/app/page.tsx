"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { DashboardMetrics } from "@/lib/metrics";
import type { FollowUp, Lead } from "@/types";
import { formatCurrency } from "@/lib/currency";
import { followUpCategory } from "@/lib/followUps";

interface DashboardData {
  metrics: DashboardMetrics;
  recentLeads: Lead[];
  followUps: FollowUp[];
  dueCount: number;
  activities: { id: string; description: string; createdAt: string; leadId: string; lead: { contactName: string | null; instagramUsername: string } }[];
}

function Metric({ label, value, hint, prominent = false }: { label: string; value: string | number; hint?: string; prominent?: boolean }) {
  return <div className="card p-4 md:p-5"><p className="text-xs font-medium text-white/50">{label}</p><p className={`mt-2 font-semibold tracking-tight tabular-nums ${prominent ? "text-3xl text-white" : "text-2xl text-white/90"}`}>{value}</p>{hint && <p className="mt-1 text-xs text-white/40">{hint}</p>}</div>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setHours(24, 0, 0, 0);
    fetch(`/api/dashboard?dueBefore=${encodeURIComponent(tomorrow.toISOString())}`).then(async res => { if (!res.ok) throw new Error(); return res.json(); })
      .then(setData).catch(() => setError(true)).finally(() => setLoading(false));
  }, []);

  const m = data?.metrics;
  const dueCount = data?.dueCount ?? 0;
  const funnel = m ? [
    { label: "Leads cadastrados", count: m.totalLeads },
    { label: "Contatados", count: m.contatados },
    { label: "Respostas estimadas", count: m.respostasEstimadas },
    { label: "Status de venda fechada", count: m.vendaFechada },
  ] : [];

  return <div className="mx-auto max-w-[1440px] space-y-6 p-4 md:p-8">
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6"><div><p className="text-xs font-semibold tracking-[.16em] text-brand-400">LUIIZWEB CRM</p><h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">Visão geral</h1><p className="mt-1 text-sm text-white/50">Prioridades de prospecção e resultado comercial.</p></div><Link href="/leads" className="btn-primary">Ver leads</Link></header>
    {loading && <p role="status" className="text-sm text-white/50">Carregando seu painel...</p>}
    {error && <div role="alert" className="card p-5 text-sm text-red-200">Não foi possível carregar o painel. Atualize a página para tentar novamente.</div>}
    {m && <>
      <section className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="card flex flex-wrap items-center justify-between gap-4 border-brand-500/20 p-5 md:p-6"><div><p className="text-xs font-semibold tracking-[.14em] text-brand-300">PRÓXIMA PRIORIDADE</p><p className="mt-2 text-xl font-semibold">{dueCount ? `${dueCount} ação${dueCount === 1 ? "" : "ões"} para revisar` : "Sua fila de hoje está em dia"}</p><p className="mt-1 text-sm text-white/50">{dueCount ? "Veja contatos vencidos e programados para hoje." : "Agende a próxima ação no perfil de cada lead."}</p></div><Link href="/atividades" className="btn-secondary">Abrir atividades</Link></div>
        <div className="card flex flex-wrap items-center justify-between gap-4 p-5 md:p-6"><div><p className="text-xs font-semibold tracking-[.14em] text-white/45">OPORTUNIDADE</p><p className="mt-2 text-xl font-semibold">{m.altoPotencial} leads de alto potencial</p><p className="mt-1 text-sm text-white/50">Priorize a qualificação e o próximo contato.</p></div><Link href="/leads" className="text-sm font-medium text-brand-300 hover:text-white">Ver oportunidades →</Link></div>
      </section>
      <section aria-label="Indicadores principais" className="grid grid-cols-2 gap-3 lg:grid-cols-4"><Metric prominent label="Leads cadastrados" value={m.totalLeads} /><Metric prominent label="Contatados" value={m.contatados} hint="Ao menos uma primeira mensagem" /><Metric prominent label="Respostas estimadas" value={m.respostasEstimadas} hint="Derivadas do status atual" /><Metric prominent label="Negócios registrados" value={formatCurrency(m.faturamentoFechado)} hint="Soma dos fechamentos, não do caixa" /></section>
      <section className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <div className="card p-5 md:p-6"><div className="mb-5 flex items-center justify-between"><div><h2 className="text-base font-semibold">Funil comercial</h2><p className="text-xs text-white/45">Etapas aproximadas pelos status existentes</p></div><Link href="/kanban" className="text-xs text-brand-300 hover:text-white">Ver pipeline</Link></div><div className="space-y-5">{funnel.map((stage, index) => <div key={stage.label}><div className="mb-2 flex items-center justify-between text-sm"><span className="text-white/70">{stage.label}</span><span className="font-semibold tabular-nums">{stage.count}</span></div><div className="h-2 rounded-full bg-white/10"><div className={`h-2 rounded-full ${index === 0 ? "bg-brand-500" : "bg-brand-500/70"}`} style={{ width: `${m.totalLeads ? Math.min(100, Math.max(2, stage.count / m.totalLeads * 100)) : 0}%` }} /></div></div>)}</div></div>
        <div className="card p-5 md:p-6"><h2 className="text-base font-semibold">Conversão e receita</h2><p className="mt-1 text-xs text-white/45">Interprete as taxas junto com a composição da base.</p><div className="mt-5 grid grid-cols-2 gap-4"><div><p className="text-xs text-white/50">Taxa de resposta estimada</p><p className="mt-1 text-2xl font-semibold tabular-nums">{m.taxaResposta}%</p><p className="text-xs text-white/35">Status de resposta / leads contatados</p></div><div><p className="text-xs text-white/50">Conversão da base</p><p className="mt-1 text-2xl font-semibold tabular-nums">{m.taxaFechamento}%</p><p className="text-xs text-white/35">Status fechado / total de leads</p></div><div><p className="text-xs text-white/50">Ticket médio</p><p className="mt-1 text-xl font-semibold">{formatCurrency(m.ticketMedio)}</p><p className="text-xs text-white/35">Por negócio registrado</p></div><div><p className="text-xs text-white/50">Leads sem contato recente</p><p className="mt-1 text-xl font-semibold">{m.paradosMais2Dias}</p><p className="text-xs text-white/35">Última mensagem há 2 dias ou mais</p></div></div></div>
      </section>
      <section className="grid gap-4 lg:grid-cols-[1.2fr_1fr]"><div className="card p-5 md:p-6"><div className="flex items-center justify-between"><h2 className="text-base font-semibold">Próximas ações</h2><Link href="/atividades" className="text-xs text-brand-300 hover:text-white">Ver todas</Link></div>{!data?.followUps.length ? <p className="mt-5 text-sm text-white/45">Nenhum follow-up agendado.</p> : <ul className="mt-4 divide-y divide-white/10">{data.followUps.map(item => <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 py-3"><div><Link href={`/leads/${item.leadId}`} className="text-sm font-medium hover:text-brand-300">{item.lead?.contactName || `@${item.lead?.instagramUsername}`}</Link><p className="text-xs text-white/50">{item.action}</p></div><span className={`text-xs ${followUpCategory(item) === "atrasados" ? "text-red-300" : "text-white/50"}`}>{new Date(item.dueAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}</span></li>)}</ul>}</div>
        <div className="card p-5 md:p-6"><h2 className="text-base font-semibold">Atividade recente</h2>{!data?.activities.length ? <p className="mt-5 text-sm text-white/45">Ainda não há registros.</p> : <ul className="mt-4 divide-y divide-white/10">{data.activities.map(item => <li key={item.id} className="py-3"><p className="text-sm text-white/75">{item.description}</p><p className="mt-1 text-xs text-white/40">{new Date(item.createdAt).toLocaleString("pt-BR")}</p></li>)}</ul>}</div></section>
      <section className="grid gap-4 lg:grid-cols-2">{([{ title: "Origem dos leads", values: m.porOrigem }, { title: "Nichos", values: m.porNicho }] as const).map(section => <div key={section.title} className="card p-5 md:p-6"><h2 className="text-base font-semibold">{section.title}</h2><div className="mt-4 space-y-3">{Object.entries(section.values).sort((a,b) => b[1]-a[1]).slice(0,5).map(([label,count]) => <div key={label} className="flex items-center justify-between border-b border-white/10 pb-2 text-sm"><span className="text-white/60">{label}</span><span className="tabular-nums">{count}</span></div>)}{!Object.keys(section.values).length && <p className="text-sm text-white/45">Sem dados para exibir.</p>}</div></div>)}</section>
    </>}
  </div>;
}
