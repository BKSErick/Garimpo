export const runtime = 'edge';

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { qualifyLead } from "@/lib/prospector";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // 1. Encontrar o próximo lead não qualificado desta campanha
  const { data: nextLead, error } = await supabaseAdmin
    .from("leads")
    .select("id")
    .eq("campaign_id", id)
    .eq("status", "extraido")
    .limit(1)
    .single();

  if (error || !nextLead) {
    return NextResponse.json({ 
      success: true, 
      finished: true,
      message: "Todos os leads foram processados." 
    });
  }

  // 2. Qualificar o lead
  try {
    const qualified = await qualifyLead(nextLead.id);
    return NextResponse.json({ 
      success: true, 
      finished: false,
      leadId: nextLead.id,
      qualified: !!qualified
    });
  } catch (e: any) {
    return NextResponse.json({ 
      success: false, 
      error: e.message 
    }, { status: 500 });
  }
}
