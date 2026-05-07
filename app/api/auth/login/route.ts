import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const { password } = await req.json();

  if (password === process.env.MASTER_PASSWORD) {
    const cookieStore = await cookies();
    cookieStore.set("finch_session", "active", { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7 // 1 semana
    });

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Chave de segurança inválida." }, { status: 401 });
}
