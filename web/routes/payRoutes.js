import express from 'express';
import { ObjectId } from 'mongodb';
import Stripe from 'stripe';

const router = express.Router();

const PayRoutes = (payments, users, applications) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  // Ensure unique index on sessionId so a session ID can never be used twice at the database level
  if (payments) {
    payments.createIndex({ sessionId: 1 }, { unique: true }).catch(() => {});
  }

  // Facilities definitions for each plan tier
  const PLAN_FACILITIES = {
    normal: {
      plan: 'normal',
      pro: false,
      premium: false,
      applicationLimit: 5,
      verifiedBadge: false,
      directRecruiterMessaging: false,
      aiResumeScore: false,
      instantJobAlerts: false,
      priorityCandidate: false,
      subscriptionStatus: 'inactive',
      updatedAt: new Date().toISOString(),
    },
    pro: {
      plan: 'pro',
      pro: true,
      premium: false,
      applicationLimit: null, // Unlimited job applications
      verifiedBadge: true,
      directRecruiterMessaging: false,
      aiResumeScore: true,
      instantJobAlerts: true,
      priorityCandidate: false,
      subscriptionStatus: 'active',
      planUpgradedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    premium: {
      plan: 'premium',
      pro: true,
      premium: true,
      applicationLimit: null, // Unlimited job applications
      verifiedBadge: true,
      directRecruiterMessaging: true, // Direct messaging with recruiters & hiring managers
      aiResumeScore: true,
      instantJobAlerts: true,
      priorityCandidate: true, // Top-of-queue placement
      executiveConcierge: true,
      subscriptionStatus: 'active',
      planUpgradedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  };

  // POST /payments - Verify Stripe Checkout Session & Activate Subscription Facilities
  router.post('/', async (req, res) => {
    try {
      const { sessionId, userEmail, userId } = req.body;

      if (!sessionId) {
        return res.status(400).json({ error: 'sessionId is required' });
      }

      // SECURITY CHECK 1: Anti-Replay / Reuse Detection
      // Ensure the same session ID cannot be claimed by multiple users or repeated fraudulently
      const existingPayment = await payments.findOne({ sessionId });
      if (existingPayment) {
        const isSameUser =
          (userEmail && existingPayment.userEmail?.toLowerCase() === userEmail.toLowerCase()) ||
          (userId && existingPayment.userId === userId);

        if (isSameUser) {
          // Idempotent success response if this user already verified this session
          return res.status(200).json({
            success: true,
            message: 'Payment has already been processed and verified for this account.',
            plan: existingPayment.plan,
            alreadyProcessed: true,
          });
        }

        // Fraud attempt: Someone else is attempting to use an already-consumed sessionId!
        return res.status(403).json({
          error: 'Security violation: This payment session has already been claimed by another account.',
        });
      }

      // SECURITY CHECK 2: Direct Stripe Verification
      // Directly retrieve session from Stripe to verify genuine payment status
      const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['line_items', 'payment_intent'],
      });

      if (!session) {
        return res.status(404).json({ error: 'Stripe checkout session not found' });
      }

      const { status, payment_status, metadata, customer_email, customer_details } = session;

      // Ensure payment is actually completed and paid
      if (status !== 'complete' || payment_status !== 'paid') {
        return res.status(400).json({
          error: 'Payment not completed or payment status is not paid.',
          status,
          payment_status,
        });
      }

      // SECURITY CHECK 3: User Identity Verification
      // Ensure the user claiming the session matches the session's email / metadata
      const stripeEmail = (customer_email || customer_details?.email || metadata?.userEmail || '').toLowerCase().trim();
      const stripeUserId = metadata?.userId || '';

      const targetEmail = (userEmail || stripeEmail).toLowerCase().trim();
      const targetUserId = userId || stripeUserId;

      if (!targetEmail && !targetUserId) {
        return res.status(400).json({ error: 'Unable to identify the user associated with this payment.' });
      }

      // Find the user account in MongoDB
      const query = {
        $or: [
          ...(targetUserId && ObjectId.isValid(targetUserId) ? [{ _id: new ObjectId(targetUserId) }] : []),
          ...(targetEmail ? [{ email: targetEmail }] : []),
        ],
      };

      const user = await users.findOne(query);
      if (!user) {
        return res.status(404).json({ error: 'User account not found to apply subscription.' });
      }

      // Prevent session hijacking: if both userEmail and stripeEmail exist, they must match
      if (userEmail && stripeEmail && userEmail.toLowerCase().trim() !== stripeEmail) {
        return res.status(403).json({
          error: 'Security violation: The logged-in account does not match the Stripe checkout customer.',
        });
      }

      // Determine target plan
      const rawPlan = (metadata?.plan || 'pro').toLowerCase();
      const plan = rawPlan === 'premium' ? 'premium' : rawPlan === 'pro' ? 'pro' : 'normal';
      const facilities = PLAN_FACILITIES[plan] || PLAN_FACILITIES.pro;

      // SECURITY CHECK 3.5: Disallow duplicate or downgraded subscriptions
      const currentPlan = (user.plan || (user.premium ? 'premium' : user.pro ? 'pro' : 'normal')).toLowerCase();
      if (currentPlan === 'premium') {
        return res.status(400).json({
          error: 'This account already has the VIP Premium plan active. You cannot purchase another subscription.',
          currentPlan,
        });
      }
      if (currentPlan === 'pro' && plan === 'pro') {
        return res.status(400).json({
          error: 'This account already has an active Pro plan. You cannot purchase the Pro plan again.',
          currentPlan,
        });
      }

      // SECURITY CHECK 4: Record Payment in DB
      const paymentRecord = {
        sessionId,
        userId: user._id.toString(),
        userEmail: user.email,
        customerName: session.customer_details?.name || user.name || 'Candidate',
        plan,
        amountTotal: session.amount_total,
        currency: session.currency || 'usd',
        paymentStatus: session.payment_status,
        status: session.status,
        paymentIntent:
          typeof session.payment_intent === 'string'
            ? session.payment_intent
            : session.payment_intent?.id || null,
        verifiedAt: new Date().toISOString(),
      };

      const paymentResult = await payments.insertOne(paymentRecord);

      // SECURITY CHECK 5: Update User Account with Plan & Facilities
      const updateResult = await users.updateOne(
        { _id: user._id },
        { $set: facilities }
      );

      // SECURITY CHECK 6: Retroactively boost existing applications priority in recruiter queues
      if (applications) {
        const priorityScore = plan === 'premium' ? 3 : plan === 'pro' ? 2 : 1;
        await applications.updateMany(
          { email: user.email },
          {
            $set: {
              plan,
              priorityScore,
              verifiedBadge: plan === 'pro' || plan === 'premium',
              priorityCandidate: plan === 'premium',
            },
          }
        ).catch(() => {});
      }

      return res.status(200).json({
        success: true,
        message: `Successfully upgraded to ${plan.toUpperCase()} plan with all facilities activated.`,
        plan,
        facilities,
        paymentId: paymentResult.insertedId,
        updateResult,
      });
    } catch (error) {
      console.error('Error processing payment verification:', error);
      return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
  });

  // GET /payments/status/:email - Fetch a candidate's current plan and active facilities
  router.get('/status/:email', async (req, res) => {
    try {
      const email = req.params.email;
      if (!email) {
        return res.status(400).json({ error: 'Email parameter required' });
      }

      const user = await users.findOne({ email: email.toLowerCase().trim() });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const plan = user.plan || (user.premium ? 'premium' : user.pro ? 'pro' : 'normal');
      const facilities = PLAN_FACILITIES[plan] || PLAN_FACILITIES.normal;

      return res.json({
        email: user.email,
        plan,
        pro: !!user.pro,
        premium: !!user.premium,
        applicationLimit: user.applicationLimit !== undefined ? user.applicationLimit : facilities.applicationLimit,
        verifiedBadge: !!user.verifiedBadge,
        directRecruiterMessaging: !!user.directRecruiterMessaging,
        aiResumeScore: !!user.aiResumeScore,
        instantJobAlerts: !!user.instantJobAlerts,
        priorityCandidate: !!user.priorityCandidate,
        subscriptionStatus: user.subscriptionStatus || 'active',
      });
    } catch (error) {
      console.error('Error fetching plan status:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // GET /payments/history/:email - Fetch candidate payment transaction history
  router.get('/history/:email', async (req, res) => {
    try {
      const email = req.params.email;
      if (!email) {
        return res.status(400).json({ error: 'Email parameter required' });
      }

      if (!payments) {
        return res.json([]);
      }

      const history = await payments
        .find({ userEmail: email.toLowerCase().trim() })
        .sort({ verifiedAt: -1, _id: -1 })
        .toArray();

      return res.json(history);
    } catch (error) {
      console.error('Error fetching billing history:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  return router;
};

export default PayRoutes;
