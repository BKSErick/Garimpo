"use client";

import { useState } from "react";

export default function ConfiguracoesPage() {
  const [saved, setSaved] = useState(false);
  const [model, setModel] = useState("anthropic/claude-3.5-sonnet");
  const [autoQualify, setAutoQualify] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-8 flex flex-col gap-8 max-w-3xl">
      <div>
        <h2 className="text-4xl font-black tracking-tighter">Configurações</h2>
        <p className="text-xs font-bold uppercase tracking-widest text-text-muted mt-1">
          Controles do motor de prospecção
        </p>
      </div>

      {/* AI Config */}
      <section className="glass rounded-sm border border-primary/10 p-6 flex flex-col gap-5">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-primary/80 border-b border-primary/10 pb-3">
          ⚡ Inteligência Artificial
        </h3>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Modelo LLM (via OpenRouter)</label>
          <select
            className="input-finch"
            value={model}
            onChange={(e) => setModel(e.target.value)}
          >
            <option value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet (Recomendado)</option>
            <option value="anthropic/claude-3-haiku">Claude 3 Haiku (Mais rápido)</option>
            <option value="openai/gpt-4o">GPT-4o</option>
            <option value="openai/gpt-4o-mini">GPT-4o Mini (Mais barato)</option>
            <option value="google/gemini-pro-1.5">Gemini Pro 1.5</option>
          </select>
          <p className="text-[9px] text-text-muted">O modelo usado para gerar o diagnóstico de Falsa Ruína e a copy de 4 passos.</p>
        </div>

        <div className="flex items-center justify-between p-4 bg-white/3 rounded-sm border border-white/5">
          <div>
            <p className="text-xs font-black uppercase tracking-widest">Qualificação Automática</p>
            <p className="text-[9px] text-text-muted mt-0.5">Qualifica via IA todos os leads logo após extração</p>
          </div>
          <button
            onClick={() => setAutoQualify(!autoQualify)}
            className={`w-12 h-6 rounded-full transition-all border ${autoQualify ? "bg-primary border-primary" : "bg-white/5 border-white/10"}`}
          >
            <div className={`w-4 h-4 rounded-full bg-white transition-all mx-1 ${autoQualify ? "translate-x-6" : "translate-x-0"}`} />
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Instrução Adicional ao Prompt Finch</label>
          <textarea
            className="input-finch resize-none"
            rows={4}
            placeholder='Ex: "Foque em negócios com mais de 50 avaliações e site desatualizado..."'
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
          />
          <p className="text-[9px] text-text-muted">Esse texto é adicionado ao prompt base do Thiago Finch para customizar o diagnóstico.</p>
        </div>
      </section>

      {/* Supabase Info */}
      <section className="glass rounded-sm border border-primary/10 p-6 flex flex-col gap-4">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-primary/80 border-b border-primary/10 pb-3">
          🗄️ Banco de Dados
        </h3>
        <div className="flex flex-col gap-3">
          {[
            { label: "Projeto Supabase", value: "qbsaqxcjoyojkzjgrzpe" },
            { label: "URL do Projeto", value: "https://qbsaqxcjoyojkzjgrzpe.supabase.co" },
            { label: "Status", value: "✅ Conectado" },
          ].map((row) => (
            <div key={row.label} className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">{row.label}</span>
              <span className="text-[10px] font-mono text-accent/70">{row.value}</span>
            </div>
          ))}
        </div>
        <a
          href="https://supabase.com/dashboard/project/qbsaqxcjoyojkzjgrzpe"
          target="_blank"
          rel="noreferrer"
          className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
        >
          → Abrir Dashboard Supabase
        </a>
      </section>

      {/* Security */}
      <section className="glass rounded-sm border border-primary/10 p-6 flex flex-col gap-4">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-primary/80 border-b border-primary/10 pb-3">
          🛡️ Segurança
        </h3>
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Nova Chave de Acesso</label>
          <input
            type="password"
            placeholder="••••••••"
            className="input-finch"
          />
          <p className="text-[9px] text-text-muted">Defina no arquivo .env.local a variável MASTER_PASSWORD.</p>
        </div>
      </section>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className="btn-finch self-start"
      >
        {saved ? "✓ Salvo!" : "Salvar configurações"}
      </button>
    </div>
  );
}
