import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "STRIPE_WEBHOOK_SECRET is not configured." },
      { status: 500 }
    );
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header." },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Webhook signature verification failed.";
    console.error("Webhook error:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const clerkUserId = session.metadata?.clerkUserId;
        const planType = session.metadata?.planType;

        if (!clerkUserId) break;

        await prisma.profile.update({
          where: { userId: clerkUserId },
          data: {
            subscriptionActive: true,
            subscriptionTier: planType ?? "unknown",
            stripeSubscriptionId:
              typeof session.subscription === "string"
                ? session.subscription
                : session.subscription?.id ?? null,
          },
        });
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const profile = await prisma.profile.findFirst({
          where: { stripeSubscriptionId: subscription.id },
        });

        if (!profile) break;

        const isActive =
          subscription.status === "active" ||
          subscription.status === "trialing";

        await prisma.profile.update({
          where: { id: profile.id },
          data: { subscriptionActive: isActive },
        });
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await prisma.profile.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            subscriptionActive: false,
            subscriptionTier: null,
            stripeSubscriptionId: null,
          },
        });
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed." },
      { status: 500 }
    );
  }
}
