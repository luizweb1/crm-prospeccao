import Papa from "papaparse";
import type { Lead } from "@/types";
import { getInstagramUrl } from "@/lib/normalize";
import { calculateNextAction } from "@/lib/nextAction";

export const EXPORT_HEADERS = [
  "Nome",
  "@",
  "Instagram URL",
  "Nicho",
  "Link do site ou página",
  "Link WhatsApp",
  "O que você pode fazer pra melhorar?",
  "Observações",
  "1º mensagem",
  "Data da 1º mensagem",
  "Canal da 1º mensagem",
  "2º mensagem",
  "Data da 2º mensagem",
  "Canal da 2º mensagem",
  "3º mensagem",
  "Data da 3º mensagem",
  "Canal da 3º mensagem",
  "Situação",
  "Potencial do Lead",
  "Origem do Lead",
  "Próxima ação",
  "Data de criação",
  "Última atualização",
] as const;

export function leadsToCsv(leads: Lead[]): string {
  const rows = leads.map((lead) => ({
    Nome: lead.contactName ?? "",
    "@": `@${lead.instagramUsername}`,
    "Instagram URL": getInstagramUrl(lead.instagramUsername),
    Nicho: lead.niche,
    "Link do site ou página": lead.websiteUrl ?? "",
    "Link WhatsApp": lead.whatsappUrl ?? "",
    "O que você pode fazer pra melhorar?": lead.improvementOpportunity ?? "",
    Observações: lead.notes ?? "",
    "1º mensagem": lead.firstMessageText ?? "",
    "Data da 1º mensagem": lead.firstMessageSentAt ?? "",
    "Canal da 1º mensagem": lead.firstMessageChannel ?? "",
    "2º mensagem": lead.secondMessageText ?? "",
    "Data da 2º mensagem": lead.secondMessageSentAt ?? "",
    "Canal da 2º mensagem": lead.secondMessageChannel ?? "",
    "3º mensagem": lead.thirdMessageText ?? "",
    "Data da 3º mensagem": lead.thirdMessageSentAt ?? "",
    "Canal da 3º mensagem": lead.thirdMessageChannel ?? "",
    Situação: lead.status,
    "Potencial do Lead": lead.potential,
    "Origem do Lead": lead.source,
    "Próxima ação": calculateNextAction(lead),
    "Data de criação": lead.createdAt,
    "Última atualização": lead.updatedAt,
  }));

  return Papa.unparse(rows, { columns: EXPORT_HEADERS as unknown as string[] });
}

export interface ImportRow {
  contactName?: string;
  instagramUsername?: string;
  niche?: string;
  websiteUrl?: string;
  whatsappUrl?: string;
  improvementOpportunity?: string;
  notes?: string;
  status?: string;
  potential?: string;
  source?: string;
}

const IMPORT_COLUMN_ALIASES: Record<string, keyof ImportRow> = {
  nome: "contactName",
  "nome do lead": "contactName",
  "nome real": "contactName",
  contactname: "contactName",
  "@": "instagramUsername",
  instagram: "instagramUsername",
  "@ do lead": "instagramUsername",
  instagramusername: "instagramUsername",
  nicho: "niche",
  niche: "niche",
  "link do site ou página": "websiteUrl",
  "link do site": "websiteUrl",
  site: "websiteUrl",
  website: "websiteUrl",
  websiteurl: "websiteUrl",
  "link whatsapp": "whatsappUrl",
  whatsapp: "whatsappUrl",
  whatsappurl: "whatsappUrl",
  "o que você pode fazer pra melhorar?": "improvementOpportunity",
  melhoria: "improvementOpportunity",
  improvementopportunity: "improvementOpportunity",
  observações: "notes",
  observacoes: "notes",
  notes: "notes",
  situação: "status",
  situacao: "status",
  status: "status",
  "potencial do lead": "potential",
  potencial: "potential",
  potential: "potential",
  "origem do lead": "source",
  origem: "source",
  source: "source",
};

/** Faz o parse de um CSV bruto e mapeia colunas conhecidas para os campos do lead. */
export function parseLeadsCsv(csvText: string): { rows: ImportRow[]; errors: string[] } {
  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  const errors = parsed.errors.map((e) => `Linha ${e.row ?? "?"}: ${e.message}`);

  const rows: ImportRow[] = parsed.data.map((rawRow) => {
    const row: ImportRow = {};
    for (const [key, value] of Object.entries(rawRow)) {
      const normalizedKey = key.trim().toLowerCase();
      const field = IMPORT_COLUMN_ALIASES[normalizedKey];
      if (field && value) {
        row[field] = value.trim();
      }
    }
    return row;
  });

  return { rows, errors };
}
