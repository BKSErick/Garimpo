import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-background">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md p-8 glass rounded-md z-10 flex flex-col gap-8 shadow-2xl border border-primary/20">
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-4xl font-black tracking-tighter text-primary">GARIMPO</h1>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-text-muted">Prospecção de Outliers</p>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-primary/80">Acesso Restrito</label>
            <input 
              type="email" 
              placeholder="seu@email.com" 
              className="input-finch"
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black uppercase tracking-widest text-primary/80">Chave de Segurança</label>
              <button className="text-[9px] uppercase tracking-wider text-text-muted hover:text-primary transition-colors">Esqueci a chave</button>
            </div>
            <input 
              type="password" 
              placeholder="••••••••" 
              className="input-finch"
            />
          </div>

          <button className="btn-finch mt-2">
            Entrar no Painel
          </button>
        </div>

        <div className="flex justify-center items-center gap-2">
          <span className="text-[10px] text-text-muted uppercase tracking-widest">Não é um outlier?</span>
          <button className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">Solicitar Acesso</button>
        </div>
      </div>

      <footer className="absolute bottom-8 text-[9px] uppercase tracking-[0.5em] text-text-muted/50">
        Holding Bilhon &copy; 2026 — Todos os direitos reservados
      </footer>
    </main>
  );
}
