export const scrapeSite = async (url: string): Promise<{
  content: string;
  title: string;
  hasWhatsApp: boolean;
  hasInstagram: boolean;
  loadSpeed: string;
  issues: string[];
}> => {
  const apiKey = process.env.FIRECRAWL_API_KEY;

  if (!url || !apiKey) {
    return { content: "", title: "", hasWhatsApp: false, hasInstagram: false, loadSpeed: "desconhecido", issues: ["Site não disponível"] };
  }

  try {
    const res = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        url,
        formats: ["markdown"],
        onlyMainContent: true,
        timeout: 15000
      })
    });

    if (!res.ok) {
      return { content: "", title: url, hasWhatsApp: false, hasInstagram: false, loadSpeed: "erro", issues: ["Falha ao acessar o site"] };
    }

    const data = await res.json();
    const content = data.data?.markdown || "";
    const title = data.data?.metadata?.title || url;

    // Detectar problemas automaticamente
    const issues: string[] = [];
    const contentLower = content.toLowerCase();

    const hasWhatsApp = contentLower.includes("whatsapp") || contentLower.includes("wa.me");
    const hasInstagram = contentLower.includes("instagram");
    const hasPhone = contentLower.includes("telefone") || contentLower.includes("contato") || /\(\d{2}\)/.test(content);
    const hasForm = contentLower.includes("formulário") || contentLower.includes("orçamento") || contentLower.includes("agendar");
    const hasTestimonials = contentLower.includes("depoimento") || contentLower.includes("avaliação") || contentLower.includes("cliente");
    const hasPrice = contentLower.includes("preço") || contentLower.includes("valor") || contentLower.includes("plano");
    const wordCount = content.split(" ").length;

    if (!hasWhatsApp) issues.push("Sem botão de WhatsApp visível — perde leads no momento mais quente");
    if (!hasForm) issues.push("Sem formulário de captura ou CTA de agendamento");
    if (!hasTestimonials) issues.push("Sem prova social — zero depoimentos ou avaliações visíveis");
    if (!hasPrice) issues.push("Sem preço ou âncora de valor — cria fricção desnecessária");
    if (wordCount < 100) issues.push("Site com conteúdo mínimo — não ranqueia e não convence");
    if (!hasInstagram) issues.push("Sem link para redes sociais — nenhuma autoridade digital");

    return {
      content: content.substring(0, 3000), // limita para o prompt
      title,
      hasWhatsApp,
      hasInstagram,
      loadSpeed: "verificado",
      issues
    };
  } catch (e) {
    return { content: "", title: url, hasWhatsApp: false, hasInstagram: false, loadSpeed: "erro", issues: ["Erro ao acessar site"] };
  }
};
