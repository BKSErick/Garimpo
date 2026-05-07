"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const STATUS_COLORS: Record<string, string> = {
  extraido: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  qualificado: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  abordado: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  convertido: "bg-green-500/10 text-green-400 border-green-500/20",
  descartado: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, abordados: 0, responderam: 0, fechados: 0 });
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
      // server still booting, use empty state
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
      if (data.success) {
        await fetchData();
        setQuery("");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-text-muted text-sm font-bold uppercase tracking-widest">{greeting}, ERICK</p>
          <h2 className="text-4xl font-black tracking-tighter mt-1">Dashboard</h2>
        </div>
        <Link
          href="/dashboard/campanhas/nova"
          className="btn-finch flex items-center gap-2 text-sm"
        >
          + Nova campanha
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Leads Gerados", value: stats.total, icon: "↑", color: "text-accent" },
          { label: "Contatados", value: stats.abordados, icon: "✉", color: "text-blue-400" },
          { label: "Responderam", value: stats.responderam, icon: "★", color: "text-yellow-400" },
          { label: "Fechados", value: stats.fechados, icon: "✓", color: "text-green-400" },
        ].map((s) => (
          <div key={s.label} className="glass p-5 rounded-sm border border-primary/10">
            <div className={`text-2xl font-black mb-1 ${s.color}`}>{s.icon}</div>
            <div className="text-3xl font-black">{s.value}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-text-muted mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Garimpo */}
      <div className="glass border border-primary/20 rounded-sm p-5 flex gap-4 items-end">
        <div className="flex-1 flex flex-col gap-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-primary/80">Novo Garimpo Rápido</label>
          <input
            type="text"
            placeholder='Ex: "Clínicas de Estética em São Paulo"'
            className="input-finch w-full"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && startGarimpo()}
          />
        </div>
        <button
          className="btn-finch shrink-0"
          onClick={startGarimpo}
          disabled={loading}
        >
          {loading ? "Garimpando..." : "⛏ Iniciar"}
        </button>
      </div>

      {/* Campaigns + Recent Leads */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Campanhas Recentes */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-black uppercase tracking-widest">Campanhas Recentes</h3>
            <Link href="/dashboard/campanhas" className="text-[10px] text-primary uppercase font-bold hover:underline">Ver todas</Link>
          </div>
          <div className="flex flex-col gap-3">
            {campaigns.length === 0 ? (
              <div className="glass p-6 rounded-sm border border-dashed border-primary/20 text-center text-text-muted text-[10px] uppercase tracking-widest">
                Nenhuma campanha ativa
              </div>
            ) : (
              campaigns.slice(0, 3).map((c) => (
                <Link href={`/dashboard/campanhas/${c.id}`} key={c.id}
                  className="glass p-4 rounded-sm border border-primary/10 hover:border-primary/30 transition-all block">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-black text-sm">{c.name}</p>
                      <p className="text-[9px] uppercase tracking-widest text-text-muted">
                        Busca ativa &nbsp;·&nbsp;
                        <span className="text-green-400">● ATIVA</span>
                      </p>
                    </div>
                    <span className="text-primary font-black">{c.total_leads} <span className="text-[9px] text-text-muted font-normal">leads</span></span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-1">
                    <div className="bg-primary h-1 rounded-full transition-all" style={{ width: `${Math.min((c.total_leads / 100) * 100, 100)}%` }} />
                  </div>
                </Link>
              ))
            )}

            <Link href="/dashboard/campanhas/nova"
              className="glass p-4 rounded-sm border border-dashed border-primary/20 text-center text-[10px] uppercase tracking-widest text-text-muted hover:border-primary/40 hover:text-primary transition-all">
              + Nova campanha estratégica
            </Link>
          </div>
        </div>

        {/* Leads Recentes */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-black uppercase tracking-widest">Leads Recentes</h3>
            <Link href="/dashboard/leads" className="text-[10px] text-primary uppercase font-bold hover:underline">Ver todos</Link>
          </div>
          <div className="flex flex-col gap-3">
            {recentLeads.length === 0 ? (
              <div className="glass p-6 rounded-sm border border-dashed border-primary/20 text-center text-text-muted text-[10px] uppercase tracking-widest">
                Nenhum lead ainda. Inicie um garimpo.
              </div>
            ) : (
              recentLeads.slice(0, 5).map((lead) => (
                <Link href={`/dashboard/leads/${lead.id}`} key={lead.id}
                  className="glass p-4 rounded-sm border border-primary/10 hover:border-primary/30 transition-all flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <p className="font-black text-sm truncate max-w-[200px]">{lead.name}</p>
                    <p className="text-[9px] text-text-muted uppercase truncate max-w-[200px]">{lead.address}</p>
                    <span className={`mt-1 px-2 py-0.5 text-[8px] font-black uppercase border rounded-sm w-fit ${STATUS_COLORS[lead.status] || STATUS_COLORS.extraido}`}>
                      {lead.status === "qualificado" ? "⚡ FORTE" : lead.status}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-2xl font-black text-primary">{lead.score || "—"}</div>
                    <div className="text-[9px] text-text-muted uppercase">Score</div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
