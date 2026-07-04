import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseLeadsCsv } from "@/lib/csv";
import { normalizeInstagramUsername, normalizeWebsiteUrl, normalizeWhatsappUrl } from "@/lib/normalize";
import { findDuplicateLeads } from "@/lib/duplicates";
import { LEAD_POTENTIALS, LEAD_SOURCES, LEAD_STATUSES } from "@/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const csvText: string = body.csvText ?? "";

  if (!csvText.trim()) {
    return NextResponse.json({ error: "Arquivo CSV vazio ou inválido." }, { status: 400 });
  }

  const { rows, errors: parseErrors } = parseLeadsCsv(csvText);

  let created = 0;
  let ignoredDuplicates = 0;
  let withErrors = 0;
  const errors: string[] = [...parseErrors];

  const seenInBatch = new Set<string>();

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNumber = i + 2; // +1 header, +1 index-to-line

    const instagramUsername = normalizeInstagramUsername(row.instagramUsername ?? "");
    const niche = (row.niche ?? "").trim();

    if (!instagramUsername || !niche) {
      withErrors += 1;
      errors.push(`Linha ${rowNumber}: @ e nicho são obrigatórios.`);
      continue;
    }

    const websiteUrl = row.websiteUrl ? normalizeWebsiteUrl(row.websiteUrl) : null;
    const whatsappUrl = row.whatsappUrl ? normalizeWhatsappUrl(row.whatsappUrl) : null;

    const batchKey = [instagramUsername, websiteUrl, whatsappUrl].filter(Boolean).join("|");
    if (batchKey && seenInBatch.has(batchKey)) {
      ignoredDuplicates += 1;
      continue;
    }

    const duplicates = await findDuplicateLeads({ instagramUsername, websiteUrl, whatsappUrl });
    if (duplicates.length > 0) {
      ignoredDuplicates += 1;
      continue;
    }

    const status = LEAD_STATUSES.find((s) => s === row.status) ?? "Gerando conexão";
    const potential = LEAD_POTENTIALS.find((p) => p === row.potential) ?? "Médio";
    const source = LEAD_SOURCES.find((s) => s === row.source) ?? "Outro";

    try {
      const lead = await prisma.lead.create({
        data: {
          contactName: row.contactName || null,
          instagramUsername,
          niche,
          websiteUrl,
          whatsappUrl,
          improvementOpportunity: row.improvementOpportunity || null,
          notes: row.notes || null,
          status,
          potential,
          source,
        },
      });

      await prisma.activityLog.create({
        data: {
          leadId: lead.id,
          action: "importado",
          description: `Lead importado por CSV: @${lead.instagramUsername}`,
        },
      });

      created += 1;
      if (batchKey) seenInBatch.add(batchKey);
    } catch (e) {
      withErrors += 1;
      errors.push(`Linha ${rowNumber}: erro ao salvar (${(e as Error).message}).`);
    }
  }

  return NextResponse.json({
    totalImportado: rows.length,
    totalIgnoradoPorDuplicidade: ignoredDuplicates,
    totalComErro: withErrors,
    totalCriadoComSucesso: created,
    errors,
  });
}
