import { supabaseAdmin } from "./supabase";
import { queryOpenRouter } from "./openrouter";
import { FINCH_SYSTEM_PROMPT, getQualifyPrompt } from "./prompts";
import { scrapeSite } from "./scraper";

export const searchLeads = async (query: string, campaignId?: string, metadata?: { product?: string, icp?: string, location?: string }) => {
  const apiKeys = (process.env.SERPER_API_KEYS || process.env.SERPER_API_KEY || "").split(",").map(k => k.trim()).filter(k => k);

  // Criar campanha automaticamente
  let activeCampaignId = campaignId;
  if (!activeCampaignId) {
    const { data: campaign } = await supabaseAdmin
      .from('campaigns')
      .insert({ 
        name: `Garimpo: ${query}`, 
        niche: query,
        location: metadata?.location || "Brasil",
      })
      .select()
      .single();
    activeCampaignId = campaign?.id;
  }

  const fullQuery = metadata?.location ? `${query} em ${metadata.location}` : query;
  console.log(`🔍 Iniciando garimpo: "${fullQuery}"`);

  let data: any = null;
  let lastError = "";

  // Tentar cada chave até uma funcionar
  for (const key of apiKeys) {
    try {
      console.log(`Tentando Serper com chave: ${key.substring(0, 6)}...`);
      const response = await fetch("https://google.serper.dev/maps", {
        method: "POST",
        headers: {
          "X-API-KEY": key,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ q: fullQuery })
      });

      const resData = await response.json();
      console.log(`📡 Serper Response [${key.substring(0, 6)}]:`, JSON.stringify(resData).substring(0, 200));

      if (response.ok && !resData.error && resData.message !== "Unauthorized.") {
        data = resData;
        break; // Sucesso!
      } else {
        lastError = resData.error || resData.message || response.statusText;
        console.warn(`❌ Chave ${key.substring(0, 6)} falhou: ${lastError}`);
      }
    } catch (e: any) {
      lastError = e.message;
      console.error(`Erro na requisição com chave ${key.substring(0, 6)}:`, e.message);
    }
  }

  if (!data) {
    console.error("Todas as chaves do Serper falharam ou estão sem crédito.");
    return { campaignId: activeCampaignId, leads: [], error: lastError };
  }

  console.log("Serper Data Success:", JSON.stringify(data).substring(0, 200));
  const places = data.places || data.maps || [];

  if (places.length === 0) {
    console.warn("Nenhum lead encontrado pelo Serper para a query:", query);
    return { campaignId: activeCampaignId, leads: [] };
  }

  const leads = places.map((place: any) => {
    return {
      campaign_id: activeCampaignId,
      name: place.title || "Empresa sem nome",
      website: place.website || null,
      phone: place.phoneNumber || null,
      address: place.address || null,
      niche: query, // Esta coluna existe no banco
      status: 'extraido',
      score: 0, // Esta coluna existe no banco
      diagnosis: { 
        rating: place.rating, 
        reviews: place.ratingCount,
        category: place.type 
      },
      raw_data: place
    };
  });

  // Atualizar total na campanha
  if (activeCampaignId) {
    try {
      await supabaseAdmin
        .from('campaigns')
        .update({ total_leads: leads.length })
        .eq('id', activeCampaignId);
    } catch (e) {
      console.warn("Aviso: Falha ao atualizar contador da campanha:", e);
    }
  }

  console.log(`🚀 Preparado para salvar ${leads.length} leads no Supabase (Schema Real)...`);

  // Tentamos inserir com campaign_id, se falhar tentamos sem (legado)
  const { data: savedLeads, error } = await supabaseAdmin
    .from('leads')
    .insert(leads)
    .select();
 
  if (error) {
    console.error("❌ Erro ao salvar leads (tentando fallback sem colunas extras):", error.message);
    // Fallback: remove colunas que podem não existir no schema, mas MANTÉM campaign_id
    const fallbackLeads = leads.map((lead: any) => ({
      campaign_id: lead.campaign_id,
      name: lead.name,
      website: lead.website,
      phone: lead.phone,
      address: lead.address,
      niche: lead.niche,
      status: lead.status,
      score: lead.score,
    }));
    const { data: retryLeads, error: retryError } = await supabaseAdmin
      .from('leads')
      .insert(fallbackLeads)
      .select();

    if (retryError) {
      console.error("❌ Falha total ao salvar leads:", retryError.message);
      return { campaignId: activeCampaignId, leads: [], error: retryError.message };
    }
    console.log(`✅ Salvos ${retryLeads?.length || 0} leads (via fallback, campaign_id preservado)`);
    return { campaignId: activeCampaignId, leads: retryLeads || [] };
  }

  console.log(`✅ Salvos ${savedLeads?.length || 0} leads com sucesso.`);
  return { campaignId: activeCampaignId, leads: savedLeads || [] };
};

export const qualifyLead = async (leadId: string) => {
  const { data: lead } = await supabaseAdmin
    .from('leads')
    .select('*')
    .eq('id', leadId)
    .single();

  if (!lead) return null;

  try {
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
    // reviews está em lead.diagnosis.reviews (salvo pelo searchLeads), não como coluna direta
    const flawCount = siteAnalysis?.issues?.length || 0;
    const reviews = lead.diagnosis?.reviews || 0;
    const score = Math.min(50 + (flawCount * 8) + (reviews > 10 ? 15 : 0), 100);

    // flaws é text[] no Supabase — enviar como array, não string
    const flaws = siteAnalysis?.issues?.length ? siteAnalysis.issues : ["Site não analisado — sem URL disponível"];
    const unique_mechanism = "IA de diagnóstico e copy personalizada";

    const { data: updatedLead, error: updateError } = await supabaseAdmin
      .from('leads')
      .update({
        score,
        flaws,
        unique_mechanism,
        whatsapp_copy: whatsappCopy,
        status: 'qualificado'
      })
      .eq('id', leadId)
      .select()
      .single();

    if (updateError) throw new Error(`Supabase update: ${updateError.message}`);
    return updatedLead;
  } catch (error) {
    console.error("Erro na qualificação:", error);
    throw error; // Propaga para qualify-all capturar via Promise.allSettled
  }
};
