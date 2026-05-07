"use client";

import { useState, useEffect } from "react";

export default function CampanhasPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/campaigns")
      .then(r => r.json())
      .then(d => setCampaigns(d.campaigns || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 flex flex-col gap-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black tracking-tighter">Campanhas</h2>
          <p className="text-xs font-bold uppercase tracking-widest text-text-muted mt-1">{campaigns.length} campanhas criadas</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {loading ? (
          <div className="glass p-12 rounded-sm border border-primary/10 text-center text-text-muted text-[10px] uppercase tracking-widest">
            Carregando campanhas...
          </div>
        ) : campaigns.length === 0 ? (
          <div className="glass p-12 rounded-sm border border-dashed border-primary/20 text-center text-text-muted text-[10px] uppercase tracking-widest">
            Nenhuma campanha. Inicie um garimpo no Dashboard.
          </div>
        ) : (
          campaigns.map(c => (
            <div key={c.id} className="glass p-6 rounded-sm border border-primary/10 hover:border-primary/30 transition-all">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-black text-lg">{c.name}</h3>
                  <p className="text-[10px] uppercase tracking-widest text-text-muted">{c.niche} · {c.location || "Brasil"}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-2xl font-black text-primary">{c.total_leads}</div>
                    <div className="text-[9px] text-text-muted uppercase">leads</div>
                  </div>
                  <span className={`px-2 py-1 text-[8px] font-black uppercase border rounded-sm ${
                    c.status === 'ativa' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                  }`}>
                    ● {c.status}
                  </span>
                </div>
              </div>
              <div className="w-full bg-white/5 rounded-full h-1.5">
                <div className="bg-primary h-1.5 rounded-full" style={{ width: `${Math.min((c.total_leads / 100) * 100, 100)}%` }} />
              </div>
              <p className="text-[9px] text-text-muted mt-2">
                Criada em {new Date(c.created_at).toLocaleDateString('pt-BR')}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
