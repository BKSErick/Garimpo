import { NextResponse } from "next/server";
import { queryOpenRouter } from "@/lib/openrouter";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { objectionText, objectionId } = await req.json();
    if (!objectionText?.trim()) {
      return NextResponse.json({ error: "Texto da objeção obrigatório" }, { status: 400 });
    }

    const prompt = `Você é um especialista em vendas consultivas e quebra de objeções com 20 anos de experiência.

Crie uma resposta persuasiva, empática e eficaz para a seguinte objeção de um prospecto:

"${objectionText}"

Regras:
- Valide a objeção antes de contorná-la (empatia primeiro)
- Use a lógica do "custo do problema vs. custo da solução"
- Seja direto e assertivo (3-5 frases no máximo)
- Termine com uma micro-ação ou pergunta que avança a conversa
- Português brasileiro, tom profissional mas humano e natural
- NÃO use bullet points, títulos ou formatação — apenas texto corrido

Retorne APENAS o texto da resposta.`;

    const response = await queryOpenRouter(prompt);

    if (objectionId) {
      await supabaseAdmin
        .from("objections")
        .update({ response })
        .eq("id", objectionId)
        .eq("is_universal", false);
    }

    return NextResponse.json({ response });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
