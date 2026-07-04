import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();

  const existing = await prisma.deal.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Registro não encontrado." }, { status: 404 });

  const value = body.value !== undefined ? Number(body.value) : existing.value;
  if (body.value !== undefined && (!Number.isFinite(value) || value <= 0)) {
    return NextResponse.json({ error: "Informe um valor válido." }, { status: 400 });
  }

  const closedAt = body.closedAt !== undefined ? new Date(body.closedAt) : existing.closedAt;
  if (body.closedAt !== undefined && Number.isNaN(closedAt.getTime())) {
    return NextResponse.json({ error: "Informe a data de fechamento." }, { status: 400 });
  }

  const deal = await prisma.deal.update({
    where: { id: params.id },
    data: {
      leadId: body.leadId !== undefined ? body.leadId || null : existing.leadId,
      clientName: body.clientName !== undefined ? body.clientName.trim() : existing.clientName,
      serviceType: body.serviceType !== undefined ? body.serviceType.trim() : existing.serviceType,
      value,
      closedAt,
      notes: body.notes !== undefined ? body.notes || null : existing.notes,
    },
  });

  return NextResponse.json({ deal });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const existing = await prisma.deal.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Registro não encontrado." }, { status: 404 });

  await prisma.deal.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
