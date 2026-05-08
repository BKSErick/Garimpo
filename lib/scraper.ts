// Usa o SDK oficial do Firecrawl (@mendable/firecrawl-js)
// Documentação: https://docs.firecrawl.dev

type SiteAnalysis = {
  content: string;
  title: string;
  hasWhatsApp: boolean;
  hasInstagram: boolean;
  issues: string[];
};

export const scrapeSite = async (url: string): Promise<SiteAnalysis> => {
  const apiKey = process.env.FIRECRAWL_API_KEY;

  const empty: SiteAnalysis = {
    content: "",
    title: url,
    hasWhatsApp: false,
    hasInstagram: false,
    issues: ["Site não analisado"]
  };

  if (!url || !apiKey) return empty;

  try {
    // Usando REST API v1 diretamente (compatível com tier gratuito)
    const scrapeController = new AbortController();
    const scrapeTimeout = setTimeout(() => scrapeController.abort(), 15000);

    const res = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      signal: scrapeController.signal,
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        url,
        formats: ["markdown"],
        onlyMainContent: true,
        timeout: 12000,
        // Webhook para crawls assíncronos (opcional)
        // webhook: { url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/firecrawl`, secret: process.env.FIRECRAWL_WEBHOOK_SECRET }
      })
    }).finally(() => clearTimeout(scrapeTimeout));

    if (!res.ok) {
      console.error(`[Firecrawl] Erro HTTP ${res.status} para ${url}`);
      return { ...empty, issues: [`Site retornou erro ${res.status}`] };
    }

    const data = await res.json();

    if (!data.success) {
      console.error(`[Firecrawl] Falha no scrape:`, data.error);
      return { ...empty, issues: ["Falha ao acessar o site"] };
    }

    const content: string = data.data?.markdown || "";
    const title: string = data.data?.metadata?.title || url;
    const contentLower = content.toLowerCase();

    // Detecção automática de falhas de conversão
    const issues: string[] = [];
    const hasWhatsApp = contentLower.includes("whatsapp") || contentLower.includes("wa.me") || contentLower.includes("zap");
    const hasInstagram = contentLower.includes("instagram") || contentLower.includes("@");
    const hasForm = contentLower.includes("formulário") || contentLower.includes("formulario") || contentLower.includes("orçamento") || contentLower.includes("orcamento") || contentLower.includes("agendar") || contentLower.includes("reservar");
    const hasTestimonials = contentLower.includes("depoimento") || contentLower.includes("avaliação") || contentLower.includes("avaliacao") || contentLower.includes("cliente") || contentLower.includes("resultado");
    const hasPrice = contentLower.includes("preço") || contentLower.includes("preco") || contentLower.includes("valor") || contentLower.includes("investimento") || contentLower.includes("plano");
    const hasPhone = /\(\d{2}\)\s*\d/.test(content) || contentLower.includes("telefone") || contentLower.includes("ligue");
    const wordCount = content.split(/\s+/).length;

    if (!hasWhatsApp) issues.push("Sem botão de WhatsApp — perde leads no momento mais quente");
    if (!hasForm) issues.push("Sem CTA de agendamento ou orçamento");
    if (!hasTestimonials) issues.push("Zero prova social visível — clientes não confiam sem depoimentos");
    if (!hasPrice) issues.push("Sem ancoragem de preço — gera fricção e afasta clientes prontos");
    if (!hasPhone) issues.push("Sem telefone visível — dificulta contato direto");
    if (wordCount < 150) issues.push("Site com conteúdo raso — não ranqueia e não convence");
    if (!hasInstagram) issues.push("Sem presença em redes sociais visível no site");

    return {
      content: content.substring(0, 3000),
      title,
      hasWhatsApp,
      hasInstagram,
      issues
    };

  } catch (e: any) {
    console.error(`[Firecrawl] Exceção ao analisar ${url}:`, e.message);
    return { ...empty, issues: ["Erro de conexão ao analisar o site"] };
  }
};
