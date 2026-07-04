import type { Lead, NextAction } from "@/types";

const MS_PER_DAY = 1000 * 60 * 60 * 24;
export const CADENCE_DAYS = 2;

/**
 * Formata uma data de envio de mensagem (1º/2º/3º mensagem) em pt-BR.
 * Essas datas vêm de um <input type="date"> e são salvas como meia-noite UTC,
 * então precisam ser exibidas em UTC também — senão, em fusos atrás de UTC
 * (como o horário do Brasil), o dia exibido "volta" um dia.
 */
export function formatMessageDate(date: string | Date | null | undefined): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

/**
 * Calcula quantos dias de calendário se passaram desde uma data de envio de
 * mensagem (1º/2º/3º mensagem) até hoje. Compara datas de calendário (o dia
 * salvo em UTC vs. o dia local de hoje), em vez da diferença bruta em
 * milissegundos — senão, dependendo da hora do dia, uma mensagem enviada
 * "ontem" podia contar como 2 dias atrás (mesmo bug de fuso da exibição).
 */
export function daysSince(date: string | Date | null | undefined): number | null {
  if (!date) return null;
  const then = new Date(date);
  if (Number.isNaN(then.getTime())) return null;

  const thenUTCDay = Date.UTC(then.getUTCFullYear(), then.getUTCMonth(), then.getUTCDate());

  const now = new Date();
  const todayLocalDay = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());

  return Math.round((todayLocalDay - thenUTCDay) / MS_PER_DAY);
}

/** Data do último contato (mensagem mais recente enviada). */
export function getLastContactDate(lead: Pick<Lead, "firstMessageSentAt" | "secondMessageSentAt" | "thirdMessageSentAt">): string | null {
  return lead.thirdMessageSentAt ?? lead.secondMessageSentAt ?? lead.firstMessageSentAt ?? null;
}

export function daysSinceLastContact(lead: Pick<Lead, "firstMessageSentAt" | "secondMessageSentAt" | "thirdMessageSentAt">): number | null {
  return daysSince(getLastContactDate(lead));
}

type NextActionInput = Pick<
  Lead,
  | "status"
  | "firstMessageSentAt"
  | "secondMessageSentAt"
  | "thirdMessageSentAt"
>;

/**
 * Calcula a próxima ação recomendada com base nas datas de envio das
 * mensagens e na situação atual do lead.
 */
export function calculateNextAction(lead: NextActionInput): NextAction {
  if (lead.status === "Venda Fechada" || lead.status === "Venda Negada" || lead.status === "Ignorado") {
    return "-";
  }

  if (lead.status === "Em processo") {
    return "Acompanhar negociação";
  }

  if (lead.status === "Gerando conexão") {
    return "Continuar interação";
  }

  if (lead.status === "Conexão gerada") {
    return "Enviar 1º mensagem";
  }

  if (!lead.firstMessageSentAt) {
    return "Enviar 1º mensagem";
  }

  const daysSinceFirst = daysSince(lead.firstMessageSentAt) ?? 0;

  if (!lead.secondMessageSentAt) {
    return daysSinceFirst >= CADENCE_DAYS ? "Enviar 2º mensagem" : "Aguardar";
  }

  const daysSinceSecond = daysSince(lead.secondMessageSentAt) ?? 0;

  if (!lead.thirdMessageSentAt) {
    return daysSinceSecond >= CADENCE_DAYS ? "Enviar 3º mensagem" : "Aguardar";
  }

  // As três mensagens foram enviadas e a situação segue "Mensagem Enviada" (sem resposta).
  return "Marcar como Ignorado";
}

export function needsSecondMessage(lead: NextActionInput): boolean {
  return calculateNextAction(lead) === "Enviar 2º mensagem";
}

export function needsThirdMessage(lead: NextActionInput): boolean {
  return calculateNextAction(lead) === "Enviar 3º mensagem";
}

export function isAwaitingResponse(lead: NextActionInput): boolean {
  return lead.status === "Mensagem Enviada" && !!lead.firstMessageSentAt && !lead.thirdMessageSentAt;
}

export function hasNoResponseAfterThreeMessages(lead: NextActionInput): boolean {
  return lead.status === "Mensagem Enviada" && !!lead.thirdMessageSentAt;
}

/** Lead parado há mais de N dias sem avanço de situação (baseado no último contato). */
export function isStale(lead: Pick<Lead, "status" | "firstMessageSentAt" | "secondMessageSentAt" | "thirdMessageSentAt">, minDays = CADENCE_DAYS): boolean {
  if (lead.status === "Venda Fechada" || lead.status === "Venda Negada" || lead.status === "Ignorado") {
    return false;
  }
  const days = daysSinceLastContact(lead);
  return days !== null && days >= minDays;
}

/** Lead precisa de alguma ação hoje (enviar mensagem ou marcar como ignorado). */
export function needsActionToday(lead: NextActionInput): boolean {
  const action = calculateNextAction(lead);
  return action !== "Aguardar" && action !== "-" && action !== "Acompanhar negociação" && action !== "Continuar interação";
}
