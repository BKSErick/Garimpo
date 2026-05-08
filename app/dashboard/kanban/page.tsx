"use client";

import { useState, useEffect, useCallback, useRef } from "react";

type Lead = {
  id: string;
  name: string;
  address: string;
  phone: string;
  website: string;
  score: number;
  status: string;
  created_at?: string;
  whatsapp_copy?: string;
  rating?: number;
  reviews_count?: number;
  niche?: string;
  query_origin?: string;
  diagnosis?: { flaws?: string[]; mechanism?: string; vulnerability_level?: string };
  flaws?: string;
  unique_mechanism?: string;
};

type SortOption = "maior_score" | "menor_score" | "mais_recentes" | "mais_antigos";

const COLUMNS = [
  { key: "extraido",    label: "⛏ Extraídos",    color: "border-blue-500/30 bg-blue-500/5" },
  { key: "qualificado", label: "⚡ Qualificados",  color: "border-yellow-500/30 bg-yellow-500/5" },
  { key: "abordado",    label: "📩 Abordados",    color: "border-orange-500/30 bg-orange-500/5" },
  { key: "convertido",  label: "💰 Convertidos",  color: "border-green-500/30 bg-green-500/5" },
  { key: "perdido",     label: "✗ Perdidos",      color: "border-red-500/30 bg-red-500/5" },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "maior_score",   label: "Maior Score" },
  { value: "menor_score",   label: "Menor Score" },
  { value: "mais_recentes", label: "Mais Recentes" },
  { value: "mais_antigos",  label: "Mais Antigos" },
];

function sortLeads(leads: Lead[], sort: SortOption): Lead[] {
  return [...leads].sort((a, b) => {
    switch (sort) {
      case "maior_score":   return (b.score || 0) - (a.score || 0);
      case "menor_score":   return (a.score || 0) - (b.score || 0);
      case "mais_recentes": return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      case "mais_antigos":  return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
    }
  });
}

function scoreLabel(score: number) {
  if (score >= 90) return { label: "EXCELENTE", cls: "text-green-400 border-green-500/30 bg-green-500/10" };
  if (score >= 70) return { label: "MUITO FORTE", cls: "text-yellow-400 border-yellow-500/30 bg-yellow-500/10" };
  if (score >= 50) return { label: "BOM", cls: "text-blue-400 border-blue-500/30 bg-blue-500/10" };
  return { label: "FRACO", cls: "text-text-muted border-white/10 bg-white/5" };
}

// ─── Lead Detail Modal ────────────────────────────────────────────────────────

