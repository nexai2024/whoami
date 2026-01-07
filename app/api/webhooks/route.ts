import { stripe } from '../../../lib/stripe'
import type { Stripe } from "stripe";
import { NextResponse } from "next/server";
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      await (await req.blob()).text(),
      req.headers.get("stripe-signature") as string,
      process.env.STRIPE_WEBHOOK_SECRET as string,
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    // On error, log and return the error message.
    if (!(err instanceof Error)) console.log(err);
    console.log(`❌ Error message: ${errorMessage}`);
    return NextResponse.json(
      { message: `Webhook Error: ${errorMessage}` },
      { status: 400 },
    );
  }

  // Successfully constructed event.
  console.log("✅ Success:", event.id);

  const permittedEvents: string[] = [
    "checkout.session.completed",
    "payment_intent.succeeded",
    "payment_intent.payment_failed",
    "customer.subscription.created",
    "customer.subscription.updated",
    "customer.subscription.deleted",
    "invoice.paid",
    "invoice.payment_failed",
  ];

  if (permittedEvents.includes(event.type)) {
    let data;

    try {
      switch (event.type) {
        case "checkout.session.completed":
          data = event.data.object as Stripe.Checkout.Session;
          await handleCheckoutSessionCompleted(data);
          console.log(`💰 CheckoutSession status: ${data.payment_status}`);
          break;
        case "customer.subscription.created":
          data = event.data.object as Stripe.Subscription;
          await handleSubscriptionCreated(data);
          console.log(`📦 Subscription created: ${data.id}`);
          break;
        case "customer.subscription.updated":
          data = event.data.object as Stripe.Subscription;
          await handleSubscriptionUpdated(data);
          console.log(`📦 Subscription updated: ${data.id}`);
          break;
        case "customer.subscription.deleted":
          data = event.data.object as Stripe.Subscription;
          await handleSubscriptionDeleted(data);
          console.log(`📦 Subscription deleted: ${data.id}`);
          break;
        case "invoice.paid":
          data = event.data.object as Stripe.Invoice;
          await handleInvoicePaid(data);
          console.log(`💰 Invoice paid: ${data.id}`);
          break;
        case "invoice.payment_failed":
          data = event.data.object as Stripe.Invoice;
          await handleInvoicePaymentFailed(data);
          console.log(`❌ Invoice payment failed: ${data.id}`);
          break;
        case "payment_intent.payment_failed":
          data = event.data.object as Stripe.PaymentIntent;
          console.log(`❌ Payment failed: ${data.last_payment_error?.message}`);
          break;
        case "payment_intent.succeeded":
          data = event.data.object as Stripe.PaymentIntent;
          console.log(`💰 PaymentIntent status: ${data.status}`);
          break;
        default:
          throw new Error(`Unhandled event: ${event.type}`);
      }
    } catch (error) {
      console.log(error);
      return NextResponse.json(
        { message: "Webhook handler failed" },
        { status: 500 },
      );
    }
  }
  // Return a response to acknowledge receipt of the event.
  return NextResponse.json({ message: "Received" }, { status: 200 });
}

// Handle checkout session completed
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const planId = session.metadata?.planId;

  if (!userId || !planId) {
    console.error('Missing metadata in checkout session:', session.id);
    return;
  }

  // If this is a subscription checkout, the subscription will be created via webhook
  if (session.mode === 'subscription' && session.subscription) {
    // Subscription will be handled by customer.subscription.created webhook
    console.log('Subscription checkout completed, waiting for subscription webhook');
    return;
  }
}

// Handle subscription created
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;
  const planId = subscription.metadata?.planId;

  if (!userId || !planId) {
    console.error('Missing metadata in subscription:', subscription.id);
    return;
  }

  try {
    // Find plan by Stripe price ID
    const priceId = subscription.items.data[0]?.price.id;
    const plan = await prisma.plan.findFirst({
      where: { priceId: priceId || planId }
    });

    if (!plan) {
      console.error('Plan not found for subscription:', subscription.id);
      return;
    }

    // Create or update subscription
    await prisma.subscription.upsert({
      where: { userId },
      update: {
        planId: plan.id,
        status: subscription.status,
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: subscription.customer as string,
        currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
        currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      },
      create: {
        userId: userId,
        planId: plan.id,
        status: subscription.status,
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: subscription.customer as string,
        currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
        currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      }
    });

    // Update user profile
    await prisma.profile.update({
      where: { userId },
      data: {
        plan: plan.planEnum,
        subscriptionStatus: subscription.status,
      }
    });

    console.log('Subscription created in database:', subscription.id);
  } catch (error) {
    console.error('Error handling subscription created:', error);
    throw error;
  }
}

// Handle subscription updated
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;
  const stripeSubscriptionId = subscription.id;

  if (!userId) {
    console.error('Missing userId in subscription metadata:', subscription.id);
    return;
  }

  try {
    // Find plan by Stripe price ID
    const priceId = subscription.items.data[0]?.price.id;
    const plan = await prisma.plan.findFirst({
      where: { priceId: priceId }
    });

    if (!plan) {
      console.error('Plan not found for subscription:', subscription.id);
      return;
    }

    // Update subscription
    await prisma.subscription.update({
      where: { stripeSubscriptionId },
      data: {
        planId: plan.id,
        status: subscription.status,
        currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
        currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      }
    });

    // Update user profile
    await prisma.profile.update({
      where: { userId },
      data: {
        plan: plan.planEnum,
        subscriptionStatus: subscription.status,
      }
    });

    console.log('Subscription updated in database:', subscription.id);
  } catch (error) {
    console.error('Error handling subscription updated:', error);
    throw error;
  }
}

// Handle subscription deleted
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;
  const stripeSubscriptionId = subscription.id;

  if (!userId) {
    console.error('Missing userId in subscription metadata:', subscription.id);
    return;
  }

  try {
    // Get FREE plan
    const freePlan = await prisma.plan.findFirst({
      where: { planEnum: 'FREE' }
    });

    if (!freePlan) {
      console.error('FREE plan not found');
      return;
    }

    // Update subscription to canceled
    await prisma.subscription.update({
      where: { stripeSubscriptionId },
      data: {
        status: 'canceled',
        cancelAtPeriodEnd: false,
      }
    });

    // Update user profile to FREE
    await prisma.profile.update({
      where: { userId },
      data: {
        plan: 'FREE',
        subscriptionStatus: 'canceled',
      }
    });

    console.log('Subscription canceled in database:', subscription.id);
  } catch (error) {
    console.error('Error handling subscription deleted:', error);
    throw error;
  }
}

// Handle invoice paid
async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const subscriptionId = typeof (invoice as any).subscription === 'string' 
    ? (invoice as any).subscription 
    : ((invoice as any).subscription as Stripe.Subscription)?.id;
  
  if (!subscriptionId) {
    return; // Not a subscription invoice
  }

  console.log('Invoice paid for subscription:', subscriptionId);
  // You can add additional logic here, like sending confirmation emails
}

// Handle invoice payment failed
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = typeof (invoice as any).subscription === 'string' 
    ? (invoice as any).subscription 
    : ((invoice as any).subscription as Stripe.Subscription)?.id;
  const customerId = invoice.customer as string;

  if (!subscriptionId) {
    return; // Not a subscription invoice
  }

  try {
    // Update subscription status
    await prisma.subscription.update({
      where: { stripeSubscriptionId: subscriptionId },
      data: {
        status: 'past_due',
      }
    });

    console.log('Invoice payment failed for subscription:', subscriptionId);
    // You can add additional logic here, like sending notification emails
  } catch (error) {
    console.error('Error handling invoice payment failed:', error);
  }
}