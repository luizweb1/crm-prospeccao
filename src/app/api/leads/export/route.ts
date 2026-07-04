import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { leadsToCsv } from "@/lib/csv";

export const dynamic = "force-dynamic";

export async function GET() {
  const leads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" } });
  // Serializa via JSON para converter os campos Date do Prisma em strings ISO,
  // no mesmo formato que o restante do app recebe através das rotas de API.
  const serializedLeads = JSON.parse(JSON.stringify(leads)) as Parameters<typeof leadsToCsv>[0];
  const csv = leadsToCsv(serializedLeads);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="leads-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
