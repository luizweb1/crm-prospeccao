"use client";

import { useCallback, useEffect, useState } from "react";
import type { FollowUp } from "@/types";
import { followUpCategory } from "@/lib/followUps";

export default function FollowUpPanel({ leadId }: { leadId: string }) {
  const [items, setItems] = useState<FollowUp[]>([]);
  const [action, setAction] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/followups?leadId=${encodeURIComponent(leadId)}`);
      if (!res.ok) throw new Error();
      setItems((await res.json()).followUps);
      setError("");
    } catch { setError("Não foi possível carregar as ações."); }
    finally { setLoading(false); }
  }, [leadId]);
  useEffect(() => { load(); }, [load]);

  async function create(event: React.FormEvent) {
    event.preventDefault();
    if (!action.trim() || !dueAt) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/followups", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ leadId, action, dueAt: new Date(dueAt).toISOString(), notes }) });
      if (!res.ok) throw new Error((await res.json()).error);
      setAction(""); setDueAt(""); setNotes("");
      await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível agendar."); }
    finally { setSaving(false); }
  }

  async function complete(id: string) {
    setError("");
    try {
      const res = await fetch(`/api/followups/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ completed: true }) });
      if (!res.ok) throw new Error();
      await load();
    } catch { setError("Não foi possível concluir a ação."); }
  }

  return <section className="card p-5 space-y-4" aria-labelledby="followup-heading">
    <div><h2 id="followup-heading" className="text-base font-semibold">Próximas ações</h2><p className="text-sm text-white/50">Agende o próximo contato com data e horário.</p></div>
    {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
    {loading ? <p className="text-sm text-white/50">Carregando ações...</p> : items.length ? <ul className="divide-y divide-white/10">{items.map(item => <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
      <div><p className={item.completedAt ? "text-white/40 line-through" : "text-white"}>{item.action}</p><p className="text-xs text-white/45">{new Date(item.dueAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}{item.notes && ` · ${item.notes}`}</p></div>
      {item.completedAt ? <span className="text-xs text-green-400">Concluído</span> : <div className="flex items-center gap-2"><span className="text-xs text-brand-300">{followUpCategory(item) === "atrasados" ? "Atrasado" : "Pendente"}</span><button onClick={() => complete(item.id)} className="btn-secondary px-2.5 py-1.5 text-xs">Concluir</button></div>}
    </li>)}</ul> : <p className="text-sm text-white/50">Nenhuma ação agendada.</p>}
    <form onSubmit={create} className="grid gap-3 border-t border-white/10 pt-4 md:grid-cols-[1fr_auto]">
      <div className="space-y-2"><label htmlFor="followup-action" className="field-label">Próxima ação</label><input id="followup-action" required maxLength={200} value={action} onChange={e => setAction(e.target.value)} placeholder="Ex.: retornar sobre a proposta" className="field-input" /></div>
      <div className="space-y-2"><label htmlFor="followup-date" className="field-label">Data e horário</label><input id="followup-date" required type="datetime-local" value={dueAt} onChange={e => setDueAt(e.target.value)} className="field-input" /></div>
      <div className="md:col-span-2"><label htmlFor="followup-notes" className="field-label">Observação opcional</label><input id="followup-notes" value={notes} onChange={e => setNotes(e.target.value)} className="field-input mt-1" /></div>
      <button disabled={saving} className="btn-primary md:col-span-2 md:justify-self-end">{saving ? "Salvando..." : "Agendar ação"}</button>
    </form>
  </section>;
}
