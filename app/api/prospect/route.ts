export const runtime = 'edge';

import { NextResponse } from "next/server";
import { searchLeads, qualifyLead } from "@/lib/prospector";

export async function POST(req: Request) {
  const { query, autoQualify = false } = await req.json();

  if (!query) {
    return NextResponse.json({ error: "Query é obrigatória." }, { status: 400 });
  }

  try {
    const result = await searchLeads(query);
    const leads = result.leads;

    if (autoQualify && leads.length > 0) {
      await qualifyLead(leads[0].id);
    }

    return NextResponse.json({ success: true, count: leads.length, leads });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
