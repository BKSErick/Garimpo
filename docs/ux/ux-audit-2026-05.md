# Garimpo Finch -- UX Brownfield Audit (GRF-009)

**Data:** 2026-05-08
**Auditor:** Uma (UX Design Expert)
**Stack:** Next.js 16, Tailwind v4, Violet #7C3AED
**Escopo:** 5 telas auditadas (Login, Dashboard, Kanban, Campanhas, Leads)

---

## 1. Shock Report -- Friction Points

> 18 friction points identificados em 5 telas. Classificados por severidade.

### CRITICAL (bloqueia conversao ou causa perda de dados)

| # | Tela | Friction Point | Impacto |
|---|------|----------------|---------|
| F01 | Kanban | **Delete sem confirmacao.** `handleDelete` faz `setLeads(prev => prev.filter(...))` e dispara DELETE na API sem `confirm()`. Um clique acidental no X de 5px apaga o lead permanentemente. | Perda de dados irreversivel |
| F02 | Kanban | **Nenhum feedback de sucesso/erro em operacoes.** Qualificar, mover status e deletar nao mostram toast nem mensagem. O usuario nao sabe se a acao funcionou. | Usuario repete acoes, duplica requests |
| F03 | Leads | **Delete sem confirmacao.** Mesmo problema de F01. `handleDelete` faz optimistic delete sem `confirm()`. | Perda de dados irreversivel |
| F04 | Dashboard | **`any[]` em campaigns e recentLeads.** Sem tipagem, qualquer mudanca na API quebra silenciosamente. `fetchData` engole erros com `catch (e) {}` vazio. | Erros invisiveis, debugging impossivel |

### HIGH (degrada a experiencia significativamente)

| # | Tela | Friction Point | Impacto |
|---|------|----------------|---------|
| F05 | Kanban | **5 colunas em `grid-cols-2 lg:grid-cols-5`.** Em telas < 1024px, 5 colunas comprimem para 2, forçando 3 colunas para uma segunda linha desalinhada. Nao ha scroll horizontal. | Layout quebrado em tablet |
| F06 | Kanban | **Sem drag-and-drop.** Pipeline CRM sem arrastar cards e um anti-pattern grave. Mover lead exige clicar dropdown de 8px, selecionar status. Friccao alta por operacao. | Workflow lento, abandono |
| F07 | Login | **Sem indicador de campo obrigatorio.** Inputs nao marcam required, nao ha validacao client-side. Submit com campos vazios dispara request desnecessario. | UX confusa, requests desperdicados |
| F08 | Todas | **Zero skeleton loaders.** Todas as telas mostram texto estatico ("Carregando pipeline...", "Sincronizando...") ou nada durante fetch. Sem shimmer/skeleton. | Performance percebida ruim |
| F09 | Dashboard | **Empty state fraco.** Campanhas vazias mostram "Aguardando primeira campanha..." sem CTA, sem icone, sem orientacao. O usuario nao sabe o que fazer. | Abandono de primeiro uso |
| F10 | Kanban | **Empty state minimalista demais.** Coluna vazia mostra apenas "Vazio" em texto de 9px. Sem icone, sem acao sugerida. | Nao orienta o usuario |

### MEDIUM (inconveniencia, inconsistencia visual)

| # | Tela | Friction Point | Impacto |
|---|------|----------------|---------|
| F11 | Todas | **Emoji como icone.** Sidebar usa emoji unicode (⛏, 📣, 🎯, 📋, ⚙️) e botoes de acao usam emoji (📱, 🌐, 🔍). Renderizacao inconsistente entre OS/browsers. | Visual amador, inconsistencia cross-platform |
| F12 | Leads | **Tabela sem paginacao.** Lista todos os leads em uma unica tabela. Com 500+ leads, a pagina fica inutilizavel. | Performance e usabilidade degradam com escala |
| F13 | Campanhas | **Barra de progresso arbitraria.** `width: Math.min((c.total_leads / 50) * 100, 100)%` usa 50 hardcoded. Nao reflete progresso real. | Informacao enganosa |
| F14 | Kanban | **StatusDropdown usa posicao `fixed` calculada manualmente.** `getBoundingClientRect()` + `style={{ top, left }}` quebra em scroll ou resize. | Dropdown aparece fora de posicao |
| F15 | Login | **Link "Solicitar Acesso" e um `<button>` sem acao.** `onClick` nao definido. Clique nao faz nada. | Dead-end, frustacao |

