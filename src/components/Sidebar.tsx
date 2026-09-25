"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import clsx from "@/lib/clsx";
import { createClient } from "@/lib/supabase/client";

const iconPaths = {
  dashboard: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
  leads: <><path d="M8 6h13M8 12h13M8 18h13" /><path d="M3 6h.01M3 12h.01M3 18h.01" strokeWidth="3" /></>,
  pipeline: <><rect x="3" y="4" width="5" height="16" rx="1" /><rect x="10" y="4" width="5" height="11" rx="1" /><rect x="17" y="4" width="4" height="14" rx="1" /></>,
  tasks: <><rect x="4" y="4" width="16" height="16" rx="2" /><path d="m8 12 3 3 5-6" /></>,
  clients: <><circle cx="9" cy="8" r="3" /><path d="M3 20v-2a6 6 0 0 1 12 0v2H3ZM17 5a3 3 0 0 1 0 6M17 14a5 5 0 0 1 4 5v1h-4" /></>,
  finance: <><rect x="2" y="5" width="20" height="15" rx="2" /><path d="M2 10h20M6 16h4" /></>,
  templates: <><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" /></>,
  settings: <><circle cx="12" cy="12" r="4" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" /></>,
  logout: <><path d="M10 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5M14 16l4-4-4-4M8 12h10" /></>,
};
type IconName = keyof typeof iconPaths;
function Icon({ name }: { name: IconName }) {
  return <svg aria-hidden="true" className="h-[18px] w-[18px] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{iconPaths[name]}</svg>;
}

const GROUPS: { label: string; items: { href: string; label: string; icon: IconName }[] }[] = [
  { label: "VISÃO GERAL", items: [{ href: "/", label: "Dashboard", icon: "dashboard" }, { href: "/atividades", label: "Atividades", icon: "tasks" }] },
  { label: "COMERCIAL", items: [{ href: "/leads", label: "Leads", icon: "leads" }, { href: "/kanban", label: "Pipeline", icon: "pipeline" }, { href: "/clientes", label: "Clientes", icon: "clients" }] },
  { label: "GESTÃO", items: [{ href: "/financeiro", label: "Financeiro", icon: "finance" }, { href: "/templates", label: "Templates", icon: "templates" }] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoutError, setLogoutError] = useState(false);
  if (["/login", "/recuperar-senha", "/alterar-senha"].includes(pathname)) return null;

  async function logout() {
    setLogoutError(false);
    const { error } = await createClient().auth.signOut();
    if (error) { setLogoutError(true); return; }
    router.push("/login");
    router.refresh();
  }

  function itemLink(item: (typeof GROUPS)[number]["items"][number], compact = false) {
    const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
    return <Link key={item.href} href={item.href} title={compact ? item.label : undefined} aria-current={active ? "page" : undefined} onClick={() => setMenuOpen(false)} className={clsx("nav-item", active && "nav-item-active", compact && "justify-center px-2")}><Icon name={item.icon} />{!compact && <span>{item.label}</span>}</Link>;
  }

  return <>
    <aside className={clsx("hidden md:flex md:flex-col md:shrink-0 border-r border-white/10 bg-[#111111] sticky top-0 h-screen transition-[width] duration-200", collapsed ? "md:w-[72px]" : "md:w-[244px]")}>
      <div className={clsx("flex h-[76px] items-center border-b border-white/10", collapsed ? "justify-center px-2" : "px-5")}>
        <Link href="/" title="LUIIZWEB CRM" aria-label="LUIIZWEB, ir para o Dashboard" className="flex items-center gap-3">
          {collapsed ? <Image src="/brand/symbol.svg" alt="" width={38} height={38} /> : <><span className="flex items-center gap-[7px]"><Image src="/brand/luiiz.svg" alt="" width={91} height={27} /><Image src="/brand/web.svg" alt="" width={82} height={26} /></span><span className="rounded border border-white/20 px-1.5 py-0.5 text-[9px] font-bold tracking-[.13em] text-white/50">CRM</span></>}
        </Link>
      </div>
      <nav aria-label="Navegação principal" className="flex-1 overflow-y-auto px-3 py-5 space-y-6">
        {GROUPS.map(group => <div key={group.label} className="space-y-1">{!collapsed && <p className="px-3 pb-2 text-[10px] font-semibold tracking-[.16em] text-white/35">{group.label}</p>}{group.items.map(item => itemLink(item, collapsed))}</div>)}
      </nav>
      <div className="border-t border-white/10 p-3 space-y-1">
        <Link href="/alterar-senha" title={collapsed ? "Alterar senha" : undefined} className={clsx("nav-item", collapsed && "justify-center px-2")}><Icon name="settings" />{!collapsed && "Alterar senha"}</Link>
        <button onClick={logout} title={collapsed ? "Sair" : undefined} className={clsx("nav-item w-full", collapsed && "justify-center px-2")}><Icon name="logout" />{!collapsed && "Sair"}</button>
        {logoutError && <p role="alert" className="px-3 text-xs text-red-300">Não foi possível sair. Tente novamente.</p>}
        <button onClick={() => setCollapsed(value => !value)} aria-label={collapsed ? "Expandir menu" : "Recolher menu"} className="nav-item w-full justify-center border-t border-white/10 pt-3"><span aria-hidden="true">{collapsed ? "›" : "‹"}</span>{!collapsed && <span className="text-xs">Recolher menu</span>}</button>
      </div>
    </aside>
    <header className="fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between border-b border-white/10 bg-[#111111] px-4 md:hidden">
      <Link href="/" aria-label="LUIIZWEB CRM, ir para o Dashboard" className="flex items-center gap-2"><Image src="/brand/symbol.svg" alt="" width={30} height={30} /><span className="text-sm font-semibold tracking-wide">CRM</span></Link>
      <button onClick={() => setMenuOpen(value => !value)} aria-expanded={menuOpen} aria-controls="mobile-menu" className="rounded-lg border border-white/15 px-3 py-1.5 text-sm">{menuOpen ? "Fechar" : "Menu"}</button>
    </header>
    {menuOpen && <nav id="mobile-menu" aria-label="Menu móvel" className="fixed inset-x-0 top-14 bottom-0 z-30 overflow-y-auto bg-[#111111] p-5 md:hidden">
      {GROUPS.map(group => <div key={group.label} className="mb-5"><p className="mb-2 px-3 text-[10px] tracking-[.16em] text-white/40">{group.label}</p>{group.items.map(item => itemLink(item))}</div>)}
      <Link href="/alterar-senha" onClick={() => setMenuOpen(false)} className="nav-item"><Icon name="settings" />Alterar senha</Link>
      <button onClick={logout} className="nav-item w-full"><Icon name="logout" />Sair</button>
    </nav>}
  </>;
}
