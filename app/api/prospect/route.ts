export const runtime = 'nodejs';
export const maxDuration = 60;

import { NextResponse } from "next/server";
import { searchLeads, qualifyLead } from "@/lib/prospector";

export async function POST(req: Request) {
  const { query, product, icp, location, autoQualify = false } = await req.json();

  if (!query) {
    return NextResponse.json({ error: "Busca é obrigatória." }, { status: 400 });
  }

  try {
    // 1. Iniciar busca e criar campanha com metadados ricos
    const result = await searchLeads(query, undefined, { product, icp, location });
    if (!result || !result.leads) {
      throw new Error("Falha na extração: Resposta inválida do motor de busca.");
    }
    const { campaignId, leads } = result;

    if (leads.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: "Nenhum resultado encontrado. Verifique sua conexão ou API Key do Serper.",
        campaignId 
      });
    }

    // 2. Se autoQualify, qualificar o primeiro lead de forma síncrona
    // (Edge Runtime cancela Promises após o return — fire-and-forget não funciona aqui)
    if (autoQualify && leads.length > 0) {
      try {
        await qualifyLead(leads[0].id);
      } catch (e) {
        console.error("autoQualify falhou no primeiro lead:", e);
      }
    }

    return NextResponse.json({ 
      success: true, 
      campaignId,
      count: leads.length, 
      leads: leads.slice(0, 10) // Retornamos apenas os primeiros para agilizar a resposta
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
