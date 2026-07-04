"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import DashboardCard from "@/components/DashboardCard";
import InstagramLink from "@/components/InstagramLink";
import type { DashboardMetrics } from "@/lib/metrics";
import type { Lead } from "@/types";

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/dashboard").then((r) => r.json()),
      fetch("/api/leads").then((r) => r.json()),
    ])
      .then(([dashboardData, leadsData]) => {
        setMetrics(dashboardData.metrics);
        setLeads(leadsData.leads);
      })
      .finally(() => setLoading(false));
  }, []);

  const recentLeads = useMemo(
    () =>
      [...leads]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 6),
    [leads],
  );

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Dashboard</h1>
          <p className="text-sm text-white/50">Visão geral da sua prospecção</p>
        </div>
        <Link href="/leads" className="btn-primary">
          + Novo lead
        </Link>
      </div>

      {loading && <p className="text-sm text-white/50">Carregando métricas...</p>}

      {metrics && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <DashboardCard label="Total de leads" value={metrics.totalLeads} tone="brand" icon="👥" />
            <DashboardCard label="Mensagens enviadas" value={metrics.totalMessagesSent} icon="✉️" />
            <DashboardCard label="Em processo" value={metrics.emProcesso} tone="warning" icon="🤝" />
            <DashboardCard label="Vendas fechadas" value={metrics.vendaFechada} tone="success" icon="✅" />
            <DashboardCard label="Vendas negadas" value={metrics.vendaNegada} tone="danger" icon="✖️" />
            <DashboardCard label="Ignorados" value={metrics.ignorado} icon="🙈" />
            <DashboardCard label="Taxa de resposta" value={`${metrics.taxaResposta}%`} icon="📈" />
            <DashboardCard label="Taxa de fechamento" value={`${metrics.taxaFechamento}%`} tone="success" icon="🏆" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <DashboardCard
              label="Precisam de ação hoje"
              value={metrics.precisamAcaoHoje}
              tone="danger"
              icon="⚡"
              hint="Enviar mensagem ou marcar como ignorado"
            />
            <DashboardCard
              label="Parados há mais de 2 dias"
              value={metrics.paradosMais2Dias}
              tone="warning"
              icon="⏳"
            />
            <DashboardCard label="Alto potencial" value={metrics.altoPotencial} tone="brand" icon="🔥" />
            <DashboardCard label="Cadastrados hoje" value={metrics.cadastradosHoje} tone="brand" icon="🆕" />
          </div>

          <div className="card p-5">
            <p className="text-sm font-semibold text-white/90 mb-3">Últimos leads cadastrados</p>
            <ul className="space-y-2">
              {recentLeads.map((lead) => (
                <li
                  key={lead.id}
                  className="flex items-center justify-between text-sm border-b border-white/10 pb-2 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <InstagramLink username={lead.instagramUsername} />
                    <span className="text-white/40 truncate">{lead.niche}</span>
                  </div>
                  <span className="text-xs text-white/40 whitespace-nowrap">
                    {new Date(lead.createdAt).toLocaleDateString("pt-BR")} às{" "}
                    {new Date(lead.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </li>
              ))}
              {recentLeads.length === 0 && <p className="text-sm text-white/40">Nenhum lead cadastrado ainda.</p>}
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card p-5">
              <p className="text-sm font-semibold text-white/90 mb-3">Leads por nicho</p>
              <ul className="space-y-2">
                {Object.entries(metrics.porNicho)
                  .sort((a, b) => b[1] - a[1])
                  .map(([niche, count]) => (
                    <li key={niche} className="flex items-center justify-between text-sm border-b border-white/10 pb-2 last:border-0 last:pb-0">
                      <span className="text-white/70">{niche}</span>
                      <span className="rounded-full bg-white/[0.08] px-2.5 py-0.5 text-xs font-semibold text-white/90">{count}</span>
                    </li>
                  ))}
                {Object.keys(metrics.porNicho).length === 0 && (
                  <p className="text-sm text-white/40">Nenhum lead cadastrado ainda.</p>
                )}
              </ul>
            </div>

            <div className="card p-5">
              <p className="text-sm font-semibold text-white/90 mb-3">Leads por origem</p>
              <ul className="space-y-2">
                {Object.entries(metrics.porOrigem)
                  .sort((a, b) => b[1] - a[1])
                  .map(([source, count]) => (
                    <li key={source} className="flex items-center justify-between text-sm border-b border-white/10 pb-2 last:border-0 last:pb-0">
                      <span className="text-white/70">{source}</span>
                      <span className="rounded-full bg-white/[0.08] px-2.5 py-0.5 text-xs font-semibold text-white/90">{count}</span>
                    </li>
                  ))}
                {Object.keys(metrics.porOrigem).length === 0 && (
                  <p className="text-sm text-white/40">Nenhum lead cadastrado ainda.</p>
                )}
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
