export const runtime = 'edge';

import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("[profile] Auth error or no user:", authError);
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    console.log("[profile] User authenticated:", { id: user.id, email: user.email });

    // Tentar buscar perfil do banco de dados
    let plan = "STARTER";
    let role = "USER";

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error("[profile] Database error fetching profile:", profileError);
    } else {
      console.log("[profile] Profile found in DB:", profile);
    }

    if (!profileError && profile) {
      plan = profile.plan || "STARTER";
      role = profile.role || "USER";
    } else {
      // Fallback: Se for o email do dono ou um email específico, forçamos ADM
      if (user.email === "admin@prospectos.com" || user.app_metadata?.role === "admin") {
        console.log("[profile] Fallback ADM activated for:", user.email);
        plan = "ADM";
        role = "ADMIN";
      }
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        plan,
        role
      }
    });

  } catch (error: any) {
    console.error("[profile] error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
