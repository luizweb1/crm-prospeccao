"use client";

import { useRef, useState } from "react";

interface ImportReport {
  totalImportado: number;
  totalIgnoradoPorDuplicidade: number;
  totalComErro: number;
  totalCriadoComSucesso: number;
  errors: string[];
}

export default function ImportCsvModal({
  open,
  onClose,
  onImported,
}: {
  open: boolean;
  onClose: () => void;
  onImported: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ImportReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  function handleClose() {
    setReport(null);
    setError(null);
    onClose();
  }

  async function handleFile(file: File) {
    setLoading(true);
    setError(null);
    setReport(null);

    const csvText = await file.text();

    const res = await fetch("/api/leads/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ csvText }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Erro ao importar o CSV.");
      return;
    }

    const data: ImportReport = await res.json();
    setReport(data);
    if (data.totalCriadoComSucesso > 0) onImported();
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white/[0.04] p-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold text-white">Importar leads via CSV</p>
          <button onClick={handleClose} className="text-white/40 hover:text-white/80 text-xl leading-none">
            ×
          </button>
        </div>

        <p className="mt-2 text-sm text-white/50">
          Colunas reconhecidas: @, Nicho, Link do site ou página, Link WhatsApp, O que você pode fazer pra melhorar?,
          Observações, Situação, Potencial do Lead, Origem do Lead.
        </p>

        <div className="mt-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
            className="block w-full rounded-lg border border-dashed border-white/20 bg-white/[0.04] p-3 text-sm text-white/70 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-600 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-brand-700"
          />
        </div>

        {loading && <p className="mt-3 text-sm text-white/50">Importando...</p>}
        {error && <p className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}

        {report && (
          <div className="mt-4 space-y-2 rounded-xl border border-white/15 bg-white/[0.04] p-3 text-sm">
            <p>
              Total no arquivo: <strong>{report.totalImportado}</strong>
            </p>
            <p className="text-green-400">
              Criados com sucesso: <strong>{report.totalCriadoComSucesso}</strong>
            </p>
            <p className="text-amber-400">
              Ignorados por duplicidade: <strong>{report.totalIgnoradoPorDuplicidade}</strong>
            </p>
            <p className="text-red-400">
              Com erro: <strong>{report.totalComErro}</strong>
            </p>
            {report.errors.length > 0 && (
              <ul className="mt-2 max-h-32 list-disc overflow-y-auto pl-4 text-xs text-red-400">
                {report.errors.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="mt-5 flex justify-end">
          <button onClick={handleClose} className="btn-primary">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
