"use client";

import { useEffect, useState } from "react";
import type { TemplateMessage } from "@/types";
import { MESSAGE_CHANNELS, TEMPLATE_STEPS, type MessageChannel, type TemplateStep } from "@/types";

export default function TemplateFormModal({
  open,
  template,
  onClose,
  onSaved,
}: {
  open: boolean;
  template?: TemplateMessage | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [recommendedChannel, setRecommendedChannel] = useState<MessageChannel>("WhatsApp");
  const [recommendedStep, setRecommendedStep] = useState<TemplateStep>("1º mensagem");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setName(template?.name ?? "");
      setText(template?.text ?? "");
      setRecommendedChannel((template?.recommendedChannel as MessageChannel) ?? "WhatsApp");
      setRecommendedStep((template?.recommendedStep as TemplateStep) ?? "1º mensagem");
      setNotes(template?.notes ?? "");
      setError(null);
    }
  }, [open, template]);

  if (!open) return null;

  async function handleSave() {
    if (!name.trim() || !text.trim()) {
      setError("Preencha o nome e o texto da mensagem.");
      return;
    }
    setSaving(true);
    setError(null);

    const url = template ? `/api/templates/${template.id}` : "/api/templates";
    const method = template ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, text, recommendedChannel, recommendedStep, notes }),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Erro ao salvar o template.");
      return;
    }

    onSaved();
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white/[0.04] p-5 shadow-2xl space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold text-white">{template ? "Editar template" : "Novo template"}</p>
          <button onClick={onClose} className="text-white/40 hover:text-white/80 text-xl leading-none">
            ×
          </button>
        </div>

        {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}

        <div>
          <label className="field-label">Nome do template</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 field-input"
          />
        </div>

        <div>
          <label className="field-label">Texto da mensagem</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            className="mt-1 field-input"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="field-label">Canal recomendado</label>
            <select
              value={recommendedChannel}
              onChange={(e) => setRecommendedChannel(e.target.value as MessageChannel)}
              className="mt-1 field-input"
            >
              {MESSAGE_CHANNELS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label">Etapa recomendada</label>
            <select
              value={recommendedStep}
              onChange={(e) => setRecommendedStep(e.target.value as TemplateStep)}
              className="mt-1 field-input"
            >
              {TEMPLATE_STEPS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="field-label">Observações</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="mt-1 field-input"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="btn-ghost">
            Cancelar
          </button>
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            {saving ? "Salvando..." : "Salvar template"}
          </button>
        </div>
      </div>
    </div>
  );
}
