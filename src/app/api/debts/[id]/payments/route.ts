import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  const amount = Number(body.amount);
  const paidAt = body.paidAt ? new Date(body.paidAt) : null;

  if (!Number.isFinite(amount) || amount <= 0 || Math.abs(amount * 100 - Math.round(amount * 100)) > 1e-6) {
    return NextResponse.json({ error: "Informe um valor de pagamento válido." }, { status: 400 });
  }
  if (!paidAt || Number.isNaN(paidAt.getTime())) {
    return NextResponse.json({ error: "Informe a data do pagamento." }, { status: 400 });
  }

  let payment;
  try {
    payment = await prisma.$transaction(async tx => {
      const debt = await tx.debt.findUnique({ where: { id } });
      if (!debt) throw new Error("NOT_FOUND");
      const payments = await tx.debtPayment.aggregate({ where: { debtId: debt.id }, _sum: { amount: true } });
      const remainingCents = Math.round(debt.totalAmount * 100) - Math.round((payments._sum.amount ?? 0) * 100);
      if (Math.round(amount * 100) > remainingCents) throw new Error("OVERPAYMENT");
      return tx.debtPayment.create({ data: { debtId: debt.id, amount, paidAt } });
    }, { isolationLevel: "Serializable" });
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Dívida não encontrada." }, { status: 404 });
    }
    if (error instanceof Error && error.message === "OVERPAYMENT") {
      return NextResponse.json({ error: "O pagamento não pode superar o valor em aberto." }, { status: 400 });
    }
    return NextResponse.json({ error: "Não foi possível registrar o pagamento. Tente novamente." }, { status: 409 });
  }

  return NextResponse.json({ payment }, { status: 201 });
}
