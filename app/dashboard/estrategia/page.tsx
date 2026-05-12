"use client";

export const runtime = 'edge';

import { useState, useEffect } from "react";
import { 
  Sparkles, 
  Brain, 
  Target, 
  Zap, 
  CheckCircle2, 
  ShieldCheck,
  Cpu,
  Fingerprint,
  Radar,
  Save,
  Copy,
  Plus,
  Trash2,
  ChevronRight,
  Database,
  History
} from "lucide-react";

import { CardMiner } from "@/components/ui/CardMiner";
import { ButtonMiner } from "@/components/ui/ButtonMiner";
import { BadgeMiner } from "@/components/ui/BadgeMiner";

export default function EstrategiaPage() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [library, setLibrary] = useState<any[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  
  const [result, setResult] = useState<any>(null);
  const [form, setForm] = useState({
    business: "",
    price: "",
    decisionMaker: "",
    mainProblem: "",
    competitors: ""
  });

  // Carregar Biblioteca
  const loadLibrary = async () => {
    try {
      const res = await fetch("/api/strategy/save");
      const json = await res.json();
      if (json.success) {
        setLibrary(json.data);
        // Se houver itens, mas nenhum ativo, não carregar nada pra deixar o form limpo se quiser
      }
    } catch (e) {
      console.warn("Falha ao carregar biblioteca.");
    }
  };

  useEffect(() => {
    loadLibrary();
  }, []);

  const updateForm = (updates: Partial<typeof form>) => {
    setForm({ ...form, ...updates });
  };

  const handleNew = () => {
    setActiveId(null);
    setResult(null);
    setForm({
      business: "",
      price: "",
      decisionMaker: "",
      mainProblem: "",
      competitors: ""
    });
  };

  const selectPersona = (persona: any) => {
    setActiveId(persona.id);
    setForm(persona.briefing);
    setResult(persona.result);
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/strategy/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.strategy) {
        setResult(data.strategy);
        
        // AUTO-SAVE: Salvar automaticamente na biblioteca após gerar
        const saveRes = await fetch("/api/strategy/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            id: activeId,
            briefing: form, 
            result: data.strategy,
            name: `Persona: ${form.business.substring(0, 15)}`
          })
        });
        const saveData = await saveRes.json();
        if (saveData.success) {
          setActiveId(saveData.data.id);
          loadLibrary();
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        id: activeId || undefined, // Deixa o banco gerar se for novo
        briefing: form,
        result,
        name: `Persona: ${form.business.substring(0, 15)}`
      };

      // Se o banco está dando erro de ID nulo, vamos forçar um ID aqui como segurança
      if (!payload.id) {
        payload.id = crypto.randomUUID();
      }

      const res = await fetch("/api/strategy/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (data.success) {
        setActiveId(data.data.id);
        loadLibrary();
      } else {
        console.error("ERRO NO BANCO:", data.error);
        alert(`ERRO DE SINCRONIA: ${data.error || "Verifique os logs do servidor"}`);
        // Fallback LocalStorage
        const currentLibrary = [...library];
        const newEntry = { ...payload, id: activeId || Date.now().toString(), updated_at: new Date().toISOString() };
        const updated = activeId ? currentLibrary.map(l => l.id === activeId ? newEntry : l) : [newEntry, ...currentLibrary];
        setLibrary(updated as any);
        localStorage.setItem('garimpo_strategy_backup', JSON.stringify(updated));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Excluir esta inteligência?")) return;
    try {
      await fetch("/api/strategy/save", {
        method: "DELETE",
        body: JSON.stringify({ id })
      });
      loadLibrary();
      if (activeId === id) handleNew();
    } catch (e) {
      alert("Erro ao excluir.");
    }
  };

  const renderContent = (content: any) => {
    if (typeof content === 'object' && content !== null) {
      return Object.entries(content).map(([key, val]) => `${key}: ${val}`).join('\n');
    }
    return content;
  };

  const handleCopy = () => {
    if (!result) return;
    const text = `ICP: ${renderContent(result.icp)}\n\nPERSONA: ${renderContent(result.persona)}\n\nÂNGULO: ${renderContent(result.angle)}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col gap-10 animate-in fade-in duration-1000">
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
             <BadgeMiner variant="primary" className="py-1 px-3 text-[9px] uppercase font-black tracking-widest">Strategic Intelligence</BadgeMiner>
             <div className="h-4 w-px bg-white/10" />
             <span className="text-text-muted text-[10px] font-black uppercase tracking-widest opacity-40">Módulo Neural v2.0</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter uppercase leading-none text-white">
            LAB <span className="text-primary">ESTRATÉGICO</span>
          </h1>
        </div>

        <ButtonMiner onClick={handleNew} variant="outline" icon={Plus} className="h-14 px-8 text-xs tracking-widest">
           NOVA ESTRATÉGIA
        </ButtonMiner>
      </div>

      {/* Biblioteca Section */}
      <div className="space-y-4">
         <div className="flex items-center gap-3 opacity-40">
            <History size={14} className="text-primary" />
            <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Sua Biblioteca de Inteligência</h3>
         </div>
         
         <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {library.map((item, index) => (
               <div 
                  key={item.id}
                  onClick={() => selectPersona(item)}
                  className={`relative p-4 rounded-sm border cursor-pointer transition-all group overflow-hidden ${
                    activeId === item.id 
                    ? "bg-primary/10 border-primary shadow-[0_0_20px_rgba(139,92,246,0.15)]" 
                    : "bg-black/40 border-white/5 hover:border-white/20"
                  }`}
               >
                  <div className="flex flex-col gap-1 relative z-10">
                     <p className="text-[8px] font-black text-primary uppercase tracking-widest">Persona {String(index + 1).padStart(2, '0')}</p>
                     <p className="text-[10px] font-bold text-white uppercase truncate pr-4">{item.name?.split(':')[1]?.trim() || "Nova Síntese"}</p>
                     <p className="text-[8px] text-white/30 font-medium">{new Date(item.updated_at).toLocaleDateString()}</p>
                  </div>
                  <button 
                     onClick={(e) => handleDelete(item.id, e)}
                     className="absolute top-2 right-2 p-1 text-white/10 hover:text-red-500 transition-colors z-20"
                  >
                     <Trash2 size={12} />
                  </button>
                  {activeId === item.id && (
                     <div className="absolute bottom-0 right-0 p-1">
                        <CheckCircle2 size={10} className="text-primary" />
                     </div>
                  )}
               </div>
            ))}
            {library.length === 0 && (
               <div className="col-span-full p-8 border border-dashed border-white/5 rounded-sm flex flex-col items-center justify-center opacity-20">
                  <Database size={24} className="mb-2" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Nenhuma estratégia salva ainda.</p>
               </div>
            )}
         </div>
      </div>

      <div className="grid lg:grid-cols-[1.2fr_1fr] gap-10">
        
        {/* Briefing Form */}
        <div className="space-y-8">
          <CardMiner elevated className="p-10 space-y-10 border-white/5 relative">
            <div className="flex items-center justify-between border-b border-white/5 pb-6">
               <div className="flex items-center gap-4">
                  <Fingerprint size={24} className="text-primary" />
                  <h2 className="text-xl font-black text-white uppercase tracking-tighter">Parâmetros de Síntese</h2>
               </div>
               {activeId && <BadgeMiner variant="outline" className="text-[8px] text-primary border-primary/20">EDITANDO SALVO</BadgeMiner>}
            </div>

            <div className="space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">O que sua empresa faz exatamente?</label>
                <textarea 
                  className="w-full bg-black/60 border border-white/10 rounded-sm p-4 text-xs text-white placeholder:text-white/10 focus:border-primary/50 transition-all outline-none min-h-[100px] uppercase font-medium resize-none"
                  placeholder="Ex: Agência de tráfego especializada em negócios locais de alto padrão."
                  value={form.business}
                  onChange={(e) => updateForm({ business: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Ticket Médio (R$)</label>
                  <input 
                    type="text"
                    className="w-full bg-black/60 border border-white/10 rounded-sm p-4 text-xs text-white placeholder:text-white/10 focus:border-primary/50 transition-all outline-none uppercase font-medium"
                    placeholder="Ex: R$ 3.000,00"
                    value={form.price}
                    onChange={(e) => updateForm({ price: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Quem decide a compra? (Cargo)</label>
                  <input 
                    type="text"
                    className="w-full bg-black/60 border border-white/10 rounded-sm p-4 text-xs text-white placeholder:text-white/10 focus:border-primary/50 transition-all outline-none uppercase font-medium"
                    placeholder="Ex: Dono da empresa / Diretor MKT"
                    value={form.decisionMaker}
                    onChange={(e) => updateForm({ decisionMaker: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Qual o maior problema que você resolve?</label>
                <textarea 
                  className="w-full bg-black/60 border border-white/10 rounded-sm p-4 text-xs text-white placeholder:text-white/10 focus:border-primary/50 transition-all outline-none min-h-[100px] uppercase font-medium resize-none"
                  placeholder="Ex: O cliente tem volume de leads mas nenhum qualificado."
                  value={form.mainProblem}
                  onChange={(e) => updateForm({ mainProblem: e.target.value })}
                />
              </div>

              <div className="flex gap-4">
                 <ButtonMiner 
                   onClick={handleGenerate}
                   isLoading={loading}
                   disabled={loading || !form.business}
                   icon={Zap}
                   className="flex-1 h-16 shadow-purple text-[10px] tracking-[0.3em]"
                 >
                   {loading ? "SINTETIZANDO..." : "GERAR ESTRATÉGIA"}
                 </ButtonMiner>
                 
                 {result && (
                    <ButtonMiner 
                      onClick={handleSave}
                      isLoading={saving}
                      variant="outline"
                      icon={Save}
                      className="h-16 px-8 text-[10px] tracking-[0.3em]"
                    >
                      SALVAR
                    </ButtonMiner>
                 )}
              </div>
            </div>
          </CardMiner>
        </div>

        {/* Result Area */}
        <div className="space-y-8">
           {result ? (
              <CardMiner elevated className="p-10 space-y-10 border-primary/20 bg-primary/[0.01] animate-in slide-in-from-right-10 duration-700">
                 <div className="flex items-center justify-between border-b border-white/5 pb-8">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-sm bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                          <Target size={24} />
                       </div>
                       <div>
                          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">DOSSIÊ</h2>
                          <p className="text-[9px] text-text-muted uppercase font-black tracking-widest opacity-40">Neural Synthesis Output</p>
                       </div>
                    </div>
                    <ButtonMiner 
                       onClick={handleCopy} 
                       variant="outline" 
                       icon={copied ? CheckCircle2 : Copy} 
                       className={`h-10 px-6 text-[10px] transition-all ${copied ? "border-success text-success" : ""}`}
                    >
                       {copied ? "COPIADO!" : "COPIAR TUDO"}
                    </ButtonMiner>
                 </div>

                 <div className="space-y-8">
                    <div className="space-y-4">
                       <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">01. ICP</h3>
                       <div className="p-6 bg-black/40 border border-white/5 rounded-sm">
                          <p className="text-xs text-white/80 leading-relaxed font-medium whitespace-pre-line uppercase tracking-tight">
                             {renderContent(result.icp)}
                          </p>
                       </div>
                    </div>
                    <div className="space-y-4">
                       <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">02. PERSONA</h3>
                       <div className="p-6 bg-black/40 border border-white/5 rounded-sm">
                          <p className="text-xs text-white/80 leading-relaxed font-medium whitespace-pre-line uppercase tracking-tight">
                             {renderContent(result.persona)}
                          </p>
                       </div>
                    </div>
                    <div className="p-6 bg-primary/5 border border-primary/10 rounded-sm space-y-3">
                       <div className="flex items-center gap-2">
                          <Sparkles size={14} className="text-primary" />
                          <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">ÂNGULO DE ATAQUE</h4>
                       </div>
                       <p className="text-[10px] text-primary font-black uppercase tracking-widest leading-relaxed">
                          {renderContent(result.angle)}
                       </p>
                    </div>
                 </div>
              </CardMiner>
           ) : (
              <div className="h-full border border-dashed border-white/5 rounded-sm flex flex-col items-center justify-center p-20 opacity-20 text-center">
                 <Radar size={48} className="mb-6 animate-pulse text-primary" />
                 <h3 className="text-sm font-black uppercase tracking-[0.4em] mb-2 text-white">Aguardando Parâmetros</h3>
                 <p className="text-[10px] uppercase font-bold tracking-widest leading-loose">
                    Preencha o briefing à esquerda para<br/>destilar a inteligência estratégica.
                 </p>
              </div>
           )}
        </div>
      </div>
    </div>
  );
}
