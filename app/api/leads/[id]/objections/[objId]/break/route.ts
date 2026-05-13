export const runtime = 'edge';

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { queryOpenRouter } from "@/lib/openrouter";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string; objId: string }> }
) {
  const { id, objId } = await params;

  const [{ data: lead }, { data: objection }] = await Promise.all([
    supabaseAdmin.from("leads").select("name, niche, diagnosis").eq("id", id).single(),
    supabaseAdmin.from("objections").select("*").eq("id", objId).eq("lead_id", id).single(),
  ]);

  if (!objection) {
    return NextResponse.json({ error: "Objeção não encontrada." }, { status: 404 });
  }

  const systemPrompt = `Você é um especialista em vendas consultivas de alto valor, aplicando o método Nudge™ e a filosofia da Falsa Ruína.
Sua missão é quebrar objeções de prospects de forma sofisticada, empática e cirúrgica.
Reposicione o prospect sem confrontar — use lógica, prova e escassez emocional.`;

  const userPrompt = `Lead: ${lead?.name || "Prospect"}
Nicho: ${lead?.niche || "Negócio"}
Diagnóstico: ${(lead?.diagnosis as any)?.mechanism || ""}

Objeção recebida: "${objection.text}"

Escreva UMA resposta de quebra de objeção em português, no tom de um vendedor sênior experiente.
Máximo 3 parágrafos curtos. Sem formatação markdown. Apenas o texto da resposta.`;

  const aiResponse = await queryOpenRouter(userPrompt, systemPrompt);

  const { data: updated, error } = await supabaseAdmin
    .from("objections")
    .update({ ai_response: aiResponse })
    .eq("id", objId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ objection: updated });
}
