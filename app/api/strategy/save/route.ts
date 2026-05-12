// Removido edge runtime para debugar conexão com Supabase
// export const runtime = 'edge';

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { id, briefing, result, name } = await req.json();

    const payload = {
      briefing,
      result,
      name: name || `Estratégia: ${briefing.business.substring(0, 20)}...`,
      updated_at: new Date().toISOString()
    };

    let query;
    if (id) {
      // Atualizar existente
      query = supabaseAdmin.from('strategic_lab').upsert({ id, ...payload });
    } else {
      // Criar novo (id será gerado pelo banco se for auto-increment, mas aqui vamos deixar o banco cuidar)
      query = supabaseAdmin.from('strategic_lab').insert([payload]);
    }

    const { data, error } = await query.select();

    if (error) {
      console.error("Erro ao salvar no Supabase:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: data[0] });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('strategic_lab')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ success: true, data: data || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    const { error } = await supabaseAdmin.from('strategic_lab').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
