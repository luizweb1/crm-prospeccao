import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { normalizeInstagramUsername, normalizeWebsiteUrl, normalizeWhatsappUrl } from "@/lib/normalize";
import { findDuplicateLeads } from "@/lib/duplicates";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const lead = await prisma.lead.findUnique({ where: { id: params.id } });
  if (!lead) return NextResponse.json({ error: "Lead não encontrado." }, { status: 404 });

  const activities = await prisma.activityLog.findMany({
    where: { leadId: params.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ lead, activities });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const force = body.force === true;

  const existing = await prisma.lead.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Lead não encontrado." }, { status: 404 });

  const instagramUsername =
    body.instagramUsername !== undefined ? normalizeInstagramUsername(body.instagramUsername) : existing.instagramUsername;
  const websiteUrl =
    body.websiteUrl !== undefined ? (body.websiteUrl ? normalizeWebsiteUrl(body.websiteUrl) : null) : existing.websiteUrl;
  const whatsappUrl =
    body.whatsappUrl !== undefined ? (body.whatsappUrl ? normalizeWhatsappUrl(body.whatsappUrl) : null) : existing.whatsappUrl;

  if (!force) {
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
    if (body[field] !== undefined) data[field] = body[field] || null;
  }

  const dateFields = ["firstMessageSentAt", "secondMessageSentAt", "thirdMessageSentAt"] as const satisfies readonly (keyof Prisma.LeadUpdateInput)[];
  for (const field of dateFields) {
    if (body[field] !== undefined) {
      data[field] = body[field] ? new Date(body[field]) : null;
    }
  }

  const lead = await prisma.lead.update({ where: { id: params.id }, data });

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

  await prisma.activityLog.createMany({
    data: activityDescriptions.map((description) => ({
      leadId: lead.id,
      action: "editado",
      description,
    })),
  });

  return NextResponse.json({ lead });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const existing = await prisma.lead.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Lead não encontrado." }, { status: 404 });

  await prisma.lead.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
