"use client";

// edge runtime: no static generation — useSearchParams without Suspense is safe here
export const runtime = 'edge';

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { 
  ClipboardCopy,
  Check,
  RefreshCw,
  Zap,
  X,
  Phone,
  Globe,
  MapPin,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Trash2,
  Trello,
  Search,
  Activity,
  Target,
  MessageSquare,
  Loader2,
  Filter,
  ArrowUpRight,
  ShieldAlert,
  Dna,
  Cpu,
  Layers,
  Sparkles,
  Database,
  ChevronDown
} from "lucide-react";
import { CardMiner, CardMinerHeader, CardMinerTitle } from "@/components/ui/CardMiner";
import { BadgeMiner } from "@/components/ui/BadgeMiner";
import { ButtonMiner } from "@/components/ui/ButtonMiner";

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
  { key: "extraido",    label: "Minério Bruto",    icon: Database,   color: "border-white/10",  glow: "" },
  { key: "qualificado", label: "Refino (IA)",      icon: Sparkles,   color: "border-primary/40",   glow: "shadow-purple-sm" },
  { key: "abordado",    label: "Operação Ativa",  icon: MessageSquare, color: "border-orange-500/30",   glow: "" },
  { key: "convertido",  label: "Ouro Extraído",   icon: Check,    color: "border-success/40",   glow: "shadow-success-sm" },
  { key: "perdido",     label: "Descarte",         icon: ShieldAlert, color: "border-error/20", glow: "" },
];

const COLUMN_ORDER = ["extraido", "qualificado", "abordado", "convertido", "perdido"];
const NEXT_LABELS: Record<string, string> = {
  qualificado: "REFINAR",
  abordado: "ABORDAR",
  convertido: "CONVERTER",
  perdido: "DESCARTAR",
};

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "maior_score",   label: "Riqueza (Score)" },
  { value: "menor_score",   label: "Menor Potencial" },
  { value: "mais_recentes", label: "Última Extração" },
  { value: "mais_antigos",  label: "Histórico Antigo" },
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

// ─── Lead Detail Modal ────────────────────────────────────────────────────────

