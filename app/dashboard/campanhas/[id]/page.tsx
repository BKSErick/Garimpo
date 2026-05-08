"use client";

export const runtime = 'edge';

import { useEffect, useState, use, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  ChevronLeft, 
  Search, 
  Globe, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Zap, 
  MessageSquare, 
  ExternalLink,
  MoreVertical,
  Filter,
  BarChart3,
  Loader2
} from "lucide-react";

export default function CampanhaDetailPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = use(paramsPromise);
  const { id } = params;
  const router = useRouter();
  
  const [campaign, setCampaign] = useState<any>(null);
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);
  const [qualifyError, setQualifyError] = useState<string | null>(null);
  const processorStarted = useRef(false);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const [campaignRes, leadsRes] = await Promise.all([
          fetch(`/api/campaigns/${id}`).then(r => r.json()),
          fetch(`/api/leads?campaign_id=${id}`).then(r => r.json()),
        ]);

        setCampaign(campaignRes.campaign);
        setLeads(leadsRes.leads || []);
        setProcessedCount(leadsRes.leads?.filter((l: any) => l.status !== 'extraido').length || 0);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Polling simulation for lead list
    const interval = setInterval(() => {
      fetch(`/api/leads?campaign_id=${id}`)
        .then(r => r.json())
        .then(data => {
          setLeads(data.leads || []);
          setProcessedCount(data.leads?.filter((l: any) => l.status !== 'extraido').length || 0);
        });
    }, 5000);

    return () => clearInterval(interval);
  }, [id]);

  // Background Processor Logic
  useEffect(() => {
    const hasPending = leads.some(l => l.status === 'extraido');
    if (hasPending && !processing && !loading && !processorStarted.current) {
      processorStarted.current = true;
      runProcessor();
    }
  }, [leads, processing, loading]);

  const runProcessor = async () => {
    if (processing) return;
    setProcessing(true);
    setQualifyError(null);

    try {
      let hasMore = true;
      let iterations = 0;
      const MAX_ITERATIONS = 20;
      while (hasMore && iterations < MAX_ITERATIONS) {
        const res = await fetch(`/api/campaigns/${id}/qualify-all`, { method: "POST" });
        if (!res.ok) { setQualifyError(`Erro HTTP ${res.status}`); break; }
        const data = await res.json();
        if (data.error) { setQualifyError(data.error); break; }
        hasMore = data.hasMore === true;
        iterations++;
        if (hasMore) await new Promise(r => setTimeout(r, 500));
      }
    } catch (e: any) {
      setQualifyError(e.message || "Erro desconhecido");
    } finally {
      setProcessing(false);
    }
  };

  // Re-enable processing if leads are still being qualified
  useEffect(() => {
    const hasPending = leads.some(l => l.status === 'extraido');
    const hasProcessing = leads.some(l => l.status === 'qualificando'); // Se tivermos status intermediário
    
    if (hasPending && processing) {
      // Mantemos o estado de processamento ativo
    } else if (!hasPending && processing) {
      setProcessing(false);
    }
  }, [leads, processing]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 className="animate-spin text-primary" size={40} />
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">Sincronizando Dados...</p>
    </div>
  );

  const stats = {
    found: leads.length,
    processed: leads.filter(l => l.status === 'qualificado').length,
    highScore: leads.filter(l => (l.score || 0) >= 80).length,
    vulnerable: leads.filter(l => l.flaws || l.diagnosis?.vulnerability_level === 'Crítica').length
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header HUD */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="flex flex-col gap-4">
          <button onClick={() => router.push("/dashboard/campanhas")} className="text-[10px] text-text-muted uppercase tracking-widest hover:text-primary flex items-center gap-2">
            <ChevronLeft size={12} /> Voltar para Campanhas
          </button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-2 py-0.5 bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest border border-primary/20 rounded-sm">Busca Ativa</span>
              <span className="text-text-muted text-[10px] font-bold uppercase">ID: {id.slice(0, 8)}</span>
            </div>
            <h2 className="text-5xl font-black tracking-tighter uppercase">{campaign?.name || "Garimpo em curso"}</h2>
            <p className="text-sm text-text-muted mt-2 max-w-xl">
              Procurando <span className="text-primary font-bold">{campaign?.niche}</span> em <span className="text-white font-bold">{campaign?.location || "Brasil"}</span>
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            className={`btn-finch flex items-center gap-2 ${processing ? 'opacity-50 cursor-not-allowed' : ''}`} 
            onClick={() => runProcessor()}
            disabled={processing}
          >
            {processing ? <Loader2 className="animate-spin" size={14} /> : <Zap size={14} />} 
            {processing ? "Qualificando..." : "Qualificar Base (IA)"}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Encontrados", val: stats.found, icon: Search, color: "text-primary" },
          { label: "Qualificados", val: stats.processed, icon: CheckCircle2, color: "text-green-500" },
          { label: "Alta Conversão", val: stats.highScore, icon: Zap, color: "text-orange-500" },
          { label: "Críticos", val: stats.vulnerable, icon: ShieldAlert, color: "text-red-500" },
        ].map(s => (
          <div key={s.label} className="glass p-6 border border-white/5 flex flex-col gap-2 relative overflow-hidden group">
            <div className="flex items-center justify-between relative z-10">
              <s.icon size={16} className={s.color} />
              <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">Tempo Real</span>
            </div>
            <div className="flex items-baseline gap-2 relative z-10">
              <span className="text-4xl font-black">{s.val}</span>
              <span className="text-[10px] text-text-muted uppercase font-bold tracking-tighter">{s.label}</span>
            </div>
            <div className={`absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-700 ${s.color}`}>
              <s.icon size={100} />
            </div>
          </div>
        ))}
      </div>

      {/* Processing Banner */}
      {processing && (
        <div className="bg-primary/5 border border-primary/20 p-6 rounded-sm mb-8 flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-6">
            <div className="relative">
              <Loader2 className="animate-spin text-primary" size={32} />
              <Zap className="absolute inset-0 m-auto text-primary animate-pulse" size={14} />
            </div>
            <div>
              <p className="text-sm font-black uppercase tracking-widest mb-1">Motor de Enriquecimento Ativo</p>
              <p className="text-[10px] text-text-muted uppercase tracking-wider">
                Analisando sites, detectando falhas de marketing e gerando scripts de conversão com IA...
              </p>
            </div>
          </div>
          <div className="text-right flex flex-col items-end">
            <p className="text-2xl font-black tracking-tighter text-primary">{stats.processed} / {leads.length}</p>
            <div className="w-32 bg-white/5 h-1 rounded-full overflow-hidden mt-1">
              <div className="bg-primary h-full transition-all duration-500" style={{ width: `${(stats.processed / Math.max(leads.length, 1)) * 100}%` }} />
            </div>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {qualifyError && !processing && (
        <div className="bg-red-500/5 border border-red-500/20 p-4 rounded-sm mb-8 flex items-center gap-4">
          <ShieldAlert size={16} className="text-red-500 shrink-0" />
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-red-400 mb-0.5">Erro na Qualificação</p>
            <p className="text-xs text-text-muted font-mono">{qualifyError}</p>
          </div>
        </div>
      )}

      {/* Leads Table */}
      <div className="glass border border-white/5 rounded-sm overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <h3 className="text-sm font-black uppercase tracking-[0.2em]">Extração de Ouro</h3>
          <div className="flex items-center gap-4 text-text-muted text-[10px] font-bold uppercase tracking-widest">
            <span className="flex items-center gap-2"><Clock size={12} /> Última atualização: agora</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-[10px] font-black uppercase tracking-widest text-text-muted">
                <th className="p-6">Lead / Empresa</th>
                <th className="p-6">Status</th>
                <th className="p-6">Vulnerabilidade</th>
                <th className="p-6 text-center">Score Finch</th>
                <th className="p-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {leads.map((lead) => (
                <tr key={lead.id} className="group hover:bg-white/[0.03] transition-all">
                  <td className="p-6">
                    <div className="flex flex-col gap-1">
                      <span className="font-black text-sm uppercase tracking-tight group-hover:text-primary transition-colors">{lead.name}</span>
                      <div className="flex items-center gap-3 text-[10px] text-text-muted font-bold">
                        <span className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer"><Globe size={10} /> {lead.website ? lead.website.replace(/https?:\/\//, "").replace("www.", "").split('/')[0] : "Sem site"}</span>
                        <span className="w-1 h-1 bg-white/10 rounded-full" />
                        <span>{lead.phone || "Sem telefone"}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2">
                      {lead.status === 'qualificado' ? (
                        <span className="flex items-center gap-1.5 px-2 py-1 bg-green-500/10 text-green-500 text-[9px] font-black uppercase tracking-widest border border-green-500/20 rounded-sm shadow-[0_0_10px_rgba(34,197,94,0.1)]">
                          <CheckCircle2 size={10} /> Qualificado
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 px-2 py-1 bg-white/5 text-text-muted text-[9px] font-black uppercase tracking-widest border border-white/10 rounded-sm">
                          <Clock size={10} /> Extraído
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-6">
                    {(lead.flaws || lead.diagnosis?.vulnerability_level) ? (
                      <span className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${
                        (lead.flaws || lead.diagnosis?.vulnerability_level === 'Crítica') ? 'text-red-500' : 'text-green-500'
                      }`}>
                        <ShieldAlert size={12} /> {lead.flaws ? "Falhas Detectadas" : lead.diagnosis.vulnerability_level}
                      </span>
                    ) : <span className="text-[10px] text-white/20 font-black uppercase tracking-widest">—</span>}
                  </td>
                  <td className="p-6">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden max-w-[80px]">
                        <div className={`h-full transition-all duration-1000 ${
                          (lead.score || 0) >= 80 ? 'bg-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]' :
                          (lead.score || 0) >= 50 ? 'bg-orange-500' : 'bg-red-500'
                        }`} style={{ width: `${lead.score || 0}%` }} />
                      </div>
                      <span className="text-[10px] font-black text-white/50">{lead.score || 0}%</span>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => router.push(`/dashboard/leads/${lead.id}`)}
                        className="p-2 hover:bg-primary/20 hover:text-primary transition-all text-text-muted border border-white/5 hover:border-primary/30 rounded-sm"
                        title="Ver Diagnóstico"
                      >
                        <BarChart3 size={16} />
                      </button>
                      <button 
                        className="p-2 hover:bg-green-500/20 hover:text-green-500 transition-all text-text-muted border border-white/5 hover:border-green-500/30 rounded-sm"
                        title="Abrir WhatsApp"
                      >
                        <MessageSquare size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {leads.length === 0 && (
            <div className="p-32 flex flex-col items-center justify-center text-center gap-6 animate-in fade-in duration-1000">
              <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center border border-primary/10">
                <Search className="text-primary/20" size={32} />
              </div>
              <div>
                <p className="text-lg font-black uppercase tracking-[0.2em] mb-2">Garimpando Ouro...</p>
                <p className="text-[10px] text-text-muted uppercase tracking-widest max-w-xs mx-auto">
                  Estamos extraindo os leads do Google Maps. Em alguns segundos eles aparecerão aqui.
                </p>
              </div>
              <div className="flex gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
