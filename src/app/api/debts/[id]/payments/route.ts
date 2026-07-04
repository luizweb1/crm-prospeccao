import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();

  const debt = await prisma.debt.findUnique({ where: { id: params.id } });
  if (!debt) return NextResponse.json({ error: "Dívida não encontrada." }, { status: 404 });

  const amount = Number(body.amount);
  const paidAt = body.paidAt ? new Date(body.paidAt) : null;

  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Informe um valor de pagamento válido." }, { status: 400 });
  }
  if (!paidAt || Number.isNaN(paidAt.getTime())) {
    return NextResponse.json({ error: "Informe a data do pagamento." }, { status: 400 });
  }

  const payment = await prisma.debtPayment.create({
    data: { debtId: debt.id, amount, paidAt },
  });

  return NextResponse.json({ payment }, { status: 201 });
}
