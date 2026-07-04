"use client";

import { useEffect, useState } from "react";
import type { TemplateMessage } from "@/types";
import TemplateFormModal from "@/components/TemplateFormModal";
import CopyButton from "@/components/CopyButton";
import ConfirmDialog from "@/components/ConfirmDialog";
import EmptyState from "@/components/EmptyState";

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<TemplateMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<TemplateMessage | null>(null);
  const [deleting, setDeleting] = useState<TemplateMessage | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/templates");
    const data = await res.json();
    setTemplates(data.templates);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete() {
    if (!deleting) return;
    await fetch(`/api/templates/${deleting.id}`, { method: "DELETE" });
    setDeleting(null);
    load();
  }

  return (
    <div className="p-4 md:p-8 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Templates de mensagem</h1>
          <p className="text-sm text-white/50">Modelos prontos para copiar e usar na cadência</p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
          className="btn-primary"
        >
          + Novo template
        </button>
      </div>

      {loading && <p className="text-sm text-white/50">Carregando templates...</p>}

      {!loading && templates.length === 0 && (
        <EmptyState
          title="Nenhum template cadastrado"
          description="Crie modelos de mensagem para agilizar sua cadência de prospecção."
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((t) => (
          <div key={t.id} className="card p-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-white">{t.name}</p>
                <p className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-brand-500/15 px-2 py-0.5 text-xs font-medium text-brand-300">
                  {t.recommendedStep} · {t.recommendedChannel}
                </p>
              </div>
              <div className="flex gap-3 text-xs shrink-0">
                <button onClick={() => { setEditing(t); setFormOpen(true); }} className="font-medium text-white/50 hover:text-brand-400">
                  Editar
                </button>
                <button onClick={() => setDeleting(t)} className="font-medium text-white/50 hover:text-red-400">
                  Excluir
                </button>
              </div>
            </div>
            <p className="text-sm text-white/70 whitespace-pre-wrap">{t.text}</p>
            {t.notes && <p className="text-xs text-white/40">{t.notes}</p>}
            <CopyButton text={t.text} label="Copiar mensagem" />
          </div>
        ))}
      </div>

      <TemplateFormModal
        open={formOpen}
        template={editing}
        onClose={() => setFormOpen(false)}
        onSaved={() => {
          setFormOpen(false);
          load();
        }}
      />

      <ConfirmDialog
        open={!!deleting}
        title="Excluir template?"
        description={deleting ? `O template "${deleting.name}" será removido permanentemente.` : undefined}
        confirmLabel="Excluir"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
