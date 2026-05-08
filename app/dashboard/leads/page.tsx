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

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [filter, setFilter] = useState("todos");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/leads")
      .then(async r => {
        const d = await r.json();
        if (!r.ok) { setFetchError(d.error || `Erro ${r.status}`); return; }
        setLeads(d.leads || []);
      })
      .catch(e => setFetchError(e.message || "Erro de rede"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = leads.filter(l => {
    const matchStatus = filter === "todos" || l.status === filter;
    const matchSearch = !search || 
      l.name?.toLowerCase().includes(search.toLowerCase()) || 
      l.address?.toLowerCase().includes(search.toLowerCase()) ||
      l.niche?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const handleDelete = async (id: string) => {
    setLeads(prev => prev.filter(l => l.id !== id));
    const res = await fetch(`/api/leads/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const r = await fetch("/api/leads");
      const d = await r.json();
      setLeads(d.leads || []);
    }
  };

  const handleWhatsApp = (lead: any) => {
    const phone = lead.phone?.replace(/\D/g, "");
    const text = encodeURIComponent(lead.whatsapp_copy || "Olá!");
    window.open(`https://wa.me/55${phone}?text=${text}`, "_blank");
  };

  return (
    <div className="p-8 flex flex-col gap-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-5xl font-black tracking-tighter uppercase">Leads</h2>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-text-muted mt-2">{leads.length} prospectos na base central</p>
        </div>
        <Link href="/dashboard/kanban" className="btn-finch py-4 px-8">Visualizar Kanban</Link>
      </div>

      {/* Filters HUD */}
      <div className="glass p-6 rounded-sm border border-white/5 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex-1 min-w-[300px]">
          <input
            type="text"
            placeholder="Filtrar por nome, nicho ou endereço..."
            className="w-full bg-white/5 border border-white/10 rounded-sm py-3 px-4 text-xs font-bold focus:outline-none focus:border-primary/50 transition-all"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["todos", "extraido", "qualificado", "abordado", "convertido"].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest border rounded-sm transition-all ${
                filter === s ? "bg-primary text-background border-primary" : "border-white/10 text-text-muted hover:border-primary/30 hover:text-primary"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {fetchError && (
        <div className="text-xs text-red-400 border border-red-500/20 bg-red-500/5 rounded-sm px-4 py-3">
          ⚠ {fetchError}
        </div>
      )}

      {/* Leads Table HUD */}
      <div className="glass rounded-sm border border-white/5 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 border-b border-white/10">
              {["Prospecto", "Nicho / Endereço", "Status", "Score", "Ações"].map(h => (
                <th key={h} className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-32">
                  <div className="inline-block w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-text-muted mt-4">Sincronizando Leads...</p>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-32 text-text-muted text-[10px] uppercase font-bold tracking-widest">
                  Nenhum registro encontrado na base.
                </td>
              </tr>
            ) : (
              filtered.map((lead, i) => (
                <tr key={lead.id} className={`border-b border-white/5 hover:bg-white/3 transition-colors ${i % 2 === 0 ? "" : "bg-white/1"}`}>
                  <td className="px-6 py-5">
                    <div className="font-black text-sm uppercase tracking-tight text-white">{lead.name}</div>
                    <div className="text-[10px] text-primary font-bold mt-1 tracking-wider">{lead.phone || "Sem Telefone"}</div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-[10px] uppercase font-black text-text-muted">{lead.niche || "Geral"}</div>
                    <div className="text-[9px] text-text-muted/60 mt-1 max-w-[200px] truncate">{lead.address || "Endereço não informado"}</div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-2 py-1 text-[9px] font-black uppercase tracking-widest border rounded-sm ${STATUS_COLORS[lead.status] || STATUS_COLORS.extraido}`}>
                      ● {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-12 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${lead.score || 0}%` }}></div>
                      </div>
                      <span className="font-black text-xs text-primary">{lead.score || 0}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex gap-2">
                      {lead.phone && (
                        <button
                          onClick={() => handleWhatsApp(lead)}
                          className="p-2 bg-green-500/10 border border-green-500/20 text-green-400 rounded-sm hover:bg-green-500 hover:text-background transition-all"
                          title="Abrir WhatsApp"
                        >
                          📱
                        </button>
                      )}
                      {lead.website && (
                        <a href={lead.website} target="_blank" rel="noreferrer"
                          className="p-2 bg-white/5 border border-white/10 text-text-muted rounded-sm hover:text-primary hover:border-primary/30 transition-all"
                          title="Visitar Website"
                        >
                          🌐
                        </a>
                      )}
                      <Link href={`/dashboard/leads/${lead.id}`}
                        className="p-2 bg-white/5 border border-white/10 text-text-muted rounded-sm hover:text-primary transition-all"
                        title="Ver Diagnóstico"
                      >
                        🔍
                      </Link>
                      <button
                        onClick={() => handleDelete(lead.id)}
                        className="p-2 bg-white/5 border border-white/10 text-text-muted/40 rounded-sm hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/20 transition-all"
                        title="Excluir lead"
                      >
                        ✕
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
