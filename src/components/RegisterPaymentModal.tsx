"use client";

import { useEffect, useState } from "react";
import type { Debt } from "@/types";
import { remainingAmountOf } from "@/lib/debts";
import { formatCurrency } from "@/lib/currency";

export default function RegisterPaymentModal({
  open,
  debt,
  onClose,
  onSaved,
}: {
  open: boolean;
  debt: Debt | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [amount, setAmount] = useState("");
  const [paidAt, setPaidAt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && debt) {
      setAmount(String(remainingAmountOf(debt)));
      setPaidAt(new Date().toISOString().slice(0, 10));
      setError(null);
    }
  }, [open, debt]);

  if (!open || !debt) return null;

  const remaining = remainingAmountOf(debt);

  async function handleSave() {
    if (!amount || !paidAt) {
      setError("Preencha o valor e a data do pagamento.");
      return;
    }
    setSaving(true);
    setError(null);

    const res = await fetch(`/api/debts/${debt!.id}/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: Number(amount.replace(",", ".")), paidAt }),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Erro ao registrar o pagamento.");
      return;
    }

    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white/[0.04] p-5 shadow-2xl space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold text-white">Registrar pagamento</p>
          <button onClick={onClose} className="text-white/40 hover:text-white/80 text-xl leading-none">
            ×
          </button>
        </div>

        <p className="text-sm text-white/50">
          {debt.description} · saldo devedor: <span className="font-semibold text-white/90">{formatCurrency(remaining)}</span>
        </p>

        {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}

        <div>
          <label className="field-label">Valor pago (R$) *</label>
          <input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" className="mt-1 field-input" />
        </div>

        <div>
          <label className="field-label">Data do pagamento *</label>
          <input type="date" value={paidAt} onChange={(e) => setPaidAt(e.target.value)} className="mt-1 field-input" />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="btn-ghost">
            Cancelar
          </button>
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            {saving ? "Salvando..." : "Registrar"}
          </button>
        </div>
      </div>
    </div>
  );
}
