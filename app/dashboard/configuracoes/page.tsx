"use client";

import { useState, useEffect } from "react";
import { 
  Zap, 
  CheckCircle2, 
  Sparkles, 
  Rocket, 
  ShieldAlert, 
  CreditCard,
  ArrowRight,
  Target,
  Activity
} from "lucide-react";
import { BadgeMiner } from "@/components/ui/BadgeMiner";

const PLAN_LIMITS = {
  "STARTER": 5,
  "MINERADOR": 20,
  "INDUSTRIAL": 40,
  "ADM": 100
};

export default function FaturamentoPage() {
  const [activeView, setActiveView] = useState<"subscriptions" | "credits">("subscriptions");
  const [activeSondas, setActiveSondas] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userPlan, setUserPlan] = useState<keyof typeof PLAN_LIMITS>("STARTER");

  const PLAN_LIMIT = PLAN_LIMITS[userPlan];

  useEffect(() => {
    async function fetchData() {
      try {
        // 1. Buscar Perfil/Plano
        let currentPlan: keyof typeof PLAN_LIMITS = "STARTER";
        const profileRes = await fetch("/api/user/profile");
        
        if (profileRes.ok) {
          const { user } = await profileRes.json();
          console.log("DEBUG [Settings]: Profile fetched", user);
          if (user?.plan && PLAN_LIMITS[user.plan as keyof typeof PLAN_LIMITS]) {
            currentPlan = user.plan as keyof typeof PLAN_LIMITS;
            setUserPlan(currentPlan);
          }
        }

        // 2. Buscar Quota
        const campaignRes = await fetch("/api/campaigns");
        if (campaignRes.ok) {
          const { campaigns } = await campaignRes.json();
          const active = (campaigns || []).length;
          setActiveSondas(active);
        }
      } catch (error) {
        console.error("DEBUG [Settings]: Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="p-8 space-y-12 max-w-7xl mx-auto pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/5 pb-12">
        <div>
          <div className="flex items-center gap-3 mb-4">
             <BadgeMiner variant="primary" className="bg-primary/20 text-primary border-primary/30 py-1 px-3 text-[10px]">PROSPECTOS v1.0</BadgeMiner>
             <span className="text-[10px] text-white/20 font-black uppercase tracking-[0.4em]">Finanças e Expansão</span>
          </div>
          <h1 className="text-5xl font-black uppercase tracking-tighter text-white">PLANO E USO</h1>
          <p className="text-sm text-text-muted uppercase font-bold tracking-[0.2em] mt-3">Gerencie sua potência de extração e licenças de prospecção.</p>
        </div>

        {/* Seletor */}
        <div className="flex gap-2">
           <button 
             onClick={() => setActiveView("subscriptions")}
             className={`px-8 py-3 text-[10px] font-black uppercase tracking-widest rounded-sm transition-all border ${
               activeView === "subscriptions" 
                 ? "bg-primary text-white border-primary shadow-[0_0_20px_rgba(139,92,246,0.4)]" 
                 : "bg-primary/10 text-primary/60 border-primary/20 hover:bg-primary/20 hover:text-primary"
             }`}
           >
             Planos de Assinatura
           </button>
           <button 
             onClick={() => setActiveView("credits")}
             className={`px-8 py-3 text-[10px] font-black uppercase tracking-widest rounded-sm transition-all border ${
               activeView === "credits" 
                 ? "bg-amber-500 text-black border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.4)]" 
                 : "bg-amber-500/10 text-amber-500/60 border-amber-500/20 hover:bg-amber-500/20 hover:text-amber-400"
             }`}
           >
             ⚡ Créditos Avulsos
           </button>
        </div>
      </div>

        {/* Alerta de Créditos Baixos (Dinâmico) */}
        {activeSondas >= PLAN_LIMIT && (
          <div className="bg-red-500/5 border border-red-500/20 p-6 rounded-sm flex flex-col md:flex-row items-center justify-between gap-6 animate-pulse">
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                <ShieldAlert size={24} />
              </div>
              <div>
                <h4 className="text-lg font-black uppercase tracking-tighter text-white">LIMITE DE OPERAÇÃO ATINGIDO</h4>
                <p className="text-sm text-text-muted mt-1">Sua infraestrutura de 5 sondas está em uso total. Faça upgrade para expandir sua malha de inteligência.</p>
              </div>
            </div>
            <button 
              onClick={() => setActiveView("subscriptions")}
              className="px-8 py-4 bg-primary hover:bg-primary-hover text-white text-[11px] font-black uppercase tracking-widest transition-all shadow-lg"
            >
              Expandir Malha (Upgrade)
            </button>
          </div>
        )}

        {activeSondas < PLAN_LIMIT && activeSondas >= 4 && (
          <div className="bg-amber-500/5 border border-amber-500/20 p-6 rounded-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                <ShieldAlert size={24} />
              </div>
              <div>
                <h4 className="text-lg font-black uppercase tracking-tighter text-white">Você está chegando no fim das sondas</h4>
                <p className="text-sm text-text-muted mt-1">Você tem <span className="text-amber-500 font-bold">{PLAN_LIMIT - activeSondas} sonda</span> disponível. Garanta mais potência para não parar.</p>
              </div>
            </div>
            <button 
              onClick={() => setActiveView("credits")}
              className="px-8 py-4 bg-amber-500 hover:bg-amber-600 text-black text-[11px] font-black uppercase tracking-widest transition-all shadow-lg"
            >
              Comprar sondas avulsas
            </button>
          </div>
        )}

        {/* Card de Assinatura Ativa */}
        <div className="bg-white/[0.02] border border-white/5 p-10 rounded-sm">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div className="flex gap-6">
              <div className="w-16 h-16 rounded-sm bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Target size={32} />
              </div>
              <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-black uppercase tracking-tighter text-white">
                      {userPlan === "ADM" ? "ProspectOS Industrial" : `Plano ${userPlan}`}
                    </h3>
                    <span className="px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-500 text-[9px] font-black uppercase tracking-widest rounded-sm">
                      {userPlan === "ADM" ? "PROTOCOLO NUDGE ATIVO" : "Ativo"}
                    </span>
                    {userPlan === "ADM" && (
                      <span className="px-3 py-1 bg-primary/10 border border-primary/20 text-primary text-[9px] font-black uppercase tracking-widest rounded-sm">
                        ADMIN
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-text-muted font-bold uppercase tracking-widest">
                    {userPlan === "ADM" ? "Capacidade Ilimitada · 100 Sondas" : `Acesso ${userPlan} · ${PLAN_LIMIT} Sondas`}
                  </p>
              </div>
            </div>

            <div className="w-full md:w-auto">
              <div className="bg-white/[0.03] border border-white/5 p-6 rounded-sm flex items-center justify-between gap-12">
                <div>
                  <h5 className="text-[11px] font-black uppercase tracking-widest text-white mb-2">Cobrança e assinatura</h5>
                  <p className="text-[10px] text-text-muted leading-relaxed max-w-sm uppercase font-bold opacity-60">
                    Gerencie seu ciclo de faturamento e infraestrutura via Stripe.
                  </p>
                </div>
                <button className="px-6 py-3 border border-primary text-primary hover:bg-primary/10 text-[10px] font-black uppercase tracking-widest transition-all rounded-sm whitespace-nowrap">
                  Gerenciar assinatura
                </button>
              </div>
            </div>
          </div>

          {/* Grid de Créditos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
            <div className="bg-white/[0.03] border border-white/5 p-8 rounded-sm">
              <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-4">Sondas do Plano</p>
              <h4 className="text-5xl font-black text-white tracking-tighter mb-2">{PLAN_LIMIT}</h4>
              <p className="text-[9px] text-text-muted uppercase font-bold tracking-widest opacity-40">Capacidade Nominal</p>
            </div>
            <div className="bg-white/[0.03] border border-white/5 p-8 rounded-sm">
              <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-4">Em Operação</p>
              <h4 className={`text-5xl font-black tracking-tighter mb-2 ${activeSondas >= PLAN_LIMIT ? 'text-red-500' : 'text-white'}`}>{activeSondas}</h4>
              <p className="text-[9px] text-text-muted uppercase font-bold tracking-widest opacity-40">Sondas Ativas Agora</p>
            </div>
            <div className="bg-white/[0.03] border border-white/5 p-8 rounded-sm border-l-4 border-l-primary shadow-2xl">
              <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-4">Disponíveis</p>
              <h4 className="text-5xl font-black text-primary tracking-tighter mb-2">{Math.max(0, PLAN_LIMIT - activeSondas)}</h4>
              <button 
                onClick={() => setActiveView("credits")}
                className="text-[9px] text-primary uppercase font-black tracking-widest hover:underline"
              >
                Expandir Capacidade →
              </button>
            </div>
          </div>
        </div>

      {/* ASSINATURAS (CONTEÚDO) */}
      {activeView === "subscriptions" && (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">

              {/* Tier 01 - Ghost */}
              <div className="bg-black/40 border border-white/5 p-10 rounded-sm hover:border-white/20 transition-all group relative overflow-hidden flex flex-col">
                 <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Zap size={80} /></div>
                 <div className="mb-8">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-text-muted mb-4">RECONHECIMENTO</p>
                    <h4 className="text-3xl font-black text-white uppercase tracking-tighter leading-none mb-4">Sonda 01</h4>
                    <div className="flex items-baseline gap-2">
                       <span className="text-4xl font-black text-white tracking-tighter">R$ 97</span>
                       <span className="text-xs font-bold text-text-muted uppercase opacity-40">/mês</span>
                    </div>
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-2 opacity-60">5 sondas base incluídas</p>
                 </div>
                 <div className="space-y-5 mb-12 flex-grow">
                    {["05 Sondas Ativas","100 Leads p/ Mês","02 Personas no Lab","Exportação Ilimitada","Suporte via Email"].map((f, i) => (
                      <div key={i} className="flex items-center gap-3 text-[11px] font-bold text-text-muted group-hover:text-white/80 transition-colors">
                         <CheckCircle2 size={14} className="text-primary shrink-0" />
                         <span className="uppercase tracking-wider">{f}</span>
                      </div>
                    ))}
                 </div>
                  <button 
                    disabled={userPlan === "STARTER" || userPlan === "ADM" || userPlan === "MINERADOR" || userPlan === "INDUSTRIAL"}
                    className={`w-full h-14 text-[10px] font-black uppercase tracking-widest border transition-all ${
                      userPlan === "STARTER" 
                        ? "border-primary text-primary bg-primary/5 cursor-default" 
                        : (userPlan === "ADM" || userPlan === "MINERADOR" || userPlan === "INDUSTRIAL")
                          ? "border-white/5 text-white/20 cursor-default"
                          : "border-white/10 text-white/40 hover:text-white hover:border-white/30 hover:bg-white/5"
                    }`}
                  >
                    {userPlan === "STARTER" ? "PLANO ATUAL" : (userPlan === "ADM" || userPlan === "MINERADOR" || userPlan === "INDUSTRIAL") ? "TIER SUPERADO" : "SELECIONAR TIER"}
                  </button>
              </div>

              {/* Tier 02 - Roxo DESTAQUE */}
              <div className="bg-primary/[0.03] border-2 border-primary/40 p-10 rounded-sm hover:border-primary/60 transition-all group relative overflow-hidden flex flex-col transform lg:scale-105 z-10 shadow-2xl">
                 <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Sparkles size={100} className="text-primary" /></div>
                 <div className="mb-8">
                    <div className="flex justify-between items-start mb-4">
                       <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">OPERACIONAL PRO</p>
                       <BadgeMiner variant="primary" className="text-[9px] py-1 px-3 bg-primary text-white animate-pulse">MAIS POPULAR</BadgeMiner>
                    </div>
                    <h4 className="text-3xl font-black text-white uppercase tracking-tighter leading-none mb-4">Minerador</h4>
                    <div className="flex items-baseline gap-2">
                       <span className="text-4xl font-black text-white tracking-tighter">R$ 197</span>
                       <span className="text-xs font-bold text-text-muted uppercase opacity-40">/mês</span>
                    </div>
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-2">20 sondas base incluídas</p>
                 </div>
                 <div className="space-y-5 mb-12 flex-grow">
                    {["20 Sondas Ativas","400 Leads p/ Mês","05 Personas no Lab","Exportação Ilimitada","Suporte Priority","Inteligência Avançada"].map((f, i) => (
                      <div key={i} className="flex items-center gap-3 text-[11px] font-black text-white/90">
                         <CheckCircle2 size={14} className="text-primary shrink-0" />
                         <span className="uppercase tracking-wider">{f}</span>
                      </div>
                    ))}
                 </div>
                  <button 
                    disabled={userPlan === "MINERADOR" || userPlan === "ADM" || userPlan === "INDUSTRIAL"}
                    className={`w-full h-16 text-[11px] font-black uppercase tracking-widest transition-all ${
                      userPlan === "MINERADOR"
                        ? "border-2 border-primary text-primary bg-primary/5 cursor-default"
                        : (userPlan === "ADM" || userPlan === "INDUSTRIAL")
                          ? "bg-white/5 text-white/20 cursor-default"
                          : "bg-primary hover:bg-primary-hover text-white animate-shimmer shadow-[0_0_30px_rgba(139,92,246,0.4)]"
                    }`}
                  >
                    {userPlan === "MINERADOR" ? "PLANO ATUAL" : (userPlan === "ADM" || userPlan === "INDUSTRIAL") ? "TIER SUPERADO" : "⚡ FAZER UPGRADE AGORA"}
                  </button>
              </div>

              {/* Tier 03 - Âmbar PREMIUM */}
              <div className="bg-amber-500/[0.03] border border-amber-500/10 p-10 rounded-sm hover:border-amber-500/30 transition-all group relative overflow-hidden flex flex-col">
                 <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Rocket size={80} className="text-amber-400" /></div>
                 <div className="mb-8">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500/70 mb-4">ESCALA GLOBAL</p>
                    <h4 className="text-3xl font-black text-white uppercase tracking-tighter leading-none mb-4">Industrial</h4>
                    <div className="flex items-baseline gap-2">
                       <span className="text-4xl font-black text-white tracking-tighter">R$ 397</span>
                       <span className="text-xs font-bold text-text-muted uppercase opacity-40">/mês</span>
                    </div>
                    <p className="text-[10px] font-black text-amber-500/70 uppercase tracking-widest mt-2">40 sondas base incluídas</p>
                 </div>
                 <div className="space-y-5 mb-12 flex-grow">
                    {["40 Sondas Ativas","800 Leads p/ Mês","10 Personas no Lab","Exportação Ilimitada","Suporte Direto WhatsApp","Sondas Ilimitadas (Batch)","Onboarding Dedicado"].map((f, i) => (
                      <div key={i} className="flex items-center gap-3 text-[11px] font-bold text-text-muted group-hover:text-white/80 transition-colors">
                         <CheckCircle2 size={14} className="text-amber-500 shrink-0" />
                         <span className="uppercase tracking-wider">{f}</span>
                      </div>
                    ))}
                 </div>
                  <button 
                    disabled={userPlan === "INDUSTRIAL" || userPlan === "ADM"}
                    className={`w-full h-14 text-[10px] font-black uppercase tracking-widest border transition-all ${
                      userPlan === "INDUSTRIAL"
                        ? "border-amber-500 text-amber-500 bg-amber-500/10 cursor-default"
                        : userPlan === "ADM"
                          ? "border-white/5 text-white/20 cursor-default"
                          : "bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    }`}
                  >
                    {userPlan === "INDUSTRIAL" ? "PLANO ATUAL" : userPlan === "ADM" ? "TIER SUPERADO" : "🏆 CONTATAR SCALE"}
                  </button>
              </div>
           </div>

           <div className="p-10 bg-white/[0.02] border border-white/5 rounded-sm flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-start gap-6">
                <div className="p-4 bg-primary/10 rounded-sm text-primary shrink-0"><ShieldAlert size={24} /></div>
                <div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-white mb-2">Segurança de Infraestrutura</p>
                   <p className="text-[9px] text-text-muted uppercase font-bold leading-relaxed tracking-wide opacity-40 italic max-w-2xl">
                     Assinaturas incluem hospedagem, segurança AES-256 e manutenção do cluster. O custo fixo de R$ 110,00/mês para banco de dados já está provisionado em todos os planos.
                   </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                 <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.4em] mb-1">FATURAMENTO</p>
                 <p className="text-xs font-black text-green-400 uppercase tracking-widest">TRANSAÇÕES SEGURAS</p>
              </div>
           </div>
        </div>
      )}

      {/* SONDAS AVULSAS */}
      {activeView === "credits" && (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="flex items-center gap-4 border-b border-white/5 pb-8">
              <CreditCard size={20} className="text-primary" />
              <div>
                <h3 className="text-xl font-black uppercase tracking-tighter text-white">Comprar Sondas Extras</h3>
                <p className="text-[10px] text-text-muted uppercase font-bold tracking-widest mt-1">Cada sonda extrai ~20 leads. Não expiram e são usadas após o limite do plano.</p>
              </div>
           </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* 5 sondas - Ghost */}
              <div className="bg-black/40 border border-white/5 p-8 rounded-sm hover:border-white/20 transition-all group relative overflow-hidden flex flex-col">
                 <div className="mb-6 flex-grow">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-3">STARTER PACK</p>
                    <p className="text-[11px] font-black text-white/50 uppercase tracking-widest mb-1">5 Sondas · +100 Leads</p>
                    <span className="text-3xl font-black text-white tracking-tighter">R$ 27</span>
                    <p className="text-[9px] text-text-muted uppercase font-bold mt-1 opacity-40">R$ 5,40 / sonda</p>
                 </div>
                 <button className="w-full py-4 text-[10px] font-black uppercase tracking-widest border border-white/10 text-white/40 hover:text-white hover:border-white/30 hover:bg-white/5 transition-all flex items-center justify-center gap-2">
                    COMPRAR SONDAS <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-all" />
                 </button>
              </div>

              {/* 15 sondas - Azul */}
              <div className="bg-black/40 border border-white/5 p-8 rounded-sm hover:border-sky-500/30 transition-all group relative overflow-hidden flex flex-col">
                 <div className="mb-6 flex-grow">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-400/70 mb-3">BOOSTER PACK</p>
                    <p className="text-[11px] font-black text-white/50 uppercase tracking-widest mb-1">15 Sondas · +300 Leads</p>
                    <span className="text-3xl font-black text-white tracking-tighter">R$ 67</span>
                    <p className="text-[9px] text-text-muted uppercase font-bold mt-1 opacity-40">R$ 4,47 / sonda</p>
                 </div>
                 <button className="w-full py-4 text-[10px] font-black uppercase tracking-widest bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 hover:text-sky-300 border border-sky-500/20 hover:border-sky-400/50 transition-all flex items-center justify-center gap-2">
                    COMPRAR SONDAS <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-all" />
                 </button>
              </div>

              {/* 30 sondas - Roxo POPULAR */}
              <div className="bg-primary/[0.03] border-2 border-primary/40 p-8 rounded-sm hover:border-primary/60 transition-all group relative overflow-hidden flex flex-col">
                 <div className="absolute top-0 right-0 p-2">
                    <BadgeMiner variant="primary" className="text-[8px] py-0.5 px-2 bg-primary text-white animate-pulse">POPULAR</BadgeMiner>
                 </div>
                 <div className="mb-6 flex-grow">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-3">PRO PACK</p>
                    <p className="text-[11px] font-black text-white/70 uppercase tracking-widest mb-1">30 Sondas · +600 Leads</p>
                    <span className="text-3xl font-black text-white tracking-tighter">R$ 119</span>
                    <p className="text-[9px] text-text-muted uppercase font-bold mt-1 opacity-40">R$ 3,97 / sonda</p>
                 </div>
                 <button className="w-full py-4 text-[10px] font-black uppercase tracking-widest bg-primary hover:bg-primary-hover text-white transition-all animate-shimmer shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] flex items-center justify-center gap-2">
                    ⚡ COMPRAR SONDAS <ArrowRight size={12} />
                 </button>
              </div>

              {/* 60 sondas - Dourado */}
              <div className="bg-amber-500/[0.03] border border-amber-500/10 p-8 rounded-sm hover:border-amber-500/30 transition-all group relative overflow-hidden flex flex-col">
                 <div className="mb-6 flex-grow">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500/70 mb-3">INDUSTRIAL PACK</p>
                    <p className="text-[11px] font-black text-white/50 uppercase tracking-widest mb-1">60 Sondas · +1.200 Leads</p>
                    <span className="text-3xl font-black text-white tracking-tighter">R$ 199</span>
                    <p className="text-[9px] text-text-muted uppercase font-bold mt-1 opacity-40">R$ 3,32 / sonda</p>
                 </div>
                 <button className="w-full py-4 text-[10px] font-black uppercase tracking-widest bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 hover:text-amber-300 border border-amber-500/30 hover:border-amber-400/60 transition-all animate-shimmer flex items-center justify-center gap-2">
                    🏆 COMPRAR SONDAS <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-all" />
                 </button>
              </div>
           </div>

           <div className="p-8 bg-primary/5 border border-primary/10 rounded-sm">
              <div className="flex items-center gap-4 text-primary mb-4">
                 <ShieldAlert size={18} />
                 <p className="text-[10px] font-black uppercase tracking-widest">Política de Sondas Avulsas</p>
              </div>
              <p className="text-[9px] text-text-muted uppercase font-bold leading-relaxed tracking-wide opacity-60">
                Cada sonda avulsa realiza 01 ciclo completo de extração (~20 leads). As sondas avulsas são vitalícias e permanecem ativas mesmo se você pausar sua assinatura mensal. O processamento é imediato após a confirmação do pagamento.
              </p>
           </div>
        </div>
      )}
    </div>
  );
}
