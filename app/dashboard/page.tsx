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
  Crosshair
} from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  extraido: "text-gray-400 border-white/5 bg-white/2",
  qualificado: "text-primary border-primary/20 bg-primary/5",
  abordado: "text-blue-400 border-blue-500/20 bg-blue-500/5",
  convertido: "text-green-400 border-green-500/20 bg-green-500/5",
  descartado: "text-red-400 border-red-500/20 bg-red-500/5",
};

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({ total: 0, qualificados: 0, abordados: 0, fechados: 0 });
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreeting("Bom dia");
    else if (h < 18) setGreeting("Boa tarde");
    else setGreeting("Boa noite");

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

  return (
    <div className="p-8 flex flex-col gap-10 max-w-7xl mx-auto">
      {/* Header HUD */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <p className="text-text-muted text-[10px] font-black uppercase tracking-[0.2em]">{greeting}, OUTLIER</p>
          </div>
          <h2 className="text-6xl font-black tracking-tighter uppercase leading-none">Command Center</h2>
          <p className="text-sm text-text-muted mt-3 max-w-md">Bem-vindo ao motor de prospecção Finch. Sua base de dados de leads de alta conversão está atualizada.</p>
        </div>
        <div className="flex gap-4">
          <Link
            href="/dashboard/campanhas/nova"
            className="btn-finch py-4 px-8 flex items-center gap-3 text-sm"
          >
            <Rocket size={18} /> Iniciar Novo Garimpo
          </Link>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Stats Pillar */}
        <div className="xl:col-span-2 flex flex-col gap-8">
          
          {/* Global Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Leads Totais", value: stats.total, icon: Users, color: "text-primary" },
              { label: "Qualificados", value: stats.qualificados, icon: Zap, color: "text-orange-500" },
              { label: "Abordados", value: stats.abordados, icon: TrendingUp, color: "text-green-500" },
              { label: "Convertidos", value: stats.fechados, icon: CheckCircle2, color: "text-blue-500" },
            ].map((s) => (
              <div key={s.label} className="glass p-6 rounded-sm border border-white/5 group hover:border-primary/30 transition-all">
                <s.icon size={16} className={`${s.color} mb-4`} />
                <div className="text-3xl font-black tracking-tighter">{s.value}</div>
                <div className="text-[9px] font-black uppercase tracking-widest text-text-muted mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Quick Prospecting HUD */}
          <div className="glass border border-primary/20 bg-primary/[0.02] p-8 rounded-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-sm bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                <Search size={20} />
              </div>
              <div>
                <h3 className="text-xl font-black tracking-tight uppercase">Garimpo Instantâneo</h3>
                <p className="text-[10px] text-text-muted uppercase font-bold tracking-widest">Extração direta do Google Maps em 15 segundos</p>
              </div>
            </div>
            <div className="flex gap-4 items-end">
              <div className="flex-1 flex flex-col gap-2">
                <input
                  type="text"
                  placeholder='Ex: "Contabilidades em Curitiba"'
                  className="input-finch py-4 text-base"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && startGarimpo()}
                />
              </div>
              <button
                className="btn-finch py-4 px-8 shrink-0 flex items-center gap-2"
                onClick={startGarimpo}
                disabled={loading}
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} />}
                Iniciar
              </button>
            </div>
          </div>

          {/* Recent Campaigns Table */}
          <div className="glass border border-white/5 rounded-sm overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-[0.2em]">Fluxos de Prospecção</h3>
              <Link href="/dashboard/campanhas" className="text-[10px] text-primary uppercase font-black hover:underline flex items-center gap-1">Ver Todos <ArrowRight size={10} /></Link>
            </div>
            <div className="divide-y divide-white/5">
              {campaigns.length === 0 ? (
                <div className="p-12 text-center text-text-muted text-[10px] uppercase tracking-widest">Aguardando primeira campanha...</div>
              ) : (
                campaigns.slice(0, 3).map((c) => (
                  <Link href={`/dashboard/campanhas/${c.id}`} key={c.id} className="p-6 flex items-center justify-between hover:bg-white/[0.02] transition-all group">
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 bg-white/5 rounded-sm flex items-center justify-center text-text-muted group-hover:text-primary border border-white/5 group-hover:border-primary/20 transition-all">
                        <Crosshair size={16} />
                      </div>
                      <div>
                        <p className="font-black text-sm uppercase tracking-tight">{c.name}</p>
                        <p className="text-[10px] text-text-muted uppercase tracking-wider">{c.niche} · {c.location || "Brasil"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right hidden md:block">
                        <div className="text-xs font-black">{c.total_leads}</div>
                        <div className="text-[8px] text-text-muted uppercase font-black">Leads</div>
                      </div>
                      <ChevronLeft size={16} className="rotate-180 text-text-muted group-hover:text-primary transition-all" />
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Activity & Leads */}
        <div className="flex flex-col gap-8">
          
          {/* Recent Leads Feed */}
          <div className="glass border border-white/5 rounded-sm overflow-hidden flex flex-col h-full">
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
              <h3 className="text-xs font-black uppercase tracking-[0.2em]">Ouro Recém Extraído</h3>
              <Zap size={14} className="text-primary animate-pulse" />
            </div>
            <div className="p-4 flex flex-col gap-3 overflow-y-auto max-h-[600px]">
              {recentLeads.length === 0 ? (
                <div className="p-10 text-center text-text-muted text-[10px] uppercase tracking-widest">Nenhum lead ainda.</div>
              ) : (
                recentLeads.map((lead) => (
                  <Link href={`/dashboard/leads/${lead.id}`} key={lead.id}
                    className="p-4 bg-white/[0.02] border border-white/5 hover:border-primary/20 hover:bg-white/[0.04] rounded-sm transition-all flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col gap-1 min-w-0">
                        <p className="font-black text-xs uppercase tracking-tight truncate">{lead.name}</p>
                        <p className="text-[9px] text-text-muted truncate">{lead.website || "Sem site"}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-lg font-black text-primary leading-none">{lead.score || "—"}</div>
                        <div className="text-[8px] text-text-muted uppercase font-black">Score</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <span className={`px-1.5 py-0.5 text-[8px] font-black uppercase border rounded-sm ${STATUS_COLORS[lead.status] || STATUS_COLORS.extraido}`}>
                        {lead.status === "qualificado" ? "⚡ QUALIFICADO" : lead.status}
                      </span>
                      <span className="text-[8px] text-text-muted uppercase font-bold flex items-center gap-1">
                        <Clock size={8} /> {new Date(lead.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
            <Link href="/dashboard/leads" className="mt-auto p-4 border-t border-white/5 text-center text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-primary hover:bg-white/[0.02] transition-all">
              Ver Toda a Extração
            </Link>
          </div>

          {/* System Health */}
          <div className="glass border border-white/5 p-6 rounded-sm bg-black/40">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-4 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> Sistema Finch Ativo
            </h4>
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-wider">
                <span className="text-text-muted">API Serper (Maps)</span>
                <span className="text-green-500">Operacional</span>
              </div>
              <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-wider">
                <span className="text-text-muted">IA Diagnostic (OpenRouter)</span>
                <span className="text-green-500">Operacional</span>
              </div>
              <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-wider">
                <span className="text-text-muted">Scraper (Firecrawl)</span>
                <span className="text-green-500">Operacional</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
