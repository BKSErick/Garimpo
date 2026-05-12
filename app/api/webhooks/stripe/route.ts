export const runtime = 'edge';

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27-preview" as any,
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Mapeamento de IDs de Preço do Stripe para os nomes de planos do ProspectOS
// TODO: Substituir pelos seus IDs reais do Stripe Dashboard
const PRICE_TO_PLAN: Record<string, string> = {
  "price_123_starter": "STARTER",
  "price_456_minerador": "MINERADOR",
  "price_789_industrial": "INDUSTRIAL",
};

export async function POST(req: Request) {
  const payload = await req.text();
  const sig = req.headers.get("stripe-signature");

  let event;

  try {
    if (!sig || !endpointSecret) {
      console.error("[stripe-webhook] Missing signature or endpoint secret");
      return NextResponse.json({ error: "Configuração incompleta" }, { status: 400 });
    }
    event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
  } catch (err: any) {
    console.error(`[stripe-webhook] Error verifying webhook: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  console.log(`[stripe-webhook] Event received: ${event.type}`);

  // Tratar eventos de sucesso de pagamento/assinatura
  if (event.type === "checkout.session.completed" || event.type === "customer.subscription.created") {
    const session = event.data.object as any;
    
    // O client_reference_id deve ser o ID do usuário no Supabase
    const userId = session.client_reference_id;
    const priceId = session.line_items?.data[0]?.price?.id || session.subscription?.items?.data[0]?.price?.id;

    if (userId && priceId) {
      const planName = PRICE_TO_PLAN[priceId];

      if (planName) {
        console.log(`[stripe-webhook] Upgrading user ${userId} to plan ${planName}`);
        
        const { error } = await supabaseAdmin
          .from('profiles')
          .update({ plan: planName })
          .eq('id', userId);

        if (error) {
          console.error("[stripe-webhook] Error updating profile:", error);
          return NextResponse.json({ error: "Erro ao atualizar plano" }, { status: 500 });
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
