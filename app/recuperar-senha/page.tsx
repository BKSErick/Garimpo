"use client";

import { useState } from "react";

export default function RecuperarSenha() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await fetch("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ email }),
        headers: { "Content-Type": "application/json" },
      });
      setSent(true);
    } catch {
      setError("Erro ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-background">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md p-8 glass rounded-md z-10 flex flex-col gap-8 shadow-2xl border border-primary/20">
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-4xl font-black tracking-tighter text-primary">GARIMPO</h1>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-text-muted">Recuperar Acesso</p>
        </div>

        {sent ? (
          <div className="flex flex-col gap-6">
            <p className="text-accent/80 text-sm text-center leading-relaxed border border-primary/20 bg-primary/5 rounded-sm px-4 py-4">
              Se o email estiver cadastrado, você receberá um link em breve.
            </p>
            <a href="/" className="btn-finch block w-full text-center">
              Voltar ao Login
            </a>
          </div>
        ) : (
          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-primary/80">
                Email
              </label>
              <input
                type="email"
                placeholder="seu@email.com"
                className="input-finch"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>

            {error && (
              <p className="text-red-500 text-[10px] uppercase font-bold text-center tracking-widest">
                {error}
              </p>
            )}

            <button type="submit" className="btn-finch mt-2" disabled={loading}>
              {loading ? "Enviando..." : "Enviar Link de Recuperação"}
            </button>

            <a
              href="/"
              className="text-center text-[10px] uppercase font-black tracking-widest text-text-muted hover:text-primary transition-colors"
            >
              ← Voltar ao Login
            </a>
          </form>
        )}
      </div>

      <footer className="absolute bottom-8 text-[9px] uppercase tracking-[0.5em] text-text-muted/50">
        Holding Bilhon &copy; 2026 — Todos os direitos reservados
      </footer>
    </main>
  );
}
