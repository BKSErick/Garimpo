export const runtime = 'edge';

import { NextResponse } from "next/server";
import { qualifyLead } from "@/lib/prospector";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lead = await qualifyLead(id);
  if (!lead) return NextResponse.json({ error: "Lead não encontrado" }, { status: 404 });
  return NextResponse.json({ lead });
}
