export const LEAD_STATUSES = [
  "Gerando conexão",
  "Conexão gerada",
  "Mensagem Enviada",
  "Em processo",
  "Venda Negada",
  "Venda Fechada",
  "Ignorado",
] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_POTENTIALS = ["Baixo", "Médio", "Alto"] as const;
export type LeadPotential = (typeof LEAD_POTENTIALS)[number];

export const LEAD_SOURCES = [
  "Instagram",
  "Google",
  "Indicação",
  "Lista fria",
  "Site",
  "Outro",
] as const;
export type LeadSource = (typeof LEAD_SOURCES)[number];

export const MESSAGE_CHANNELS = ["WhatsApp", "Instagram", "Email", "Outro"] as const;
export type MessageChannel = (typeof MESSAGE_CHANNELS)[number];

export const TEMPLATE_STEPS = ["1º mensagem", "2º mensagem", "3º mensagem"] as const;
export type TemplateStep = (typeof TEMPLATE_STEPS)[number];

export interface Lead {
  id: string;
  contactName: string | null;
  instagramUsername: string;
  niche: string;
  websiteUrl: string | null;
  whatsappUrl: string | null;
  improvementOpportunity: string | null;
  notes: string | null;

  firstMessageText: string | null;
  firstMessageSentAt: string | null;
  firstMessageChannel: string | null;

  secondMessageText: string | null;
  secondMessageSentAt: string | null;
  secondMessageChannel: string | null;

  thirdMessageText: string | null;
  thirdMessageSentAt: string | null;
  thirdMessageChannel: string | null;

  status: LeadStatus;
  potential: LeadPotential;
  source: LeadSource;

  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  leadId: string;
  action: string;
  description: string;
  createdAt: string;
}

export interface TemplateMessage {
  id: string;
  name: string;
  text: string;
  recommendedChannel: MessageChannel;
  recommendedStep: TemplateStep;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Deal {
  id: string;
  leadId: string | null;
  clientName: string;
  serviceType: string;
  value: number;
  closedAt: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export type NextAction =
  | "Continuar interação"
  | "Enviar 1º mensagem"
  | "Aguardar"
  | "Enviar 2º mensagem"
  | "Enviar 3º mensagem"
  | "Marcar como Ignorado"
  | "Acompanhar negociação"
  | "-";
