import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MESSAGE_CHANNELS, TEMPLATE_STEPS } from "@/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const templates = await prisma.templateMessage.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ templates });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!body.name || !body.text || !body.recommendedChannel || !body.recommendedStep) {
    return NextResponse.json(
      { error: "Nome, texto, canal recomendado e etapa recomendada são obrigatórios." },
      { status: 400 },
    );
  }

  if (!MESSAGE_CHANNELS.includes(body.recommendedChannel)) {
    return NextResponse.json({ error: "Canal recomendado inválido." }, { status: 400 });
  }
  if (!TEMPLATE_STEPS.includes(body.recommendedStep)) {
    return NextResponse.json({ error: "Etapa recomendada inválida." }, { status: 400 });
  }

  const template = await prisma.templateMessage.create({
    data: {
      name: body.name,
      text: body.text,
      recommendedChannel: body.recommendedChannel,
      recommendedStep: body.recommendedStep,
      notes: body.notes || null,
    },
  });

  return NextResponse.json({ template }, { status: 201 });
}
