"use client";

export const runtime = 'edge';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Rocket,
  Plus,
  Search,
  ChevronRight,
  Target,
  Globe,
  Zap,
  BarChart3,
  Loader2,
  Layers,
  Sparkles,
  ArrowRight,
  Clock,
  MoreVertical,
  Activity,
  History,
  Database,
  Radar,
  Trash2
} from "lucide-react";

import { CardMiner, CardMinerHeader, CardMinerTitle } from "@/components/ui/CardMiner";
import { ButtonMiner } from "@/components/ui/ButtonMiner";
import { BadgeMiner } from "@/components/ui/BadgeMiner";

export default function CampanhasPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCampaigns = () => {
    fetch("/api/campaigns")
      .then((res) => res.json())
      .then((data) => {
        setCampaigns(data.campaigns || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erro ao carregar campanhas:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const deleteCampaign = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Deseja realmente excluir esta linha de extração?")) return;
    
    try {
      const res = await fetch("/api/campaigns", {
        method: "DELETE",
        body: JSON.stringify({ id }),
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) {
        setCampaigns(campaigns.filter(c => c.id !== id));
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
      <div className="relative">
        <div className="absolute inset-0 bg-primary blur-3xl opacity-20 animate-pulse" />
        <Loader2 className="animate-spin text-primary relative" size={64} />
      </div>
      <div className="text-center">
        <p className="text-[12px] font-black uppercase tracking-[0.4em] text-white animate-pulse">Sincronizando Matriz de Operações...</p>
        <p className="text-[10px] text-text-muted uppercase font-bold tracking-widest mt-2 opacity-40 italic">Mapeando sondas ativas no quadrante global</p>
      </div>
    </div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col gap-10 animate-in fade-in duration-1000">
      
      {/* Ops Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 bg-black/40 border border-white/5 p-10 rounded-sm relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1 h-full bg-primary/20" />
        <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none group-hover:opacity-[0.05] transition-opacity">
           <Activity size={200} />
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
             <BadgeMiner variant="primary" className="py-1 px-3 text-[9px]">Sovereign Control</BadgeMiner>
             <div className="h-4 w-px bg-white/10" />
             <span className="text-text-muted text-[10px] font-black uppercase tracking-widest opacity-40">ESTADO DAS SONDAS</span>
          </div>
          <h1 className="text-6xl font-black tracking-tighter uppercase leading-none text-white">
            MATRIZ DE <span className="text-primary">OPERAÇÕES</span>
          </h1>
          <p className="text-[11px] text-text-muted uppercase font-black tracking-[0.4em] mt-2 opacity-60">
            Gerencie suas extrações de inteligência e monitore o fluxo de mineração.
          </p>
        </div>

        <ButtonMiner 
          onClick={() => router.push("/dashboard/campanhas/nova")}
          icon={Plus}
          className="h-20 px-14 shadow-purple text-sm tracking-[0.2em]"
        >
          LANÇAR NOVA SONDA
        </ButtonMiner>
      </div>

      {/* Campaigns Grid/Map */}
      {campaigns.length === 0 ? (
        <CardMiner className="p-32 flex flex-col items-center gap-10 border-dashed border-white/10 bg-transparent">
          <div className="relative">
             <div className="absolute inset-0 bg-primary/20 blur-3xl animate-pulse rounded-full" />
             <div className="w-32 h-32 rounded-sm border-2 border-white/5 flex items-center justify-center text-white/10 relative">
                <Radar size={64} className="animate-pulse" />
             </div>
          </div>
          <div className="text-center space-y-4">
            <h3 className="text-3xl font-black uppercase tracking-tighter text-white">Nenhuma Sonda Ativa</h3>
            <p className="text-[11px] text-text-muted uppercase font-black tracking-[0.3em] max-w-sm mx-auto opacity-60">
              Sua frota de mineração está em repouso. Inicie um escaneamento tático para começar a extrair ouro.
            </p>
          </div>
          <ButtonMiner 
            onClick={() => router.push("/dashboard/campanhas/nova")}
            variant="outline"
            icon={Zap}
            className="h-14 px-10 border-primary/20 text-primary hover:bg-primary/5"
          >
            INICIALIZAR PRIMEIRO PROTOCOLO
          </ButtonMiner>
        </CardMiner>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {campaigns.map((campaign) => (
            <CardMiner 
              key={campaign.id} 
              elevated
              className="group p-0 overflow-hidden border-white/5 hover:border-primary/30 transition-all cursor-pointer"
              onClick={() => router.push(`/dashboard/campanhas/${campaign.id}`)}
            >
              <div className="p-8 border-b border-white/5 flex items-start justify-between bg-white/[0.01]">
                <div className="flex gap-6">
                  <div className="w-16 h-16 rounded-sm bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:shadow-purple-sm transition-all shrink-0">
                    <Rocket size={32} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black uppercase tracking-tighter text-white group-hover:text-primary transition-colors leading-none">
                      {campaign.name}
                    </h3>
                    <div className="flex items-center gap-4 mt-4">
                       <BadgeMiner variant="muted" className="text-[8px] py-0.5 px-2">ID: {campaign.id.slice(0, 8)}</BadgeMiner>
                       <div className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest opacity-40">
                          <Clock size={12} />
                          {new Date(campaign.created_at).toLocaleDateString()}
                       </div>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={(e) => deleteCampaign(e, campaign.id)}
                  className="text-text-muted hover:text-error transition-colors opacity-20 group-hover:opacity-100 p-2 hover:bg-error/5 rounded-sm"
                  title="Excluir Campanha"
                >
                  <Trash2 size={20} />
                </button>
              </div>

              <div className="grid grid-cols-2 divide-x divide-white/5">
                <div className="p-8 space-y-6">
                  <div className="space-y-2">
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-text-muted opacity-40">NICHO ALVO</span>
                    <div className="flex items-center gap-3 text-sm font-black text-white uppercase tracking-wider">
                       <Target size={14} className="text-primary" />
                       {campaign.niche}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-text-muted opacity-40">LOCALIZAÇÃO</span>
                    <div className="flex items-center gap-3 text-sm font-black text-white uppercase tracking-wider">
                       <Globe size={14} className="text-primary" />
                       {campaign.location || "Global"}
                    </div>
                  </div>
                </div>
                <div className="p-8 flex flex-col justify-between bg-black/20">
                   <div className="space-y-2">
                      <div className="flex justify-between items-end">
                         <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary">POTENCIAL DE EXTRAÇÃO</span>
                         <span className="text-xl font-black text-white tracking-tighter">84%</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                         <div className="h-full bg-primary shadow-purple w-[84%]" />
                      </div>
                   </div>
                   <div className="flex items-center justify-between pt-4">
                      <div className="flex -space-x-2">
                         {[1,2,3].map(i => (
                            <div key={i} className="w-8 h-8 rounded-full border-2 border-black bg-white/10 flex items-center justify-center text-[10px] font-black text-white">
                               L
                            </div>
                         ))}
                         <div className="w-8 h-8 rounded-full border-2 border-black bg-primary flex items-center justify-center text-[10px] font-black text-black">
                            +
                         </div>
                      </div>
                      <span className="text-[10px] font-black text-text-muted uppercase tracking-widest opacity-40">24 LEADS ENCONTRADOS</span>
                   </div>
                </div>
              </div>

              <div className="p-6 bg-white/[0.03] flex items-center justify-between group-hover:bg-primary/[0.05] transition-all">
                 <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-success">SONDA ESTÁVEL</span>
                 </div>
                 <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                    ACESSAR DOSSIÊ
                    <ArrowRight size={14} />
                 </div>
              </div>
            </CardMiner>
          ))}
        </div>
      )}

    </div>
  );
}

