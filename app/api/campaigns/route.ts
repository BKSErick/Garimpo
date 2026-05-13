import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const PLAN_LIMITS: Record<string, number> = {
  "STARTER": 5,
  "MINERADOR": 20,
  "INDUSTRIAL": 40,
  "ADM": 100
};

import { supabaseAdmin } from "@/lib/supabase";
import { searchLeads, searchLeadsInstagram } from "@/lib/prospector";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: () => {},
    },
  });

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    console.error("DEBUG [Campaigns API]: No user found in session");
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  console.log(`DEBUG [Campaigns API]: Fetching campaigns for user_id: ${user.id} (${user.email})`);

  const { data, error } = await supabaseAdmin
    .from("campaigns")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("DEBUG [Campaigns API]: Database error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  console.log(`DEBUG [Campaigns API]: Found ${data?.length || 0} campaigns`);
  return NextResponse.json({ campaigns: data || [] });
}

export async function POST(req: Request) {
  try {
    const { name, niche, location, product, icp, source } = await req.json();
    
    // 0. Identificar Usuário e Plano
    const cookieStore = await cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Buscar Plano Real
    let userPlan = "STARTER";
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single();

    if (profile?.plan) {
      userPlan = profile.plan;
    } else if (user.email === "admin@prospectos.com" || user.app_metadata?.role === "admin") {
      userPlan = "ADM";
    }

    const CURRENT_PLAN_LIMIT = PLAN_LIMITS[userPlan] || 5;

    // 1. Verificar Quota
    const { count, error: countError } = await supabaseAdmin
      .from('campaigns')
      .select('*', { count: 'exact', head: true })
      .in('status', ['processando', 'ativo']);

    if (countError) throw countError;
    if (count !== null && count >= CURRENT_PLAN_LIMIT) {
      return NextResponse.json({ 
        success: false, 
        error: `LIMITE DE QUOTA ATINGIDO: Seu plano ${userPlan} permite até ${CURRENT_PLAN_LIMIT} sondas ativas. Finalize ou exclua uma campanha para iniciar outra.` 
      }, { status: 403 });
    }
    
    // 2. Criar a campanha primeiro
    const { data: campaign, error: campaignError } = await supabaseAdmin
      .from('campaigns')
      .insert({
        name: name || `Garimpo: ${niche}`,
        niche: niche,
        location: location || "Brasil",
        product_description: product || "Serviços B2B", 
        icp_description: icp || "Empresas locais e prestadores de serviço",
        status: 'processando'
      })
      .select()
      .single();

    if (campaignError) throw campaignError;

    // 2. Disparar a busca de leads (Google Maps ou Instagram)
    const searchFn = source === "instagram" ? searchLeadsInstagram : searchLeads;
    const { leads, error: searchError } = await searchFn(niche, campaign.id, { location });

    if (searchError) {
      return NextResponse.json({ 
        success: false, 
        error: `Erro na prospecção: ${searchError}`,
        campaignId: campaign.id
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      campaign,
      leadsFound: leads?.length || 0
    });

  } catch (error: any) {
    console.error("Erro ao criar campanha:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    const { error } = await supabaseAdmin.from('campaigns').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
