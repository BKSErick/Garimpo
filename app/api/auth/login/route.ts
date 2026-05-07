export const runtime = 'edge';

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { password } = await req.json();

  if (password === process.env.MASTER_PASSWORD) {
    const response = NextResponse.json({ success: true });
    response.cookies.set("finch_session", "active", {
      httpOnly: true,
      secure: true,
      maxAge: 60 * 60 * 24 * 7,
      path: "/"
    });
    return response;
  }

  return NextResponse.json({ error: "Chave de segurança inválida." }, { status: 401 });
}
