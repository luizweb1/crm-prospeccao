import type { Lead } from "@/types";
import type { LeadFiltersState } from "@/components/LeadFilters";
import { hasNoResponseAfterThreeMessages, isStale, needsSecondMessage, needsThirdMessage } from "@/lib/nextAction";

export function applyLeadFilters(leads: Lead[], filters: LeadFiltersState): Lead[] {
  const search = filters.search.trim().toLowerCase();

  return leads.filter((lead) => {
    if (filters.status !== "all" && lead.status !== filters.status) return false;
    if (filters.niche !== "all" && lead.niche !== filters.niche) return false;
    if (filters.potential !== "all" && lead.potential !== filters.potential) return false;
    if (filters.source !== "all" && lead.source !== filters.source) return false;

    if (filters.channel !== "all") {
      const channels = [lead.firstMessageChannel, lead.secondMessageChannel, lead.thirdMessageChannel];
      if (!channels.includes(filters.channel)) return false;
    }

    // Os filtros rápidos representam estágios diferentes (muitas vezes mutuamente
    // exclusivos, ex.: um lead nunca precisa da 2ª e da 3ª mensagem ao mesmo tempo),
    // então quando mais de um está ativo o lead passa se combinar com QUALQUER um deles.
    const activeQuickFilters = [filters.needsSecond, filters.needsThird, filters.noResponse, filters.stale];
    if (activeQuickFilters.some(Boolean)) {
      const matchesAny =
        (filters.needsSecond && needsSecondMessage(lead)) ||
        (filters.needsThird && needsThirdMessage(lead)) ||
        (filters.noResponse && hasNoResponseAfterThreeMessages(lead)) ||
        (filters.stale && isStale(lead));
      if (!matchesAny) return false;
    }

    if (search) {
      const haystack = [
        lead.contactName,
        lead.instagramUsername,
        lead.niche,
        lead.websiteUrl,
        lead.whatsappUrl,
        lead.notes,
        lead.improvementOpportunity,
        lead.status,
        lead.source,
        lead.potential,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(search)) return false;
    }

    return true;
  });
}
