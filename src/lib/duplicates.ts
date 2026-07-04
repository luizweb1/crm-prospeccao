import { prisma } from "@/lib/prisma";

export interface DuplicateMatch {
  id: string;
  instagramUsername: string;
  niche: string;
  matchedOn: ("instagram" | "website" | "whatsapp")[];
}

/** Procura leads já cadastrados com o mesmo @, site ou WhatsApp. */
export async function findDuplicateLeads(params: {
  instagramUsername: string;
  websiteUrl?: string | null;
  whatsappUrl?: string | null;
  excludeId?: string;
}): Promise<DuplicateMatch[]> {
  const { instagramUsername, websiteUrl, whatsappUrl, excludeId } = params;

  const orConditions: Record<string, string>[] = [];
  if (instagramUsername) orConditions.push({ instagramUsername });
  if (websiteUrl) orConditions.push({ websiteUrl });
  if (whatsappUrl) orConditions.push({ whatsappUrl });

  if (orConditions.length === 0) return [];

  const candidates = await prisma.lead.findMany({
    where: {
      OR: orConditions,
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
    select: { id: true, instagramUsername: true, niche: true, websiteUrl: true, whatsappUrl: true },
  });

  return candidates.map((c) => {
    const matchedOn: DuplicateMatch["matchedOn"] = [];
    if (instagramUsername && c.instagramUsername === instagramUsername) matchedOn.push("instagram");
    if (websiteUrl && c.websiteUrl === websiteUrl) matchedOn.push("website");
    if (whatsappUrl && c.whatsappUrl === whatsappUrl) matchedOn.push("whatsapp");
    return { id: c.id, instagramUsername: c.instagramUsername, niche: c.niche, matchedOn };
  });
}
