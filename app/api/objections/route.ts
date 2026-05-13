import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("objections")
    .select("*")
    .order("is_universal", { ascending: false })
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ objections: data || [] });
}

export async function POST(req: Request) {
  const { text, response } = await req.json();
  if (!text?.trim()) return NextResponse.json({ error: "Texto obrigatório" }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("objections")
    .insert([{ text: text.trim(), response: response?.trim() || null, is_universal: false }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ objection: data });
}

export async function PATCH(req: Request) {
  const { id, response } = await req.json();
  if (!id) return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("objections")
    .update({ response: response?.trim() || null })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ objection: data });
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });

  const { error } = await supabaseAdmin.from("objections").delete().eq("id", id).eq("is_universal", false);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
