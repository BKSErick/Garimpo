"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, ChevronLeft, Search, Target, Rocket, CheckCircle2, Loader2 } from "lucide-react";

const STEPS = [
  { id: 1, name: "Produto", description: "O que você vende?", icon: Rocket },
  { id: 2, name: "Público (ICP)", description: "Para quem você vende?", icon: Target },
  { id: 3, name: "Garimpo", description: "Onde vamos buscar?", icon: Search },
];

export default function NovaCampanhaPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    product: "",
    icp: "",
    query: "",
    location: "São Paulo, SP",
    autoQualify: true
  });

  const nextStep = () => setStep(s => Math.min(s + 1, 3));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleCreate = async () => {
    if (!formData.query.trim()) { setError("Defina a busca da campanha."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/prospect", {
        method: "POST",
        body: JSON.stringify({ 
          query: formData.query.trim(),
          product: formData.product,
          icp: formData.icp,
          location: formData.location,
          autoQualify: formData.autoQualify
        }),
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      if (data.success) {
        router.push(`/dashboard/campanhas/${data.campaignId}`);
      } else {
        setError(data.error || "Erro ao criar campanha.");
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-12">
        <button onClick={() => router.back()} className="text-[10px] text-text-muted uppercase tracking-widest hover:text-primary mb-4 flex items-center gap-2">
          <ChevronLeft size={12} /> Voltar ao Painel
        </button>
        <h2 className="text-5xl font-black tracking-tighter">Garimpar Leads</h2>
        <p className="text-sm text-text-muted mt-2">Siga os passos para configurar seu motor de prospecção de alta conversão.</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-4 mb-12">
        {STEPS.map((s, idx) => (
          <div key={s.id} className="flex items-center gap-4 flex-1">
            <div className={`flex items-center gap-3 transition-all ${step >= s.id ? "opacity-100" : "opacity-30"}`}>
              <div className={`w-10 h-10 rounded-sm flex items-center justify-center border ${step === s.id ? "border-primary bg-primary/10 text-primary" : step > s.id ? "border-green-500 bg-green-500/10 text-green-500" : "border-white/10"}`}>
                {step > s.id ? <CheckCircle2 size={18} /> : <s.icon size={18} />}
              </div>
              <div className="hidden md:block">
                <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">{s.name}</p>
                <p className="text-[9px] text-text-muted uppercase tracking-wider whitespace-nowrap">{s.description}</p>
              </div>
            </div>
            {idx < STEPS.length - 1 && <div className={`h-[1px] flex-1 bg-white/10 mx-2 ${step > s.id ? "bg-green-500/30" : ""}`} />}
          </div>
        ))}
      </div>

      {/* Form Content */}
      <div className="glass border border-primary/10 p-10 rounded-sm min-h-[400px] flex flex-col">
        {step === 1 && (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h3 className="text-2xl font-black tracking-tight mb-2">Descreva seu Produto ou Serviço</h3>
              <p className="text-sm text-text-muted">A nossa IA usará isso para encontrar os melhores argumentos de venda (Falsa Ruína).</p>
            </div>
            <textarea
              placeholder="Ex: Oferecemos automação de atendimento via WhatsApp para buffets de festas infantis, garantindo que nenhum lead seja perdido no final de semana..."
              className="input-finch min-h-[150px] resize-none text-base"
              value={formData.product}
              onChange={e => setFormData({ ...formData, product: e.target.value })}
            />
            <div className="flex flex-wrap gap-2">
              {["Agência de Marketing", "SaaS B2B", "Consultoria", "Serviços Industriais"].map(t => (
                <button key={t} onClick={() => setFormData({...formData, product: t})} className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest border border-primary/10 hover:border-primary/30 text-text-muted rounded-sm">{t}</button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div>
              <h3 className="text-2xl font-black tracking-tight mb-2">Defina seu Cliente Ideal (ICP)</h3>
              <p className="text-sm text-text-muted">Quem tem o maior problema que seu produto resolve? Seja específico.</p>
            </div>
            <textarea
              placeholder="Ex: Donos de buffets de médio porte em capitais, que têm mais de 10 eventos por mês e sofrem com a demora no atendimento comercial..."
              className="input-finch min-h-[150px] resize-none text-base"
              value={formData.icp}
              onChange={e => setFormData({ ...formData, icp: e.target.value })}
            />
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div>
              <h3 className="text-2xl font-black tracking-tight mb-2">Configurações de Busca</h3>
              <p className="text-sm text-text-muted">Onde e o que vamos buscar no Google Maps para extrair os leads?</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-primary/80">O que buscar?</label>
                <input
                  type="text"
                  placeholder='Ex: "Buffets infantis"'
                  className="input-finch"
                  value={formData.query}
                  onChange={e => setFormData({ ...formData, query: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-primary/80">Localização</label>
                <input
                  type="text"
                  placeholder='Ex: "São Paulo, SP"'
                  className="input-finch"
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/10 rounded-sm mt-4">
              <input 
                type="checkbox" 
                id="autoQualify" 
                className="w-4 h-4 accent-primary" 
                checked={formData.autoQualify}
                onChange={e => setFormData({...formData, autoQualify: e.target.checked})}
              />
              <label htmlFor="autoQualify" className="text-xs font-bold uppercase tracking-widest cursor-pointer">
                Qualificar automaticamente com IA (Recomendado)
              </label>
            </div>
          </div>
        )}

        <div className="mt-auto pt-10 flex justify-between items-center border-t border-white/5">
          {step > 1 ? (
            <button onClick={prevStep} className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-text-muted hover:text-primary transition-all">
              <ChevronLeft size={16} /> Voltar
            </button>
          ) : <div />}

          <div className="flex gap-4">
            {step < 3 ? (
              <button 
                onClick={nextStep} 
                className="btn-finch flex items-center gap-2"
                disabled={step === 1 && !formData.product.trim() || step === 2 && !formData.icp.trim()}
              >
                Próximo Passo <ChevronRight size={16} />
              </button>
            ) : (
              <button 
                onClick={handleCreate} 
                className="btn-finch flex items-center gap-2"
                disabled={loading || !formData.query.trim()}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={16} /> Iniciando Garimpo...
                  </>
                ) : (
                  <>
                    <Rocket size={16} /> Começar o Garimpo
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-sm">
          <p className="text-red-400 text-[10px] uppercase font-black tracking-widest text-center">{error}</p>
        </div>
      )}
    </div>
  );
}
