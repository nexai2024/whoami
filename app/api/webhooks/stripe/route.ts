import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import prisma from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    logger.error('Webhook error: No signature');
    return NextResponse.json(
      { error: 'No signature' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    logger.error('Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      default:
        logger.info(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    logger.error('Error processing webhook:', err);
    // Still return 200 to Stripe so it doesn't retry
    return NextResponse.json({ received: true, error: err.message });
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  logger.info('Payment intent succeeded:', paymentIntent.id);

  const { blockId, pageId, email, productTitle } = paymentIntent.metadata;

  if (!blockId || !email) {
    logger.error('Missing metadata in payment intent:', paymentIntent.id);
    return;
  }

  try {
    // Check if sale already exists (prevent duplicates from webhook retries)
    const existingSale = await prisma.sale.findFirst({
      where: { stripePaymentIntentId: paymentIntent.id },
    });

    if (existingSale) {
      logger.info('Sale already recorded:', paymentIntent.id);
      return;
    }

    // Get block to find productId
    const block = await prisma.block.findUnique({
      where: { id: blockId },
      select: { productId: true },
    });

    // Create sale record
    const sale = await prisma.sale.create({
      data: {
        productId: block?.productId || blockId, // Use productId if available, fallback to blockId
        buyerEmail: email,
        amount: paymentIntent.amount / 100, // Convert cents to dollars
        currency: paymentIntent.currency.toUpperCase(),
        stripePaymentIntentId: paymentIntent.id,
        status: 'completed',
      },
    });

    logger.info('Sale recorded successfully:', {
      saleId: sale.id,
      paymentIntentId: paymentIntent.id,
      amount: sale.amount,
      email,
    });

    // TODO: Send confirmation email to buyer (future enhancement)
  } catch (err) {
    logger.error('Error creating sale record:', err);
    throw err;
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  logger.warn('Payment intent failed:', {
    id: paymentIntent.id,
    email: paymentIntent.metadata.email,
    error: paymentIntent.last_payment_error?.message,
  });

  // TODO: Send failure notification email (future enhancement)
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  logger.info('Checkout session completed:', session.id);

  const userId = session.metadata?.userId;

  if (!userId) {
    logger.error('Missing userId in checkout session metadata:', session.id);
    return;
  }

  // Handle subscription checkout
  if (session.mode === 'subscription' && session.subscription) {
    // The subscription webhook handler will take care of creating the subscription record
    // We just need to log it here
    logger.info('Subscription checkout completed, subscription webhook will handle it:', session.subscription);
    return;
  }

  // Handle course checkout (existing logic)
  const courseId = session.metadata?.courseId;

  if (!courseId) {
    logger.error('Missing courseId in checkout session metadata:', session.id);
    return;
  }

  try {
    // Get course
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      logger.error('Course not found:', courseId);
      return;
    }

    // Check if enrollment already exists
    const existingEnrollment = await prisma.courseEnrollment.findFirst({
      where: {
        email: session.customer_email || '',
        courseId
      }
    });

    if (existingEnrollment) {
      logger.info('Enrollment already exists:', existingEnrollment.id);
      return;
    }

    // Create enrollment
    const enrollment = await prisma.courseEnrollment.create({
      data: {
        courseId,
        email: session.customer_email || '',
        name: session.customer_details?.name || undefined,
        enrollmentSource: 'stripe-checkout',
        paymentStatus: 'completed',
        paymentAmount: course.price,
        stripePaymentId: session.payment_intent as string
      }
    });

    // Update enrollment count
    await prisma.course.update({
      where: { id: courseId },
      data: {
        enrollmentCount: {
          increment: 1
        }
      }
    });

    logger.info('Successfully created enrollment from Stripe payment:', enrollment.id);
  } catch (error) {
    logger.error('Error handling checkout session completed:', error);
    throw error;
  }
}

// Subscription webhook handlers
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  logger.info('Subscription created:', subscription.id);

  try {
    const customerId = subscription.customer as string;
    const customer = await stripe.customers.retrieve(customerId);

    if (customer.deleted) {
      logger.error('Customer deleted:', customerId);
      return;
    }

    const userId = (customer as Stripe.Customer).metadata?.userId;
    if (!userId) {
      logger.error('No userId in customer metadata:', customerId);
      return;
    }

    // Get plan from subscription price
    const priceId = subscription.items.data[0]?.price.id;
    // For now, we'll need to map Stripe price to our Plan model
    // This assumes the planId is stored in the price metadata or we need to look it up
    // For Phase 1, we'll create/update subscription record with basic info
    
    // Check if subscription already exists
    const existingSubscription = await prisma.subscription.findUnique({
      where: { stripeSubscriptionId: subscription.id }
    });

    if (existingSubscription) {
      logger.info('Subscription already exists:', subscription.id);
      return;
    }

    // Find plan by matching price (we'll need to store Stripe price IDs in Plan model later)
    // For now, use a default plan or the planId from subscription metadata
    const planId = subscription.metadata?.planId;
    let plan = null;

    if (planId) {
      plan = await prisma.plan.findUnique({ where: { id: planId } });
    }

    // If no plan found, use FREE plan as default
    if (!plan) {
      plan = await prisma.plan.findFirst({
        where: { planEnum: 'FREE' }
      });
    }

    if (!plan) {
      logger.error('No plan found for subscription');
      return;
    }

    // Create subscription record
    const newSubscription = await prisma.subscription.create({
      data: {
        userId,
        planId: plan.id,
        status: subscription.status,
        currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
        currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: customerId,
      },
    });

    // Update Profile
    await prisma.profile.update({
      where: { userId },
      data: {
        subscriptionId: newSubscription.id,
        subscriptionStatus: subscription.status,
        plan: plan.planEnum,
        stripeCustomerId: customerId,
      },
    });

    logger.info('Subscription created successfully:', newSubscription.id);
  } catch (error) {
    logger.error('Error handling subscription created:', error);
    throw error;
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  logger.info('Subscription updated:', subscription.id);

  try {
    const existingSubscription = await prisma.subscription.findUnique({
      where: { stripeSubscriptionId: subscription.id },
      include: { plan: true }
    });

    if (!existingSubscription) {
      logger.warn('Subscription not found in database:', subscription.id);
      // Try to create it
      await handleSubscriptionCreated(subscription);
      return;
    }

    // Update subscription record
    await prisma.subscription.update({
      where: { id: existingSubscription.id },
      data: {
        status: subscription.status,
        currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
        currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      },
    });

    // Update Profile
    await prisma.profile.update({
      where: { userId: existingSubscription.userId },
      data: {
        subscriptionStatus: subscription.status,
      },
    });

    logger.info('Subscription updated successfully:', existingSubscription.id);
  } catch (error) {
    logger.error('Error handling subscription updated:', error);
    throw error;
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  logger.info('Subscription deleted:', subscription.id);

  try {
    const existingSubscription = await prisma.subscription.findUnique({
      where: { stripeSubscriptionId: subscription.id }
    });

    if (!existingSubscription) {
      logger.warn('Subscription not found in database:', subscription.id);
      return;
    }

    // Get FREE plan
    const freePlan = await prisma.plan.findFirst({
      where: { planEnum: 'FREE' }
    });

    if (!freePlan) {
      logger.error('FREE plan not found');
      return;
    }

    // Update subscription status (don't delete, mark as canceled)
    await prisma.subscription.update({
      where: { id: existingSubscription.id },
      data: {
        status: 'canceled',
      },
    });

    // Update Profile to FREE plan
    await prisma.profile.update({
      where: { userId: existingSubscription.userId },
      data: {
        plan: 'FREE',
        subscriptionStatus: 'canceled',
        subscriptionId: null,
      },
    });

    logger.info('Subscription deleted successfully:', existingSubscription.id);
  } catch (error) {
    logger.error('Error handling subscription deleted:', error);
    throw error;
  }
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  logger.info('Invoice paid:', invoice.id);

  try {
    // For now, we'll just log invoice payments
    // In Phase 3, we can create invoice records in the database
    const subscriptionId = (invoice as any).subscription as string;
    if (subscriptionId) {
      const subscription = await prisma.subscription.findUnique({
        where: { stripeSubscriptionId: subscriptionId }
      });

      if (subscription) {
        logger.info('Invoice paid for subscription:', subscription.id);
      }
    }
  } catch (error) {
    logger.error('Error handling invoice paid:', error);
    // Don't throw - invoice payment handling shouldn't break webhook processing
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  logger.info('Invoice payment failed:', invoice.id);

  try {
    const subscriptionId = (invoice as any).subscription as string;
    if (subscriptionId) {
      const subscription = await prisma.subscription.findUnique({
        where: { stripeSubscriptionId: subscriptionId }
      });

      if (subscription) {
        // Update subscription status
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            status: 'past_due',
          },
        });

        // Update Profile
        await prisma.profile.update({
          where: { userId: subscription.userId },
          data: {
            subscriptionStatus: 'past_due',
          },
        });

        logger.info('Subscription marked as past_due:', subscription.id);
      }
    }
  } catch (error) {
    logger.error('Error handling invoice payment failed:', error);
    // Don't throw - payment failure handling shouldn't break webhook processing
  }
}

async function handleCustomerCreated(customer: Stripe.Customer) {
  logger.info('Customer created:', customer.id);

  try {
    const userId = customer.metadata?.userId;
    if (!userId) {
      // Customer might have been created outside our system
      return;
    }

    // Update Profile with Stripe customer ID if not already set
    const profile = await prisma.profile.findUnique({
      where: { userId }
    });

    if (profile && !profile.stripeCustomerId) {
      await prisma.profile.update({
        where: { userId },
        data: {
          stripeCustomerId: customer.id,
        },
      });

      logger.info('Profile updated with Stripe customer ID:', userId);
    }
  } catch (error) {
    logger.error('Error handling customer created:', error);
    // Don't throw - customer creation handling shouldn't break webhook processing
  }
}
