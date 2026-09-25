import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const existing = await prisma.followUp.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Ação não encontrada." }, { status: 404 });
  if (body.completed !== undefined && typeof body.completed !== "boolean") {
    return NextResponse.json({ error: "Estado inválido." }, { status: 400 });
  }
  if (body.dueAt !== undefined && (typeof body.dueAt !== "string" || !body.dueAt)) {
    return NextResponse.json({ error: "Prazo inválido." }, { status: 400 });
  }
  if (body.action !== undefined && typeof body.action !== "string") {
    return NextResponse.json({ error: "Ação inválida." }, { status: 400 });
  }
  if (body.notes !== undefined && body.notes !== null && typeof body.notes !== "string") {
    return NextResponse.json({ error: "Observação inválida." }, { status: 400 });
  }
  const dueAt = body.dueAt !== undefined ? new Date(body.dueAt) : existing.dueAt;
  const action = body.action !== undefined && typeof body.action === "string" ? body.action.trim() : existing.action;
  if (Number.isNaN(dueAt.getTime()) || !action || action.length > 200) {
    return NextResponse.json({ error: "Ação ou prazo inválido." }, { status: 400 });
  }
  const followUp = await prisma.$transaction(async tx => {
    const saved = await tx.followUp.update({ where: { id: existing.id }, data: {
      dueAt, action, notes: body.notes !== undefined ? (body.notes?.trim() || null) : existing.notes,
      completedAt: body.completed === true ? new Date() : body.completed === false ? null : existing.completedAt,
    } });
    if (body.completed === true && !existing.completedAt) {
      await tx.activityLog.create({ data: { leadId: existing.leadId, action: "followup_concluido", description: `Ação concluída: ${action}` } });
    } else if (body.dueAt !== undefined && dueAt.getTime() !== existing.dueAt.getTime()) {
      await tx.activityLog.create({ data: { leadId: existing.leadId, action: "followup_reagendado", description: `Ação reagendada: ${action}` } });
    }
    return saved;
  });
  return NextResponse.json({ followUp });
}
