"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

export default function AtualizarSenha() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sessionReady, setSessionReady] = useState(false);
  const router = useRouter();

  const supabaseRef = useRef(
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  );

  useEffect(() => {
    const supabase = supabaseRef.current;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setSessionReady(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }
    if (password.length < 8) {
      setError("A senha deve ter pelo menos 8 caracteres.");
      return;
    }
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/update-password", {
      method: "POST",
      body: JSON.stringify({ password }),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Erro ao atualizar senha.");
      setLoading(false);
      return;
    }

    router.push("/?reset=success");
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-background">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md p-8 glass rounded-md z-10 flex flex-col gap-8 shadow-2xl border border-primary/20">
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-4xl font-black tracking-tighter text-primary">GARIMPO</h1>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-text-muted">Nova Senha</p>
        </div>

        {!sessionReady ? (
          <div className="flex flex-col gap-4 items-center">
            <p className="text-text-muted text-xs uppercase tracking-widest text-center animate-pulse">
              Validando link de recuperação...
            </p>
            <p className="text-[10px] text-text-muted/60 text-center">
              Link expirado?{" "}
              <a href="/recuperar-senha" className="text-primary hover:underline font-black">
                Solicitar novo
              </a>
            </p>
          </div>
        ) : (
          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-primary/80">
                Nova Senha
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="input-finch"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoFocus
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-primary/80">
                Confirmar Senha
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="input-finch"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </div>

            {error && (
              <p className="text-red-500 text-[10px] uppercase font-bold text-center tracking-widest">
                {error}
              </p>
            )}

            <button type="submit" className="btn-finch mt-2" disabled={loading}>
              {loading ? "Atualizando..." : "Definir Nova Senha"}
            </button>
          </form>
        )}
      </div>

      <footer className="absolute bottom-8 text-[9px] uppercase tracking-[0.5em] text-text-muted/50">
        Holding Bilhon &copy; 2026 — Todos os direitos reservados
      </footer>
    </main>
  );
}
