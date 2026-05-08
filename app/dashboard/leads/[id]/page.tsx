"use client";

export const runtime = 'edge';

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ChevronLeft,
  Zap,
  MessageSquare,
  Globe,
  Phone,
  MapPin,
  Star,
  ShieldAlert,
  CheckCircle2,
  Copy,
  ExternalLink,
  Loader2,
  AlertTriangle,
  FileText,
  Calendar,
  Search
} from "lucide-react";

export default function LeadDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  
  const [lead, setLead] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [qualifying, setQualifying] = useState(false);
  const [activeTab, setActiveTab] = useState<"initial" | "followup">("initial");

  useEffect(() => {
    fetchLead();
  }, [id]);

  const fetchLead = async () => {
    try {
      const r = await fetch(`/api/leads/${id}/status`);
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || `Erro ${r.status}`);
      setLead(data.lead ?? null);
    } catch (e: any) {
      console.error("fetchLead falhou:", e.message);
      setLead(null);
    } finally {
      setLoading(false);
    }
  };

  const handleQualify = async () => {
    setQualifying(true);
    try {
      await fetch(`/api/leads/${id}/qualify`, { method: "POST" });
      fetchLead();
    } catch (e) {
      console.error(e);
    } finally {
      setQualifying(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copiado para o seu arsenal! ✍️");
  };

  const parseCopy = (copyString: string) => {
    if (!copyString) return { initial: "", followup: "" };
    
    const parts = copyString.split(/\[MENSAGEM 2\]/i);
    const initial = parts[0]?.replace(/\[MENSAGEM 1\]/i, "").trim() || "";
    const followup = parts[1]?.trim() || "";
    
    return { initial, followup };
  };

  const { initial, followup } = parseCopy(lead?.whatsapp_copy);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 className="animate-spin text-primary" size={40} />
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">Analisando Ativos do Lead...</p>
    </div>
  );

  if (!lead) return <div className="p-8">Lead não encontrado.</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <button onClick={() => router.back()} className="text-[10px] text-text-muted uppercase tracking-widest hover:text-primary mb-4 flex items-center gap-2">
            <ChevronLeft size={12} /> Voltar ao Painel
          </button>
          <div className="flex items-center gap-3 mb-2">
            <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest border rounded-sm ${
              lead.status === 'qualificado' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-primary/10 text-primary border-primary/20'
            }`}>
              {lead.status}
            </span>
            <span className="text-text-muted text-[10px] font-bold uppercase tracking-wider">Score Finch</span>
          </div>
          <h2 className="text-5xl font-black tracking-tighter uppercase leading-none">{lead.name}</h2>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className={`text-6xl font-black tracking-tighter ${lead.score >= 80 ? 'text-primary' : 'text-white'}`}>
              {lead.score || 0}<span className="text-xl text-text-muted">%</span>
            </div>
            <p className="text-[9px] font-black uppercase tracking-widest text-text-muted">Conversão Estimada</p>
          </div>
          <button 
            onClick={handleQualify}
            disabled={qualifying}
            className="btn-finch py-5 px-10 flex items-center gap-3 shadow-lg shadow-primary/20"
          >
            {qualifying ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} />}
            {lead.status === 'qualificado' ? "Atualizar Inteligência" : "Gerar Diagnóstico de Elite"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Info & Diagnosis */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          {/* Diagnostic Card */}
          <div className="glass border border-white/5 p-8 rounded-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                <ShieldAlert className="text-primary" size={20} />
                Ponto Cego (Falsa Ruína)
              </h3>
              <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-sm ${
                (lead.flaws || lead.diagnosis?.vulnerability_level === 'Crítica') ? 'bg-red-500/10 text-red-500 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'bg-primary/10 text-primary'
              }`}>
                Vulnerabilidade: {lead.diagnosis?.vulnerability_level || (lead.flaws ? 'Crítica' : 'Pendente')}
              </span>
            </div>

            {lead.status === 'qualificado' ? (
              <div className="flex flex-col gap-6">
                <div className="p-6 bg-red-500/5 border border-red-500/10 rounded-sm">
                  <p className="text-[10px] font-black uppercase tracking-widest text-red-400 mb-2">Falhas de Conversão Detectadas</p>
                  <p className="text-base font-bold text-white/90 leading-relaxed">
                    {lead.flaws || "Nenhuma falha crítica listada explicitamente."}
                  </p>
                </div>

                <div className="p-6 bg-primary/5 border border-primary/10 rounded-sm">
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Mecanismo Único de Resolução (Oferta)</p>
                  <p className="text-base text-white/80 italic leading-relaxed">
                    "{lead.unique_mechanism || "Implementação de triagem automatizada para capturar o desejo imediato do cliente de eventos."}"
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-20 flex flex-col items-center justify-center text-center gap-4 opacity-30">
                <Search size={48} className="animate-pulse" />
                <p className="text-sm font-black uppercase tracking-widest">Aguardando Enriquecimento de Dados</p>
              </div>
            )}
          </div>

          {/* Scripts Card (The main focus now) */}
          <div className="glass border border-white/5 p-8 rounded-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
              <MessageSquare size={120} />
            </div>
            
            <div className="flex items-center justify-between mb-6 relative z-10">
              <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                <MessageSquare className="text-green-500" size={20} />
                Scripts de Abordagem
              </h3>
            </div>

            {lead.whatsapp_copy ? (
              <div className="flex flex-col gap-4 relative z-10">
                {/* Tabs */}
                <div className="flex gap-2">
                  <button 
                    onClick={() => setActiveTab("initial")}
                    className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-sm transition-all border ${
                      activeTab === "initial" ? "bg-primary text-background border-primary" : "bg-white/5 text-text-muted border-white/10 hover:border-primary/30"
                    }`}
                  >
                    1. Abordagem Inicial
                  </button>
                  <button 
                    onClick={() => setActiveTab("followup")}
                    className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-sm transition-all border ${
                      activeTab === "followup" ? "bg-primary text-background border-primary" : "bg-white/5 text-text-muted border-white/10 hover:border-primary/30"
                    }`}
                  >
                    2. Follow-up (Recuperação)
                  </button>
                </div>

                {/* Copy Text Area */}
                <div className="bg-black/60 border border-white/10 p-6 rounded-sm min-h-[150px] relative group">
                  <p className="text-sm text-white/90 leading-relaxed whitespace-pre-wrap font-sans">
                    {activeTab === "initial" ? initial : (followup || "Nenhum follow-up gerado. Requalifique o lead para gerar a sequência completa.")}
                  </p>
                  <button 
                    onClick={() => copyToClipboard(activeTab === "initial" ? initial : followup)}
                    className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-primary/20 text-text-muted hover:text-primary rounded-sm transition-all border border-white/5 opacity-0 group-hover:opacity-100"
                    title="Copiar Script"
                  >
                    <Copy size={16} />
                  </button>
                </div>
                
                <p className="text-[10px] text-text-muted uppercase font-bold tracking-widest text-center mt-2">
                  ✍️ Orquestrado por Copy Chief — Framework Schwartz + Halbert
                </p>
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center gap-4 opacity-20">
                <Loader2 className="animate-spin" />
                <p className="text-xs font-black uppercase tracking-widest">Os scripts de elite serão forjados após a qualificação</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Sidebar */}
        <div className="flex flex-col gap-6">
          
          {/* Action Card */}
          <div className="glass border border-green-500/20 bg-green-500/[0.02] p-6 rounded-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-green-500 mb-4">Ação de Alta Intencionalidade</p>
            <a 
              href={`https://wa.me/55${lead.phone?.replace(/\D/g, "")}?text=${encodeURIComponent(activeTab === "initial" ? initial : followup)}`}
              target="_blank"
              className="btn-finch bg-green-600 hover:bg-green-500 border-green-400 w-full py-5 flex items-center justify-center gap-3 text-xs"
            >
              <MessageSquare size={18} />
              Enviar pelo WhatsApp
            </a>
            <p className="text-[9px] text-center text-text-muted mt-4 uppercase font-bold tracking-[0.1em] leading-tight">
              A copy ativa ({activeTab === "initial" ? "Inicial" : "Follow-up"}) será enviada automaticamente.
            </p>
          </div>

          {/* Lead Data Card */}
          <div className="glass border border-white/5 p-6 rounded-sm flex flex-col gap-6">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-text-muted border-b border-white/5 pb-4">Raio-X do Prospecto</h4>
            
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">Domínio Ativo</span>
              <a href={lead.website} target="_blank" className="text-sm font-bold text-primary hover:underline flex items-center gap-2 truncate">
                {lead.website || "Sem Website"} <ExternalLink size={12} />
              </a>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">Linha Direta</span>
              <span className="text-sm font-bold flex items-center gap-2">
                <Phone size={12} className="text-text-muted" /> {lead.phone || "Indisponível"}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">Localização Geográfica</span>
              <span className="text-xs font-bold text-white/80 leading-tight flex items-start gap-2">
                <MapPin size={14} className="text-text-muted shrink-0 mt-0.5" /> {lead.address || "N/A"}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">Social Proof (Google)</span>
              <div className="flex items-center gap-1.5 mt-1">
                <Star className="text-yellow-500" size={14} fill="currentColor" />
                <span className="text-sm font-black">{lead.rating || "—"}</span>
                <span className="text-[10px] text-text-muted font-bold">({lead.reviews_count || 0} reviews)</span>
              </div>
            </div>
          </div>

          {/* Follow-up Reminder */}
          <div className="glass border border-orange-500/20 p-6 rounded-sm">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="text-orange-500" size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest text-orange-400">Janela de Conversão</span>
            </div>
            <p className="text-[10px] text-white/60 leading-relaxed font-bold">
              Leads de eventos esfriam em 48h. Se não responderem ao primeiro script, use o **Follow-up** após 24h para reativar o gatilho de perda.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
