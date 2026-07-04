"use client";

import { MESSAGE_CHANNELS, type MessageChannel } from "@/types";
import CopyButton from "@/components/CopyButton";
import clsx from "@/lib/clsx";

export interface MessageFieldValue {
  text: string;
  sentAt: string; // yyyy-mm-dd ou ""
  channel: MessageChannel | "";
}

export default function MessageFieldGroup({
  title,
  hint,
  highlight,
  value,
  onChange,
  onGenerate,
}: {
  title: string;
  hint?: string;
  highlight?: boolean;
  value: MessageFieldValue;
  onChange: (value: MessageFieldValue) => void;
  onGenerate?: () => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const sent = !!value.sentAt;

  return (
    <div
      className={clsx(
        "rounded-xl border p-3 space-y-2 transition-colors",
        highlight ? "border-brand-700 bg-brand-500/10" : "border-white/15 bg-white/[0.04]",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-white/90">
          {title}
          {highlight && (
            <span className="ml-2 inline-flex items-center rounded-full bg-brand-500/20 px-2 py-0.5 text-xs font-medium text-brand-300">
              ⚡ pronto para enviar
            </span>
          )}
        </p>
        <label className="flex items-center gap-1.5 text-xs font-medium text-white/70">
          <input
            type="checkbox"
            checked={sent}
            onChange={(e) => onChange({ ...value, sentAt: e.target.checked ? today : "" })}
            className="accent-brand-600"
          />
          Enviada
        </label>
      </div>
      {hint && <p className="text-xs text-white/40">{hint}</p>}

      <textarea
        value={value.text}
        onChange={(e) => onChange({ ...value, text: e.target.value })}
        rows={3}
        placeholder="Texto da mensagem usada..."
        className="field-input"
      />

      {onGenerate && (
        <button
          type="button"
          onClick={onGenerate}
          className="inline-flex items-center gap-1 rounded-md border border-brand-800 bg-brand-500/10 px-2 py-1 text-xs font-medium text-brand-300 hover:bg-brand-500/20 transition-colors"
        >
          ✨ {value.text ? "Gerar outra mensagem" : "Gerar mensagem"}
        </button>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <input
          type="date"
          value={value.sentAt}
          onChange={(e) => onChange({ ...value, sentAt: e.target.value })}
          className="rounded-lg border border-white/15 bg-white/[0.04] px-2 py-1 text-xs focus:border-brand-400 focus:outline-none"
        />
        <select
          value={value.channel}
          onChange={(e) => onChange({ ...value, channel: e.target.value as MessageChannel })}
          className="rounded-lg border border-white/15 bg-white/[0.04] px-2 py-1 text-xs focus:border-brand-400 focus:outline-none"
        >
          <option value="">Canal...</option>
          {MESSAGE_CHANNELS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <CopyButton text={value.text} label="Copiar mensagem" />
      </div>
    </div>
  );
}
