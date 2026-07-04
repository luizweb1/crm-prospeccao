import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function DELETE(_req: NextRequest, { params }: { params: { paymentId: string } }) {
  const existing = await prisma.debtPayment.findUnique({ where: { id: params.paymentId } });
  if (!existing) return NextResponse.json({ error: "Pagamento não encontrado." }, { status: 404 });

  await prisma.debtPayment.delete({ where: { id: params.paymentId } });
  return NextResponse.json({ ok: true });
}
