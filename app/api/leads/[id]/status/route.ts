import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { status } = await req.json();

  const validStatuses = ["extraido", "qualificado", "abordado", "convertido", "descartado"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Status inválido" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("leads")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Log activity
  await supabaseAdmin.from("activity_logs").insert({
    lead_id: id,
    action: "status_change",
    details: `Status atualizado para: ${status}`,
  });

  return NextResponse.json({ lead: data });
}
