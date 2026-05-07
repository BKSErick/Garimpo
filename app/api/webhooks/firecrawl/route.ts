export const runtime = 'edge';

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { qualifyLead } from "@/lib/prospector";

export async function POST(req: Request) {
  // Validar o webhook secret
  const secret = req.headers.get("x-webhook-secret") || req.headers.get("authorization")?.replace("Bearer ", "");
  if (secret !== process.env.FIRECRAWL_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await req.json();
  console.log("[Firecrawl Webhook]", JSON.stringify(payload, null, 2));

  // Firecrawl envia o resultado do crawl quando job assíncrono completa
  const { type, data, metadata } = payload;

  if (type === "crawl.completed" && metadata?.leadId) {
    const leadId = metadata.leadId;
    const siteContent = data?.[0]?.markdown || "";

    // Atualiza o raw_data do lead com o conteúdo do site
    await supabaseAdmin
      .from("leads")
      .update({ raw_data: { ...metadata, site_content: siteContent } })
      .eq("id", leadId);

    // Dispara a qualificação automática com o conteúdo do site
    await qualifyLead(leadId);

    // Log
    await supabaseAdmin.from("activity_logs").insert({
      lead_id: leadId,
      action: "firecrawl_webhook",
      details: `Crawl concluído. ${siteContent.length} chars analisados.`
    });

    return NextResponse.json({ success: true, leadId });
  }

  return NextResponse.json({ received: true, type });
}
