export const runtime = 'edge';

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const campaignId = searchParams.get("campaign_id");

  let query = supabaseAdmin
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (campaignId) {
    console.log(`Buscando leads para campanha: ${campaignId}`);
    
    // Tenta filtrar por campaign_id
    const { data, error } = await supabaseAdmin
      .from("leads")
      .select("*")
      .eq("campaign_id", campaignId)
      .order("created_at", { ascending: false });
    
    // Se falhar OU vier vazio, tentamos o fallback por NICHE
    if ((error && error.code === 'PGRST204') || (!error && (!data || data.length === 0))) {
      console.log(`Fallback ativado: nenhum lead com campaign_id ${campaignId}. Buscando por nicho...`);
      
      // 1. Buscar a campanha para pegar o niche
      const { data: campaign } = await supabaseAdmin
        .from("campaigns")
        .select("niche")
        .eq("id", campaignId)
        .single();
        
      if (campaign?.niche) {
        console.log(`Nicho encontrado: ${campaign.niche}. Buscando leads...`);
        const { data: nicheLeads } = await supabaseAdmin
          .from("leads")
          .select("*")
          .order("created_at", { ascending: false });

        // Dedup por nome+phone para não retornar o mesmo negócio duas vezes
        const seen = new Set<string>();
        const deduped = (nicheLeads || []).filter((l: any) => {
          const key = `${l.name?.toLowerCase()}|${l.phone || ""}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        return NextResponse.json({
          leads: deduped,
          fallback: true,
          reason: "niche_match"
        });
      }
    }
    
    return NextResponse.json({ leads: data || [] });
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  
  return NextResponse.json({ leads: data || [] });
}
