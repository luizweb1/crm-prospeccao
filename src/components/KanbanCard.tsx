"use client";

import type { Lead, LeadStatus } from "@/types";
import { LEAD_STATUSES } from "@/types";
import InstagramLink from "@/components/InstagramLink";
import PotentialBadge from "@/components/PotentialBadge";
import NextActionBadge from "@/components/NextActionBadge";
import { calculateNextAction, formatMessageDate, getLastContactDate } from "@/lib/nextAction";

export default function KanbanCard({
  lead,
  onStatusChange,
  onOpen,
  onDragStart,
}: {
  lead: Lead;
  onStatusChange: (status: LeadStatus) => void;
  onOpen: () => void;
  onDragStart: (e: React.DragEvent) => void;
}) {
  const lastContact = getLastContactDate(lead);

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onOpen}
      className="cursor-pointer rounded-xl border border-white/15 bg-white/[0.04] p-3 space-y-2 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all"
    >
      <div className="flex items-center justify-between gap-2">
        <InstagramLink username={lead.instagramUsername} className="text-sm font-semibold" />
        <PotentialBadge potential={lead.potential} />
      </div>
      <p className="text-xs text-white/50">{lead.niche}</p>
      <NextActionBadge action={calculateNextAction(lead)} />
      <p className="text-xs text-white/40">
        {lastContact ? `Último contato: ${formatMessageDate(lastContact)}` : "Sem contato ainda"}
      </p>
      <select
        value={lead.status}
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => onStatusChange(e.target.value as LeadStatus)}
        className="w-full rounded-md border border-white/15 bg-white/[0.08] px-2 py-1 text-xs text-white/90"
      >
        {LEAD_STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    </div>
  );
}
