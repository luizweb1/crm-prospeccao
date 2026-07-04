import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PAYMENT_STATUSES } from "@/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const deals = await prisma.deal.findMany({
    orderBy: { closedAt: "desc" },
    include: { lead: { select: { id: true, instagramUsername: true, contactName: true } } },
  });
  return NextResponse.json({ deals });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const clientName = (body.clientName ?? "").trim();
  const serviceType = (body.serviceType ?? "").trim();
  const value = Number(body.value);
  const closedAt = body.closedAt ? new Date(body.closedAt) : null;

  if (!clientName) {
    return NextResponse.json({ error: "O nome do cliente é obrigatório." }, { status: 400 });
  }
  if (!serviceType) {
    return NextResponse.json({ error: "O tipo de serviço é obrigatório." }, { status: 400 });
  }
  if (!Number.isFinite(value) || value <= 0) {
    return NextResponse.json({ error: "Informe um valor válido." }, { status: 400 });
  }
  if (!closedAt || Number.isNaN(closedAt.getTime())) {
    return NextResponse.json({ error: "Informe a data de fechamento." }, { status: 400 });
  }

  const paymentStatus = PAYMENT_STATUSES.find((s) => s === body.paymentStatus) ?? "A receber";

  const deal = await prisma.deal.create({
    data: {
      leadId: body.leadId || null,
      clientName,
      serviceType,
      value,
      paymentStatus,
      closedAt,
      notes: body.notes || null,
    },
  });

  return NextResponse.json({ deal }, { status: 201 });
}
