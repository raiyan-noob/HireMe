import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getSession } from '@/lib/core/server';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/auth';

// Map of plan keys to their respective Stripe Price IDs
const PLAN_PRICES = {
  pro: process.env.STRIPE_PRO_PRICE_ID || 'price_1UdwXVCq8UtFaVN0dSRtrSJ0',
  premium: process.env.STRIPE_PREMIUM_PRICE_ID || 'price_1UdwqICq8UtFaVN0xjgAyynJ',
};

export async function POST(req) {
  const usersession = await getSession();

  try {
    const headersList = await headers();
    const origin = headersList.get('origin') || 'http://localhost:3000';

    const contentType = req?.headers?.get('content-type') || '';
    const isJson = contentType.includes('application/json');

    // Ensure user is authenticated before creating checkout
    if (!usersession?.user) {
      if (isJson) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }
      return NextResponse.redirect(`${origin}/Login?redirect=/pricing`, 303);
    }

    // Parse the requested plan from form data or JSON body
    let plan = 'pro';
    if (isJson) {
      const body = await req.json().catch(() => ({}));
      plan = (body.plan || 'pro').toLowerCase();
    } else {
      const formData = await req.formData().catch(() => null);
      if (formData) {
        plan = (formData.get('plan') || 'pro').toLowerCase();
      }
    }

    // Fetch authoritative user plan status from DB to prevent duplicate purchases
    const userEmail = usersession.user.email?.toLowerCase().trim();
    let currentPlan = (
      usersession.user.plan ||
      (usersession.user.premium ? 'premium' : usersession.user.pro ? 'pro' : 'normal')
    ).toLowerCase();

    if (userEmail && db) {
      try {
        const userDoc = await db.collection('user').findOne({ email: userEmail });
        if (userDoc) {
          currentPlan = (
            userDoc.plan ||
            (userDoc.premium ? 'premium' : userDoc.pro ? 'pro' : 'normal')
          ).toLowerCase();
        }
      } catch (dbErr) {
        console.warn('Could not query current plan from DB in checkout_sessions:', dbErr);
      }
    }

    // ENFORCE PLAN RESTRICTIONS:
    // 1. Premium users cannot buy Premium or Pro again
    if (currentPlan === 'premium') {
      if (isJson) {
        return NextResponse.json(
          { error: 'You are already on the VIP Premium tier and cannot purchase another plan.' },
          { status: 400 }
        );
      }
      return NextResponse.redirect(`${origin}/pricing?info=already_has_premium`, 303);
    }

    // 2. Pro users cannot buy Pro again (they can only upgrade to Premium)
    if (currentPlan === 'pro' && plan === 'pro') {
      if (isJson) {
        return NextResponse.json(
          { error: 'You are already subscribed to the Pro plan and cannot buy Pro again.' },
          { status: 400 }
        );
      }
      return NextResponse.redirect(`${origin}/pricing?info=already_has_pro`, 303);
    }

    // Select the appropriate Stripe price for the chosen plan
    const selectedPrice = PLAN_PRICES[plan] || PLAN_PRICES.pro;

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: selectedPrice,
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: usersession.user.email,
      success_url: `${origin}/pricing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing?canceled=true`,
      metadata: {
        plan,
        userId: usersession?.user?.id || usersession?.user?._id || '',
        userEmail: usersession?.user?.email || '',
      },
      integration_identifier: `hireme_${plan}`,
    });

    return NextResponse.redirect(session.url, 303);
  } catch (err) {
    console.error('Stripe Checkout Error:', err);
    return NextResponse.json(
      { error: err.message },
      { status: err.statusCode || 500 }
    );
  }
}
