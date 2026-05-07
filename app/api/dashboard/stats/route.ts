export const runtime = 'edge';

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    const [leadsRes, abordadosRes, respoRes, fechadosRes, campaignsRes, recentLeadsRes] = await Promise.all([
      supabaseAdmin.from("leads").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("leads").select("id", { count: "exact", head: true }).eq("status", "abordado"),
      supabaseAdmin.from("leads").select("id", { count: "exact", head: true }).in("status", ["respondeu"]),
      supabaseAdmin.from("leads").select("id", { count: "exact", head: true }).eq("status", "convertido"),
      supabaseAdmin.from("campaigns").select("*").order("created_at", { ascending: false }).limit(5),
      supabaseAdmin.from("leads").select("*").order("created_at", { ascending: false }).limit(8),
    ]);

    return NextResponse.json({
      stats: {
        total: leadsRes.count || 0,
        abordados: abordadosRes.count || 0,
        responderam: respoRes.count || 0,
        fechados: fechadosRes.count || 0,
      },
      campaigns: campaignsRes.data || [],
      recentLeads: recentLeadsRes.data || [],
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
