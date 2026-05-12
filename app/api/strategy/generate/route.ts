export const runtime = 'edge';

import { NextResponse } from "next/server";
import { queryOpenRouter } from "@/lib/openrouter";

export async function POST(req: Request) {
  try {
    const briefing = await req.json();

    const systemPrompt = `Você é um Estrategista Sênior de Geração de Demanda.
Sua missão é transformar um briefing de negócio em um dossiê tático de prospecção focado no framework FALSA RUÍNA.

SAÍDA OBRIGATÓRIA: Um objeto JSON válido com os campos:
- icp: (String de texto) Descrição técnica e comportamental do Perfil de Cliente Ideal.
- persona: (String de texto) Nome, medos, dores latentes e quem é o decisor, tudo formatado em um único bloco de texto.
- angle: (String de texto) O ângulo de abordagem "Falsa Ruína" mais letal.

REGRAS CRÍTICAS:
- Os campos icp, persona e angle devem ser STRINGS de texto, nunca objetos aninhados.
- Use quebras de linha (\n) dentro das strings para formatar o texto.
- Tom de autoridade máxima e sofisticado.`;

    const userPrompt = `Briefing do Cliente:
Empresa: ${briefing.business}
Ticket Médio: ${briefing.price}
Decisor: ${briefing.decisionMaker}
Problema que resolve: ${briefing.mainProblem}

Com base nisso, destile o ICP, Persona e o Ângulo de Ataque para o Garimpo Finch.
Retorne APENAS o JSON.`;

    const aiResponse = await queryOpenRouter(userPrompt, systemPrompt);
    
    // Limpar resposta caso a IA coloque blocos de código
    const jsonString = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    const strategy = JSON.parse(jsonString);

    return NextResponse.json({ success: true, strategy });

  } catch (error: any) {
    console.error("Erro na síntese estratégica:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
