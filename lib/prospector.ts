import { supabaseAdmin } from "./supabase";
import { queryOpenRouter } from "./openrouter";
import { FINCH_SYSTEM_PROMPT, getQualifyPrompt } from "./prompts";
import { scrapeSite } from "./scraper";

export const searchLeads = async (query: string, campaignId?: string) => {
  const apiKey = process.env.SERPER_API_KEY;

  // Criar campanha automaticamente
  let activeCampaignId = campaignId;
  if (!activeCampaignId) {
    const { data: campaign } = await supabaseAdmin
      .from('campaigns')
      .insert({ name: `Garimpo: ${query}`, niche: query })
      .select()
      .single();
    activeCampaignId = campaign?.id;
  }

  const response = await fetch("https://google.serper.dev/maps", {
    method: "POST",
    headers: {
      "X-API-KEY": apiKey!,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ q: query })
  });

  const data = await response.json();
  const places = data.maps || [];

  if (places.length === 0) return { campaignId: activeCampaignId, leads: [] };

  const leads = places.map((place: any) => ({
    campaign_id: activeCampaignId,
    name: place.title,
    address: place.address,
    phone: place.phoneNumber,
    website: place.website,
    rating: place.rating ? parseFloat(place.rating) : null,
    reviews_count: place.ratingCount || 0,
    status: 'extraido',
    raw_data: place
  }));

  // Atualizar total na campanha
  await supabaseAdmin
    .from('campaigns')
    .update({ total_leads: leads.length })
    .eq('id', activeCampaignId);

  const { data: savedLeads, error } = await supabaseAdmin
    .from('leads')
    .insert(leads)
    .select();

  if (error) console.error("Erro ao salvar leads:", error);
  return { campaignId: activeCampaignId, leads: savedLeads || [] };
};

export const qualifyLead = async (leadId: string) => {
  const { data: lead } = await supabaseAdmin
    .from('leads')
    .select('*')
    .eq('id', leadId)
    .single();

  if (!lead) return null;

  // 1. Analisar site com Firecrawl (se tiver website)
  let siteAnalysis = null;
  if (lead.website) {
    console.log(`Analisando site: ${lead.website}`);
    siteAnalysis = await scrapeSite(lead.website);
  }

  // 2. Gerar copy com IA usando dados reais do site
  const prompt = getQualifyPrompt(lead, siteAnalysis);
  const whatsappCopy = await queryOpenRouter(prompt, FINCH_SYSTEM_PROMPT);

  // 3. Calcular score com base nas falhas detectadas
  const flawCount = siteAnalysis?.issues?.length || 0;
  const score = Math.min(50 + (flawCount * 8) + (lead.reviews_count > 10 ? 15 : 0), 100);

  // 4. Montar diagnóstico
  const diagnosis = {
    flaws: siteAnalysis?.issues || ["Site não analisado — sem URL disponível"],
    mechanism: "IA de diagnóstico e copy personalizada",
    vulnerability_level: flawCount >= 4 ? "Crítica" : flawCount >= 2 ? "Alta" : "Média",
    site_has_whatsapp: siteAnalysis?.hasWhatsApp || false,
    site_has_instagram: siteAnalysis?.hasInstagram || false,
  };

  const { data: updatedLead } = await supabaseAdmin
    .from('leads')
    .update({
      score,
      diagnosis,
      whatsapp_copy: whatsappCopy,
      status: 'qualificado'
    })
    .eq('id', leadId)
    .select()
    .single();

  // 5. Log de atividade
  await supabaseAdmin.from('activity_logs').insert({
    lead_id: leadId,
    action: 'qualification',
    details: `Score: ${score} | Falhas: ${flawCount} | Modelo: ${process.env.AIOS_DEFAULT_MODEL}`
  });

  return updatedLead;
};
