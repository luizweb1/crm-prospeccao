"use client";

import clsx from "@/lib/clsx";
import { LEAD_POTENTIALS, LEAD_SOURCES, LEAD_STATUSES, MESSAGE_CHANNELS } from "@/types";

export interface LeadFiltersState {
  search: string;
  status: string;
  niche: string;
  potential: string;
  source: string;
  channel: string;
  needsSecond: boolean;
  needsThird: boolean;
  noResponse: boolean;
  stale: boolean;
}

export const DEFAULT_FILTERS: LeadFiltersState = {
  search: "",
  status: "all",
  niche: "all",
  potential: "all",
  source: "all",
  channel: "all",
  needsSecond: false,
  needsThird: false,
  noResponse: false,
  stale: false,
};

export default function LeadFilters({
  filters,
  onChange,
  niches,
}: {
  filters: LeadFiltersState;
  onChange: (filters: LeadFiltersState) => void;
  niches: string[];
}) {
  const quickFilters: { key: keyof LeadFiltersState; label: string }[] = [
    { key: "needsSecond", label: "Precisa 2º mensagem" },
    { key: "needsThird", label: "Precisa 3º mensagem" },
    { key: "noResponse", label: "Sem resposta" },
    { key: "stale", label: "Parados há +2 dias" },
  ];

  return (
    <div className="space-y-3">
      <input
        value={filters.search}
        onChange={(e) => onChange({ ...filters, search: e.target.value })}
        placeholder="Buscar por @, nicho, site, WhatsApp, observações, situação..."
        className="field-input"
      />

      <div className="flex flex-wrap gap-2">
        <select
          value={filters.status}
          onChange={(e) => onChange({ ...filters, status: e.target.value })}
          className="rounded-lg border border-white/15 bg-white/[0.04] px-2 py-1.5 text-sm focus:border-brand-400 focus:outline-none"
        >
          <option value="all">Todas as situações</option>
          {LEAD_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          value={filters.niche}
          onChange={(e) => onChange({ ...filters, niche: e.target.value })}
          className="rounded-lg border border-white/15 bg-white/[0.04] px-2 py-1.5 text-sm focus:border-brand-400 focus:outline-none"
        >
          <option value="all">Todos os nichos</option>
          {niches.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>

        <select
          value={filters.potential}
          onChange={(e) => onChange({ ...filters, potential: e.target.value })}
          className="rounded-lg border border-white/15 bg-white/[0.04] px-2 py-1.5 text-sm focus:border-brand-400 focus:outline-none"
        >
          <option value="all">Todos os potenciais</option>
          {LEAD_POTENTIALS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>

        <select
          value={filters.source}
          onChange={(e) => onChange({ ...filters, source: e.target.value })}
          className="rounded-lg border border-white/15 bg-white/[0.04] px-2 py-1.5 text-sm focus:border-brand-400 focus:outline-none"
        >
          <option value="all">Todas as origens</option>
          {LEAD_SOURCES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          value={filters.channel}
          onChange={(e) => onChange({ ...filters, channel: e.target.value })}
          className="rounded-lg border border-white/15 bg-white/[0.04] px-2 py-1.5 text-sm focus:border-brand-400 focus:outline-none"
        >
          <option value="all">Todos os canais</option>
          {MESSAGE_CHANNELS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        {(filters.status !== "all" ||
          filters.niche !== "all" ||
          filters.potential !== "all" ||
          filters.source !== "all" ||
          filters.channel !== "all" ||
          filters.needsSecond ||
          filters.needsThird ||
          filters.noResponse ||
          filters.stale ||
          filters.search) && (
          <button
            onClick={() => onChange(DEFAULT_FILTERS)}
            className="rounded-lg border border-white/15 bg-white/[0.04] px-2 py-1.5 text-sm focus:border-brand-400 focus:outline-none text-white/50 hover:bg-white/[0.08]"
          >
            Limpar filtros
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {quickFilters.map((qf) => (
          <button
            key={qf.key}
            onClick={() => onChange({ ...filters, [qf.key]: !filters[qf.key] })}
            className={clsx(
              "rounded-full border px-3 py-1 text-xs font-medium",
              filters[qf.key]
                ? "border-brand-500 bg-brand-500/15 text-brand-300"
                : "border-white/15 text-white/50 hover:bg-white/[0.08]",
            )}
          >
            {qf.label}
          </button>
        ))}
      </div>
    </div>
  );
}