function LeadModal({ id, onClose }: { id: string; onClose: () => void }) {
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"initial" | "followup">("initial");
  const [copied, setCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetch(`/api/leads/${id}/status`)
      .then(r => r.json())
      .then(d => { setDetail(d.lead ?? null); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const regenerateCopy = async () => {
    setRefreshing(true);
    try {
      const res = await fetch(`/api/leads/${id}/regenerate-copy`, { method: "POST" });
      const data = await res.json();
      if (res.ok) setDetail((prev: any) => ({ ...prev, whatsapp_copy: data.whatsapp_copy }));
    } finally {
      setRefreshing(false);
    }
  };

  const d = detail;
  const parseCopy = (s: string) => {
    if (!s) return { initial: "", followup: "" };
    const parts = s.split(/\[MENSAGEM 2\]/i);
    return {
      initial:  parts[0]?.replace(/\[MENSAGEM 1\]/i, "").trim() || "",
      followup: parts[1]?.trim() || "",
    };
  };

  const { initial, followup } = parseCopy(d?.whatsapp_copy || "");
  const activeText = tab === "initial" ? initial : followup;
  const initials = d?.name?.split(" ").slice(0, 2).map((w: string) => w[0]).join("").toUpperCase() || "?";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-10">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-xl animate-in fade-in duration-500" onClick={onClose} />
      <CardMiner elevated className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col p-0 border-white/5 animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        
        {loading ? (
          <div className="p-32 flex flex-col items-center justify-center">
            <div className="relative mb-10">
               <div className="absolute inset-0 bg-primary blur-3xl opacity-20 animate-pulse" />
               <Cpu className="animate-spin text-primary relative" size={64} />
            </div>
            <p className="text-[11px] uppercase font-black tracking-[0.4em] text-white animate-pulse">Acessando Dossiê Restrito...</p>
            <p className="text-[9px] text-text-muted uppercase font-bold tracking-widest mt-4 opacity-40 italic">Decriptando logs do Protocolo Nudge™</p>
          </div>
        ) : !d ? (
          <div className="p-32 text-center">
             <ShieldAlert size={64} className="text-error mx-auto mb-6 opacity-20" />
             <p className="text-sm font-black text-error uppercase tracking-[0.3em]">Protocolo de Lead Inexistente.</p>
          </div>
        ) : (
          <>
            <div className="p-10 lg:p-14 border-b border-white/5 bg-white/[0.01] flex items-center gap-10">
              <div className="w-24 h-24 rounded-sm bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-black text-4xl shadow-purple shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-4 mb-4">
                  <BadgeMiner variant="primary" className="text-[10px] font-black tracking-widest px-4 py-1">RANK #{d.score || 0}</BadgeMiner>
                  <div className="h-4 w-px bg-white/10" />
                  <span className="text-[10px] text-text-muted font-black uppercase tracking-[0.3em] opacity-40 italic">{d.status}</span>
                </div>
                <h3 className="font-black text-5xl lg:text-6xl uppercase tracking-tighter text-white leading-[0.9] truncate">{d.name}</h3>
              </div>
              <button onClick={onClose} className="w-16 h-16 flex items-center justify-center rounded-sm bg-white/5 hover:bg-white/10 text-text-muted hover:text-white transition-all border border-white/5">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 lg:p-14 custom-scrollbar space-y-16 bg-black/40">
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-16">
                <div className="space-y-12">
                  <section>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-6 flex items-center gap-3">
                      <Target size={14} /> GEO-COORDENADAS
                    </p>
                    <div className="p-8 bg-white/[0.02] border border-white/5 rounded-sm flex gap-6 items-start group hover:border-primary/20 transition-all">
                      <MapPin size={24} className="text-primary mt-1 opacity-40 group-hover:opacity-100 transition-opacity" />
                      <div>
                         <p className="text-xl text-white font-black uppercase tracking-tight leading-tight">{d.address || 'Localização não rastreada'}</p>
                         <p className="text-[10px] text-text-muted font-bold tracking-[0.2em] mt-3 uppercase opacity-40">Verificado via Satélite Google Maps</p>
                      </div>
                    </div>
                  </section>

                  {d.whatsapp_copy && (
                    <section className="p-10 bg-primary/[0.03] border border-primary/10 rounded-sm relative group overflow-hidden">
                      <div className="absolute top-0 right-0 p-6 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
                        <MessageSquare size={200} />
                      </div>
                      
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10 relative">
                        <div>
                           <h4 className="text-[11px] font-black uppercase tracking-[0.5em] text-primary">Script de Ataque (IA)</h4>
                           <p className="text-[9px] text-text-muted uppercase font-bold tracking-widest mt-1 opacity-40">Geração via Protocolo Nudge™</p>
                        </div>
                        <div className="flex gap-2 p-1 bg-black/40 rounded-sm border border-white/5">
                          {["initial", "followup"].map((t: any) => (
                            <button key={t} onClick={() => setTab(t)} className={`px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-sm transition-all ${tab === t ? "bg-primary text-white shadow-purple-sm" : "text-text-muted hover:text-white"}`}>
                              {t === "initial" ? "Abordagem" : "Follow-up"}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="relative pl-8 mb-12">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/40 rounded-full" />
                        <p className="text-lg text-white/90 leading-relaxed whitespace-pre-wrap font-medium selection:bg-primary/30">{activeText}</p>
                      </div>

                      <div className="flex flex-wrap gap-4 relative">
                        <ButtonMiner onClick={() => copy(activeText)} icon={copied ? Check : ClipboardCopy} className={`h-14 px-10 min-w-[200px] transition-all ${copied ? 'bg-success border-success text-white' : ''}`}>
                          {copied ? "COPIADO" : "COPIAR SCRIPT"}
                        </ButtonMiner>
                        <ButtonMiner variant="outline" onClick={regenerateCopy} disabled={refreshing} icon={RefreshCw} className={`h-14 px-10 border-white/10 ${refreshing ? "animate-pulse" : ""}`}>
                          {refreshing ? "CALIBRANDO..." : "NOVA VARIAÇÃO"}
                        </ButtonMiner>
                        {d.phone && (
                          <ButtonMiner variant="primary" className="bg-success hover:bg-success/90 h-14 px-10 shadow-success border-none ml-auto" onClick={() => {
                            const phone = d.phone.replace(/\D/g, "");
                            window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(activeText)}`, "_blank");
                          }} icon={MessageSquare}>
                            ENVIAR WHATSAPP
                          </ButtonMiner>
                        )}
                      </div>
                    </section>
                  )}
                </div>

                <div className="space-y-12">
                  <section>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-8">INDICADORES DE VALOR</p>
                    <div className="space-y-8">
                      {[
                        { label: "Vulnerabilidade", value: d.score || 0, icon: ShieldAlert },
                        { label: "Qualidade do Lead", value: Math.min(100, Math.round((d.score || 0) * 1.2)), icon: Sparkles },
                      ].map(item => (
                        <div key={item.label} className="group/item">
                          <div className="flex justify-between mb-3">
                            <span className="text-[10px] uppercase tracking-[0.25em] text-text-muted font-black flex items-center gap-2 group-hover/item:text-white transition-colors">
                               <item.icon size={12} className="text-primary opacity-40 group-hover/item:opacity-100" />
                               {item.label}
                            </span>
                            <span className="text-sm font-black text-white tracking-tighter">{item.value}%</span>
                          </div>
                          <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                            <div className="h-full bg-primary shadow-purple transition-all duration-1000" style={{ width: `${item.value}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="space-y-6">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">DADOS TÁTICOS</p>
                    <div className="flex flex-col gap-4">
                       <div className="p-5 bg-white/[0.02] border border-white/5 rounded-sm flex items-center justify-between group hover:border-white/20 transition-all">
                          <div className="flex items-center gap-4">
                             <Globe size={18} className="text-text-muted opacity-40 group-hover:text-primary transition-colors" />
                             <span className="text-[10px] font-black text-white uppercase tracking-widest">{d.website ? d.website.replace(/https?:\/\//, '').split('/')[0] : "SEM SITE"}</span>
                          </div>
                          {d.website && (
                             <button onClick={() => window.open(d.website, "_blank")} className="text-text-muted hover:text-white transition-colors">
                                <ExternalLink size={14} />
                             </button>
                          )}
                       </div>
                       <div className="p-5 bg-white/[0.02] border border-white/5 rounded-sm flex items-center justify-between group hover:border-white/20 transition-all">
                          <div className="flex items-center gap-4">
                             <Phone size={18} className="text-text-muted opacity-40 group-hover:text-primary transition-colors" />
                             <span className="text-[10px] font-black text-white uppercase tracking-widest">{d.phone || "PRIVADO"}</span>
                          </div>
                          {d.phone && (
                             <button onClick={() => window.open(`tel:${d.phone}`, "_self")} className="text-text-muted hover:text-white transition-colors">
                                <ArrowUpRight size={14} />
                             </button>
                          )}
                       </div>
                    </div>
                  </section>

                  <CardMiner className="p-8 border-dashed border-white/10 bg-transparent text-center space-y-4">
                     <p className="text-[9px] text-text-muted uppercase font-black tracking-widest opacity-40">Mecanismo Único Detalhado</p>
                     <p className="text-xs text-white/60 italic font-medium leading-relaxed">
                        "{d.diagnosis?.unique_mechanism || "Sonda IA ainda em processo de refinamento narrativo."}"
                     </p>
                  </CardMiner>
                </div>
              </div>
            </div>
          </>
        )}
      </CardMiner>
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
  return (
    <CardMiner 
      onClick={() => onOpen(lead.id)}
      className="p-6 gap-6 flex flex-col hover:border-primary/50 transition-all cursor-pointer group bg-black/40 border-white/5 hover:bg-primary/[0.02]"
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          <h4 className="font-black text-base uppercase tracking-tight text-white group-hover:text-primary transition-colors truncate mb-2 leading-none">
            {lead.name}
          </h4>
          <div className="flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
             <p className="text-[9px] text-text-muted font-black uppercase tracking-[0.2em] opacity-40">{lead.niche || "GERAL"}</p>
          </div>
        </div>
        {lead.score > 0 && (
          <div className="shrink-0 flex flex-col items-end">
            <span className="text-primary font-black text-2xl leading-none drop-shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]">{lead.score}</span>
            <span className="text-[8px] text-text-muted uppercase font-black tracking-widest mt-1 opacity-40">SCORE</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
           <div className="flex items-center gap-2 text-[10px] font-black text-text-muted/60 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-sm border border-white/5 group-hover:border-primary/20 transition-all">
              <Globe size={12} className="opacity-40" />
              {lead.website ? "ONLINE" : "OFFLINE"}
           </div>
        </div>
        {lead.diagnosis?.vulnerability_level && (
          <BadgeMiner variant="primary" className="text-[8px] py-1 px-3 font-black tracking-widest shadow-purple-sm">
            {lead.diagnosis.vulnerability_level.toUpperCase()}
          </BadgeMiner>
        )}
      </div>

      <div className="flex items-center justify-between pt-5 border-t border-white/5 opacity-40 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
        <div className="flex gap-2">
          {COLUMN_ORDER.indexOf(lead.status) > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); onMove(lead.id, COLUMN_ORDER[COLUMN_ORDER.indexOf(lead.status) - 1]); }}
              className="p-2 text-text-muted/60 hover:text-white hover:bg-white/10 rounded-sm transition-all border border-white/5"
              title="Voltar estágio"
            >
              <ChevronLeft size={12} />
            </button>
          )}
          {COLUMN_ORDER.indexOf(lead.status) < COLUMN_ORDER.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); onMove(lead.id, COLUMN_ORDER[COLUMN_ORDER.indexOf(lead.status) + 1]); }}
              className="flex items-center gap-1 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-primary bg-primary/10 hover:bg-primary hover:text-white rounded-sm transition-all border border-primary/20"
              title="Avançar estágio"
            >
              {NEXT_LABELS[COLUMN_ORDER[COLUMN_ORDER.indexOf(lead.status) + 1]]} <ChevronRight size={10} />
            </button>
          )}
        </div>
        <div className="flex gap-3">
          {lead.status === "extraido" && (
            <button onClick={(e) => { e.stopPropagation(); onQualify(lead.id); }} className="p-2.5 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-sm transition-all border border-primary/20 shadow-purple-sm" title="Qualificar IA">
              <Zap size={14} />
            </button>
          )}
          <button onClick={(e) => { e.stopPropagation(); onDelete(lead.id); }} className="p-2.5 text-text-muted hover:text-error hover:bg-error/10 border border-transparent hover:border-error/20 rounded-sm transition-all">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </CardMiner>
  );
}

// ─── Kanban Page ──────────────────────────────────────────────────────────────

export default function KanbanPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [qualifyingId, setQualifyingId] = useState<string | null>(null);
  const [sort, setSort] = useState<SortOption>("maior_score");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const searchParams = useSearchParams();

  const fetchLeads = useCallback(async () => {
    try {
      const res = await fetch("/api/leads");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setLeads(data.leads || []);
      setFetchError(null);
    } catch (e: any) {
      setFetchError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  useEffect(() => {
    const leadId = searchParams.get("lead");
    if (leadId && leads.length > 0) setSelectedId(leadId);
  }, [searchParams, leads]);

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
    if (!confirm("Confirmar descarte permanente do prospecto?")) return;
    setLeads(prev => prev.filter(l => l.id !== id));
    await fetch(`/api/leads/${id}`, { method: "DELETE" });
  };

  const handleMove = async (id: string, newStatus: string) => {
    setLeads(p => p.map(l => l.id === id ? { ...l, status: newStatus } : l));
    await fetch(`/api/leads/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: newStatus }),
      headers: { "Content-Type": "application/json" },
    });
  };

  const q = search.toLowerCase();
  const filtered = q ? leads.filter(l => l.name?.toLowerCase().includes(q) || l.niche?.toLowerCase().includes(q)) : leads;
  const byStatus = (status: string) => sortLeads(filtered.filter(l => l.status === status), sort);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
      <div className="relative">
        <div className="absolute inset-0 bg-primary blur-3xl opacity-20 animate-pulse" />
        <Loader2 className="animate-spin text-primary relative" size={64} />
      </div>
      <div className="text-center">
        <p className="text-[12px] font-black uppercase tracking-[0.4em] text-white animate-pulse">Sincronizando Fluxo de Extração...</p>
        <p className="text-[10px] text-text-muted uppercase font-bold tracking-widest mt-2 opacity-40 italic">Acessando Kernel ProspectOS v1.0</p>
      </div>
    </div>
  );

  return (
    <div className="p-8 max-w-[1800px] mx-auto flex flex-col gap-10 animate-in fade-in duration-1000 h-[calc(100vh-100px)]">
      
      {/* Kanban Header HUD */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 bg-black/40 border border-white/5 p-10 rounded-sm relative overflow-hidden group shrink-0">
        <div className="absolute top-0 left-0 w-1 h-full bg-primary/20" />
        <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none group-hover:opacity-[0.05] transition-opacity">
           <Trello size={200} />
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
             <BadgeMiner variant="primary" className="py-1 px-4 text-[10px] font-black tracking-widest shadow-purple-sm">Sovereign Pipeline</BadgeMiner>
             <div className="h-4 w-px bg-white/10" />
             <span className="text-text-muted text-[10px] font-black uppercase tracking-widest opacity-40 italic">TABULEIRO DE CONVERSÃO v2.0</span>
          </div>
          <h1 className="text-6xl font-black tracking-tighter uppercase leading-none text-white">
            EXTRACTION <span className="text-primary">LINE</span>
          </h1>
        </div>

        <div className="flex items-center gap-6 flex-wrap lg:flex-nowrap">
           <div className="relative group/search">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted opacity-40 group-focus-within/search:text-primary group-focus-within/search:opacity-100 transition-all" size={20} />
              <input 
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="RASTREAR PROSPECTO..."
                className="bg-black/40 border-2 border-white/5 h-16 pl-14 pr-8 text-[11px] font-black uppercase tracking-[0.2em] text-white outline-none focus:border-primary/40 focus:bg-primary/[0.02] transition-all rounded-sm w-[350px] placeholder:text-white/10"
              />
           </div>
           
           <div className="flex items-center gap-2">
              <div className="relative">
                 <select 
                   value={sort}
                   onChange={e => setSort(e.target.value as SortOption)}
                   className="appearance-none bg-black/40 border-2 border-white/5 h-16 pl-6 pr-14 text-[10px] font-black uppercase tracking-widest text-white outline-none focus:border-primary/40 transition-all rounded-sm cursor-pointer"
                 >
                    {SORT_OPTIONS.map(opt => (
                       <option key={opt.value} value={opt.value} className="bg-black text-white">{opt.label}</option>
                    ))}
                 </select>
                 <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" size={16} />
              </div>
              <ButtonMiner onClick={fetchLeads} variant="outline" icon={RefreshCw} className="h-16 px-8 border-white/10 text-text-muted hover:text-white" />
           </div>
        </div>
      </div>

      {fetchError && (
        <CardMiner className="border-error/20 bg-error/[0.03] p-6 flex items-center gap-4 animate-in slide-in-from-top-4 duration-500">
           <ShieldAlert size={20} className="text-error" />
           <p className="text-[11px] font-black uppercase tracking-[0.3em] text-error">PROTOCOLO DE INTERRUPÇÃO: {fetchError}</p>
        </CardMiner>
      )}

      {/* Board Layout */}
      <div className="flex gap-8 overflow-x-auto pb-8 custom-scrollbar flex-1 min-h-0">
        {COLUMNS.map((col) => {
          const colLeads = byStatus(col.key);
          const Icon = col.icon;
          return (
            <div key={col.key} className="flex flex-col gap-8 min-w-[350px] max-w-[400px] flex-1 min-h-0 group/col">
              <div className={`p-6 bg-white/[0.01] border-b-2 ${col.color} flex items-center justify-between transition-all duration-500 group-hover/col:bg-white/[0.03] ${col.glow} shrink-0`}>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/5 rounded-sm border border-white/5 group-hover/col:border-primary/20 transition-all">
                    <Icon size={18} className="text-primary" />
                  </div>
                  <div>
                     <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-white">{col.label}</h3>
                     <p className="text-[8px] text-text-muted font-black uppercase tracking-widest mt-1 opacity-40 italic">Módulo Operacional</p>
                  </div>
                </div>
                <div className="text-xl font-black text-white tracking-tighter bg-white/5 w-12 h-12 flex items-center justify-center rounded-sm border border-white/5">
                  {colLeads.length}
                </div>
              </div>
              
              <div className="flex flex-col gap-6 overflow-y-auto custom-scrollbar px-1 pr-3 pb-12 flex-1">
                {colLeads.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-32 border border-dashed border-white/5 rounded-sm opacity-10 group-hover/col:opacity-20 transition-all">
                    <Icon size={48} className="mb-6" />
                    <p className="text-[10px] uppercase font-black tracking-[0.4em]">Linha de Extração Vazia</p>
                  </div>
                ) : (
                  colLeads.map((lead) => (
                    <div key={lead.id} className={`${qualifyingId === lead.id ? "opacity-30 pointer-events-none scale-95" : "scale-100"} transition-all duration-500`}>
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

      {selectedId && <LeadModal id={selectedId} onClose={() => setSelectedId(null)} />}
    </div>
  );
}
