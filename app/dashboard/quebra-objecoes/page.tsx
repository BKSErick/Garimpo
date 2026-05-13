"use client";

import { useState, useEffect } from "react";
import {
  ShieldAlert,
  Plus,
  Copy,
  Check,
  Sparkles,
  Loader2,
  Trash2,
  Crown,
  MessageSquare,
  Zap,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { CardMiner } from "@/components/ui/CardMiner";
import { ButtonMiner } from "@/components/ui/ButtonMiner";
import { BadgeMiner } from "@/components/ui/BadgeMiner";

// no user_id: intentional single-tenant design (same pattern as strategic_lab)
type Objection = {
  id: string;
  text: string;
  response: string | null;
  is_universal: boolean;
  created_at: string;
};

function ObjectionCard({
  objection,
  onDelete,
  onGenerate,
  onSaveResponse,
}: {
  objection: Objection;
  onDelete?: (id: string) => void;
  onGenerate: (id: string, text: string) => Promise<string>;
  onSaveResponse: (id: string, response: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [expanded, setExpanded] = useState(!!objection.response);
  const [localResponse, setLocalResponse] = useState(objection.response || "");

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setExpanded(true);
    const response = await onGenerate(objection.id, objection.text);
    setLocalResponse(response);
    onSaveResponse(objection.id, response);
    setGenerating(false);
  };

  return (
    <CardMiner className="p-0 overflow-hidden border-white/5 bg-black/30 group hover:border-primary/20 transition-all">
      {/* Objection header */}
      <div
        className="flex items-center justify-between p-6 cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className={`p-2 rounded-sm border shrink-0 ${objection.is_universal ? "bg-amber-500/10 border-amber-500/20" : "bg-primary/10 border-primary/20"}`}>
            {objection.is_universal ? (
              <Crown size={14} className="text-amber-400" />
            ) : (
              <MessageSquare size={14} className="text-primary" />
            )}
          </div>
          <p className="font-black text-sm uppercase tracking-tight text-white truncate">
            "{objection.text}"
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-4">
          {objection.is_universal && (
            <BadgeMiner variant="muted" className="text-[8px] px-2 py-0.5 text-amber-400 border-amber-500/20 bg-amber-500/5">
              UNIVERSAL
            </BadgeMiner>
          )}
          {localResponse && (
            <BadgeMiner variant="primary" className="text-[8px] px-2 py-0.5">
              RESPOSTA OK
            </BadgeMiner>
          )}
          {expanded ? (
            <ChevronUp size={16} className="text-text-muted" />
          ) : (
            <ChevronDown size={16} className="text-text-muted" />
          )}
        </div>
      </div>

      {/* Response section */}
      {expanded && (
        <div className="border-t border-white/5 p-6 space-y-4 bg-white/[0.01]">
          {generating ? (
            <div className="flex items-center gap-3 py-6 text-primary animate-pulse">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-[11px] font-black uppercase tracking-widest">IA escrevendo a quebra...</span>
            </div>
          ) : localResponse ? (
            <>
              <div className="relative pl-6">
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary/40 rounded-full" />
                <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">{localResponse}</p>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <ButtonMiner
                  onClick={() => copy(localResponse)}
                  icon={copied ? Check : Copy}
                  className={`h-10 px-6 text-[10px] ${copied ? "bg-success border-success text-white" : ""}`}
                >
                  {copied ? "COPIADO" : "COPIAR"}
                </ButtonMiner>
                {!objection.is_universal && (
                  <ButtonMiner
                    variant="outline"
                    onClick={handleGenerate}
                    icon={Sparkles}
                    className="h-10 px-6 text-[10px] border-white/10"
                  >
                    NOVA VARIAÇÃO
                  </ButtonMiner>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-4 py-2">
              <p className="text-[11px] text-text-muted/40 font-black uppercase tracking-widest italic flex-1">
                Sem resposta ainda
              </p>
              {!objection.is_universal && (
                <ButtonMiner
                  onClick={handleGenerate}
                  icon={Zap}
                  className="h-10 px-6 text-[10px] shadow-purple"
                >
                  IA GERAR QUEBRA
                </ButtonMiner>
              )}
            </div>
          )}
        </div>
      )}

      {/* Actions footer (custom only) */}
      {!objection.is_universal && (
        <div className="border-t border-white/5 px-6 py-3 flex items-center justify-between bg-black/20">
          {!localResponse && (
            <ButtonMiner
              onClick={handleGenerate}
              icon={Zap}
              className="h-9 px-5 text-[9px] shadow-purple"
            >
              IA GERAR QUEBRA
            </ButtonMiner>
          )}
          <div className="ml-auto">
            <button
              onClick={() => onDelete?.(objection.id)}
              className="p-2 text-text-muted/30 hover:text-error hover:bg-error/10 rounded-sm transition-all border border-transparent hover:border-error/20"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      )}
    </CardMiner>
  );
}

export default function QuebraObjecoesPage() {
  const [objections, setObjections] = useState<Objection[]>([]);
  const [loading, setLoading] = useState(true);
  const [newText, setNewText] = useState("");
  const [adding, setAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetch("/api/objections")
      .then((r) => r.json())
      .then((d) => {
        setObjections(d.objections || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;
    setAdding(true);
    const res = await fetch("/api/objections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: newText }),
    });
    const data = await res.json();
    if (data.objection) {
      setObjections((prev) => [...prev, data.objection]);
      setNewText("");
      setShowForm(false);
    }
    setAdding(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remover esta objeção?")) return;
    setObjections((prev) => prev.filter((o) => o.id !== id));
    await fetch("/api/objections", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  };

  const handleGenerate = async (id: string, text: string): Promise<string> => {
    const res = await fetch("/api/objections/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ objectionText: text, objectionId: id }),
    });
    const data = await res.json();
    return data.response || "";
  };

  const handleSaveResponse = (id: string, response: string) => {
    setObjections((prev) =>
      prev.map((o) => (o.id === id ? { ...o, response } : o))
    );
  };

  const universal = objections.filter((o) => o.is_universal);
  const custom = objections.filter((o) => !o.is_universal);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
        <div className="relative">
          <div className="absolute inset-0 bg-primary blur-3xl opacity-20 animate-pulse" />
          <Loader2 className="animate-spin text-primary relative" size={64} />
        </div>
        <p className="text-[12px] font-black uppercase tracking-[0.4em] text-white animate-pulse">
          Carregando Arsenal de Objeções...
        </p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1200px] mx-auto flex flex-col gap-10 animate-in fade-in duration-1000">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 bg-black/40 border border-white/5 p-10 rounded-sm relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1 h-full bg-primary/20" />
        <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none group-hover:opacity-[0.05] transition-opacity">
          <ShieldAlert size={200} />
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <BadgeMiner variant="primary" className="py-1 px-3 text-[9px]">
              Arsenal Tático
            </BadgeMiner>
            <div className="h-4 w-px bg-white/10" />
            <span className="text-text-muted text-[10px] font-black uppercase tracking-widest opacity-40 italic">
              PROTOCOLO ANTI-OBJEÇÃO
            </span>
          </div>
          <h1 className="text-6xl font-black tracking-tighter uppercase leading-none text-white">
            QUEBRA DE <span className="text-primary">OBJEÇÕES</span>
          </h1>
          <p className="text-[11px] text-text-muted uppercase font-black tracking-[0.4em] mt-2 opacity-60">
            Respostas prontas para cada barreira. Copie, adapte e feche.
          </p>
        </div>
        <ButtonMiner
          onClick={() => setShowForm((v) => !v)}
          icon={showForm ? X : Plus}
          className="h-16 px-10 shadow-purple text-xs tracking-widest shrink-0"
        >
          {showForm ? "CANCELAR" : "NOVA OBJEÇÃO"}
        </ButtonMiner>
      </div>

      {/* Add form */}
      {showForm && (
        <CardMiner className="p-8 border-primary/20 bg-primary/[0.02] animate-in slide-in-from-top-4 duration-300">
          <form onSubmit={handleAdd} className="flex gap-4">
            <input
              autoFocus
              required
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="ESCREVA A OBJEÇÃO DO CLIENTE (EX: NÃO É O MOMENTO CERTO)"
              className="flex-1 bg-black/40 border-2 border-white/5 p-5 text-sm font-bold uppercase tracking-widest text-white placeholder:text-white/10 focus:border-primary/40 transition-all outline-none rounded-sm"
            />
            <ButtonMiner
              type="submit"
              isLoading={adding}
              disabled={adding}
              icon={Plus}
              className="h-16 px-8 shadow-purple text-xs tracking-widest shrink-0"
            >
              ADICIONAR
            </ButtonMiner>
          </form>
          <p className="text-[9px] text-text-muted/40 font-black uppercase tracking-widest mt-4">
            Depois de adicionar, use o botão "IA GERAR QUEBRA" para criar a resposta automaticamente.
          </p>
        </CardMiner>
      )}

      {/* Universal objections */}
      <section className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Crown size={16} className="text-amber-400" />
          <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-amber-400">
            OBJEÇÕES UNIVERSAIS
          </h2>
          <div className="flex-1 h-px bg-amber-500/10" />
          <span className="text-[9px] font-black text-text-muted/30 uppercase tracking-widest">
            {universal.length} REGISTROS
          </span>
        </div>
        <div className="flex flex-col gap-4">
          {universal.map((obj) => (
            <ObjectionCard
              key={obj.id}
              objection={obj}
              onGenerate={handleGenerate}
              onSaveResponse={handleSaveResponse}
            />
          ))}
        </div>
      </section>

      {/* Custom objections */}
      <section className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <MessageSquare size={16} className="text-primary" />
          <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-primary">
            MINHAS OBJEÇÕES
          </h2>
          <div className="flex-1 h-px bg-primary/10" />
          <span className="text-[9px] font-black text-text-muted/30 uppercase tracking-widest">
            {custom.length} REGISTROS
          </span>
        </div>
        {custom.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 border border-dashed border-white/5 rounded-sm opacity-20">
            <ShieldAlert size={48} className="mb-6" />
            <p className="text-[10px] uppercase font-black tracking-[0.4em]">
              Nenhuma objeção customizada ainda
            </p>
            <p className="text-[9px] uppercase font-bold tracking-widest mt-2 opacity-60">
              Clique em "Nova Objeção" para adicionar
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {custom.map((obj) => (
              <ObjectionCard
                key={obj.id}
                objection={obj}
                onDelete={handleDelete}
                onGenerate={handleGenerate}
                onSaveResponse={handleSaveResponse}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
