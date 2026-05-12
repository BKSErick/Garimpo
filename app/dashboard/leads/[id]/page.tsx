"use client";

export const runtime = 'edge';

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ChevronLeft, 
  MessageSquare, 
  Globe, 
  MapPin, 
  Target, 
  Zap, 
  Activity, 
  ShieldCheck, 
  Copy, 
  ExternalLink,
  Loader2,
  Trash2,
  BrainCircuit,
  Terminal,
  Search,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  Star,
  AlertTriangle,
  Calendar,
  Phone,
  ShieldAlert
} from "lucide-react";
import { CardMiner, CardMinerHeader, CardMinerTitle } from "@/components/ui/CardMiner";
import { BadgeMiner } from "@/components/ui/BadgeMiner";
import { ButtonMiner } from "@/components/ui/ButtonMiner";

export default function LeadDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [lead, setLead] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [qualifying, setQualifying] = useState(false);
  const [activeTab, setActiveTab] = useState<"initial" | "followup">("initial");
  const [refreshingCopy, setRefreshingCopy] = useState(false);
  const [copied, setCopied] = useState(false);

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

  const handleRegenerateCopy = async () => {
    setRefreshingCopy(true);
    try {
      const r = await fetch(`/api/leads/${id}/regenerate-copy`, { method: "POST" });
      if (r.ok) fetchLead();
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshingCopy(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    if (!confirm("Confirmar descarte definitivo deste minério?")) return;
    const res = await fetch(`/api/leads/${id}`, { method: "DELETE" });
    if (res.ok) router.push("/dashboard/leads");
  };

  const parseCopy = (copyString: string) => {
    if (!copyString) return { initial: "", followup: "" };
    const parts = copyString.split(/\[MENSAGEM 2\]/i);
    const initial = parts[0]?.replace(/\[MENSAGEM 1\]/i, "").trim() || "";
    const followup = parts[1]?.trim() || "";
    return { initial, followup };
  };

  const { initial, followup } = parseCopy(lead?.whatsapp_copy);
  const activeText = activeTab === "initial" ? initial : followup;

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-black gap-6">
      <div className="relative">
        <div className="absolute inset-0 bg-primary blur-3xl opacity-20 animate-pulse" />
        <Loader2 className="animate-spin text-primary relative" size={64} />
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-text-muted animate-pulse">Descriptografando Dossiê...</p>
    </div>
  );

  if (!lead) return (
    <div className="p-8 flex flex-col items-center justify-center min-h-screen gap-4 bg-black">
      <AlertTriangle className="text-error" size={48} />
      <p className="text-xl font-black uppercase tracking-tight text-white">Lead não encontrado na base.</p>
      <ButtonMiner variant="outline" onClick={() => router.push('/dashboard/leads')}>VOLTAR PARA A BASE</ButtonMiner>
    </div>
  );

  return (
    <div className="p-8 flex flex-col gap-10 max-w-7xl mx-auto animate-in fade-in duration-1000">
      {/* Navigation HUD */}
      <div className="flex justify-between items-center bg-white/[0.01] border border-white/5 p-4 rounded-sm backdrop-blur-md sticky top-4 z-50">
        <button 
          onClick={() => router.push('/dashboard/leads')}
          className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted hover:text-white transition-all group"
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform text-primary" />
          Retornar à Base
        </button>
        <div className="flex gap-3">
          <ButtonMiner variant="outline" icon={Trash2} onClick={handleDelete} className="text-error/60 border-error/20 hover:bg-error/10 hover:text-error hover:border-error/40 h-10 text-[9px]">
            DESCARTAR
          </ButtonMiner>
          <ButtonMiner 
            variant="primary" 
            icon={MessageSquare} 
            onClick={() => {
              const phone = lead.phone?.replace(/\D/g, "");
              window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(activeText)}`, "_blank");
            }} 
            className="h-10 text-[9px]"
          >
            ABORDAGEM DIRETA
          </ButtonMiner>
        </div>
      </div>

      {/* Hero Header */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-transparent blur-3xl opacity-0 group-hover:opacity-100 transition-all duration-1000" />
        <CardMiner elevated className="p-10 border-primary/10 overflow-hidden bg-white/[0.01]">
          <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
             <BrainCircuit size={200} className="text-primary" />
          </div>
          
          <div className="flex flex-col md:flex-row gap-10 relative">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-6">
                <BadgeMiner variant={lead.status === 'qualificado' ? 'primary' : 'muted'} className="text-[10px] px-4 py-1.5 shadow-purple">
                  {lead.status === 'qualificado' ? 'MINÉRIO QUALIFICADO' : lead.status.toUpperCase()}
                </BadgeMiner>
                <div className="h-px flex-1 bg-white/5" />
              </div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase text-white leading-tight">
                {lead.name}
              </h1>
              <div className="flex flex-wrap gap-6 mt-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/5 border border-white/5 rounded-sm text-primary">
                    <Target size={16} />
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-text-muted uppercase tracking-widest">Nicho Alvo</p>
                    <p className="text-xs font-black text-white uppercase">{lead.niche || "Não mapeado"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/5 border border-white/5 rounded-sm text-primary">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-text-muted uppercase tracking-widest">Localização</p>
                    <p className="text-xs font-black text-white uppercase">{lead.address?.split(',')[1]?.trim() || "Global"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/5 border border-white/5 rounded-sm text-primary">
                    <Globe size={16} />
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-text-muted uppercase tracking-widest">Digital Presence</p>
                    {lead.website ? (
                      <a href={lead.website} target="_blank" rel="noreferrer" className="text-xs font-black text-primary hover:underline flex items-center gap-1 uppercase">
                        Visitar Portal <ExternalLink size={10} />
                      </a>
                    ) : (
                      <p className="text-xs font-black text-text-muted uppercase">Offline</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full md:w-80 flex flex-col justify-center items-center p-8 bg-white/[0.02] border border-white/5 rounded-sm backdrop-blur-xl relative overflow-hidden group/score">
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover/score:opacity-100 transition-all duration-700" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted mb-4 relative">Miner Accuracy</p>
              <div className="relative flex items-center justify-center">
                <svg className="w-40 h-40 transform -rotate-90">
                  <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="2" fill="transparent" className="text-white/5" />
                  <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray={440} strokeDashoffset={440 - (440 * (lead.score || 0)) / 100} className="text-primary shadow-purple transition-all duration-[2000ms] ease-out" />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-5xl font-black text-white tracking-tighter">{lead.score || 0}%</span>
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest">{lead.score >= 80 ? 'Grade A+' : lead.score >= 60 ? 'Grade B' : 'Grade C'}</span>
                </div>
              </div>
              <p className="text-[9px] font-bold text-primary mt-6 tracking-widest relative uppercase">Score de Conversão</p>
            </div>
          </div>
        </CardMiner>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Deep Intelligence Section */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          <CardMiner elevated className="p-8 border-primary/10 bg-primary/[0.02]">
             <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4 text-left">
                  <div className="w-14 h-14 rounded-sm bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-purple-sm">
                    <Zap size={28} />
                  </div>
                  <div>
                    <h4 className="text-lg font-black uppercase tracking-tight text-white">Centro de Inteligência</h4>
                    <p className="text-[10px] text-text-muted uppercase font-bold tracking-widest">IA forjou o script ideal baseado nos pontos cegos detectados.</p>
                  </div>
                </div>
                <ButtonMiner 
                  onClick={handleQualify}
                  isLoading={qualifying}
                  icon={RefreshCw}
                  variant="primary"
                  className="h-14 px-10 shadow-purple"
                >
                  {lead.status === 'qualificado' ? "RECALCULAR INTELIGÊNCIA" : "GERAR DIAGNÓSTICO"}
                </ButtonMiner>
             </div>
          </CardMiner>

          <CardMiner elevated className="p-8 border-white/5 bg-white/[0.01]">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 border border-primary/20 rounded-sm text-primary">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white tracking-tight uppercase">Scripts de Abordagem</h3>
                  <p className="text-[9px] text-text-muted font-bold uppercase tracking-[0.2em] mt-1">Sequência validada de alta conversão</p>
                </div>
              </div>
              {lead.status === 'qualificado' && (
                <button
                  onClick={handleRegenerateCopy}
                  disabled={refreshingCopy}
                  className="group flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/5 rounded-sm text-[9px] font-black uppercase tracking-[0.2em] text-text-muted hover:text-white transition-all"
                >
                  <RefreshCw size={12} className={refreshingCopy ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"} />
                  REGERAR VARIAÇÃO
                </button>
              )}
            </div>

            <div className="space-y-8">
              {lead.whatsapp_copy ? (
                <div className="flex flex-col gap-6">
                  <div className="flex p-1 bg-white/5 border border-white/5 rounded-sm w-fit">
                    {[
                      { id: "initial", label: "Abordagem 1", icon: Zap },
                      { id: "followup", label: "Follow-up", icon: Activity }
                    ].map(t => (
                      <button
                        key={t.id}
                        onClick={() => setActiveTab(t.id as any)}
                        className={`flex items-center gap-2 px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-sm transition-all ${
                          activeTab === t.id ? "bg-primary text-white shadow-purple" : "text-text-muted hover:text-white hover:bg-white/5"
                        }`}
                      >
                        <t.icon size={12} />
                        {t.label}
                      </button>
                    ))}
                  </div>

                  <div className="relative group/copy">
                    <div className="bg-black border border-white/10 p-10 rounded-sm italic text-white/90 text-lg leading-relaxed font-medium relative overflow-hidden group-hover/copy:border-primary/20 transition-all">
                       <div className="absolute top-4 left-4 opacity-5 pointer-events-none">
                          <MessageSquare size={100} />
                       </div>
                       <span className="relative z-10 whitespace-pre-wrap">"{activeText || "Aguardando geração de sequência..."}"</span>
                       
                       <div className="absolute top-6 right-6 flex gap-2">
                          <button 
                            onClick={() => copyToClipboard(activeText)}
                            className="p-3 bg-white/5 border border-white/10 text-text-muted hover:text-primary hover:border-primary/40 rounded-sm transition-all"
                            title="Copiar para o arsenal"
                          >
                            {copied ? <CheckCircle2 size={18} className="text-success" /> : <Copy size={18} />}
                          </button>
                       </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 pt-4">
                    <ButtonMiner 
                      onClick={() => {
                        const phone = lead.phone?.replace(/\D/g, "");
                        window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(activeText)}`, "_blank");
                      }}
                      icon={MessageSquare}
                      className="bg-success hover:bg-success/80 border-success/20 h-16 px-10 flex-1 shadow-sm"
                    >
                      ATACAR VIA WHATSAPP
                    </ButtonMiner>
                    <ButtonMiner 
                      variant="outline"
                      onClick={() => copyToClipboard(activeText)}
                      icon={Copy}
                      className="h-16 px-10"
                    >
                      {copied ? "COPIADO!" : "COPIAR SCRIPT"}
                    </ButtonMiner>
                  </div>
                </div>
              ) : (
                <div className="py-32 flex flex-col items-center justify-center text-center gap-6 opacity-20">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary blur-2xl opacity-20 animate-pulse" />
                    <Loader2 className="animate-spin text-primary relative" size={48} />
                  </div>
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-text-muted">Forjando Scripts de Alta Conversão...</p>
                </div>
              )}
            </div>
          </CardMiner>

          {/* Diagnosis HUDs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <CardMiner elevated className="p-8 border-error/10 bg-error/[0.01] hover:bg-error/[0.02] transition-all">
              <div className="flex items-center gap-3 mb-6">
                <ShieldAlert className="text-error" size={20} />
                <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-white">Pontos Cegos (Falsa Ruína)</h3>
              </div>
              <p className="text-sm text-text-muted leading-relaxed font-medium">
                {lead.flaws || "Análise de vulnerabilidade pendente. Execute o diagnóstico para mapear falhas críticas no posicionamento atual."}
              </p>
            </CardMiner>

            <CardMiner elevated className="p-8 border-primary/10 bg-primary/[0.01] hover:bg-primary/[0.02] transition-all">
              <div className="flex items-center gap-3 mb-6">
                <Target className="text-primary" size={20} />
                <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-white">Mecanismo Único Proposto</h3>
              </div>
              <p className="text-sm text-text-muted italic leading-relaxed font-medium">
                "{lead.unique_mechanism || "O mecanismo único será forjado após o mapeamento das falhas críticas do prospecto."}"
              </p>
            </CardMiner>
          </div>

          {/* Technical Logs */}
          <CardMiner className="p-8 bg-black border-white/5 overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/5 border border-white/5 rounded-sm text-text-muted">
                  <Terminal size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">Logs de Sistema</h3>
                  <p className="text-[8px] text-text-muted font-bold uppercase tracking-[0.2em] mt-1">Rastro de extração de dados</p>
                </div>
              </div>
              <BadgeMiner variant="muted" className="text-[8px]">STABLE BUILD v4.2</BadgeMiner>
            </div>
            
            <div className="space-y-4 font-mono text-[10px] text-text-muted/60 max-h-[250px] overflow-y-auto custom-scrollbar pr-4">
               <div className="flex gap-4 p-3 border-l border-primary/20 hover:bg-white/[0.02] transition-all">
                  <span className="text-primary font-bold">15:02:44</span>
                  <span>[CORE] Inicializando Deep Mining para ID: {id.slice(0, 8)}...</span>
               </div>
               <div className="flex gap-4 p-3 border-l border-primary/20 hover:bg-white/[0.02] transition-all">
                  <span className="text-primary font-bold">15:02:48</span>
                  <span>[SCAN] Localizando metadados digitais e presença social...</span>
               </div>
               <div className="flex gap-4 p-3 border-l border-success/20 hover:bg-white/[0.02] transition-all">
                  <span className="text-success font-bold">15:02:55</span>
                  <span>[SUCCESS] Captura de {lead.name} finalizada com sucesso.</span>
               </div>
               <div className="flex gap-4 p-3 border-l border-primary/50 bg-primary/5 text-white">
                  <span className="text-primary font-bold">15:03:01</span>
                  <span>[AI] Diagnóstico gerado. Score calculado: {lead.score || 0}%</span>
               </div>
            </div>
          </CardMiner>
        </div>

        {/* Side Stats */}
        <div className="flex flex-col gap-8">
          <CardMiner elevated className="p-8 border-white/5 bg-white/[0.01]">
            <h3 className="text-[11px] font-black text-white uppercase tracking-[0.25em] mb-8 flex items-center gap-3 border-b border-white/5 pb-6">
               <Activity size={14} className="text-primary" />
               Dados Técnicos
            </h3>
            <div className="space-y-8">
              {[
                { label: "Domínio Principal", value: lead.website, icon: Globe, isLink: true },
                { label: "Linha Primária", value: lead.phone, icon: Phone },
                { label: "Social Proof", value: `${lead.rating || "—"} (${lead.reviews_count || 0} reviews)`, icon: Star },
                { label: "Origem do Minério", value: lead.query_origin || "Google Maps", icon: Search },
              ].map((m, i) => (
                <div key={i} className="flex flex-col gap-2 group/stat">
                   <div className="flex items-center gap-3">
                      <m.icon size={12} className="text-text-muted group-hover/stat:text-primary transition-colors" />
                      <span className="text-[8px] font-black uppercase text-text-muted tracking-[0.2em]">{m.label}</span>
                   </div>
                   {m.isLink && m.value ? (
                     <a href={m.value} target="_blank" className="text-xs font-black text-white hover:text-primary transition-colors truncate uppercase tracking-tight">
                       {m.value.replace(/^https?:\/\//, '')}
                     </a>
                   ) : (
                     <span className="text-xs font-black text-white uppercase tracking-tight">{m.value || "OCULTO"}</span>
                   )}
                </div>
              ))}
            </div>
            
            <div className="mt-10 pt-10 border-t border-white/5">
               <h3 className="text-[11px] font-black text-white uppercase tracking-[0.25em] mb-6 flex items-center gap-3">
                  <ShieldCheck size={14} className="text-primary" />
                  Validação de Rede
               </h3>
               <div className="flex flex-wrap gap-2">
                  {["API Serper", "Enriquecido", "Qualified", "Ready"].map(f => (
                    <BadgeMiner key={f} variant="muted" className="text-[8px] bg-white/5 border-white/10">{f}</BadgeMiner>
                  ))}
               </div>
            </div>
          </CardMiner>

          <CardMiner elevated className="p-8 border-orange-500/20 bg-orange-500/[0.02] flex flex-col gap-4">
             <div className="flex items-center gap-3">
                <Calendar size={16} className="text-orange-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-400">Janela de Oportunidade</span>
             </div>
             <p className="text-[10px] text-white/70 leading-relaxed font-bold uppercase tracking-wider">
               Leads frios em 48h. Se não houver conversão imediata, execute o <span className="text-orange-400">Follow-up Estratégico</span> em exatamente 24h para reativar o gatilho de urgência.
             </p>
          </CardMiner>

          <CardMiner className="p-10 border-white/5 bg-gradient-to-br from-primary/10 to-transparent flex flex-col items-center text-center group/cta">
             <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-6 border border-primary/30 group-hover/cta:scale-110 transition-transform duration-500 shadow-purple">
                <Zap size={32} className="text-primary" />
             </div>
             <h4 className="text-lg font-black text-white uppercase tracking-tighter mb-4">Ação Recomenda</h4>
             <p className="text-[10px] text-text-muted font-bold leading-relaxed mb-8 uppercase tracking-widest">
                Alta prontidão digital detectada. Inicie a abordagem agora.
             </p>
             <ButtonMiner 
                icon={Zap} 
                onClick={() => {
                  const phone = lead.phone?.replace(/\D/g, "");
                  window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(activeText)}`, "_blank");
                }} 
                className="w-full h-16 text-xs shadow-purple"
              >
                EXECUTAR ABORDAGEM
             </ButtonMiner>
          </CardMiner>
        </div>
      </div>
    </div>
  );
}
