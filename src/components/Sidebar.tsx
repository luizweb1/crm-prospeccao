"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "@/lib/clsx";
import { createClient } from "@/lib/supabase/client";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: "📊" },
  { href: "/leads", label: "Leads", icon: "📋" },
  { href: "/kanban", label: "Kanban", icon: "🗂️" },
  { href: "/clientes", label: "Clientes", icon: "💰" },
  { href: "/financeiro", label: "Financeiro", icon: "💳" },
  { href: "/templates", label: "Templates", icon: "✉️" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/login") return null;

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      <aside className="hidden md:flex md:flex-col md:w-60 md:shrink-0 border-r border-white/15 bg-white/[0.04] min-h-screen sticky top-0">
        <div className="flex items-center gap-2.5 px-5 py-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl brand-gradient text-white font-bold shadow-sm">
            C
          </div>
          <div>
            <p className="text-sm font-bold tracking-tight text-white">CRM Prospecção</p>
            <p className="text-xs text-white/40">Leads frios &rarr; clientes</p>
          </div>
        </div>
        <nav className="flex-1 px-3 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "relative flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active ? "bg-brand-500/15 text-brand-300" : "text-white/50 hover:bg-white/[0.04] hover:text-white",
                )}
              >
                {active && <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-brand-600" />}
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-3 py-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-white/50 hover:bg-white/[0.04] hover:text-white transition-colors"
          >
            <span className="text-base">🚪</span>
            Sair
          </button>
        </div>
      </aside>

      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-black/90 backdrop-blur border-t border-white/15 flex justify-around py-2 shadow-[0_-2px_8px_rgba(0,0,0,0.04)]">
        {NAV_ITEMS.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex flex-col items-center gap-0.5 text-xs px-3 py-1 rounded-lg transition-colors",
                active ? "text-brand-400 font-semibold bg-brand-500/15" : "text-white/40",
              )}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
        <button onClick={handleLogout} className="flex flex-col items-center gap-0.5 text-xs px-3 py-1 rounded-lg text-white/40">
          <span className="text-base">🚪</span>
          Sair
        </button>
      </nav>
    </>
  );
}
