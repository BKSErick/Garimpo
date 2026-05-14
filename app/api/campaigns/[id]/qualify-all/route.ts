import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { qualifyLead } from "@/lib/prospector";

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // 1. Buscar todos os leads da campanha que ainda não foram qualificados
    const { data: leads, error: fetchError } = await supabaseAdmin
      .from('leads')
      .select('id')
      .eq('campaign_id', id)
      .eq('status', 'extraido');

    if (fetchError) throw fetchError;

    if (!leads || leads.length === 0) {
      return NextResponse.json({ message: "Nenhum lead pendente de qualificação." });
    }

    // 2. Disparar qualificação (processamento assíncrono simulado via Promise.all ou loop controlado)
    // No Edge Runtime, não temos background jobs reais, mas podemos disparar as requisições
    // Para não estourar limite de tempo da Edge Function, processamos em pequenos lotes ou apenas disparamos
    
    console.log(`Iniciando qualificação em lote para ${leads.length} leads.`);

    // NOTA: Em produção, o ideal seria uma Queue (n8n, BullMQ, etc). 
    // Aqui fazemos um disparo controlado para não travar a resposta.
    // Edge Runtime cancela Promises após o return, então processamos síncronamente.
    // Limitamos a 5 leads por chamada para não exceder o timeout de 30s do Edge.
    // A campanha page fará novas chamadas via polling enquanto houver pendentes.
    const BATCH_SIZE = 3;
    const batch = leads.slice(0, BATCH_SIZE);

    const results = await Promise.allSettled(batch.map(lead => qualifyLead(lead.id)));
    const qualified = results.filter(r => r.status === 'fulfilled' && r.value).length;

    const firstError = results
      .find(r => r.status === 'rejected') as PromiseRejectedResult | undefined;
    const errorMessage = firstError?.reason?.message || null;

    results.forEach((r, i) => {
      if (r.status === 'rejected') console.error(`Erro ao qualificar lead ${batch[i].id}:`, r.reason);
    });

    const hasMore = leads.length > BATCH_SIZE;

    return NextResponse.json({
      success: qualified > 0,
      qualified,
      processed: batch.length,
      hasMore,
      remaining: Math.max(0, leads.length - BATCH_SIZE),
      error: qualified === 0 ? (errorMessage || 'Nenhum lead qualificado — verifique logs do servidor') : null,
      message: hasMore
        ? `${qualified}/${batch.length} qualificados. ${leads.length - BATCH_SIZE} restantes.`
        : `Qualificação concluída: ${qualified}/${batch.length} leads.`
    });

  } catch (error: any) {
    console.error("Erro no qualify-all:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
