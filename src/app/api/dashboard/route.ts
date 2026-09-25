import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateDashboardMetrics } from "@/lib/metrics";
import type { Lead } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const dueBefore = req.nextUrl.searchParams.get("dueBefore");
  const cutoff = dueBefore ? new Date(dueBefore) : null;
  if (cutoff && Number.isNaN(cutoff.getTime())) {
    return NextResponse.json({ error: "Prazo inválido." }, { status: 400 });
  }
  const [leads, deals, followUps, activities, dueCount] = await Promise.all([
    prisma.lead.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.deal.findMany({ select: { value: true } }),
    prisma.followUp.findMany({ where: { completedAt: null }, orderBy: { dueAt: "asc" }, take: 6, include: { lead: { select: { id: true, contactName: true, instagramUsername: true, potential: true, status: true } } } }),
    prisma.activityLog.findMany({ orderBy: { createdAt: "desc" }, take: 5, include: { lead: { select: { contactName: true, instagramUsername: true } } } }),
    prisma.followUp.count({ where: { completedAt: null, dueAt: { lt: cutoff ?? new Date() } } }),
  ]);
  // Serializa via JSON para converter os campos Date do Prisma em strings ISO,
  // no mesmo formato que o restante do app recebe através das rotas de API.
  const serializedLeads = JSON.parse(JSON.stringify(leads)) as Lead[];
  const metrics = calculateDashboardMetrics(serializedLeads, deals);
  return NextResponse.json({ metrics, recentLeads: leads.slice(0, 5), followUps, activities, dueCount });
}
