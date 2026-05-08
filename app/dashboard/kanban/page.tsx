"use client";

import { useState, useEffect, useCallback } from "react";

type Lead = {
  id: string;
  name: string;
  address: string;
  phone: string;
  website: string;
  score: number;
  status: string;
  whatsapp_copy?: string;
  diagnosis?: { flaws?: string[]; mechanism?: string; vulnerability_level?: string };
};

const COLUMNS = [
  { key: "extraido", label: "⛏ Extraídos", color: "border-blue-500/30 bg-blue-500/5" },
  { key: "qualificado", label: "⚡ Qualificados", color: "border-yellow-500/30 bg-yellow-500/5" },
  { key: "abordado", label: "📩 Abordados", color: "border-orange-500/30 bg-orange-500/5" },
  { key: "convertido", label: "💰 Convertidos", color: "border-green-500/30 bg-green-500/5" },
];

function LeadCard({ lead, onQualify, onMove }: {
  lead: Lead;
  onQualify: (id: string) => void;
  onMove: (id: string, status: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const handleWhatsApp = () => {
    if (!lead.phone) return;
    const phone = lead.phone.replace(/\D/g, "");
    const text = encodeURIComponent(lead.whatsapp_copy || "Olá! Identifiquei algo interessante no seu negócio...");
    window.open(`https://wa.me/55${phone}?text=${text}`, "_blank");
  };

  return (
    <div className="glass border border-primary/10 rounded-sm p-4 flex flex-col gap-3 hover:border-primary/30 transition-all cursor-default">
      {/* Header */}
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-black text-xs leading-tight truncate">{lead.name}</h4>
          {lead.address && <p className="text-[9px] text-text-muted mt-0.5 truncate">{lead.address}</p>}
        </div>
        {lead.score > 0 && (
          <div className="shrink-0 text-center">
            <div className="text-primary font-black text-lg leading-none">{lead.score}</div>
            <div className="text-[8px] text-text-muted uppercase">score</div>
          </div>
        )}
      </div>

      {/* Diagnosis pills */}
      {lead.diagnosis?.vulnerability_level && (
        <span className="px-2 py-0.5 text-[8px] font-black uppercase border rounded-sm w-fit bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
          ⚡ {lead.diagnosis.vulnerability_level}
        </span>
      )}

      {/* Flaws (expandable) */}
      {lead.diagnosis?.flaws && lead.diagnosis.flaws.length > 0 && (
        <div>
          <button
            className="text-[9px] uppercase tracking-widest text-text-muted hover:text-primary transition-colors"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "▲" : "▼"} {lead.diagnosis.flaws.length} falhas detectadas
          </button>
          {expanded && (
            <ul className="mt-2 flex flex-col gap-1">
              {lead.diagnosis.flaws.map((f, i) => (
                <li key={i} className="text-[9px] text-red-400 flex gap-1">
                  <span>✗</span> {f}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Copy preview */}
      {lead.whatsapp_copy && (
        <p className="text-[9px] text-text-muted italic line-clamp-2 border-l-2 border-primary/20 pl-2">
          {lead.whatsapp_copy.substring(0, 120)}...
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-2 flex-wrap mt-1">
        {lead.status === "extraido" && (
          <button
            onClick={() => onQualify(lead.id)}
            className="px-3 py-1.5 bg-primary/10 border border-primary/30 text-primary text-[9px] font-black uppercase hover:bg-primary hover:text-background transition-all"
          >
            ⚡ Qualificar IA
          </button>
        )}
        {lead.status === "qualificado" && (
          <button
            onClick={handleWhatsApp}
            className="px-3 py-1.5 bg-green-500/10 border border-green-500/30 text-green-400 text-[9px] font-black uppercase hover:bg-green-500 hover:text-background transition-all flex items-center gap-1"
          >
            📱 WhatsApp
          </button>
        )}
        {lead.status === "abordado" && (
          <button
            onClick={() => onMove(lead.id, "convertido")}
            className="px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-[9px] font-black uppercase hover:bg-yellow-500 hover:text-background transition-all"
          >
            💰 Marcar Fechado
          </button>
        )}

        {/* Move to next */}
        {lead.status !== "convertido" && lead.status !== "descartado" && (
          <button
            onClick={() => {
              const next: Record<string, string> = {
                extraido: "qualificado",
                qualificado: "abordado",
                abordado: "convertido",
              };
              onMove(lead.id, next[lead.status]);
            }}
            className="px-3 py-1.5 bg-white/5 border border-white/10 text-text-muted text-[9px] font-bold uppercase hover:border-primary/30 hover:text-primary transition-all"
          >
            → Avançar
          </button>
        )}
      </div>

      {/* Contact info */}
      <div className="flex gap-3 pt-1 border-t border-white/5">
        {lead.phone && (
          <a href={`tel:${lead.phone}`} className="text-[9px] text-text-muted hover:text-primary transition-colors">
            📞 {lead.phone}
          </a>
        )}
        {lead.website && (
          <a href={lead.website} target="_blank" rel="noreferrer" className="text-[9px] text-text-muted hover:text-primary transition-colors truncate">
            🌐 Site
          </a>
        )}
      </div>
    </div>
  );
}

export default function KanbanPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [qualifyingId, setQualifyingId] = useState<string | null>(null);

  const fetchLeads = useCallback(async () => {
    try {
      const res = await fetch("/api/leads");
      const data = await res.json();
      if (!res.ok) {
        setFetchError(data.error || `Erro ${res.status} ao buscar leads`);
        return;
      }
      setFetchError(null);
      setLeads(data.leads || []);
    } catch (e: any) {
      setFetchError(e.message || "Erro de rede ao buscar leads");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const handleQualify = async (id: string) => {
    setQualifyingId(id);
    try {
      await fetch(`/api/leads/${id}/qualify`, { method: "POST" });
      await fetchLeads();
    } finally {
      setQualifyingId(null);
    }
  };

  const handleMove = async (id: string, newStatus: string) => {
    const prevLeads = leads;
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));
    const res = await fetch(`/api/leads/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: newStatus }),
      headers: { "Content-Type": "application/json" }
    });
    if (!res.ok) setLeads(prevLeads); // rollback on failure
  };

  const byStatus = (status: string) => leads.filter(l => l.status === status);

  return (
    <div className="p-8 flex flex-col gap-6 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black tracking-tighter">Kanban</h2>
          <p className="text-xs font-bold uppercase tracking-widest text-text-muted mt-1">
            Pipeline de Conversão — {leads.length} leads ativos
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchLeads}
            className="px-4 py-2 glass border border-primary/20 text-primary text-[10px] font-black uppercase hover:bg-primary/10 transition-all"
          >
            ↻ Atualizar
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      {fetchError && (
        <div className="text-xs text-red-400 border border-red-500/20 bg-red-500/5 rounded-sm px-4 py-3">
          ⚠ {fetchError}
        </div>
      )}
      {loading ? (
        <div className="flex-1 flex items-center justify-center text-text-muted text-xs uppercase tracking-widest">
          Carregando pipeline...
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
          {COLUMNS.map((col) => {
            const colLeads = byStatus(col.key);
            return (
              <div key={col.key} className={`flex flex-col gap-3 rounded-sm border p-4 ${col.color}`}>
                {/* Column Header */}
                <div className="flex justify-between items-center">
                  <h3 className="text-[10px] font-black uppercase tracking-widest">{col.label}</h3>
                  <span className="text-[10px] font-black text-text-muted bg-white/5 px-2 py-0.5 rounded-full">
                    {colLeads.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="flex flex-col gap-3 overflow-y-auto max-h-[calc(100vh-280px)]">
                  {colLeads.length === 0 ? (
                    <div className="text-center text-[9px] uppercase tracking-widest text-text-muted/50 py-8 border border-dashed border-white/5 rounded-sm">
                      Vazio
                    </div>
                  ) : (
                    colLeads.map((lead) => (
                      <div key={lead.id} className={qualifyingId === lead.id ? "opacity-50 pointer-events-none" : ""}>
                        <LeadCard lead={lead} onQualify={handleQualify} onMove={handleMove} />
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
