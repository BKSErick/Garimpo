"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  Megaphone, 
  Target, 
  Trello, 
  Settings, 
  LogOut,
  Zap,
  Radar,
  Crown,
  ChevronRight,
  Activity,
  ShieldCheck,
  Cpu,
  Layers,
  Sparkles
} from "lucide-react";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "COMMAND CENTER" },
  { href: "/dashboard/estrategia", icon: Sparkles, label: "LAB ESTRATÉGICO" },
  { href: "/dashboard/campanhas", icon: Megaphone, label: "OPERAÇÕES" },
  { href: "/dashboard/leads", icon: Target, label: "INTELIGÊNCIA" },
  { href: "/dashboard/kanban", icon: Trello, label: "PIPELINE" },
  { href: "/dashboard/configuracoes", icon: Settings, label: "PLANO E USO" },
];

const PLAN_LIMITS = {
  "STARTER": 5,
  "MINERADOR": 20,
  "INDUSTRIAL": 40,
  "ADM": 100
};

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [userPlan, setUserPlan] = useState<keyof typeof PLAN_LIMITS>("STARTER");
  const [activeSondas, setActiveSondas] = useState(0);
  const [quotaPercent, setQuotaPercent] = useState(0);
  const [userEmail, setUserEmail] = useState("");

  const PLAN_LIMIT = PLAN_LIMITS[userPlan];

  useEffect(() => {
    async function fetchData() {
      try {
        // 1. Fetch Plan
        let currentPlan: keyof typeof PLAN_LIMITS = "STARTER";
        const profileRes = await fetch("/api/user/profile");
        
        if (profileRes.ok) {
          const { user } = await profileRes.json();
          console.log("DEBUG [Sidebar]: Profile fetched", user);
          if (user?.plan && PLAN_LIMITS[user.plan as keyof typeof PLAN_LIMITS]) {
            currentPlan = user.plan as keyof typeof PLAN_LIMITS;
            setUserPlan(currentPlan);
          }
          if (user?.email) {
            setUserEmail(user.email);
          }
        }

        const currentLimit = PLAN_LIMITS[currentPlan];

        // 2. Fetch Quota
        const res = await fetch("/api/campaigns");
        if (!res.ok) return;
        const { campaigns } = await res.json();
        const active = (campaigns || []).filter(
          (c: any) => c.status === "processando" || c.status === "ativo"
        ).length;
        
        setActiveSondas(active);
        setQuotaPercent(Math.min(Math.round((active / currentLimit) * 100), 100));
      } catch (error) {
        console.error("DEBUG [Sidebar]: Fetch error", error);
      }
    }
    fetchData();
  }, [pathname]); // re-fetch on route change

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };


  return (
    <aside className="w-72 min-h-screen bg-black/60 backdrop-blur-3xl border-r border-white/5 flex flex-col justify-between shrink-0 relative z-[60] shadow-2xl">
      {/* Decorative Edge Glow */}
      <div className="absolute inset-y-0 right-0 w-[1px] bg-gradient-to-b from-transparent via-primary/30 to-transparent" />
      
      <div>
        <div className="px-10 py-12">
          <div className="flex items-center gap-5">
            <div className="relative group cursor-pointer" onClick={() => router.push("/dashboard")}>
              <div className="absolute -inset-2 bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-all rounded-full" />
              <div className="w-12 h-12 rounded-sm bg-primary flex items-center justify-center shadow-purple relative border border-primary/40 group-hover:scale-105 transition-transform">
                <Radar className="text-white w-7 h-7" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter text-white leading-none uppercase">ProspectOS</h1>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <p className="text-[10px] uppercase font-black tracking-[0.4em] text-primary/80">Protocolo Nudge™</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tactical Navigation */}
        <nav className="flex flex-col gap-2 px-5 mt-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-6 py-4 rounded-sm text-[10px] font-black uppercase tracking-[0.25em] transition-all group relative overflow-hidden ${
                  isActive
                    ? "text-primary bg-primary/[0.07] border border-primary/20 shadow-purple-sm"
                    : "text-text-muted hover:text-white hover:bg-white/[0.04] border border-transparent"
                }`}
              >
                <div className="flex items-center gap-5 relative z-10">
                  <item.icon 
                    size={18} 
                    className={`${isActive ? "text-primary drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.8)]" : "text-text-muted group-hover:text-white transition-colors opacity-40 group-hover:opacity-100"}`} 
                  />
                  {item.label}
                </div>
                
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary shadow-purple" />
                )}

                <ChevronRight size={14} className={`transition-all ${isActive ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}`} />
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer: Intelligence HUD & Power State */}
      <div className="p-6 flex flex-col gap-6">
        {/* System Health HUD */}
        <div className="bg-white/[0.02] border border-white/5 rounded-sm p-6 relative overflow-hidden group hover:border-primary/20 transition-all">
          <div className="absolute -top-4 -right-4 opacity-[0.03] group-hover:opacity-[0.08] transition-all text-primary pointer-events-none">
            <Cpu size={100} />
          </div>
          
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
               <ShieldCheck size={14} className={quotaPercent >= 90 ? "text-red-400" : quotaPercent >= 70 ? "text-yellow-400" : "text-primary"} />
               <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">QUOTA ATIVA</span>
            </div>
            <span className={`text-[11px] font-black tracking-tighter ${quotaPercent >= 90 ? "text-red-400" : quotaPercent >= 70 ? "text-yellow-400" : "text-white"}`}>
              {quotaPercent}%
            </span>
          </div>
          
          <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden border border-white/5">
            <div 
              className={`h-full transition-all duration-1000 ${quotaPercent >= 90 ? "bg-red-500" : quotaPercent >= 70 ? "bg-yellow-400" : "bg-primary shadow-purple"}`}
              style={{ width: `${quotaPercent}%` }} 
            />
          </div>

          <p className="text-[8px] text-text-muted font-black uppercase tracking-widest opacity-30 mt-2">
            {activeSondas} / {PLAN_LIMIT} sondas usadas
          </p>
          
          <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-white/5">
             <button 
               onClick={() => router.push("/dashboard/configuracoes?view=credits")}
               className="flex items-center justify-center gap-2 h-10 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 text-[9px] font-black uppercase tracking-widest border border-amber-500/20 transition-all rounded-sm"
             >
               <Zap size={12} fill="currentColor" />
               COMPRAR
             </button>
             <button 
               onClick={() => router.push("/dashboard/configuracoes?view=subscriptions")}
               className="flex items-center justify-center gap-2 h-10 bg-primary/10 hover:bg-primary/20 text-primary text-[9px] font-black uppercase tracking-widest border border-primary/20 transition-all rounded-sm"
             >
               <Crown size={12} fill="currentColor" />
               UPGRADE
             </button>
          </div>
          <div className="flex items-center gap-2 mt-3 justify-center">
            <div className={`w-1 h-1 rounded-full animate-pulse ${quotaPercent >= 90 ? "bg-red-400" : "bg-green-400"}`} />
            <p className="text-[7px] text-text-muted font-black uppercase tracking-widest opacity-40">
              {quotaPercent >= 90 ? "Capacidade Crítica" : "Sincronia OK"}
            </p>
          </div>
        </div>

        {/* Power Down Action */}
        <button
          onClick={handleLogout}
          className="group flex items-center justify-center gap-3 px-6 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-text-muted/60 hover:text-red-400 border border-white/5 hover:border-red-500/30 rounded-sm transition-all hover:bg-red-500/[0.03]"
        >
          <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
          TERMINAR SESSÃO
        </button>
        
        {/* User Identity Section */}
        <div className="flex items-center gap-4 px-2 mb-2">
          <div className="w-10 h-10 rounded-sm bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center text-white font-black text-xs shadow-purple-sm shrink-0 uppercase">
            {userEmail ? userEmail.charAt(0) : "P"}
          </div>
          <div className="min-w-0">
             <p className="text-[10px] font-black text-white uppercase tracking-wider truncate">
               {userEmail ? userEmail.split('@')[0] : "Prospector"}
             </p>
             <p className="text-[8px] font-bold text-text-muted truncate opacity-40 uppercase tracking-tighter">
               {userEmail || "Carregando..."}
             </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
