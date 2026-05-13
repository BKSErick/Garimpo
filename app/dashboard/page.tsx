"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Rocket,
  Search,
  MessageSquare,
  TrendingUp,
  Zap,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Users,
  ChevronLeft,
  Crosshair,
  Activity,
  ShieldCheck,
  Target,
  BarChart3,
  Sparkles,
  Command,
  Database,
  Cpu,
  Trash2,
  MapPin as LucideMapPin
} from "lucide-react";

import { KpiMiner } from "@/components/ui/KpiMiner";
import { CardMiner, CardMinerHeader, CardMinerTitle } from "@/components/ui/CardMiner";
import { BadgeMiner } from "@/components/ui/BadgeMiner";
import { ButtonMiner } from "@/components/ui/ButtonMiner";

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({ total: 0, qualificados: 0, abordados: 0, fechados: 0 });
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [greeting, setGreeting] = useState("");
  const [streak, setStreak] = useState(0);
  const [todayLeads, setTodayLeads] = useState(0);

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreeting("Bom dia");
    else if (h < 18) setGreeting("Boa tarde");
    else setGreeting("Boa noite");

    // Streak tracking
    const today = new Date().toDateString();
    const lastVisit = localStorage.getItem("finch_last_visit");
    const savedStreak = parseInt(localStorage.getItem("finch_streak") || "0");
    if (lastVisit !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const newStreak = lastVisit === yesterday.toDateString() ? savedStreak + 1 : 1;
      localStorage.setItem("finch_streak", newStreak.toString());
      localStorage.setItem("finch_last_visit", today);
      setStreak(newStreak);
    } else {
      setStreak(savedStreak);
    }

    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/dashboard/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats || stats);
        setCampaigns(data.campaigns || []);
        setRecentLeads(data.recentLeads || []);
        const todayCount = (data.recentLeads || []).filter((l: any) => {
          return new Date(l.created_at).toDateString() === new Date().toDateString();
        }).length;
        setTodayLeads(todayCount);
      }
    } catch (e) {
      // server still booting
    }
  };

  const startGarimpo = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/prospect", {
        method: "POST",
        body: JSON.stringify({ query }),
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      if (data.success && data.campaignId) {
        router.push(`/dashboard/campanhas/${data.campaignId}`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const deleteCampaign = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Deseja realmente excluir esta linha de extração?")) return;
    
    try {
      const res = await fetch("/api/campaigns", {
        method: "DELETE",
        body: JSON.stringify({ id }),
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) {
        setCampaigns(campaigns.filter(c => c.id !== id));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-8 flex flex-col gap-10 max-w-7xl mx-auto animate-in fade-in duration-1000">
      
      {/* Cinematic Header HUD */}
      <div className="relative group overflow-hidden rounded-sm border border-white/5 bg-black/40 backdrop-blur-xl p-10">
        {/* Background Grid Motif */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 via-transparent to-primary/5 blur-3xl opacity-0 group-hover:opacity-100 transition-all duration-1000" />
        
        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-10">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-5">
              <div className="flex -space-x-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-purple" />
                <div className="w-2 h-2 rounded-full bg-primary/40 animate-pulse delay-75" />
              </div>
              <p className="text-text-muted text-[10px] font-black uppercase tracking-[0.4em]" suppressHydrationWarning>{greeting}, OPERADOR ESTRATÉGICO</p>
            </div>
            
            <h2 className="text-6xl md:text-7xl font-black tracking-tighter uppercase leading-[0.9] text-white">
              Command <span className="text-primary drop-shadow-[0_0_25px_rgba(var(--primary-rgb),0.3)]">Center</span>
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 shrink-0">
            <ButtonMiner 
              onClick={() => router.push('/dashboard/campanhas/nova')}
              icon={Rocket}
              className="h-16 px-12 shadow-purple text-xs group/btn"
            >
              INICIAR EXTRAÇÃO <ChevronLeft size={16} className="rotate-180 ml-2 group-hover/btn:translate-x-1 transition-transform" />
            </ButtonMiner>
          </div>
        </div>
      </div>

      {/* Global Performance HUD */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <KpiMiner 
          title="Base Total" 
          value={stats.total} 
          icon={Users} 
          trend={{ value: '+12%', positive: true }} 
          className="bg-white/[0.02] border-white/5"
        />
        <KpiMiner 
          title="Qualificados" 
          value={stats.qualificados} 
          icon={Zap} 
          trend={{ value: 'IA', positive: true }} 
          className="bg-primary/[0.03] border-primary/10"
        />
        <KpiMiner 
          title="Em Abordagem" 
          value={stats.abordados} 
          icon={MessageSquare} 
          className="bg-white/[0.02] border-white/5"
        />
        <KpiMiner 
          title="Conversão" 
          value={stats.fechados} 
          icon={CheckCircle2} 
          trend={{ value: 'ROAS 8.2x', positive: true }}
          className="bg-white/[0.02] border-white/5"
        />
      </div>

      {/* Missão Diária — Habit Tracker */}
      <div className="flex items-center gap-6 p-6 bg-black/40 border border-white/5 rounded-sm overflow-hidden relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="shrink-0 flex flex-col items-center justify-center w-20 h-20 rounded-sm bg-primary/10 border border-primary/20 relative">
          <span className="text-3xl font-black text-primary leading-none">{streak}</span>
          <span className="text-[8px] font-black text-primary/60 uppercase tracking-widest mt-1">dias</span>
          {streak >= 3 && <span className="absolute -top-2 -right-2 text-base">🔥</span>}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">MISSÃO DIÁRIA</span>
            <div className="h-3 w-px bg-white/10" />
            <span className="text-[9px] font-black uppercase tracking-widest text-text-muted/40">
              {streak === 0 ? "Comece hoje" : streak === 1 ? "1º dia — bom começo!" : `${streak} dias em sequência`}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
              <div
                className="h-full bg-primary transition-all duration-1000 shadow-purple"
                style={{ width: `${Math.min(100, (todayLeads / 5) * 100)}%` }}
              />
            </div>
            <span className="text-[10px] font-black text-white shrink-0">
              {todayLeads}<span className="text-text-muted/40">/5 leads hoje</span>
            </span>
          </div>
        </div>
        <div className="shrink-0 text-right hidden lg:block">
          <p className="text-[9px] font-black uppercase tracking-widest text-text-muted/30">
            {todayLeads >= 5 ? "🏆 Meta batida!" : todayLeads > 0 ? `Faltam ${5 - todayLeads}` : "Inicie uma extração"}
          </p>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* Primary Operations Pillar */}
        <div className="xl:col-span-8 flex flex-col gap-8">
          
          {/* Quick Prospecting Miner Tool */}
          <CardMiner elevated className="relative overflow-hidden border-primary/20 bg-primary/[0.02] p-10 group">
            <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
              <Command size={120} className="text-primary" />
            </div>
            
            <div className="flex items-center gap-5 mb-10">
              <div className="w-14 h-14 rounded-sm bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-purple-sm">
                <Search size={28} />
              </div>
              <div>
                <CardMinerTitle className="uppercase text-2xl tracking-tighter">Garimpo Instantâneo</CardMinerTitle>
                <p className="text-[10px] text-text-muted uppercase font-black tracking-[0.3em] mt-1.5 opacity-60">Sondagem direta via API Geográfica e Diagnóstico de Falsa Ruína</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-5 items-stretch relative">
              <div className="flex-1 relative group/input">
                <div className="absolute inset-y-0 left-6 flex items-center text-text-muted group-focus-within/input:text-primary transition-colors">
                  <Target size={20} />
                </div>
                <input
                  type="text"
                  placeholder='Ex: "Oficinas de Luxo em Belo Horizonte"'
                  className="w-full bg-black border border-white/10 pl-16 pr-8 h-20 text-lg font-bold rounded-sm focus:outline-none focus:border-primary/50 focus:bg-white/[0.03] transition-all placeholder:opacity-20 shadow-inner"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && startGarimpo()}
                />
                <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-20 hidden md:block">
                  <kbd className="px-2 py-1 bg-white/10 rounded-sm text-[8px] font-black tracking-widest text-white border border-white/10">ENTER</kbd>
                </div>
              </div>
              <ButtonMiner
                isLoading={loading}
                icon={Zap}
                onClick={startGarimpo}
                className="h-20 px-14 text-sm font-black tracking-[0.2em]"
              >
                DETONAR
              </ButtonMiner>
            </div>
            
            <div className="flex items-center gap-4 mt-8 pt-8 border-t border-white/5">
               <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-text-muted opacity-40">
                  <Activity size={12} /> FREQUÊNCIA: 4.2 GHZ
               </div>
               <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-text-muted opacity-40 border-l border-white/5 pl-4">
                  <Database size={12} /> BUFFER: CLEAR
               </div>
            </div>
          </CardMiner>

          {/* Active Extraction Lines */}
          <CardMiner className="p-0 overflow-hidden border-white/5 bg-black/20">
            <CardMinerHeader className="p-10 border-b border-white/5 mb-0 bg-white/[0.01] flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <Activity className="text-primary animate-[pulse_3s_linear_infinite]" size={22} />
                 <CardMinerTitle className="uppercase text-lg">Linhas de Extração Ativas</CardMinerTitle>
              </div>
              <Link href="/dashboard/campanhas" className="text-[10px] text-primary uppercase font-black tracking-[0.3em] hover:brightness-125 flex items-center gap-3 group transition-all">
                CENTRAL DE OPERAÇÕES <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </CardMinerHeader>
            <div className="divide-y divide-white/5">
              {campaigns.length === 0 ? (
                <div className="p-24 text-center">
                   <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6 opacity-20">
                      <Target size={32} />
                   </div>
                   <p className="text-text-muted text-[10px] uppercase font-black tracking-[0.4em] opacity-30">Nenhum comando de extração pendente</p>
                </div>
              ) : (
                campaigns.slice(0, 5).map((c) => (
                  <div key={c.id} className="relative group border-l-4 border-transparent hover:border-primary transition-all hover:bg-white/[0.02]">
                    <Link href={`/dashboard/campanhas/${c.id}`} className="p-10 flex items-center justify-between">
                      <div className="flex items-center gap-8">
                        <div className="w-16 h-16 bg-white/5 rounded-sm flex items-center justify-center text-text-muted group-hover:text-primary border border-white/5 group-hover:border-primary/20 transition-all shadow-md">
                          <Crosshair size={24} />
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <p className="font-black text-xl uppercase tracking-tighter text-white group-hover:text-primary transition-colors leading-none">{c.name}</p>
                            <BadgeMiner variant="muted" className="text-[8px] py-0 border-white/5">{c.niche}</BadgeMiner>
                          </div>
                          <div className="flex items-center gap-4 opacity-40">
                            <span className="text-[10px] text-text-muted uppercase font-black tracking-widest flex items-center gap-2">
                                <MapPin size={10} className="text-primary" /> {c.location || "Brasil"}
                            </span>
                            <span className="w-1 h-1 bg-white/20 rounded-full" />
                            <span className="text-[10px] text-text-muted uppercase font-black tracking-widest">{new Date(c.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-12">
                        <div className="text-right hidden sm:block">
                          <div className="text-3xl font-black text-white leading-none tracking-tighter">{c.total_leads}</div>
                          <div className="text-[9px] text-text-muted uppercase font-black tracking-[0.2em] mt-2 opacity-60">Extraídos</div>
                        </div>
                        <div className="flex items-center gap-4">
                           <button 
                              onClick={(e) => deleteCampaign(e, c.id)}
                              className="w-10 h-10 rounded-sm flex items-center justify-center border border-white/5 text-text-muted hover:text-error hover:border-error/30 hover:bg-error/5 transition-all opacity-0 group-hover:opacity-100"
                              title="Excluir Linha"
                           >
                              <Trash2 size={16} />
                           </button>
                           <div className="w-12 h-12 rounded-full flex items-center justify-center border border-white/5 group-hover:border-primary/30 group-hover:text-primary transition-all group-hover:bg-primary/5">
                              <ArrowRight size={20} />
                           </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))
              )}
            </div>
            <div className="p-6 border-t border-white/5 flex items-center justify-center">
              <Link href="/dashboard/campanhas" className="flex items-center gap-3 px-8 py-3 rounded-sm border border-primary/30 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.3em] hover:bg-primary/20 hover:border-primary/60 transition-all group/link">
                <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
                ACESSAR TODOS OS FLUXOS DE DADOS
              </Link>
            </div>
          </CardMiner>
        </div>

        {/* Intelligence Side Pillar */}
        <div className="xl:col-span-4 flex flex-col gap-8">
          
          {/* Live Extraction Log Feed */}
          <CardMiner className="p-0 overflow-hidden flex flex-col h-[820px] border-white/5 bg-black/40 backdrop-blur-sm">
            <CardMinerHeader className="p-10 border-b border-white/5 mb-0 bg-white/[0.02] flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="relative">
                    <Zap size={22} className="text-primary animate-pulse" />
                    <div className="absolute -inset-1 bg-primary/20 blur-md rounded-full animate-pulse" />
                 </div>
                 <CardMinerTitle className="uppercase text-lg">Log de Extração</CardMinerTitle>
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
                 <span className="text-[9px] font-black text-primary tracking-[0.2em]">LIVE</span>
              </div>
            </CardMinerHeader>
            <div className="p-8 flex flex-col gap-5 overflow-y-auto custom-scrollbar flex-1">
              {recentLeads.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full opacity-20 gap-6">
                   <Database size={48} />
                   <p className="text-[10px] text-text-muted uppercase font-black tracking-[0.3em]">Sincronizando Base...</p>
                </div>
              ) : (
                recentLeads.map((lead) => (
                  <Link href={`/dashboard/leads/${lead.id}`} key={lead.id}
                    className="p-6 bg-white/[0.02] border border-white/5 hover:border-primary/40 hover:bg-primary/[0.03] rounded-sm transition-all flex flex-col gap-5 group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                       <ArrowRight size={12} className="text-primary" />
                    </div>
                    
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex flex-col gap-2 min-w-0">
                        <p className="font-black text-sm uppercase tracking-tight truncate text-white group-hover:text-primary transition-colors">{lead.name}</p>
                        <div className="flex items-center gap-3">
                           <p className="text-[9px] text-text-muted font-bold truncate opacity-40 uppercase tracking-widest">{lead.website ? lead.website.replace(/https?:\/\//, '') : "Sem Site"}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-2xl font-black text-primary leading-none tracking-tighter drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.3)]">{lead.score || "—"}</div>
                        <div className="text-[8px] text-text-muted uppercase font-black tracking-widest mt-2">SCORE</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <BadgeMiner variant={lead.status === "qualificado" ? "primary" : "muted"} className="text-[8px] py-1 border-white/5">
                        {lead.status === "qualificado" ? "QUALIFICADO" : "EXTRAÍDO"}
                      </BadgeMiner>
                      <span className="text-[9px] text-text-muted uppercase font-black tracking-widest flex items-center gap-2 opacity-30">
                        <Clock size={12} /> {new Date(lead.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
            <Link href="/dashboard/leads" className="mt-auto p-8 border-t border-white/5 text-center text-[11px] font-black uppercase tracking-[0.4em] text-text-muted hover:text-primary hover:bg-white/[0.03] transition-all bg-white/[0.01]">
              VER RELATÓRIO COMPLETO
            </Link>
          </CardMiner>

          {/* Infrastructure Integrity HUD */}
          <CardMiner className="p-8 bg-black/40 border-white/5 overflow-hidden group">
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-primary/5 blur-3xl rounded-full group-hover:bg-primary/10 transition-all" />
            
            <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-text-muted mb-8 flex items-center gap-4">
              <div className="w-2.5 h-2.5 rounded-full bg-success animate-pulse shadow-[0_0_12px_rgba(34,197,94,0.4)]" /> 
              Satus de Infraestrutura
            </h4>
            <div className="flex flex-col gap-6 relative z-10">
              {[
                { name: "Sonda Maps (Serper)", status: "ESTÁVEL", icon: Target, active: true },
                { name: "Kernel ProspectOS (Claude)", status: "ESTÁVEL", icon: Cpu, active: true },
                { name: "Web Crawler (Firecrawl)", status: "OPERACIONAL", icon: Activity, active: true },
                { name: "Pipeline de Dados (Supabase)", status: "SINCRONIZADO", icon: Database, active: true }
              ].map((s) => (
                <div key={s.name} className="flex justify-between items-center group/item">
                  <div className="flex items-center gap-4">
                    <s.icon size={14} className="text-text-muted/30 group-hover/item:text-primary transition-colors" />
                    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-text-muted group-hover/item:text-white transition-colors">{s.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                     <span className="text-[10px] font-black text-success tracking-widest">{s.status}</span>
                     <div className="w-1 h-1 rounded-full bg-success" />
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between">
               <span className="text-[9px] font-black uppercase tracking-widest text-text-muted/40">Latência de Resposta</span>
               <span className="text-[9px] font-mono text-primary">124ms</span>
            </div>
          </CardMiner>
        </div>
      </div>
    </div>
  );
}

const MapPin = ({ size, className }: { size?: number, className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);
