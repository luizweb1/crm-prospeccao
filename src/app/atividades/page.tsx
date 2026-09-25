"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { FollowUp } from "@/types";
import { followUpCategory } from "@/lib/followUps";

const groups = [{ key: "atrasados", label: "Atrasados" }, { key: "hoje", label: "Hoje" }, { key: "proximos", label: "Próximos" }] as const;

export default function AtividadesPage() {
  const [items, setItems] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");
  const [reschedulingId, setReschedulingId] = useState("");
  const [newDate, setNewDate] = useState("");

  async function load() {
    try {
      const res = await fetch("/api/followups");
      if (!res.ok) throw new Error();
      setItems((await res.json()).followUps);
      setError("");
    } catch { setError("Não foi possível carregar as atividades."); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);
  const categorized = useMemo(() => Object.fromEntries(groups.map(group => [group.key, items.filter(item => followUpCategory(item) === group.key)])) as Record<(typeof groups)[number]["key"], FollowUp[]>, [items]);

  async function update(id: string, data: { completed?: boolean; dueAt?: string }) {
    setBusyId(id); setError("");
    try {
      const res = await fetch(`/api/followups/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error();
      setReschedulingId(""); setNewDate("");
      await load();
    } catch { setError("Não foi possível salvar a ação. Tente novamente."); }
    finally { setBusyId(""); }
  }

  return <div className="p-4 md:p-8 space-y-6 max-w-6xl">
    <div><p className="text-xs font-semibold tracking-[.16em] text-brand-400">ROTINA COMERCIAL</p><h1 className="mt-1 text-2xl font-bold tracking-tight">Atividades</h1><p className="text-sm text-white/50">Contatos com prazo definido e próximos passos.</p></div>
    {error && <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}
    {loading ? <p className="text-sm text-white/50">Carregando atividades...</p> : groups.map(group => <section key={group.key} className="card overflow-hidden">
      <h2 className="flex items-center justify-between border-b border-white/10 p-4 text-sm font-semibold">{group.label}<span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/60">{categorized[group.key].length}</span></h2>
      {categorized[group.key].length === 0 ? <p className="p-4 text-sm text-white/45">Nenhuma ação nesta categoria.</p> : <ul className="divide-y divide-white/10">{categorized[group.key].map(item => <li key={item.id} className="flex flex-wrap items-center justify-between gap-4 p-4">
        <div className="min-w-0"><Link href={`/leads/${item.leadId}`} className="font-medium text-white hover:text-brand-300">{item.lead?.contactName || `@${item.lead?.instagramUsername}`}</Link><p className="mt-1 text-sm text-white/75">{item.action}</p><p className="mt-1 text-xs text-white/45">{new Date(item.dueAt).toLocaleString("pt-BR", { dateStyle: "medium", timeStyle: "short" })}{item.notes && ` · ${item.notes}`}</p></div>
        <div className="flex flex-wrap items-center gap-2"><button disabled={busyId === item.id} onClick={() => update(item.id, { completed: true })} className="btn-primary px-3 py-1.5 text-xs">Concluir</button><button onClick={() => { setReschedulingId(item.id); setNewDate(""); }} className="btn-secondary px-3 py-1.5 text-xs">Reagendar</button></div>
        {reschedulingId === item.id && <form onSubmit={event => { event.preventDefault(); if (newDate) update(item.id, { dueAt: new Date(newDate).toISOString() }); }} className="flex w-full flex-wrap items-center gap-2"><label className="field-label" htmlFor={`date-${item.id}`}>Novo prazo</label><input id={`date-${item.id}`} type="datetime-local" required value={newDate} onChange={e => setNewDate(e.target.value)} className="field-input w-auto" /><button disabled={busyId === item.id} className="btn-primary px-3 py-1.5 text-xs">Salvar</button><button type="button" onClick={() => setReschedulingId("")} className="btn-ghost text-xs">Cancelar</button></form>}
      </li>)}</ul>}
    </section>)}
  </div>;
}