function LeadModal({ id, onClose }: { id: string; onClose: () => void }) {
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"initial" | "followup">("initial");
  const [copied, setCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshed, setRefreshed] = useState(false);
  const [refreshError, setRefreshError] = useState("");

  useEffect(() => {
    fetch(`/api/leads/${id}/status`)
      .then(r => r.json())
      .then(d => { setDetail(d.lead ?? null); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const parseCopy = (s: string) => {
    if (!s) return { initial: "", followup: "" };
    const parts = s.split(/\[MENSAGEM 2\]/i);
    return {
      initial:  parts[0]?.replace(/\[MENSAGEM 1\]/i, "").trim() || "",
      followup: parts[1]?.trim() || "",
    };
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const regenerateCopy = async () => {
    setRefreshing(true);
    setRefreshError("");
    try {
      const res = await fetch(`/api/leads/${id}/regenerate-copy`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) { setRefreshError(data.error || "Erro ao gerar copy"); return; }
      setDetail((prev: any) => ({ ...prev, whatsapp_copy: data.whatsapp_copy }));
      setRefreshed(true);
      setTimeout(() => setRefreshed(false), 2000);
    } catch {
      setRefreshError("Erro de rede");
    } finally {
      setRefreshing(false);
    }
  };

  const d = detail;
  const { initial, followup } = parseCopy(d?.whatsapp_copy || "");
  const activeText = tab === "initial" ? initial : followup;
  const sl = d ? scoreLabel(d.score || 0) : null;
  const initials = d?.name?.split(" ").slice(0, 2).map((w: string) => w[0]).join("").toUpperCase() || "?";

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative ml-auto w-full max-w-lg h-full bg-[#0f0f0f] border-l border-white/10 overflow-y-auto shadow-2xl flex flex-col">
        {loading ? (
          <div className="flex-1 flex items-center justify-center text-text-muted text-xs uppercase tracking-widest">
            Carregando...
          </div>
        ) : !d ? (
          <div className="flex-1 flex items-center justify-center text-red-400 text-xs">Lead não encontrado.</div>
        ) : (
          <>
            {/* Header */}
            <div className="sticky top-0 z-10 bg-[#0f0f0f]/95 backdrop-blur border-b border-white/5 px-6 py-5 flex items-start gap-4">
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-black text-sm shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-black text-base leading-tight truncate">{d.name}</h3>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  {d.website && (
                    <span className="px-2 py-0.5 text-[8px] font-black uppercase border rounded-sm border-white/20 text-text-muted">
                      PERFIL PÚBLICO
                    </span>
                  )}
                  {sl && (
                    <span className={`px-2 py-0.5 text-[8px] font-black uppercase border rounded-sm ${sl.cls}`}>
                      {sl.label}
                    </span>
                  )}
                  <span className="text-primary font-black text-lg leading-none">{d.score || 0}</span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="shrink-0 w-8 h-8 flex items-center justify-center rounded-sm hover:bg-white/10 text-text-muted hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-6 p-6">
              {/* BIO */}
              {d.address && (
                <section>
                  <p className="text-[9px] font-black uppercase tracking-widest text-text-muted mb-2">Bio</p>
                  <p className="text-xs text-white/70 leading-relaxed">{d.address}</p>
                </section>
              )}

              {/* Contexto Estratégico */}
              {d.diagnosis?.mechanism && (
                <section>
                  <p className="text-[9px] font-black uppercase tracking-widest text-text-muted mb-2">Contexto Estratégico</p>
                  <div className="bg-white/[0.03] border border-white/8 rounded-sm p-4">
                    <p className="text-xs text-white/80 leading-relaxed">{d.diagnosis.mechanism}</p>
                  </div>
                </section>
              )}

              {/* Contato */}
              <section>
                <p className="text-[9px] font-black uppercase tracking-widest text-text-muted mb-3">Contato</p>
                <div className="flex flex-col gap-2">
                  {d.address && <p className="text-[10px] text-white/60 flex items-center gap-2">📍 {d.address.split(",").pop()?.trim()}</p>}
                  {d.phone    && <p className="text-[10px] text-white/60 flex items-center gap-2">📱 {d.phone}</p>}
                  {d.website  && (
                    <a href={d.website} target="_blank" rel="noreferrer" className="text-[10px] text-primary flex items-center gap-2 hover:underline truncate">
                      🔗 {d.website}
                    </a>
                  )}
                </div>
              </section>

              {/* Qualificação — barras de score */}
              {d.score > 0 && (
                <section>
                  <p className="text-[9px] font-black uppercase tracking-widest text-text-muted mb-3">Qualificação</p>
                  <div className="flex flex-col gap-3">
                    {[
                      { label: "Score Geral",  value: d.score || 0 },
                      { label: "Potencial",    value: Math.round((d.score || 0) * 0.92) },
                      { label: "Acessibilidade", value: d.phone ? Math.round((d.score || 0) * 0.88) : 20 },
                    ].map(item => (
                      <div key={item.label}>
                        <div className="flex justify-between mb-1">
                          <span className="text-[9px] uppercase tracking-widest text-text-muted font-bold">{item.label}</span>
                          <span className="text-[9px] font-black text-primary">{item.value}</span>
                        </div>
                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${item.value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Sinais Estratégicos */}
              <section>
                <p className="text-[9px] font-black uppercase tracking-widest text-text-muted mb-3">Sinais Estratégicos</p>
                <div className="flex flex-col gap-3">
                  {d.query_origin && (
                    <div className="bg-white/[0.03] border border-white/8 rounded-sm p-3">
                      <p className="text-[8px] uppercase tracking-widest text-text-muted mb-1">Query de Origem</p>
                      <p className="text-[10px] text-white/70">{d.query_origin}</p>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {d.website && <span className="px-2 py-1 text-[8px] font-black uppercase border border-white/10 rounded-sm text-white/50">TEM SITE PRÓPRIO</span>}
                    {d.phone   && <span className="px-2 py-1 text-[8px] font-black uppercase border border-white/10 rounded-sm text-white/50">TEM TELEFONE VISÍVEL</span>}
                    {d.reviews_count > 0 && <span className="px-2 py-1 text-[8px] font-black uppercase border border-white/10 rounded-sm text-white/50">{d.reviews_count} AVALIAÇÕES</span>}
                    {d.niche   && <span className="px-2 py-1 text-[8px] font-black uppercase border border-yellow-500/20 rounded-sm text-yellow-400">NICHO: {d.niche}</span>}
                    {d.diagnosis?.vulnerability_level && (
                      <span className="px-2 py-1 text-[8px] font-black uppercase border border-orange-500/20 rounded-sm text-orange-400">
                        ⚡ {d.diagnosis.vulnerability_level}
                      </span>
                    )}
                  </div>
                </div>
              </section>

              {/* Mensagens de Prospecção */}
              {d.whatsapp_copy && (
                <section>
                  <p className="text-[9px] font-black uppercase tracking-widest text-text-muted mb-3">Mensagens de Prospecção</p>
                  <div className="flex flex-col gap-3">
                    {/* Tab selector */}
                    <div className="flex gap-1">
                      <button
                        onClick={() => setTab("initial")}
                        className={`px-3 py-1.5 text-[8px] font-black uppercase rounded-sm transition-all border ${tab === "initial" ? "bg-primary text-background border-primary" : "bg-white/5 text-text-muted border-white/10 hover:border-primary/30"}`}
                      >
                        1ª Mensagem — Abertura
                      </button>
                      {followup && (
                        <button
                          onClick={() => setTab("followup")}
                          className={`px-3 py-1.5 text-[8px] font-black uppercase rounded-sm transition-all border ${tab === "followup" ? "bg-primary text-background border-primary" : "bg-white/5 text-text-muted border-white/10 hover:border-primary/30"}`}
                        >
                          Follow-up
                        </button>
                      )}
                    </div>

                    {tab === "followup" && followup && (
                      <p className="text-[8px] uppercase tracking-widest text-text-muted font-bold">
                        FOLLOW-UP — SE NÃO RESPONDER EM ~3 DIAS
                      </p>
                    )}

                    <div className="bg-white/[0.03] border border-white/8 rounded-sm p-4">
                      <p className="text-xs text-white/80 leading-relaxed whitespace-pre-wrap">{activeText}</p>
                    </div>

                    {refreshError && (
                      <p className="text-red-400 text-[9px] uppercase tracking-widest">{refreshError}</p>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => copy(activeText)}
                        className="px-4 py-2 bg-primary/10 border border-primary/30 text-primary text-[9px] font-black uppercase hover:bg-primary hover:text-background transition-all flex items-center gap-1.5"
                      >
                        {copied ? "✓ Copiado!" : "⧉ Copiar"}
                      </button>
                      <button
                        onClick={regenerateCopy}
                        disabled={refreshing}
                        className="px-4 py-2 bg-white/5 border border-white/10 text-text-muted text-[9px] font-black uppercase hover:border-primary/30 hover:text-primary transition-all flex items-center gap-1.5 disabled:opacity-40"
                        title="Gerar nova variação de copy"
                      >
                        {refreshing ? "⟳ Gerando..." : refreshed ? "✓ Atualizado!" : "↺ Nova Copy"}
                      </button>
                      {d.phone && (
                        <a
                          href={`https://wa.me/55${d.phone.replace(/\D/g, "")}?text=${encodeURIComponent(activeText)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-4 py-2 bg-green-500/10 border border-green-500/30 text-green-400 text-[9px] font-black uppercase hover:bg-green-500 hover:text-background transition-all flex items-center gap-1.5"
                        >
                          📱 Abrir WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                </section>
              )}

              {/* Análise da IA */}
              {d.diagnosis?.mechanism && (
                <section>
                  <p className="text-[9px] font-black uppercase tracking-widest text-text-muted mb-2">Análise da IA</p>
                  <p className="text-xs text-white/60 italic leading-relaxed">"{d.diagnosis.mechanism}"</p>
                </section>
              )}

              {/* Link externo */}
              {d.website && (
                <a
                  href={d.website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[9px] text-primary uppercase tracking-widest font-bold hover:underline flex items-center gap-1"
                >
                  ↗ Abrir perfil completo no navegador
                </a>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Status Dropdown ──────────────────────────────────────────────────────────

function StatusDropdown({ lead, onMove }: { lead: Lead; onMove: (id: string, status: string) => void }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 4, left: rect.left });
    }
    setOpen(!open);
  };

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={handleOpen}
        className="px-2 py-0.5 text-[8px] font-black uppercase tracking-wider border rounded-sm flex items-center gap-1 bg-white/5 border-white/20 hover:border-primary/40 transition-colors"
      >
        {lead.status} ▾
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="fixed z-50 min-w-[130px] glass border border-white/10 rounded-sm shadow-xl overflow-hidden"
            style={{ top: pos.top, left: pos.left }}
          >
            {COLUMNS.map(col => (
              <button
                key={col.key}
                onClick={(e) => { e.stopPropagation(); onMove(lead.id, col.key); setOpen(false); }}
                className={`w-full text-left px-3 py-2 text-[9px] font-bold uppercase hover:bg-primary/10 hover:text-primary transition-colors ${col.key === lead.status ? "text-primary bg-primary/5" : "text-text-muted"}`}
              >
                {col.key === lead.status ? "✓ " : ""}{col.key}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Lead Card ────────────────────────────────────────────────────────────────

function LeadCard({ lead, onQualify, onMove, onOpen, onDelete }: {
  lead: Lead;
  onQualify: (id: string) => void;
  onMove: (id: string, status: string) => void;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!lead.phone) return;
    const phone = lead.phone.replace(/\D/g, "");
    const text = encodeURIComponent(lead.whatsapp_copy || "Olá! Identifiquei algo interessante no seu negócio...");
    window.open(`https://wa.me/55${phone}?text=${text}`, "_blank");
  };

  return (
    <div
      onClick={() => onOpen(lead.id)}
      className="glass border border-primary/10 rounded-sm p-4 flex flex-col gap-3 hover:border-primary/30 transition-all cursor-pointer"
    >
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

      {/* Status dropdown */}
      <StatusDropdown lead={lead} onMove={onMove} />

      {/* Diagnosis pill */}
      {lead.diagnosis?.vulnerability_level && (
        <span className="px-2 py-0.5 text-[8px] font-black uppercase border rounded-sm w-fit bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
          ⚡ {lead.diagnosis.vulnerability_level}
        </span>
      )}

      {/* Flaws */}
      {lead.diagnosis?.flaws && lead.diagnosis.flaws.length > 0 && (
        <div>
          <button
            className="text-[9px] uppercase tracking-widest text-text-muted hover:text-primary transition-colors"
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
          >
            {expanded ? "▲" : "▼"} {lead.diagnosis.flaws.length} falhas detectadas
          </button>
          {expanded && (
            <ul className="mt-2 flex flex-col gap-1">
              {lead.diagnosis.flaws.map((f, i) => (
                <li key={i} className="text-[9px] text-red-400 flex gap-1"><span>✗</span> {f}</li>
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
      <div className="flex gap-2 flex-wrap mt-1" onClick={e => e.stopPropagation()}>
        {lead.status === "extraido" && (
          <button
            onClick={(e) => { e.stopPropagation(); onQualify(lead.id); }}
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
      </div>

      {/* Contact info + delete */}
      <div className="flex items-center justify-between pt-1 border-t border-white/5" onClick={e => e.stopPropagation()}>
        <div className="flex gap-3">
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
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(lead.id); }}
          className="w-5 h-5 flex items-center justify-center text-[9px] text-text-muted/40 hover:bg-red-500/20 hover:text-red-400 transition-colors rounded-sm"
          title="Excluir lead"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

// ─── Kanban Page ──────────────────────────────────────────────────────────────

export default function KanbanPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [qualifyingId, setQualifyingId] = useState<string | null>(null);
  const [sort, setSort] = useState<SortOption>("maior_score");
  const [sortOpen, setSortOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const fetchLeads = useCallback(async () => {
    try {
      const res = await fetch("/api/leads");
      const data = await res.json();
      if (!res.ok) { setFetchError(data.error || `Erro ${res.status}`); return; }
      setFetchError(null);
      setLeads(data.leads || []);
    } catch (e: any) {
      setFetchError(e.message || "Erro de rede");
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

  const handleDelete = async (id: string) => {
    setLeads(prev => prev.filter(l => l.id !== id));
    const res = await fetch(`/api/leads/${id}`, { method: "DELETE" });
    if (!res.ok) fetchLeads(); // rollback on failure
  };

  const handleMove = async (id: string, newStatus: string) => {
    const prev = leads;
    setLeads(p => p.map(l => l.id === id ? { ...l, status: newStatus } : l));
    const res = await fetch(`/api/leads/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: newStatus }),
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) setLeads(prev);
  };

  const q = search.toLowerCase();
  const filtered = q
    ? leads.filter(l => l.name?.toLowerCase().includes(q) || l.address?.toLowerCase().includes(q))
    : leads;

  const byStatus = (status: string) => sortLeads(filtered.filter(l => l.status === status), sort);
  const currentSortLabel = SORT_OPTIONS.find(o => o.value === sort)?.label || "Ordenar";

  return (
    <div className="p-8 flex flex-col gap-6 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-6 flex-wrap">
        <div>
          <h2 className="text-4xl font-black tracking-tighter">Kanban</h2>
          <p className="text-xs font-bold uppercase tracking-widest text-text-muted mt-1">Pipeline de Conversão</p>
        </div>

        <div className="flex items-center gap-6 flex-wrap">
          {/* Counter bar */}
          <div className="flex gap-4 items-center">
            <div className="text-center">
              <div className="text-xl font-black">{leads.length}</div>
              <div className="text-[8px] uppercase tracking-widest text-text-muted">Total</div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            {COLUMNS.map(col => (
              <div key={col.key} className="text-center">
                <div className="text-xl font-black">{leads.filter(l => l.status === col.key).length}</div>
                <div className="text-[8px] uppercase tracking-widest text-text-muted">{col.key}</div>
              </div>
            ))}
          </div>

          {/* Sort dropdown */}
          <div className="relative">
            <button
              onClick={() => setSortOpen(!sortOpen)}
              className="px-4 py-2 glass border border-white/20 text-[10px] font-black uppercase hover:border-primary/40 transition-all flex items-center gap-2"
            >
              {currentSortLabel} ▾
            </button>
            {sortOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)} />
                <div className="absolute right-0 top-full mt-1 z-20 min-w-[160px] glass border border-white/10 rounded-sm shadow-xl overflow-hidden">
                  {SORT_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => { setSort(opt.value); setSortOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-[9px] font-bold uppercase hover:bg-primary/10 hover:text-primary transition-colors ${opt.value === sort ? "text-primary bg-primary/5" : "text-text-muted"}`}
                    >
                      {opt.value === sort ? "✓ " : ""}{opt.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <button
            onClick={fetchLeads}
            className="px-4 py-2 glass border border-primary/20 text-primary text-[10px] font-black uppercase hover:bg-primary/10 transition-all"
          >
            ↻ Atualizar
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div className="relative max-w-sm">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-xs pointer-events-none">🔍</span>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar empresa, CNPJ ou local..."
          className="w-full pl-8 pr-4 py-2 glass border border-white/10 text-[10px] font-bold text-white placeholder:text-text-muted focus:border-primary/40 focus:outline-none transition-colors rounded-sm"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white text-xs"
          >
            ✕
          </button>
        )}
      </div>

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
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 flex-1">
          {COLUMNS.map((col) => {
            const colLeads = byStatus(col.key);
            return (
              <div key={col.key} className={`flex flex-col gap-3 rounded-sm border p-4 ${col.color}`}>
                <div className="flex justify-between items-center">
                  <h3 className="text-[10px] font-black uppercase tracking-widest">{col.label}</h3>
                  <span className="text-[10px] font-black text-text-muted bg-white/5 px-2 py-0.5 rounded-full">
                    {colLeads.length}
                  </span>
                </div>
                <div className="flex flex-col gap-3 overflow-y-auto max-h-[calc(100vh-320px)]">
                  {colLeads.length === 0 ? (
                    <div className="text-center text-[9px] uppercase tracking-widest text-text-muted/50 py-8 border border-dashed border-white/5 rounded-sm">
                      {search ? "Sem resultados" : "Vazio"}
                    </div>
                  ) : (
                    colLeads.map((lead) => (
                      <div key={lead.id} className={qualifyingId === lead.id ? "opacity-50 pointer-events-none" : ""}>
                        <LeadCard
                          lead={lead}
                          onQualify={handleQualify}
                          onMove={handleMove}
                          onOpen={setSelectedId}
                          onDelete={handleDelete}
                        />
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lead Detail Modal */}
      {selectedId && (
        <LeadModal id={selectedId} onClose={() => setSelectedId(null)} />
      )}
    </div>
  );
}
