export const runtime = 'edge';

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { queryOpenRouter } from "@/lib/openrouter";
import { getSystemPrompt, DEFAULT_SYSTEM_PROMPT, getQualifyPrompt } from "@/lib/prompts";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data: lead } = await supabaseAdmin
    .from("leads")
    .select("*")
    .eq("id", id)
    .single();

  if (!lead) {
    return NextResponse.json({ error: "Lead não encontrado." }, { status: 404 });
  }

  if (!lead.score && !lead.flaws) {
    return NextResponse.json(
      { error: "Lead não qualificado — execute a qualificação primeiro." },
      { status: 400 }
    );
  }

  let campaignContext: { product?: string; icp?: string } = {};
  if (lead.campaign_id) {
    const { data: campaign } = await supabaseAdmin
      .from("campaigns")
      .select("product_description, icp_description")
      .eq("id", lead.campaign_id)
      .single();
    if (campaign) {
      campaignContext = {
        product: campaign.product_description || undefined,
        icp: campaign.icp_description || undefined,
      };
    }
  }

  const systemPrompt = (campaignContext.product && campaignContext.icp)
    ? getSystemPrompt(campaignContext.product, campaignContext.icp)
    : DEFAULT_SYSTEM_PROMPT;

  const siteAnalysis = lead.flaws?.length
    ? { issues: Array.isArray(lead.flaws) ? lead.flaws : [lead.flaws] }
    : null;

  const prompt = getQualifyPrompt(lead, siteAnalysis, campaignContext);
  const whatsappCopy = await queryOpenRouter(prompt, systemPrompt);

  const { error } = await supabaseAdmin
    .from("leads")
    .update({ whatsapp_copy: whatsappCopy })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const parts = whatsappCopy.split(/\[MENSAGEM 2\]/i);
  const mensagem1 = parts[0]?.replace(/\[MENSAGEM 1\]/i, "").trim() || "";
  const mensagem2 = parts[1]?.trim() || "";

  return NextResponse.json({ mensagem1, mensagem2, whatsapp_copy: whatsappCopy });
}
