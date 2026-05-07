"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const NICHES = [
  "Espaços para Eventos",
  "Buffets e Gastronomia para Eventos",
  "Fotógrafos de Eventos",
  "Videomakers e Cinegrafistas",
  "Decoração e Cenografia",
  "DJ e Entretenimento",
  "Locação de Móveis para Eventos",
  "Sonorização e Iluminação",
  "Cerimonialistas e Produtores",
  "Floricultura e Arranjos",
  "Bartenders e Open Bar",
  "Segurança para Eventos",
];

export default function NovaCampanhaPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    if (!query.trim()) { setError("Defina a busca da campanha."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/prospect", {
        method: "POST",
        body: JSON.stringify({ query: query.trim() }),
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      if (data.success) {
        router.push("/dashboard/campanhas");
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
    <div className="p-8 flex flex-col gap-8 max-w-2xl">
      <div>
        <h2 className="text-4xl font-black tracking-tighter">Nova Campanha</h2>
        <p className="text-xs font-bold uppercase tracking-widest text-text-muted mt-1">
          Configure o garimpo estratégico
        </p>
      </div>

      <div className="glass rounded-sm border border-primary/10 p-6 flex flex-col gap-6">

        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-primary/80">Nome da Campanha (opcional)</label>
          <input
            type="text"
            placeholder='Ex: "Barbearias SP - Maio 2026"'
            className="input-finch"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-primary/80">Busca no Google Maps *</label>
          <input
            type="text"
            placeholder='Ex: "Barbearias em São Paulo"'
            className="input-finch"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <p className="text-[9px] text-text-muted">Escreva exatamente como buscaria no Google Maps.</p>
        </div>

        {/* Quick select niches */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Nichos Rápidos</label>
          <div className="flex flex-wrap gap-2">
            {NICHES.map(n => (
              <button
                key={n}
                onClick={() => setQuery(`${n} em São Paulo`)}
                className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest border rounded-sm transition-all ${
                  query.startsWith(n)
                    ? "bg-primary text-background border-primary"
                    : "border-primary/20 text-text-muted hover:border-primary/40 hover:text-primary"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-red-400 text-[10px] uppercase font-black tracking-widest">{error}</p>}

        <div className="flex gap-3 pt-2 border-t border-primary/10">
          <button
            className="btn-finch"
            onClick={handleCreate}
            disabled={loading}
          >
            {loading ? "⛏ Garimpando..." : "⛏ Iniciar Campanha"}
          </button>
          <button
            onClick={() => router.back()}
            className="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest border border-primary/20 text-text-muted hover:text-primary hover:border-primary/40 transition-all"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
