"use client";

import Link from "next/link";
import type { DuplicateMatch } from "@/lib/duplicates";

const MATCH_LABELS: Record<string, string> = {
  instagram: "mesmo @",
  website: "mesmo site",
  whatsapp: "mesmo WhatsApp",
};

export default function DuplicateWarningDialog({
  open,
  duplicates,
  onCancel,
  onContinueAnyway,
}: {
  open: boolean;
  duplicates: DuplicateMatch[];
  onCancel: () => void;
  onContinueAnyway: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-2xl bg-white/[0.04] p-5 shadow-2xl">
        <p className="text-base font-semibold text-white">⚠️ Possível lead duplicado</p>
        <p className="mt-1 text-sm text-white/50">
          Já existe {duplicates.length > 1 ? "leads com" : "um lead com"} dados em comum:
        </p>

        <ul className="mt-3 space-y-2 max-h-48 overflow-y-auto">
          {duplicates.map((d) => (
            <li key={d.id} className="rounded-md border border-amber-800 bg-amber-500/10 px-3 py-2 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-white/90">
                  @{d.instagramUsername} · {d.niche}
                </span>
                <Link href={`/leads/${d.id}`} className="text-xs font-semibold text-brand-400 hover:underline">
                  Ver lead
                </Link>
              </div>
              <p className="mt-0.5 text-xs text-amber-400">{d.matchedOn.map((m) => MATCH_LABELS[m]).join(", ")}</p>
            </li>
          ))}
        </ul>

        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="btn-ghost">
            Cancelar cadastro
          </button>
          <button
            type="button"
            onClick={onContinueAnyway}
            className="btn bg-amber-500 text-white hover:bg-amber-600"
          >
            Continuar mesmo assim
          </button>
        </div>
      </div>
    </div>
  );
}
