import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateDashboardMetrics } from "@/lib/metrics";
import type { Lead } from "@/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const leads = await prisma.lead.findMany();
  // Serializa via JSON para converter os campos Date do Prisma em strings ISO,
  // no mesmo formato que o restante do app recebe através das rotas de API.
  const serializedLeads = JSON.parse(JSON.stringify(leads)) as Lead[];
  const metrics = calculateDashboardMetrics(serializedLeads);
  return NextResponse.json({ metrics });
}
