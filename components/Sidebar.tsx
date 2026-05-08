"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
  { href: "/dashboard", icon: "⚡", label: "Dashboard" },
  { href: "/dashboard/campanhas", icon: "📣", label: "Campanhas" },
  { href: "/dashboard/leads", icon: "🎯", label: "Leads" },
  { href: "/dashboard/kanban", icon: "📋", label: "Kanban" },
  { href: "/dashboard/configuracoes", icon: "⚙️", label: "Configurações" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  return (
    <aside className="w-64 min-h-screen bg-surface border-r border-primary/10 flex flex-col justify-between shrink-0">
      {/* Logo */}
      <div>
        <div className="px-6 py-5 border-b border-primary/10">
          <div className="flex items-center gap-2">
            <span className="text-primary text-xl">⛏</span>
            <h1 className="text-lg font-black tracking-tighter text-primary">GARIMPO</h1>
          </div>
          <p className="text-[9px] uppercase tracking-widest text-text-muted mt-0.5">Prospecção de Outliers</p>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 p-3 mt-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-sm text-sm font-bold uppercase tracking-widest transition-all ${
                  isActive
                    ? "bg-primary/15 text-primary border-l-2 border-primary"
                    : "text-text-muted hover:text-accent hover:bg-white/5"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer: Credits + Logout */}
      <div className="p-4 border-t border-primary/10 flex flex-col gap-3">
        <div className="glass p-3 rounded-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">Créditos</span>
            <span className="text-xs font-black text-primary">40</span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-1.5">
            <div className="bg-primary h-1.5 rounded-full" style={{ width: "40%" }} />
          </div>
          <p className="text-[9px] text-text-muted mt-2">Plano Starter</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 text-[9px] font-black uppercase tracking-widest text-text-muted border border-white/10 rounded-sm hover:border-red-500/30 hover:text-red-400 transition-all"
        >
          ↩ Sair
        </button>
      </div>
    </aside>
  );
}
