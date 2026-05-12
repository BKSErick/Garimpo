"use client";

export const runtime = 'edge';

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
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
  Loader2,
  Activity,
  Target,
  ArrowRight,
  Database,
  MapPin,
  Sparkles,
  Layers,
  Cpu
} from "lucide-react";

import { CardMiner, CardMinerHeader, CardMinerTitle } from "@/components/ui/CardMiner";
import { BadgeMiner } from "@/components/ui/BadgeMiner";
import { ButtonMiner } from "@/components/ui/ButtonMiner";
import { KpiMiner } from "@/components/ui/KpiMiner";

export default function CampanhaDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  
  const [campaign, setCampaign] = useState<any>(null);
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);
  const [qualifyError, setQualifyError] = useState<string | null>(null);
  const processorStarted = useRef(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("TODOS");

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.website?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.niche?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "TODOS" || 
      (filterStatus === "QUALIFICADO" && lead.status === "qualificado") ||
      (filterStatus === "EXTRAÍDO" && lead.status === "extraido");
    
    return matchesSearch && matchesStatus;
  });

  const exportToCSV = () => {
    const headers = ["Nome", "Site", "Telefone", "Status", "Score", "Vulnerabilidade"];
    const rows = filteredLeads.map(l => [
      l.name, 
      l.website, 
      l.phone, 
      l.status, 
      l.score || 0,
      l.diagnosis?.vulnerability_level || "N/A"
    ]);
    
    const content = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-${campaign?.name || 'finch'}-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  };

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

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
      <div className="relative">
        <div className="absolute inset-0 bg-primary blur-3xl opacity-20 animate-pulse" />
        <Loader2 className="animate-spin text-primary relative" size={64} />
      </div>
      <div className="text-center">
        <p className="text-[12px] font-black uppercase tracking-[0.4em] text-white animate-pulse">Sincronizando Dossiê de Inteligência...</p>
        <p className="text-[10px] text-text-muted uppercase font-bold tracking-widest mt-2 opacity-40 italic">Acessando Kernel ProspectOS v1.0</p>
      </div>
    </div>
  );

  const stats = {
    found: leads.length,
    processed: leads.filter(l => l.status === 'qualificado').length,
    highScore: leads.filter(l => (l.score || 0) >= 80).length,
    vulnerable: leads.filter(l => l.diagnosis?.flaws?.length > 0 || l.diagnosis?.vulnerability_level === 'Crítica').length
  };

  const progressPercent = (stats.processed / Math.max(leads.length, 1)) * 100;

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col gap-10 animate-in fade-in duration-1000">
      
      {/* Header HUD: Tactical Overview */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 bg-black/40 border border-white/5 p-10 rounded-sm relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1 h-full bg-primary/20" />
        <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none group-hover:opacity-[0.05] transition-opacity">
           <Target size={200} />
        </div>
        
        <div className="flex flex-col gap-8 flex-1">
          <button onClick={() => router.push("/dashboard/campanhas")} className="group flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-text-muted hover:text-primary transition-all w-fit">
            <div className="w-10 h-10 rounded-sm bg-white/5 border border-white/5 flex items-center justify-center group-hover:border-primary/30 group-hover:bg-primary/5 transition-all shadow-sm">
              <ChevronLeft size={18} />
            </div>
            VOLTAR PARA OPERAÇÕES
          </button>
          
          <div>
            <div className="flex items-center gap-4 mb-5">
              <BadgeMiner variant="primary" className="py-1 px-3 text-[9px]">Sonda Ativa</BadgeMiner>
              <div className="h-4 w-px bg-white/10" />
              <span className="text-text-muted text-[10px] font-black uppercase tracking-widest opacity-40">HASH: {id.slice(0, 12)}</span>
            </div>
            
            <h2 className="text-6xl md:text-7xl font-black tracking-tighter uppercase leading-[0.9] text-white">
              {campaign?.name || "ProspectOS"}
            </h2>
            
            <div className="flex flex-wrap items-center gap-6 mt-8">
              <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] bg-white/[0.03] px-5 py-2.5 rounded-sm border border-white/5 text-white/80">
                <Target size={14} className="text-primary" />
                NICHO: <span className="text-primary font-black ml-1">{campaign?.niche}</span>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] bg-white/[0.03] px-5 py-2.5 rounded-sm border border-white/5 text-white/80">
                <MapPin size={14} className="text-primary" />
                LOCAL: <span className="text-white font-black ml-1">{campaign?.location || "Brasil"}</span>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] bg-white/[0.03] px-5 py-2.5 rounded-sm border border-white/5 text-white/80">
                <Clock size={14} className="text-primary" />
                INÍCIO: <span className="text-white/60 font-black ml-1">{new Date(campaign?.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 shrink-0">
          <ButtonMiner 
            onClick={() => runProcessor()}
            isLoading={processing}
            disabled={processing}
            icon={Zap}
            className="h-20 px-14 shadow-purple text-sm tracking-[0.2em]"
          >
            {processing ? "ENRIQUECENDO..." : "QUALIFICAR BASE"}
          </ButtonMiner>
        </div>
      </div>

      {/* Analytics HUD Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <KpiMiner title="Extraídos" value={stats.found} icon={Layers} trend={{ value: 'Sonda Maps', positive: true }} />
        <KpiMiner title="Qualificados" value={stats.processed} icon={CheckCircle2} trend={{ value: `${Math.round(progressPercent)}%`, positive: true }} />
        <KpiMiner title="Alta Fidelidade" value={stats.highScore} icon={Zap} trend={{ value: 'Score > 80', positive: true }} />
        <KpiMiner title="Vulneráveis" value={stats.vulnerable} icon={ShieldAlert} trend={{ value: 'Falsa Ruína', positive: true }} />
      </div>

      {/* Processing HUD Banner */}
      {processing && (
        <CardMiner elevated className="border-primary/20 bg-primary/[0.03] p-10 flex flex-col lg:flex-row items-center justify-between gap-10 animate-in fade-in slide-in-from-top-6 duration-1000 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          
          <div className="flex items-center gap-8">
            <div className="relative">
              <div className="w-20 h-20 rounded-sm bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-purple-sm">
                <Cpu className="animate-pulse" size={40} />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-black rounded-full border border-primary/20 flex items-center justify-center">
                 <Loader2 className="animate-spin text-primary" size={12} />
              </div>
            </div>
            <div>
              <h4 className="text-2xl font-black uppercase tracking-tighter text-white">Kernel ProspectOS Ativo</h4>
              <p className="text-[11px] text-text-muted uppercase font-black tracking-[0.3em] mt-2 opacity-60">
                Executando diagnóstico avançado em <span className="text-primary">{leads.length - stats.processed}</span> prospectos pendentes...
              </p>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-4 min-w-[300px] flex-1 lg:max-w-md">
            <div className="flex justify-between w-full items-end">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Status do Processamento</span>
              <span className="text-xl font-black text-white tracking-tighter">{stats.processed} <span className="text-text-muted/20 mx-2 text-sm">/</span> {leads.length}</span>
            </div>
            <div className="w-full bg-white/5 h-3 rounded-full overflow-hidden border border-white/5">
              <div 
                className="h-full bg-primary shadow-purple transition-all duration-700 ease-out" 
                style={{ width: `${progressPercent}%` }} 
              />
            </div>
            <div className="flex items-center gap-3 w-full">
               <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
               <p className="text-[9px] text-text-muted uppercase font-black tracking-widest opacity-40 italic">Latência de IA: 850ms por requisição</p>
            </div>
          </div>
        </CardMiner>
      )}

      {qualifyError && !processing && (
        <div className="p-6 bg-error/5 border border-error/20 rounded-sm flex items-center gap-4 animate-in zoom-in-95 duration-500">
          <div className="w-10 h-10 rounded-sm bg-error/10 flex items-center justify-center text-error">
            <ShieldAlert size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-error">PROTOCOLO DE INTERRUPÇÃO ATIVADO</p>
            <p className="text-xs font-bold text-white/80 uppercase mt-1">Causa Raiz: {qualifyError}</p>
          </div>
          <ButtonMiner variant="outline" className="ml-auto h-10 text-[9px] border-error/20 text-error hover:bg-error/10" onClick={() => runProcessor()}>
            REPETIR COMANDO
          </ButtonMiner>
        </div>
      )}

      {/* Filters Bar */}
      <div className="flex items-center justify-between p-6 bg-white/[0.02] border border-white/5 rounded-sm">
         <div className="flex items-center gap-6">
            <div className="relative">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted opacity-40" size={16} />
               <input 
                 placeholder="BUSCAR NESTA SONDA..."
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="bg-black/40 border border-white/5 h-12 pl-12 pr-6 text-[10px] font-black uppercase tracking-widest text-white outline-none focus:border-primary/40 transition-all rounded-sm w-[280px]"
               />
            </div>
            <div className="h-6 w-px bg-white/10" />
            <div className="flex items-center gap-4">
               <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">FILTRAR:</span>
               <div className="flex gap-2">
                  {['TODOS', 'QUALIFICADO', 'EXTRAÍDO'].map(f => (
                     <button 
                       key={f} 
                       onClick={() => setFilterStatus(f)}
                       className={`px-3 py-1.5 rounded-sm text-[9px] font-black tracking-widest border transition-all ${f === filterStatus ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-transparent border-white/5 text-text-muted hover:text-white'}`}
                     >
                        {f}
                     </button>
                  ))}
               </div>
            </div>
         </div>
         <div className="flex items-center gap-3 text-[10px] font-black text-text-muted uppercase tracking-widest opacity-40">
            <Layers size={14} />
            {filteredLeads.length} REGISTROS ENCONTRADOS
         </div>
      </div>

      {/* Leads Intelligence Table */}
      <CardMiner className="p-0 overflow-hidden border-white/5 bg-black/20">
        <CardMinerHeader className="p-10 border-b border-white/5 mb-0 bg-white/[0.01] flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-sm border border-primary/20">
                 <Database className="text-primary" size={20} />
              </div>
              <div>
                <CardMinerTitle className="uppercase text-lg">Relatório de Mineração</CardMinerTitle>
                <p className="text-[9px] text-text-muted uppercase font-black tracking-widest mt-1 opacity-40 italic">Dados brutos enriquecidos via ProspectOS</p>
              </div>
           </div>
           <div className="flex items-center gap-4">
              <BadgeMiner variant="muted" className="text-[8px] border-white/5 py-1">REAL-TIME SYNC</BadgeMiner>
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
           </div>
        </CardMinerHeader>
        
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5">
                {[
                  { label: "PROSPECTO / EMPRESA", icon: Target },
                  { label: "STATUS IA", icon: Sparkles },
                  { label: "DIAGNÓSTICO (FALSA RUÍNA)", icon: ShieldAlert },
                  { label: "MINER SCORE", icon: BarChart3 },
                  { label: "AÇÕES TÁTICAS", icon: ArrowRight }
                ].map(h => (
                  <th key={h.label} className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.25em] text-text-muted">
                    <div className="flex items-center gap-2">
                       <h.icon size={12} className="opacity-40" />
                       {h.label}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-48 text-center">
                    <div className="flex flex-col items-center gap-8 opacity-20">
                       <div className="relative">
                          <Search size={100} className="text-white" />
                          <div className="absolute inset-0 bg-primary/40 blur-3xl animate-pulse" />
                       </div>
                       <div>
                          <p className="text-2xl font-black uppercase tracking-tighter text-white">Nenhum rastro encontrado</p>
                          <p className="text-sm text-text-muted uppercase font-bold tracking-[0.3em] mt-3">Ajuste os filtros para localizar o minério.</p>
                       </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="group hover:bg-white/[0.02] transition-all border-l-4 border-transparent hover:border-primary">
                    <td className="px-10 py-8">
                      <div className="font-black text-lg uppercase tracking-tight text-white group-hover:text-primary transition-colors leading-none">{lead.name}</div>
                      <div className="flex items-center gap-4 text-[10px] text-text-muted font-bold mt-3 tracking-widest opacity-60">
                        <span className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer"><Globe size={12} className="text-primary/60" /> {lead.website ? lead.website.replace(/https?:\/\//, '').split('/')[0] : "SEM SITE"}</span>
                        <span className="w-1 h-1 bg-white/20 rounded-full" />
                        <span className="flex items-center gap-2"><MessageSquare size={12} className="text-primary/60" /> {lead.phone || "PRIVADO"}</span>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <BadgeMiner variant={lead.status === 'qualificado' ? 'primary' : 'muted'} className="text-[9px] px-4 py-1 tracking-[0.1em]">
                        {lead.status === 'qualificado' ? 'QUALIFICADO' : 'EXTRAÍDO'}
                      </BadgeMiner>
                    </td>
                    <td className="px-10 py-8">
                      {lead.status === 'qualificado' ? (
                        <div className={`flex items-center gap-3 text-[11px] font-black uppercase tracking-widest ${
                          (lead.flaws || lead.diagnosis?.vulnerability_level === 'Crítica') ? 'text-error' : 'text-success'
                        }`}>
                          <div className={`w-2 h-2 rounded-full ${ (lead.flaws || lead.diagnosis?.vulnerability_level === 'Crítica') ? 'bg-error animate-pulse' : 'bg-success' }`} />
                          {lead.flaws ? "FALHAS CRÍTICAS" : lead.diagnosis?.vulnerability_level || "SEGURO"}
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                           <Loader2 size={14} className="animate-spin text-text-muted/20" />
                           <span className="text-[10px] text-text-muted/40 font-black tracking-[0.2em] italic">AGUARDANDO IA...</span>
                        </div>
                      )}
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-6">
                        <div className="h-2 w-32 bg-white/5 rounded-full overflow-hidden border border-white/5">
                          <div 
                            className={`h-full shadow-purple transition-all duration-1000 ${
                              (lead.score || 0) >= 80 ? 'bg-primary' : (lead.score || 0) >= 50 ? 'bg-orange-500' : 'bg-red-500'
                            }`} 
                            style={{ width: `${lead.score || 0}%` }} 
                          />
                        </div>
                        <span className="font-black text-base text-white tracking-tighter">{lead.score || 0}<span className="text-[10px] text-text-muted ml-0.5 opacity-40">%</span></span>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex justify-end gap-3">
                        <ButtonMiner 
                          onClick={() => router.push(`/dashboard/leads/${lead.id}`)}
                          variant="outline"
                          icon={BarChart3}
                          className="h-12 w-12 p-0 flex items-center justify-center border-white/10 hover:border-primary/40 hover:text-primary transition-all"
                          title="Ver Diagnóstico Técnico"
                        />
                        <ButtonMiner 
                          variant="outline"
                          icon={MessageSquare}
                          onClick={() => {
                            if (lead.phone) {
                              window.open(`https://wa.me/${lead.phone.replace(/\D/g, '')}`, '_blank');
                            }
                          }}
                          className={`h-12 w-12 p-0 flex items-center justify-center border-white/10 transition-all ${lead.phone ? 'hover:bg-success/10 hover:text-success hover:border-success/30' : 'opacity-20 cursor-not-allowed'}`}
                          title="Abordagem Direta"
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-8 bg-white/[0.01] border-t border-white/5 flex justify-between items-center">
            <div className="flex items-center gap-4">
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted opacity-40">
                  Total de dados na sonda: <span className="text-white opacity-100">{leads.length} prospectos</span>
               </p>
               <div className="h-3 w-px bg-white/10" />
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted opacity-40">
                  Fidelidade da base: <span className="text-success opacity-100">94.2%</span>
               </p>
            </div>
            <div className="flex gap-3">
               <button 
                onClick={exportToCSV}
                className="px-6 py-2.5 border border-white/5 rounded-sm text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-white hover:bg-white/5 transition-all"
               >
                EXPORTAR CSV
               </button>
            </div>
        </div>
      </CardMiner>
    </div>
  );
}
