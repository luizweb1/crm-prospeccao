import type { Lead } from "@/types";
import { calculateNextAction, isStale, needsActionToday } from "@/lib/nextAction";

export interface DashboardMetrics {
  totalLeads: number;
  totalMessagesSent: number;
  emProcesso: number;
  vendaFechada: number;
  vendaNegada: number;
  ignorado: number;
  taxaResposta: number;
  taxaFechamento: number;
  precisamAcaoHoje: number;
  paradosMais2Dias: number;
  altoPotencial: number;
  cadastradosHoje: number;
  porNicho: Record<string, number>;
  porOrigem: Record<string, number>;
}

function isToday(date: string | Date): boolean {
  const d = new Date(date);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

export function calculateDashboardMetrics(leads: Lead[]): DashboardMetrics {
  const totalLeads = leads.length;

  let totalMessagesSent = 0;
  let respondentes = 0;

  const porNicho: Record<string, number> = {};
  const porOrigem: Record<string, number> = {};

  let emProcesso = 0;
  let vendaFechada = 0;
  let vendaNegada = 0;
  let ignorado = 0;
  let precisamAcaoHoje = 0;
  let paradosMais2Dias = 0;
  let altoPotencial = 0;
  let cadastradosHoje = 0;

  for (const lead of leads) {
    if (isToday(lead.createdAt)) cadastradosHoje += 1;

    if (lead.firstMessageSentAt) totalMessagesSent += 1;
    if (lead.secondMessageSentAt) totalMessagesSent += 1;
    if (lead.thirdMessageSentAt) totalMessagesSent += 1;

    if (lead.status === "Em processo" || lead.status === "Venda Fechada") {
      respondentes += 1;
    }

    porNicho[lead.niche] = (porNicho[lead.niche] ?? 0) + 1;
    porOrigem[lead.source] = (porOrigem[lead.source] ?? 0) + 1;

    if (lead.status === "Em processo") emProcesso += 1;
    if (lead.status === "Venda Fechada") vendaFechada += 1;
    if (lead.status === "Venda Negada") vendaNegada += 1;
    if (lead.status === "Ignorado") ignorado += 1;
    if (lead.potential === "Alto") altoPotencial += 1;

    if (needsActionToday(lead)) precisamAcaoHoje += 1;
    if (isStale(lead)) paradosMais2Dias += 1;
  }

  const leadsComPrimeiraMensagem = leads.filter((l) => l.firstMessageSentAt).length;
  const taxaResposta = leadsComPrimeiraMensagem > 0 ? (respondentes / leadsComPrimeiraMensagem) * 100 : 0;
  const taxaFechamento = totalLeads > 0 ? (vendaFechada / totalLeads) * 100 : 0;

  return {
    totalLeads,
    totalMessagesSent,
    emProcesso,
    vendaFechada,
    vendaNegada,
    ignorado,
    taxaResposta: Math.round(taxaResposta * 10) / 10,
    taxaFechamento: Math.round(taxaFechamento * 10) / 10,
    precisamAcaoHoje,
    paradosMais2Dias,
    altoPotencial,
    cadastradosHoje,
    porNicho,
    porOrigem,
  };
}

export function nextActionLabel(lead: Lead): string {
  return calculateNextAction(lead);
}
