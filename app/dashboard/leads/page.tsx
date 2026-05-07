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

  useEffect(() => {
    fetch("/api/leads")
      .then(r => r.json())
      .then(d => setLeads(d.leads || []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = leads.filter(l => {
    const matchStatus = filter === "todos" || l.status === filter;
    const matchSearch = !search || l.name?.toLowerCase().includes(search.toLowerCase()) || l.address?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const handleWhatsApp = (lead: any) => {
    const phone = lead.phone?.replace(/\D/g, "");
    const text = encodeURIComponent(lead.whatsapp_copy || "Olá!");
    window.open(`https://wa.me/55${phone}?text=${text}`, "_blank");
  };

  return (
    <div className="p-8 flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black tracking-tighter">Leads</h2>
          <p className="text-xs font-bold uppercase tracking-widest text-text-muted mt-1">{leads.length} leads na base</p>
        </div>
        <Link href="/dashboard/kanban" className="btn-finch text-sm">Ver Kanban</Link>
      </div>

      {/* Filters */}
      <div className="glass p-4 rounded-sm border border-primary/10 flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="Buscar por nome ou endereço..."
          className="input-finch flex-1 min-w-[200px]"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="flex gap-2 flex-wrap">
          {["todos", "extraido", "qualificado", "abordado", "convertido"].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest border rounded-sm transition-all ${
                filter === s ? "bg-primary text-background border-primary" : "border-primary/20 text-text-muted hover:border-primary/40 hover:text-primary"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass rounded-sm border border-primary/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-primary/10">
            <tr>
              {["Nome", "Endereço", "Contato", "Status", "Score", "Ações"].map(h => (
                <th key={h} className="text-left px-4 py-3 text-[9px] font-black uppercase tracking-widest text-text-muted">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-12 text-text-muted text-[10px] uppercase tracking-widest">Carregando...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-text-muted text-[10px] uppercase tracking-widest">Nenhum lead encontrado</td></tr>
            ) : (
              filtered.map((lead, i) => (
                <tr key={lead.id} className={`border-b border-primary/5 hover:bg-white/3 transition-colors ${i % 2 === 0 ? "" : "bg-white/1"}`}>
                  <td className="px-4 py-3 font-bold max-w-[200px] truncate">{lead.name}</td>
                  <td className="px-4 py-3 text-text-muted text-[10px] max-w-[180px] truncate">{lead.address || "—"}</td>
                  <td className="px-4 py-3 text-[10px]">
                    {lead.phone ? (
                      <a href={`tel:${lead.phone}`} className="text-primary hover:underline">{lead.phone}</a>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 text-[8px] font-black uppercase border rounded-sm ${STATUS_COLORS[lead.status] || STATUS_COLORS.extraido}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-black text-primary">{lead.score || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {lead.phone && lead.whatsapp_copy && (
                        <button
                          onClick={() => handleWhatsApp(lead)}
                          className="px-2 py-1 bg-green-500/10 border border-green-500/20 text-green-400 text-[8px] font-black uppercase hover:bg-green-500 hover:text-background transition-all"
                        >
                          📱 WA
                        </button>
                      )}
                      {lead.website && (
                        <a href={lead.website} target="_blank" rel="noreferrer"
                          className="px-2 py-1 bg-white/5 border border-white/10 text-text-muted text-[8px] font-black uppercase hover:text-primary transition-all">
                          🌐
                        </a>
                      )}
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
