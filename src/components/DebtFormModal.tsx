"use client";

import { useEffect, useState } from "react";
import type { Debt } from "@/types";
import { DEBT_CATEGORY_SUGGESTIONS } from "@/lib/debtCategories";

export default function DebtFormModal({
  open,
  debt,
  onClose,
  onSaved,
}: {
  open: boolean;
  debt?: Debt | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setDescription(debt?.description ?? "");
      setCategory(debt?.category ?? "");
      setTotalAmount(debt ? String(debt.totalAmount) : "");
      setDueDate(debt?.dueDate ? debt.dueDate.slice(0, 10) : "");
      setNotes(debt?.notes ?? "");
      setError(null);
    }
  }, [open, debt]);

  if (!open) return null;

  async function handleSave() {
    if (!description.trim() || !category.trim() || !totalAmount) {
      setError("Preencha descrição, categoria e valor total.");
      return;
    }
    setSaving(true);
    setError(null);

    const url = debt ? `/api/debts/${debt.id}` : "/api/debts";
    const method = debt ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description,
        category,
        totalAmount: Number(totalAmount.replace(",", ".")),
        dueDate: dueDate || null,
        notes,
      }),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Erro ao salvar a dívida.");
      return;
    }

    onSaved();
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white/[0.04] p-5 shadow-2xl space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold text-white">{debt ? "Editar dívida" : "Nova dívida"}</p>
          <button onClick={onClose} className="text-white/40 hover:text-white/80 text-xl leading-none">
            ×
          </button>
        </div>

        {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}

        <div>
          <label className="field-label">Descrição *</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex: Cartão de crédito, fatura de julho..."
            className="mt-1 field-input"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="field-label">Categoria *</label>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Selecione ou digite..."
              list="debt-category-suggestions"
              className="mt-1 field-input"
            />
            <datalist id="debt-category-suggestions">
              {DEBT_CATEGORY_SUGGESTIONS.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
          <div>
            <label className="field-label">Valor total (R$) *</label>
            <input
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              inputMode="decimal"
              placeholder="0,00"
              className="mt-1 field-input"
            />
          </div>
        </div>

        <div>
          <label className="field-label">Vencimento (opcional)</label>
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="mt-1 field-input" />
        </div>

        <div>
          <label className="field-label">Observações</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="mt-1 field-input" />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="btn-ghost">
            Cancelar
          </button>
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}
