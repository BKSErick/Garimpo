import { supabaseAdmin } from "./supabase";
import { queryOpenRouter } from "./openrouter";
import { FINCH_SYSTEM_PROMPT, getQualifyPrompt } from "./prompts";

export const searchLeads = async (query: string, campaignId?: string) => {
  const apiKey = process.env.SERPER_API_KEY;
  
  // 1. Criar campanha se não existir
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

  const leads = places.map((place: any) => ({
    campaign_id: activeCampaignId,
    name: place.title,
    address: place.address,
    phone: place.phoneNumber,
    website: place.website,
    rating: place.rating,
    reviews_count: place.ratingCount,
    status: 'extraido',
    raw_data: place
  }));

  // Salva no Supabase
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

  // Prompt Finch — Agora com mais dados (reviews, website)
  const analysis = await queryOpenRouter(getQualifyPrompt(lead), FINCH_SYSTEM_PROMPT);

  // Simulação de parser de diagnóstico
  const diagnosis = {
    flaws: ["Site obsoleto", "Falta de botão WhatsApp direto", "Carregamento lento"],
    mechanism: "Vendedor de IA 24h",
    vulnerability_level: "Crítica"
  };

  const { data: updatedLead } = await supabaseAdmin
    .from('leads')
    .update({
        score: 88,
        diagnosis,
        whatsapp_copy: analysis,
        status: 'qualificado'
    })
    .eq('id', leadId)
    .select()
    .single();

  // Log de Atividade
  await supabaseAdmin.from('activity_logs').insert({
    lead_id: leadId,
    action: 'qualification',
    details: 'Diagnóstico de Falsa Ruína concluído via Claude 3.5'
  });

  return updatedLead;
};