### LOW (polish, micro-melhorias)

| # | Tela | Friction Point | Impacto |
|---|------|----------------|---------|
| F16 | Dashboard | **Greeting hardcoded "OUTLIER".** Nao usa nome do usuario logado. | Impessoal |
| F17 | Sidebar | **Creditos hardcoded "40" e "Plano Starter".** `style={{ width: "40%" }}` e nao reflete dados reais. | Informacao falsa |
| F18 | Kanban Modal | **Duplicacao de "Contexto Estrategico" e "Analise da IA".** Ambos renderizam `d.diagnosis.mechanism` — mesmo conteudo aparece 2x. | Confuso, desperdiça espaço |

---

## 2. Priority Matrix -- Esforco x Impacto (Top 10)

```
                        ALTO IMPACTO
                            |
              F01,F03       |   F06
            (confirm)       | (drag-drop)
        ----Quick Wins------+------Projetos Estrategicos----
              F02,F09       |   F05
            (toasts,empty)  | (responsive kanban)
              F08           |   F12
            (skeletons)     | (paginacao)
              F07           |
            (validacao)     |
                            |
         BAIXO ESFORCO -----+------ ALTO ESFORCO
                            |
              F11           |   F14
            (icons lucide)  | (floating-ui)
              F15           |
            (link fix)      |
                            |
                       BAIXO IMPACTO
```

| Rank | ID | Descricao | Esforco | Impacto | Quadrante |
|------|----|-----------|---------|---------|-----------|
| 1 | F01+F03 | Confirm dialog em deletes | 15min | Critical | Quick Win |
| 2 | F02 | Toast system (sonner) | 1h | Critical | Quick Win |
| 3 | F08 | Skeleton loaders | 1.5h | High | Quick Win |
| 4 | F09+F10 | Empty states com CTA | 1h | High | Quick Win |
| 5 | F07 | Validacao de login | 30min | High | Quick Win |
| 6 | F11 | Trocar emoji por Lucide icons | 1h | Medium | Quick Win |
| 7 | F06 | Drag-and-drop no Kanban | 8h | High | Projeto |
| 8 | F05 | Kanban responsive (scroll horizontal) | 3h | High | Projeto |
| 9 | F12 | Paginacao de leads | 4h | Medium | Projeto |
| 10 | F15 | Fix "Solicitar Acesso" button | 10min | Medium | Quick Win |

---

## 3. Top 5 Quick Wins

### QW-1: Confirmacao em operacoes destrutivas (F01 + F03)

**Descricao:** Adicionar `confirm()` nativo antes de todo `DELETE`. Impede perda acidental de leads.

**Arquivos afetados:**
- `app/dashboard/kanban/page.tsx` (linha ~559, `handleDelete`)
- `app/dashboard/leads/page.tsx` (linha ~41, `handleDelete`)

**Codigo sugerido (Kanban):**

```tsx
const handleDelete = async (id: string) => {
  if (!confirm("Tem certeza que deseja excluir este lead? Esta acao e irreversivel.")) return;
  setLeads(prev => prev.filter(l => l.id !== id));
  const res = await fetch(`/api/leads/${id}`, { method: "DELETE" });
  if (!res.ok) fetchLeads();
};
```

**Codigo sugerido (Leads):**

```tsx
const handleDelete = async (id: string) => {
  if (!confirm("Excluir este lead permanentemente?")) return;
  setLeads(prev => prev.filter(l => l.id !== id));
  const res = await fetch(`/api/leads/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const r = await fetch("/api/leads");
    const d = await r.json();
    setLeads(d.leads || []);
  }
};
```

**Esforco estimado:** 15 minutos

---

### QW-2: Sistema de Toast para feedback de operacoes (F02)

**Descricao:** Instalar `sonner` e adicionar toasts em qualify, move status, delete e erros de API. O usuario precisa saber se a acao funcionou.

**Arquivos afetados:**
- `app/layout.tsx` (adicionar `<Toaster />`)
- `app/dashboard/kanban/page.tsx` (handleQualify, handleMove, handleDelete)
- `app/dashboard/leads/page.tsx` (handleDelete)
- `app/dashboard/campanhas/page.tsx` (handleDelete)

**Codigo sugerido (layout.tsx):**

```tsx
import { Toaster } from "sonner";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#111111",
              border: "1px solid rgba(124,58,237,0.2)",
              color: "#F5F3FF",
              fontSize: "12px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            },
          }}
        />
      </body>
    </html>
  );
}
```

**Codigo sugerido (kanban handleMove):**

```tsx
import { toast } from "sonner";

