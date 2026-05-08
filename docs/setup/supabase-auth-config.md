# Supabase Auth Config — Garimpo Finch

## Redirect URLs (Painel Supabase → Authentication → URL Configuration)

Adicionar nas **Redirect URLs**:

```
https://saas-garimpofinch.pages.dev/atualizar-senha
http://localhost:3000/atualizar-senha
```

## Email Template — Reset Password

Painel: **Authentication → Email Templates → Reset Password**

**Assunto:**
```
Garimpo Finch — Redefinição de Senha
```

**Corpo (HTML):**
```html
<h2>Redefinição de Senha</h2>
<p>Clique no link abaixo para definir uma nova senha:</p>
<p><a href="{{ .ConfirmationURL }}">Redefinir minha senha</a></p>
<p>O link expira em 1 hora. Se você não solicitou a redefinição, ignore este email.</p>
<br>
<p>— Equipe Garimpo Finch</p>
```

## SMTP (Resend — grátis até 3k emails/mês)

1. Criar conta em [resend.com](https://resend.com)
2. Gerar API Key
3. Painel Supabase → **Authentication → SMTP Settings**:

```
Host:     smtp.resend.com
Port:     465
User:     resend
Password: <sua-api-key>
Sender:   noreply@seudominio.com
```

## Variáveis de Ambiente

### `.env.local` (desenvolvimento)
```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Cloudflare Pages (produção)
Settings → Environment Variables:
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_SITE_URL=https://saas-garimpofinch.pages.dev
```

## Cloudflare Pages — Workers Paid

O bundle atual (~9 MiB) excede o limite free (3 MiB).
Requer o plano **Workers Paid ($5/mês)** — limite de 10 MiB.

Ativar em: [dash.cloudflare.com](https://dash.cloudflare.com) → Workers & Pages → Plans → Workers Paid

---
*GRF-STORY-011 — Sprint S2-Q2-2026*
