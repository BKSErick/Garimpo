export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  const { email } = await req.json();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  );

  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/atualizar-senha`,
  });

  // Sempre 200 — anti-enumeration
  return NextResponse.json(
    { message: 'Se o email estiver cadastrado, você receberá um link.' },
    { status: 200 }
  );
}
