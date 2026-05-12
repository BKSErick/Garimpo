"use client";

export const runtime = 'edge';

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Rocket,
  Search,
  ChevronLeft,
  Target,
  Globe,
  Zap,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Cpu,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Radar
} from "lucide-react";

import { CardMiner, CardMinerHeader, CardMinerTitle } from "@/components/ui/CardMiner";
import { ButtonMiner } from "@/components/ui/ButtonMiner";
import { BadgeMiner } from "@/components/ui/BadgeMiner";

export default function NovaCampanhaPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [niche, setNiche] = useState("");
  const [location, setLocation] = useState("");
  const [product, setProduct] = useState("");
  const [icp, setIcp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, niche, location, product, icp }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha ao iniciar sonda.");

      router.push(`/dashboard/campanhas/${data.campaign.id}`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto flex flex-col gap-12 animate-in fade-in duration-1000">
      
      {/* Launch Sequence Header */}
      <div className="flex flex-col gap-6">
        <button 
          onClick={() => router.push("/dashboard/campanhas")} 
          className="group flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-text-muted hover:text-primary transition-all w-fit"
        >
          <div className="w-10 h-10 rounded-sm bg-white/5 border border-white/5 flex items-center justify-center group-hover:border-primary/30 group-hover:bg-primary/5 transition-all">
            <ChevronLeft size={18} />
          </div>
          CANCELAR OPERAÇÃO
        </button>

        <div className="relative pt-6">
          <div className="absolute -top-4 -left-10 opacity-10 pointer-events-none">
             <Radar size={120} className="text-primary animate-pulse" />
          </div>
          <h1 className="text-6xl font-black tracking-tighter uppercase leading-none text-white">
            CONFIGURAR <span className="text-primary">NOVA SONDA</span>
          </h1>
          <p className="text-[11px] text-text-muted uppercase font-black tracking-[0.4em] mt-5 opacity-60">
            Defina as coordenadas táticas para extração de leads em massa via Google Maps Engine.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-10">
        <CardMiner elevated className="p-12 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary/20" />
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-10">
            <div className="space-y-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted flex items-center gap-2">
                  <Rocket size={14} className="text-primary/60" />
                  NOME DA MISSÃO
                </label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="EX: EXPANSÃO SUL - EVENTOS 2026"
                  className="w-full bg-black/40 border-2 border-white/5 p-6 text-xl font-black uppercase tracking-tight text-white placeholder:text-white/10 focus:border-primary/40 focus:bg-primary/[0.02] transition-all outline-none rounded-sm"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted flex items-center gap-2">
                    <Target size={14} className="text-primary/60" />
                    NICHO ALVO
                  </label>
                  <input
                    required
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    placeholder="EX: BUFFET PARA CASAMENTOS"
                    className="w-full bg-black/40 border-2 border-white/5 p-5 text-base font-black uppercase tracking-widest text-white placeholder:text-white/10 focus:border-primary/40 focus:bg-primary/[0.02] transition-all outline-none rounded-sm"
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted flex items-center gap-2">
                    <Globe size={14} className="text-primary/60" />
                    COORDENADAS (CIDADE/ESTADO)
                  </label>
                  <input
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="EX: SÃO PAULO, SP"
                    className="w-full bg-black/40 border-2 border-white/5 p-5 text-base font-black uppercase tracking-widest text-white placeholder:text-white/10 focus:border-primary/40 focus:bg-primary/[0.02] transition-all outline-none rounded-sm"
                  />
                </div>
              </div>

              {/* NOVOS CAMPOS ESTRATÉGICOS */}
              <div className="space-y-8 pt-6 border-t border-white/5">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary flex items-center gap-2">
                    <Zap size={14} />
                    O QUE VOCÊ VENDE? (PRODUTO/SERVIÇO)
                  </label>
                  <input
                    required
                    value={product}
                    onChange={(e) => setProduct(e.target.value)}
                    placeholder="EX: CONSULTORIA DE TRÁFEGO PARA NEGÓCIOS LOCAIS"
                    className="w-full bg-black/40 border-2 border-primary/10 p-5 text-base font-black uppercase tracking-wider text-white placeholder:text-white/10 focus:border-primary/40 focus:bg-primary/[0.05] transition-all outline-none rounded-sm"
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary flex items-center gap-2">
                    <Sparkles size={14} />
                    QUEM É O CLIENTE IDEAL? (ICP)
                  </label>
                  <textarea
                    required
                    value={icp}
                    onChange={(e) => setIcp(e.target.value)}
                    placeholder="EX: DONOS DE BUFFETS QUE FATURAM ACIMA DE 50K E TÊM SITE LENTO NO MOBILE."
                    rows={3}
                    className="w-full bg-black/40 border-2 border-primary/10 p-5 text-sm font-bold uppercase tracking-widest text-white placeholder:text-white/10 focus:border-primary/40 focus:bg-primary/[0.05] transition-all outline-none rounded-sm resize-none"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="p-6 bg-error/5 border border-error/20 rounded-sm flex items-center gap-4 animate-in slide-in-from-top-2 duration-300">
                <AlertCircle size={20} className="text-error" />
                <p className="text-[11px] font-black uppercase tracking-widest text-error">FALHA NO LANÇAMENTO: {error}</p>
              </div>
            )}

            <div className="pt-6 border-t border-white/5">
              <ButtonMiner
                type="submit"
                isLoading={loading}
                disabled={loading}
                icon={Zap}
                className="h-20 w-full shadow-purple text-sm tracking-[0.3em]"
              >
                {loading ? "SINCRONIZANDO SATÉLITE..." : "INICIAR EXTRAÇÃO AGORA"}
              </ButtonMiner>
              <p className="text-[9px] text-text-muted text-center uppercase font-black tracking-widest mt-6 opacity-30 italic">
                Ao iniciar, a Sonda ProspectOS percorrerá o banco de dados do Google Maps em tempo real.
              </p>
            </div>
          </form>
        </CardMiner>

        {/* Sidebar Context */}
        <div className="flex flex-col gap-6">
          <CardMiner className="p-8 bg-primary/[0.02] border-primary/10">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-6 flex items-center gap-2">
               <ShieldCheck size={14} />
               PROTOCOLO NUDGE™
            </h4>
            <div className="space-y-6">
               <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                     <span className="text-[10px] font-bold text-primary">01</span>
                  </div>
                  <p className="text-[10px] text-white/60 uppercase font-bold leading-relaxed tracking-wide">
                    MAPEAMENTO GEOGRÁFICO DE ALTA PRECISÃO.
                  </p>
               </div>
               <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                     <span className="text-[10px] font-bold text-primary">02</span>
                  </div>
                  <p className="text-[10px] text-white/60 uppercase font-bold leading-relaxed tracking-wide">
                    DETECÇÃO DE "FALSA RUÍNA" EM TEMPO REAL.
                  </p>
               </div>
               <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                     <span className="text-[10px] font-bold text-primary">03</span>
                  </div>
                  <p className="text-[10px] text-white/60 uppercase font-bold leading-relaxed tracking-wide">
                    ENRIQUECIMENTO AUTOMÁTICO DE DADOS DE CONTATO.
                  </p>
               </div>
            </div>
          </CardMiner>

          <div className="p-8 border border-white/5 bg-black/40 rounded-sm">
             <div className="flex items-center gap-4 mb-4">
                <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">LINK DE SATÉLITE ATIVO</span>
             </div>
             <div className="space-y-2">
                <div className="h-1 w-full bg-white/5 rounded-full" />
                <div className="h-1 w-[80%] bg-white/5 rounded-full" />
                <div className="h-1 w-[60%] bg-white/5 rounded-full" />
             </div>
          </div>
        </div>
      </div>

    </div>
  );
}
