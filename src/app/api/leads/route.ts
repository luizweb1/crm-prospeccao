import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeInstagramUsername, normalizeWebsiteUrl, normalizeWhatsappUrl } from "@/lib/normalize";
import { findDuplicateLeads } from "@/lib/duplicates";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ leads });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro desconhecido";

    console.error("Falha ao consultar leads:", error);

    return NextResponse.json(
      {
        error: "Falha ao consultar o banco",
        details: message.replace(
          /postgres(?:ql)?:\/\/[^\s"']+/gi,
          "[database-url-hidden]",
        ),
      },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const force = body.force === true;

  const instagramUsername = normalizeInstagramUsername(body.instagramUsername ?? "");
  const niche = (body.niche ?? "").trim();
  const websiteUrl = body.websiteUrl ? normalizeWebsiteUrl(body.websiteUrl) : null;
  const whatsappUrl = body.whatsappUrl ? normalizeWhatsappUrl(body.whatsappUrl) : null;

  if (!instagramUsername) {
    return NextResponse.json({ error: "O @ do lead é obrigatório." }, { status: 400 });
  }
  if (!niche) {
    return NextResponse.json({ error: "O nicho é obrigatório." }, { status: 400 });
  }

  if (!force) {
    const duplicates = await findDuplicateLeads({ instagramUsername, websiteUrl, whatsappUrl });
    if (duplicates.length > 0) {
      return NextResponse.json({ duplicates }, { status: 409 });
    }
  }

  const lead = await prisma.lead.create({
    data: {
      contactName: body.contactName || null,
      instagramUsername,
      niche,
      websiteUrl,
      whatsappUrl,
      improvementOpportunity: body.improvementOpportunity || null,
      notes: body.notes || null,
      firstMessageText: body.firstMessageText || null,
      firstMessageSentAt: body.firstMessageSentAt ? new Date(body.firstMessageSentAt) : null,
      firstMessageChannel: body.firstMessageChannel || null,
      secondMessageText: body.secondMessageText || null,
      secondMessageSentAt: body.secondMessageSentAt ? new Date(body.secondMessageSentAt) : null,
      secondMessageChannel: body.secondMessageChannel || null,
      thirdMessageText: body.thirdMessageText || null,
      thirdMessageSentAt: body.thirdMessageSentAt ? new Date(body.thirdMessageSentAt) : null,
      thirdMessageChannel: body.thirdMessageChannel || null,
      status: body.status || "Gerando conexão",
      potential: body.potential || "Médio",
      source: body.source || "Outro",
    },
  });

  await prisma.activityLog.create({
    data: {
      leadId: lead.id,
      action: "criado",
      description: `Lead criado: @${lead.instagramUsername}`,
    },
  });

  return NextResponse.json({ lead }, { status: 201 });
}
