import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();

  const existing = await prisma.debt.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Dívida não encontrada." }, { status: 404 });

  const totalAmount = body.totalAmount !== undefined ? Number(body.totalAmount) : existing.totalAmount;
  if (body.totalAmount !== undefined && (!Number.isFinite(totalAmount) || totalAmount <= 0)) {
    return NextResponse.json({ error: "Informe um valor total válido." }, { status: 400 });
  }

  const dueDate = body.dueDate !== undefined ? (body.dueDate ? new Date(body.dueDate) : null) : existing.dueDate;
  if (dueDate && Number.isNaN(dueDate.getTime())) {
    return NextResponse.json({ error: "Data de vencimento inválida." }, { status: 400 });
  }

  const debt = await prisma.debt.update({
    where: { id: params.id },
    data: {
      description: body.description !== undefined ? body.description.trim() : existing.description,
      category: body.category !== undefined ? body.category.trim() : existing.category,
      totalAmount,
      dueDate,
      notes: body.notes !== undefined ? body.notes || null : existing.notes,
    },
    include: { payments: true },
  });

  return NextResponse.json({ debt });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const existing = await prisma.debt.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Dívida não encontrada." }, { status: 404 });

  await prisma.debt.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
