import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { normalizeInstagramUsername, normalizeWebsiteUrl, normalizeWhatsappUrl } from "@/lib/normalize";
import { findDuplicateLeads } from "@/lib/duplicates";
import { validateLeadEnums } from "@/lib/leadValidation";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) return NextResponse.json({ error: "Lead não encontrado." }, { status: 404 });

  const activities = await prisma.activityLog.findMany({
    where: { leadId: id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ lead, activities });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const validationError = validateLeadEnums(body);
  if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });
  const force = body.force === true;

  const existing = await prisma.lead.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Lead não encontrado." }, { status: 404 });

  const instagramUsername =
    body.instagramUsername !== undefined ? normalizeInstagramUsername(body.instagramUsername) : existing.instagramUsername;
  if (!instagramUsername || (body.niche !== undefined && (typeof body.niche !== "string" || !body.niche.trim()))) {
    return NextResponse.json({ error: "O @ e o nicho são obrigatórios." }, { status: 400 });
  }
  const websiteUrl =
    body.websiteUrl !== undefined ? (body.websiteUrl ? normalizeWebsiteUrl(body.websiteUrl) : null) : existing.websiteUrl;
  const whatsappUrl =
    body.whatsappUrl !== undefined ? (body.whatsappUrl ? normalizeWhatsappUrl(body.whatsappUrl) : null) : existing.whatsappUrl;

  const identifiersChanged = instagramUsername !== existing.instagramUsername || websiteUrl !== existing.websiteUrl || whatsappUrl !== existing.whatsappUrl;
  if (!force && identifiersChanged) {
    const duplicates = await findDuplicateLeads({
      instagramUsername,
      websiteUrl,
      whatsappUrl,
      excludeId: existing.id,
    });
    if (duplicates.length > 0) {
      return NextResponse.json({ duplicates }, { status: 409 });
    }
  }

  const data: Prisma.LeadUpdateInput = {
    instagramUsername,
    websiteUrl,
    whatsappUrl,
  };

  const passthroughFields = [
    "contactName",
    "niche",
    "improvementOpportunity",
    "notes",
    "firstMessageText",
    "firstMessageChannel",
    "secondMessageText",
    "secondMessageChannel",
    "thirdMessageText",
    "thirdMessageChannel",
    "status",
    "potential",
    "source",
  ] as const satisfies readonly (keyof Prisma.LeadUpdateInput)[];

  for (const field of passthroughFields) {
    if (body[field] !== undefined) {
      // Campos obrigatórios têm validação própria e nunca devem virar null.
      data[field] = field === "niche" ? body[field].trim() : body[field] || null;
    }
  }

  const dateFields = ["firstMessageSentAt", "secondMessageSentAt", "thirdMessageSentAt"] as const satisfies readonly (keyof Prisma.LeadUpdateInput)[];
  for (const field of dateFields) {
    if (body[field] !== undefined) {
      const date = body[field] ? new Date(body[field]) : null;
      if (date && Number.isNaN(date.getTime())) return NextResponse.json({ error: "Data de mensagem inválida." }, { status: 400 });
      data[field] = date;
    }
  }

  const activityDescriptions: string[] = [];

  if (body.status !== undefined && body.status !== existing.status) {
    activityDescriptions.push(`Situação alterada de "${existing.status}" para "${body.status}"`);
  }
  if (body.potential !== undefined && body.potential !== existing.potential) {
    activityDescriptions.push(`Potencial alterado de "${existing.potential}" para "${body.potential}"`);
  }
  if (body.source !== undefined && body.source !== existing.source) {
    activityDescriptions.push(`Origem alterada de "${existing.source}" para "${body.source}"`);
  }
  if (body.notes !== undefined && body.notes !== existing.notes) {
    activityDescriptions.push("Observação adicionada/editada");
  }
  if (body.firstMessageSentAt !== undefined && !existing.firstMessageSentAt && body.firstMessageSentAt) {
    activityDescriptions.push("1º mensagem marcada como enviada");
  }
  if (body.secondMessageSentAt !== undefined && !existing.secondMessageSentAt && body.secondMessageSentAt) {
    activityDescriptions.push("2º mensagem marcada como enviada");
  }
  if (body.thirdMessageSentAt !== undefined && !existing.thirdMessageSentAt && body.thirdMessageSentAt) {
    activityDescriptions.push("3º mensagem marcada como enviada");
  }

  if (activityDescriptions.length === 0) {
    activityDescriptions.push("Lead editado");
  }

  const lead = await prisma.$transaction(async tx => {
    const updated = await tx.lead.update({ where: { id }, data });
    await tx.activityLog.createMany({
      data: activityDescriptions.map(description => ({ leadId: updated.id, action: "editado", description })),
    });
    return updated;
  });

  return NextResponse.json({ lead });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const existing = await prisma.lead.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Lead não encontrado." }, { status: 404 });

  await prisma.lead.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
