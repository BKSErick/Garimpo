"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Zap, Search, X } from "lucide-react";

export default function CampanhasPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/campaigns")
      .then(r => r.json())
      .then(d => setCampaigns(d.campaigns || []))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Tem certeza que deseja excluir esta campanha e todos os seus leads?")) return;

    try {
      const res = await fetch(`/api/campaigns/${id}/delete`, { method: "DELETE" });
      if (res.ok) {
        setCampaigns(prev => prev.filter(c => c.id !== id));
      }
    } catch (err) {
      console.error("Erro ao deletar campanha:", err);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">Campanhas</h1>
          <p className="text-text-muted font-bold text-xs uppercase tracking-widest">
            {campaigns.length} fluxos de garimpo ativos
          </p>
        </div>
        <Link href="/dashboard/campanhas/nova" className="btn-finch flex items-center gap-2">
          <Zap size={16} /> Novo Garimpo
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="glass p-20 rounded-sm border border-white/5 text-center text-text-muted text-[10px] uppercase tracking-widest animate-pulse">
            Sincronizando banco de dados...
          </div>
        ) : campaigns.length === 0 ? (
          <div className="glass p-20 text-center border border-dashed border-white/10 rounded-sm">
            <Search className="mx-auto mb-4 opacity-20" size={48} />
            <p className="text-text-muted font-bold uppercase tracking-widest text-xs">Nenhum garimpo encontrado</p>
            <Link href="/dashboard/campanhas/nova" className="text-primary text-xs font-black uppercase mt-4 block hover:underline">
              Iniciar primeira extração →
            </Link>
          </div>
        ) : (
          campaigns.map((c) => (
            <Link 
              key={c.id} 
              href={`/dashboard/campanhas/${c.id}`}
              className="glass p-8 group hover:border-primary/50 transition-all border border-white/5 relative block"
            >
              <button 
                onClick={(e) => handleDelete(e, c.id)}
                className="absolute top-6 right-6 p-2 hover:bg-red-500/10 text-white/20 hover:text-red-500 rounded-sm transition-all z-10"
                title="Excluir Campanha"
              >
                <X size={14} />
              </button>

              <div className="flex justify-between items-start mb-4">
                <div className="flex flex-col gap-2">
                  <h2 className="text-xl font-black tracking-tight uppercase group-hover:text-primary transition-colors">
                    {c.name}
                  </h2>
                  <p className="text-[10px] text-text-muted font-bold uppercase tracking-[0.2em]">
                    {c.niche} • {c.location || 'Brasil'}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 justify-end mb-1">
                    <span className="text-2xl font-black tracking-tighter">{c.total_leads}</span>
                    <span className="px-1.5 py-0.5 bg-green-500/10 text-green-500 text-[8px] font-black uppercase tracking-widest border border-green-500/20 rounded-sm">
                      Ativa
                    </span>
                  </div>
                  <p className="text-[9px] text-text-muted font-bold uppercase tracking-widest">Leads Extraídos</p>
                </div>
              </div>
              
              <div className="w-full bg-white/5 rounded-full h-1 mt-6 overflow-hidden">
                <div 
                  className="bg-primary h-full transition-all duration-1000" 
                  style={{ width: `${Math.min((c.total_leads / 50) * 100, 100)}%` }} 
                />
              </div>
              <div className="flex justify-between items-center mt-3">
                <p className="text-[9px] text-text-muted uppercase font-bold tracking-widest">
                  Criada em {new Date(c.created_at).toLocaleDateString('pt-BR')}
                </p>
                <p className="text-[9px] text-primary uppercase font-black tracking-widest opacity-0 group-hover:opacity-100 transition-all">
                  Acessar Painel de Comando →
                </p>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
