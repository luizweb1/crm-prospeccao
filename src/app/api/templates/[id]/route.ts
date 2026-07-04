import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MESSAGE_CHANNELS, TEMPLATE_STEPS } from "@/types";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();

  const existing = await prisma.templateMessage.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Template não encontrado." }, { status: 404 });

  if (body.recommendedChannel !== undefined && !MESSAGE_CHANNELS.includes(body.recommendedChannel)) {
    return NextResponse.json({ error: "Canal recomendado inválido." }, { status: 400 });
  }
  if (body.recommendedStep !== undefined && !TEMPLATE_STEPS.includes(body.recommendedStep)) {
    return NextResponse.json({ error: "Etapa recomendada inválida." }, { status: 400 });
  }

  const template = await prisma.templateMessage.update({
    where: { id: params.id },
    data: {
      name: body.name ?? existing.name,
      text: body.text ?? existing.text,
      recommendedChannel: body.recommendedChannel ?? existing.recommendedChannel,
      recommendedStep: body.recommendedStep ?? existing.recommendedStep,
      notes: body.notes !== undefined ? body.notes || null : existing.notes,
    },
  });

  return NextResponse.json({ template });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const existing = await prisma.templateMessage.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Template não encontrado." }, { status: 404 });

  await prisma.templateMessage.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