const handleMove = async (id: string, newStatus: string) => {
  const prev = leads;
  setLeads(p => p.map(l => l.id === id ? { ...l, status: newStatus } : l));
  const res = await fetch(`/api/leads/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status: newStatus }),
    headers: { "Content-Type": "application/json" },
  });
  if (res.ok) {
    toast.success(`Lead movido para ${newStatus}`);
  } else {
    setLeads(prev);
    toast.error("Falha ao mover lead. Tente novamente.");
  }
};
```

**Esforco estimado:** 1 hora (inclui npm install + integracao em 3 telas)

---

### QW-3: Skeleton Loaders para listas (F08)

**Descricao:** Substituir textos de "Carregando..." por skeletons animados que espelham o layout real. Melhora drasticamente a performance percebida.

**Arquivos afetados:**
- `app/dashboard/kanban/page.tsx` (estado loading)
- `app/dashboard/leads/page.tsx` (estado loading)

**Markup sugerido (Leads table skeleton):**

```tsx
function LeadsTableSkeleton() {
  return (
    <div className="glass rounded-sm border border-white/5 overflow-hidden">
      <div className="bg-white/5 border-b border-white/10 px-6 py-4 flex gap-6">
        {[1,2,3,4,5].map(i => (
          <div key={i} className="h-3 bg-white/10 rounded-sm animate-pulse" style={{ width: `${60 + i * 15}px` }} />
        ))}
      </div>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="px-6 py-5 border-b border-white/5 flex items-center gap-6">
          <div className="flex-1 flex flex-col gap-2">
            <div className="h-3.5 w-40 bg-white/8 rounded-sm animate-pulse" />
            <div className="h-2.5 w-24 bg-white/5 rounded-sm animate-pulse" />
          </div>
          <div className="flex-1 flex flex-col gap-2">
            <div className="h-2.5 w-20 bg-white/8 rounded-sm animate-pulse" />
            <div className="h-2 w-32 bg-white/5 rounded-sm animate-pulse" />
          </div>
          <div className="h-5 w-20 bg-white/8 rounded-sm animate-pulse" />
          <div className="flex items-center gap-2">
            <div className="h-2 w-12 bg-white/5 rounded-full animate-pulse" />
            <div className="h-3 w-6 bg-white/8 rounded-sm animate-pulse" />
          </div>
          <div className="flex gap-2">
            <div className="h-8 w-8 bg-white/5 rounded-sm animate-pulse" />
            <div className="h-8 w-8 bg-white/5 rounded-sm animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}
```

**Markup sugerido (Kanban card skeleton):**

```tsx
function KanbanColumnSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-sm border border-white/10 p-4 bg-white/[0.02]">
      <div className="flex justify-between items-center">
        <div className="h-3 w-24 bg-white/10 rounded-sm animate-pulse" />
        <div className="h-4 w-6 bg-white/5 rounded-full animate-pulse" />
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="glass border border-white/5 rounded-sm p-4 flex flex-col gap-3">
          <div className="flex justify-between">
            <div className="flex-1 flex flex-col gap-1.5">
              <div className="h-3 w-28 bg-white/10 rounded-sm animate-pulse" />
              <div className="h-2 w-36 bg-white/5 rounded-sm animate-pulse" />
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <div className="h-5 w-8 bg-primary/10 rounded-sm animate-pulse" />
              <div className="h-2 w-8 bg-white/5 rounded-sm animate-pulse" />
            </div>
          </div>
          <div className="h-5 w-16 bg-white/8 rounded-sm animate-pulse" />
          <div className="h-2 w-full bg-white/5 rounded-sm animate-pulse" />
          <div className="flex gap-2 pt-1 border-t border-white/5">
            <div className="h-2.5 w-20 bg-white/5 rounded-sm animate-pulse" />
            <div className="h-2.5 w-12 bg-white/5 rounded-sm animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

function KanbanSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 flex-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <KanbanColumnSkeleton key={i} />
      ))}
    </div>
  );
}
```

**Esforco estimado:** 1.5 horas

---

### QW-4: Empty States com CTA (F09 + F10)

**Descricao:** Substituir textos planos de "Vazio" por empty states informativos com icone, copy motivacional e call-to-action que direciona ao proximo passo.

**Arquivos afetados:**
- `app/dashboard/page.tsx` (campanhas vazias, leads vazios)
- `app/dashboard/kanban/page.tsx` (colunas vazias)

Specs detalhados na Secao 4 deste documento.

**Esforco estimado:** 1 hora

---

### QW-5: Validacao de login client-side (F07)

**Descricao:** Adicionar `required` nos inputs, validar email format e senha minima antes de submeter. Previne requests desnecessarios.

**Arquivo afetado:**
- `app/page.tsx`

**Codigo sugerido:**

```tsx
const handleLogin = async () => {
  setError("");

  if (!email.trim()) {
    setError("Informe seu email.");
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setError("Email invalido.");
    return;
  }
  if (password.length < 6) {
    setError("Senha deve ter pelo menos 6 caracteres.");
    return;
  }

  setLoading(true);
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      headers: { "Content-Type": "application/json" }
    });
    const data = await res.json();
    if (data.success) {
      router.push("/dashboard");
    } else {
      setError(data.error);
    }
  } catch {
    setError("Erro ao conectar com o servidor.");
  } finally {
    setLoading(false);
  }
};
```

Adicionar atributos `required` e `aria-required="true"` nos `<input>`:

```tsx
<input
  type="email"
  placeholder="seu@email.com"
  className="input-finch"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  required
  aria-required="true"
  autoComplete="email"
  autoFocus
/>
```

**Esforco estimado:** 30 minutos

---

## 4. Empty States Spec

### 4.1 Dashboard -- Sem Campanhas

**Contexto:** Secao "Fluxos de Prospeccao" na Dashboard quando `campaigns.length === 0`.

**Copy:**
- **Titulo:** "Nenhum garimpo iniciado"
- **Subtitulo:** "Inicie sua primeira prospeccao para ver seus leads aqui."
- **CTA:** "Iniciar Primeiro Garimpo" (link para `/dashboard/campanhas/nova`)

**Icone sugerido:** `Search` do Lucide (ja importado na Dashboard)

**Markup:**

```tsx
{campaigns.length === 0 ? (
  <div className="p-16 flex flex-col items-center justify-center gap-4 border border-dashed border-white/10 rounded-sm">
    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
      <Search size={28} className="text-primary/60" />
    </div>
    <div className="text-center">
      <p className="text-sm font-black uppercase tracking-tight">Nenhum garimpo iniciado</p>
      <p className="text-[10px] text-text-muted uppercase tracking-widest mt-1">
        Inicie sua primeira prospeccao para ver seus leads aqui.
      </p>
    </div>
    <Link
      href="/dashboard/campanhas/nova"
      className="btn-finch mt-2 flex items-center gap-2"
    >
      <Rocket size={16} /> Iniciar Primeiro Garimpo
    </Link>
  </div>
) : (
  /* ... existing campaign list ... */
)}
```

---

### 4.2 Dashboard -- Sem Leads Recentes

**Contexto:** Feed "Ouro Recem Extraido" na sidebar quando `recentLeads.length === 0`.

**Copy:**
- **Titulo:** "Nenhum lead extraido"
- **Subtitulo:** "Os leads aparecerao aqui conforme suas campanhas extrairem dados."
- **CTA:** nenhum (orienta sem exigir acao)

**Icone sugerido:** `Zap` do Lucide (ja importado)

**Markup:**

```tsx
{recentLeads.length === 0 ? (
  <div className="p-10 flex flex-col items-center justify-center gap-3">
    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
      <Zap size={20} className="text-primary/50" />
    </div>
    <p className="text-[10px] font-black uppercase tracking-widest text-text-muted text-center">
      Nenhum lead extraido
    </p>
    <p className="text-[9px] text-text-muted/60 uppercase tracking-wider text-center max-w-[200px]">
      Os leads aparecerao aqui conforme suas campanhas extrairem dados.
    </p>
  </div>
) : (
  /* ... existing leads list ... */
)}
```

---

### 4.3 Kanban -- Coluna Vazia

**Contexto:** Coluna sem cards no Kanban (qualquer status).

**Copy:**
- Coluna "Extraidos": "Inicie um garimpo para popular esta coluna."
- Coluna "Qualificados": "Qualifique leads extraidos com IA."
- Coluna "Abordados": "Mova leads qualificados apos contato."
- Coluna "Convertidos": "Seus fechamentos aparecerao aqui."
- Coluna "Perdidos": "Leads descartados ficam aqui."

**Icone sugerido:** nenhum (espaco restrito nas colunas do kanban)

**Markup:**

```tsx
const EMPTY_HINTS: Record<string, string> = {
  extraido:    "Inicie um garimpo para popular esta coluna.",
  qualificado: "Qualifique leads extraidos com IA.",
  abordado:    "Mova leads qualificados apos contato.",
  convertido:  "Seus fechamentos aparecerao aqui.",
  perdido:     "Leads descartados ficam aqui.",
};

// Dentro do map de colunas:
{colLeads.length === 0 ? (
  <div className="text-center py-10 px-3 border border-dashed border-white/5 rounded-sm flex flex-col items-center gap-2">
    <p className="text-[9px] uppercase tracking-widest text-text-muted/50 font-bold leading-relaxed">
      {search ? "Sem resultados para esta busca" : EMPTY_HINTS[col.key] || "Vazio"}
    </p>
  </div>
) : (
  /* ... existing card list ... */
)}
```

---

### 4.4 Leads -- Lista Vazia

**Contexto:** Tabela de leads quando `filtered.length === 0` e nao e loading.

**Copy:**
- **Titulo:** "Base de leads vazia"
- **Subtitulo:** "Inicie uma campanha de garimpo para extrair seus primeiros prospectos."
- **CTA:** "Iniciar Garimpo" (link para `/dashboard/campanhas/nova`)

**Icone sugerido:** `Users` do Lucide

**Markup:**

```tsx
{filtered.length === 0 ? (
  <tr>
    <td colSpan={5} className="text-center py-20">
      <div className="flex flex-col items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
          <Users size={24} className="text-primary/50" />
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-tight">Base de leads vazia</p>
          <p className="text-[10px] text-text-muted uppercase tracking-widest mt-1">
            Inicie uma campanha de garimpo para extrair seus primeiros prospectos.
          </p>
        </div>
        <Link href="/dashboard/campanhas/nova" className="btn-finch mt-2 text-[10px]">
          Iniciar Garimpo
        </Link>
      </div>
    </td>
  </tr>
) : (
  /* ... existing rows ... */
)}
```

---

## 5. Skeleton Loaders Spec

### 5.1 Lista de Leads (Tabela)

Substituir o bloco `loading` em `app/dashboard/leads/page.tsx`. Markup completo no QW-3 acima.

**Principios:**
- Cada "linha skeleton" espelha a estrutura real da tabela (5 colunas)
- Usar `animate-pulse` nativo do Tailwind
- Cores: `bg-white/5` para fundo, `bg-white/8` e `bg-white/10` para elementos
- 6 linhas de skeleton (representa uma pagina tipica)

### 5.2 Cards do Kanban

Substituir o bloco `loading` em `app/dashboard/kanban/page.tsx`. Markup completo no QW-3 acima.

**Principios:**
- Renderizar 5 colunas skeleton (uma por status)
- 3 cards skeleton por coluna
- Cada card espelha: nome (h-3 w-28), endereco (h-2 w-36), score (h-5 w-8), status badge (h-5 w-16), contatos (h-2.5 w-20)
- Manter bordas e espacamento identicos ao card real

### 5.3 Dashboard Campanhas

Substituir "Aguardando primeira campanha..." em `app/dashboard/page.tsx` por skeleton quando `campaigns` esta carregando (requer adicionar estado loading separado):

```tsx
function CampaignRowSkeleton() {
  return (
    <div className="p-6 flex items-center justify-between border-b border-white/5">
      <div className="flex items-center gap-6">
        <div className="w-12 h-12 bg-white/5 rounded-sm animate-pulse" />
        <div className="flex flex-col gap-1.5">
          <div className="h-3.5 w-36 bg-white/10 rounded-sm animate-pulse" />
          <div className="h-2.5 w-48 bg-white/5 rounded-sm animate-pulse" />
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <div className="h-4 w-8 bg-white/10 rounded-sm animate-pulse" />
        <div className="h-2 w-12 bg-white/5 rounded-sm animate-pulse" />
      </div>
    </div>
  );
}
```

---

## 6. Recomendacao de Transicao de Navegacao

### Problema Atual
Troca de rota no Next.js App Router causa flash branco momentaneo. O `<main>` monta/desmonta sem transicao.

### Solucao Recomendada
Adicionar CSS transition no `DashboardLayout` via animacao de fade-in no conteudo principal:

**Arquivo:** `app/globals.css`

```css
/* Page transition */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}

main > * {
  animation: fadeIn 0.2s ease-out;
}
```

**Esforco:** 5 minutos. Alternativa mais robusta: usar `next-view-transitions` (1h de setup).

---

## 7. Achados Adicionais por Tela

### Login (`app/page.tsx`)
- `<Suspense>` sem fallback definido (deveria ter skeleton do form)
- Link "Esqueci a senha" aponta para `/recuperar-senha` -- verificar se rota existe
- Footer com copyright 2026 hardcoded

### Dashboard (`app/dashboard/page.tsx`)
- STATUS_COLORS definido mas nao utilizado no corpo da Dashboard (importado sem uso)
- `AlertTriangle` importado do Lucide mas nunca usado
- `MessageSquare` importado mas nunca usado
- `fetchData` nao tem estado `loading` proprio -- campanhas e leads aparecem "zerados" ate o fetch resolver

### Kanban (`app/dashboard/kanban/page.tsx`)
- Arquivo monolitico com 718 linhas: LeadModal, StatusDropdown, LeadCard e KanbanPage em um unico arquivo. Deveria ser decomposto em componentes separados
- `e: any` na linha 539 no catch -- viola regra TypeScript do projeto (sem `any`)
- Nao ha tecla de atalho para navegar entre colunas (acessibilidade)

### Campanhas (`app/dashboard/campanhas/page.tsx`)
- `confirm()` usado corretamente aqui (diferente do Kanban/Leads que esqueceram)
- Sem filtro/busca -- com muitas campanhas, nao ha como encontrar uma especifica

### Leads (`app/dashboard/leads/page.tsx`)
- `any[]` no estado de leads -- sem tipagem
- Botoes de acao usam emoji ao inves de Lucide icons
- Sem indicador de quantidade por status no header dos filtros
- Re-fetch completo em caso de erro no delete (ineficiente)

---

## 8. Acessibilidade (WCAG AA Quick Scan)

| Criterio | Status | Detalhe |
|----------|--------|---------|
| Contraste de texto | WARN | `text-text-muted` (#6b6b6b) sobre `bg-background` (#080808) = ratio 3.5:1. WCAG AA exige 4.5:1 para texto normal. |
| Labels em inputs | PASS | Login tem labels explicitas. |
| Focus visible | WARN | Nenhum `focus-visible` customizado. Usa outline default do browser (inconsistente em dark theme). |
| Keyboard navigation | FAIL | Kanban cards nao sao focaveis via Tab. StatusDropdown nao suporta Arrow keys. |
| ARIA landmarks | WARN | Layout usa `<main>` mas sidebar nao tem `<nav aria-label>`. |
| Alt text | N/A | Sem imagens no escopo. |
| Motion preferences | FAIL | Animacoes (`animate-pulse`, `animate-spin`) nao respeitam `prefers-reduced-motion`. |

**Recomendacao prioritaria:** Corrigir contraste do `text-muted` para pelo menos `#8a8a8a` (ratio 4.6:1).

---

## 9. Resumo Executivo

| Metrica | Valor |
|---------|-------|
| Total friction points | 18 |
| Critical | 4 |
| High | 6 |
| Medium | 5 |
| Low | 3 |
| Quick Wins identificados | 5 (esforco total: ~4h15min) |
| Tela com mais problemas | Kanban (F01, F02, F05, F06, F08, F10, F14) |
| Tela mais solida | Login (apenas F07, F15) |

### Proximos Passos

1. Implementar os 5 Quick Wins (branch `feat/grf-009-quick-wins`)
2. Planejar drag-and-drop no Kanban como GRF-010 (maior impacto restante)
3. Decompor `kanban/page.tsx` em componentes atomicos (LeadCard, LeadModal, StatusDropdown)
4. Adicionar paginacao na tabela de Leads antes do lancamento multi-usuario
5. Corrigir contraste de `text-muted` para atingir WCAG AA

---

*Auditoria realizada por Uma (UX Design Expert) -- Sprint S2-Q2-2026*
*Garimpo Finch v1 -- Brownfield Review GRF-009*
