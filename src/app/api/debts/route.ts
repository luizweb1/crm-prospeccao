import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { FINANCE_TYPES } from "@/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const debts = await prisma.debt.findMany({
    orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
    include: { payments: { orderBy: { paidAt: "desc" } } },
  });
  return NextResponse.json({ debts });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const type = FINANCE_TYPES.find((t) => t === body.type) ?? "Gasto";
  const description = (body.description ?? "").trim();
  const category = (body.category ?? "").trim();
  const totalAmount = Number(body.totalAmount);
  const dueDate = body.dueDate ? new Date(body.dueDate) : null;

  if (!description) {
    return NextResponse.json({ error: "A descrição é obrigatória." }, { status: 400 });
  }
  if (!category) {
    return NextResponse.json({ error: "A categoria é obrigatória." }, { status: 400 });
  }
  if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
    return NextResponse.json({ error: "Informe um valor total válido." }, { status: 400 });
  }
  if (dueDate && Number.isNaN(dueDate.getTime())) {
    return NextResponse.json({ error: "Data de vencimento inválida." }, { status: 400 });
  }

  const debt = await prisma.debt.create({
    data: {
      type,
      description,
      category,
      totalAmount,
      dueDate,
      notes: body.notes || null,
    },
    include: { payments: true },
  });

  return NextResponse.json({ debt }, { status: 201 });
}
