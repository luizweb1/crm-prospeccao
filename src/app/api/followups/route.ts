import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const leadId = req.nextUrl.searchParams.get("leadId");
  const followUps = await prisma.followUp.findMany({
    where: leadId ? { leadId, completedAt: null } : { completedAt: null },
    orderBy: { dueAt: "asc" },
    take: leadId ? 100 : 200,
    include: { lead: { select: { id: true, contactName: true, instagramUsername: true, potential: true, status: true } } },
  });
  return NextResponse.json({ followUps });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const leadId = typeof body.leadId === "string" ? body.leadId : "";
  const action = typeof body.action === "string" ? body.action.trim() : "";
  const dueAt = new Date(body.dueAt);
  if (body.notes !== undefined && body.notes !== null && typeof body.notes !== "string") {
    return NextResponse.json({ error: "Observação inválida." }, { status: 400 });
  }
  if (!leadId || !action || action.length > 200 || Number.isNaN(dueAt.getTime())) {
    return NextResponse.json({ error: "Informe lead, ação e prazo válidos." }, { status: 400 });
  }
  const lead = await prisma.lead.findUnique({ where: { id: leadId }, select: { id: true } });
  if (!lead) return NextResponse.json({ error: "Lead não encontrado." }, { status: 404 });
  const followUp = await prisma.$transaction(async tx => {
    const saved = await tx.followUp.create({ data: { leadId, action, dueAt, notes: body.notes?.trim() || null } });
    await tx.activityLog.create({ data: { leadId, action: "followup_criado", description: `Próxima ação agendada: ${action}` } });
    return saved;
  });
  return NextResponse.json({ followUp }, { status: 201 });
}
