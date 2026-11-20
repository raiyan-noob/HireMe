import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { stripe } from '@/lib/stripe';
import { paymentVerify } from '@/lib/actions/payment';
import { getSession } from '@/lib/core/server';

export default async function SuccessPage({ searchParams }) {
  const { session_id } = await searchParams;

  if (!session_id) {
    return redirect('/pricing');
  }

  // 1. Retrieve session directly from Stripe
  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['line_items', 'payment_intent'],
    });
  } catch (err) {
    console.error('Failed to retrieve Stripe session:', err);
    return redirect('/pricing');
  }

  const {
    status,
    payment_status,
    customer_details,
    customer_email,
    metadata,
    amount_total,
    currency,
  } = session;

  const email = (customer_email || customer_details?.email || metadata?.userEmail || '').toLowerCase();

  // If session is still open or unpaid, redirect
  if (status === 'open') {
    return redirect('/pricing');
  }

  if (status !== 'complete' || payment_status !== 'paid') {
    return redirect('/pricing?canceled=true');
  }

  // 2. Check logged-in user session
  const userSession = await getSession();
  const loggedInUser = userSession?.user;

  if (!loggedInUser) {
    // Redirect to login preserving the success session_id redirect
    return redirect(`/Login?redirect=/pricing/success?session_id=${encodeURIComponent(session_id)}`);
  }

  // 3. Verify payment in backend & activate subscription facilities
  let verifyResult = null;
  let verifyError = null;

  try {
    verifyResult = await paymentVerify({
      sessionId: session_id,
      userEmail: loggedInUser.email,
      userId: loggedInUser.id || loggedInUser._id,
    });
  } catch (err) {
    console.error('Backend payment verification failed:', err);
    verifyError = err.message || 'Could not verify payment session with backend.';
  }

  const plan = (verifyResult?.plan || metadata?.plan || 'pro').toLowerCase();
  const isPremium = plan === 'premium';
  const formattedAmount = (amount_total / 100).toFixed(2);
  const formattedCurrency = (currency || 'USD').toUpperCase();
  const maskedSessionId = session_id.slice(0, 14) + '...' + session_id.slice(-6);

  return (
    <div className="relative min-h-screen py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center overflow-hidden">
      {/* Background Glow */}
      <div className="dark:hidden absolute inset-0 -z-10 pointer-events-none bg-gradient-to-b from-slate-50 via-white to-slate-50">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-emerald-300/20 via-blue-300/25 to-indigo-300/20 rounded-full blur-[120px]" />
      </div>
      <div className="hidden dark:block absolute inset-0 -z-10 pointer-events-none bg-gradient-to-b from-[#070a12] via-[#090d18] to-[#060910]">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[650px] h-[380px] bg-gradient-to-tr from-emerald-600/15 via-blue-600/20 to-indigo-600/15 rounded-full blur-[130px]" />
      </div>

      <div className="max-w-xl w-full">
        {verifyError ? (
          /* Error State */
          <div className="rounded-3xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-rose-200 dark:border-rose-900/60 p-8 sm:p-10 text-center shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center text-3xl font-black mb-6">
              ✕
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Verification Notice
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 mt-3 leading-relaxed">
              {verifyError}
            </p>
            <div className="mt-8 flex gap-3">
              <Link
                href="/pricing"
                className="flex-1 py-3 px-4 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 font-bold text-xs text-center"
              >
                Back to Pricing
              </Link>
              <Link
                href="/dashboard/seeker"
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs text-center shadow-md"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        ) : (
          /* Success Card */
          <div className="rounded-3xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-zinc-800 p-8 sm:p-10 shadow-2xl text-center">
            
            {/* Animated Celebration Icon */}
            <div className="relative mx-auto w-20 h-20 mb-6">
              <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center text-3xl font-black shadow-lg shadow-emerald-500/30">
                ✓
              </div>
            </div>

            {/* Title & Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 mb-3">
              <span>{isPremium ? '👑 Premium VIP Activated' : '★ Pro Member Activated'}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Payment Successful!
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 mt-2 leading-relaxed max-w-md mx-auto">
              Welcome to <span className="font-bold text-slate-900 dark:text-white capitalize">{plan} Plan</span>! Your account has been upgraded with all facilities activated.
            </p>

            {/* Receipt Summary Container */}
            <div className="mt-8 p-5 rounded-2xl bg-slate-50/80 dark:bg-zinc-800/60 border border-slate-200/70 dark:border-zinc-700/70 text-left space-y-3 text-xs">
              <div className="flex justify-between items-center text-slate-500 dark:text-zinc-400">
                <span>Account</span>
                <span className="font-semibold text-slate-900 dark:text-white">{loggedInUser.email}</span>
              </div>
              <div className="flex justify-between items-center text-slate-500 dark:text-zinc-400">
                <span>Plan Subscribed</span>
                <span className="font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  HireMe {plan}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-500 dark:text-zinc-400">
                <span>Amount Paid</span>
                <span className="font-black text-slate-900 dark:text-white text-sm">
                  ${formattedAmount} {formattedCurrency}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-500 dark:text-zinc-400">
                <span>Status</span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                  <span>●</span> Paid & Verified
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-zinc-700/80 flex justify-between items-center text-[11px] text-slate-400 dark:text-zinc-500">
                <span>Session ID</span>
                <span className="font-mono">{maskedSessionId}</span>
              </div>
            </div>

            {/* Facilities Activated Checklist */}
            <div className="mt-6 text-left">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-3">
                Facilities Now Active:
              </h3>
              <ul className="space-y-2 text-xs text-slate-700 dark:text-zinc-300">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    Unlimited Job Applications
                  </span>{' '}
                  (5-application limit removed)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>Verified Candidate Badge displayed to employers</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>AI Resume & Profile Match Scoring</span>
                </li>
                {isPremium && (
                  <>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <span>Direct messaging with hiring managers unlocked</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <span>Top-of-Queue Priority Placement for recruiters</span>
                    </li>
                  </>
                )}
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                href="/jobs"
                className="flex-1 py-3.5 px-5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-bold text-xs sm:text-sm text-center shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Browse All Jobs</span>
                <span>→</span>
              </Link>
              <Link
                href="/dashboard/seeker"
                className="flex-1 py-3.5 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 font-bold text-xs sm:text-sm text-center border border-slate-200 dark:border-zinc-700 transition-all cursor-pointer"
              >
                Go to Seeker Dashboard
              </Link>
            </div>

            <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-4">
              A receipt has been sent to {email}. You can manage your subscription anytime from your dashboard.
            </p>

          </div>
        )}
      </div>
    </div>
  );
}