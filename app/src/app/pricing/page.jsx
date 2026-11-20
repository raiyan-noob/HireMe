"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { getUserPlanStatus } from "@/lib/actions/payment";

function PricingContent() {
  const searchParams = useSearchParams();
  const canceled = searchParams?.get("canceled") === "true";
  const infoParam = searchParams?.get("info");

  const { data: session } = useSession();
  const user = session?.user;
  const [userPlanData, setUserPlanData] = useState(null);

  useEffect(() => {
    if (!user?.email) return;

    let isMounted = true;
    getUserPlanStatus(user.email).then((data) => {
      if (isMounted && data) {
        setUserPlanData(data);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [user?.email]);

  // Determine user's active plan: "premium" | "pro" | "normal"
  const currentPlan = (
    userPlanData?.plan ||
    user?.plan ||
    (userPlanData?.premium || user?.premium
      ? "premium"
      : userPlanData?.pro || user?.pro
      ? "pro"
      : "normal")
  ).toLowerCase();

  const isPro = currentPlan === "pro";
  const isPremium = currentPlan === "premium";
  const isNormal = !isPro && !isPremium;

  const plans = [
    {
      id: "normal",
      name: "Normal",
      tagline: "Free Starter",
      badge: "Free Forever",
      price: "$0",
      period: "forever",
      description: "Essential tools for casual job seekers exploring new career opportunities.",
      features: [
        { text: "Up to 5 active job applications", included: true },
        { text: "Standard candidate profile", included: true },
        { text: "Save up to 10 favorite jobs", included: true },
        { text: "Standard search & workplace filters", included: true },
        { text: "Unlimited job applications", included: false },
        { text: "Verified Candidate Badge", included: false },
        { text: "Direct recruiter messaging", included: false },
      ],
      isPopular: false,
      isFree: true,
      href: "/jobs",
    },
    {
      id: "pro",
      name: "Pro",
      tagline: "Career Accelerator",
      badge: isPro ? "✓ Your Current Plan" : "★ Most Popular",
      price: "$19",
      period: "one-time payment",
      description: "For active candidates looking to apply without limits and stand out to hiring teams.",
      features: [
        { text: "Unlimited job applications", included: true, highlight: true },
        { text: "Verified Candidate Badge on card", included: true, highlight: true },
        { text: "Unlimited saved & tracked jobs", included: true },
        { text: "Instant job alerts via Email", included: true },
        { text: "AI Resume & Skill Match score", included: true },
        { text: "Read receipts on submitted applications", included: true },
        { text: "Direct recruiter chat (15 msgs / mo)", included: true },
      ],
      isPopular: !isPremium && !isPro,
      isFree: false,
    },
    {
      id: "premium",
      name: "Premium",
      tagline: "Executive Suite",
      badge: isPremium
        ? "👑 Your Current Plan"
        : isPro
        ? "👑 Recommended Upgrade"
        : "👑 VIP Priority",
      price: "$39",
      period: "one-time payment",
      description: "Maximum visibility and top-of-the-pile placement for senior & executive talent.",
      features: [
        { text: "Everything in Pro included", included: true, highlight: true },
        { text: "Unlimited direct hiring manager chat", included: true, highlight: true },
        { text: "Top-of-Queue placement for recruiters", included: true },
        { text: "1-on-1 resume & portfolio review", included: true },
        { text: "Salary benchmark & negotiation data", included: true },
        { text: "Early access to confidential listings", included: true },
        { text: "Dedicated VIP Candidate concierge", included: true },
      ],
      isPopular: isPro,
      isFree: false,
    },
  ];

  return (
    <div className="relative min-h-screen pb-20 overflow-hidden">
      {/* Background Ambience */}
      <div className="dark:hidden absolute inset-0 -z-10 pointer-events-none bg-gradient-to-b from-slate-50 via-white to-slate-50">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#cbd5e1_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e1_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_15%,#000_75%,transparent_100%)] opacity-50" />
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-gradient-to-tr from-blue-400/25 via-indigo-300/30 to-violet-300/25 rounded-full blur-[120px]" />
      </div>

      <div className="hidden dark:block absolute inset-0 -z-10 pointer-events-none bg-gradient-to-b from-[#070a12] via-[#090d18] to-[#060910]">
        <div className="absolute inset-0 bg-[size:3.5rem_3.5rem] bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_85%_65%_at_50%_20%,#000_65%,transparent_100%)] opacity-30" />
        <div className="absolute -top-36 left-1/2 -translate-x-1/2 w-[900px] h-[420px] bg-gradient-to-r from-blue-600/15 via-indigo-600/20 to-violet-600/15 rounded-full blur-[130px]" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16">
        
        {/* Notice: Already Pro attempt */}
        {infoParam === "already_has_pro" && (
          <div className="max-w-xl mx-auto mb-8 p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-300 text-xs sm:text-sm text-center flex items-center justify-center gap-2 animate-in fade-in slide-in-from-top-2">
            <span>★</span>
            <span>You already have an active <strong>Pro Plan</strong>! You cannot buy Pro again. You can upgrade to Premium anytime below.</span>
          </div>
        )}

        {/* Notice: Already Premium attempt */}
        {infoParam === "already_has_premium" && (
          <div className="max-w-xl mx-auto mb-8 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300 text-xs sm:text-sm text-center flex items-center justify-center gap-2 animate-in fade-in slide-in-from-top-2">
            <span>👑</span>
            <span>You are already on the highest tier: <strong>VIP Premium Plan</strong>! All facilities and top-of-queue priority are active.</span>
          </div>
        )}

        {/* Canceled Notice if returning from Stripe canceled */}
        {canceled && (
          <div className="max-w-xl mx-auto mb-8 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs sm:text-sm text-center flex items-center justify-center gap-2 animate-in fade-in slide-in-from-top-2">
            <span>ℹ️</span>
            <span>Checkout was canceled. No charges were made. You can upgrade anytime!</span>
          </div>
        )}

        {/* User Current Tier Status Pill */}
        {user?.email && !infoParam && (
          <div className="max-w-xl mx-auto mb-8">
            {isPremium && (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 dark:bg-amber-950/40 border border-amber-300/60 dark:border-amber-700/60 text-amber-900 dark:text-amber-200 text-xs text-center flex items-center justify-center gap-2 shadow-xs">
                <span>👑</span>
                <span>Active Account: <strong>{user.email}</strong> • <strong>VIP Premium Tier</strong> (Top-of-Queue Priority & Unlimited Applications)</span>
              </div>
            )}
            {isPro && (
              <div className="p-3.5 rounded-2xl bg-blue-50/90 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 text-xs text-center flex items-center justify-center gap-2 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span>Active Account: <strong>{user.email}</strong> • <strong>Pro Tier Active</strong> (Unlimited Applications). Upgrade to Premium below.</span>
              </div>
            )}
            {isNormal && (
              <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 text-xs text-center flex items-center justify-center gap-2 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                <span>Active Account: <strong>{user.email}</strong> • <strong>Free Starter Tier</strong> (5 applications max). Upgrade below to unlock unlimited applications.</span>
              </div>
            )}
          </div>
        )}

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/60 text-blue-600 dark:text-blue-400 text-xs font-bold tracking-wider uppercase mb-3 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span>Simple, Transparent Pricing</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Accelerate Your Career with{" "}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
              HireMe
            </span>
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-400 mt-3">
            Apply to unlimited positions, stand out to hiring managers, and get hired faster.
          </p>
        </div>

        {/* 3 Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan) => {
            const isPlanActive =
              (plan.id === "normal" && isNormal) ||
              (plan.id === "pro" && isPro) ||
              (plan.id === "premium" && isPremium);

            const isProDisabledForUser = plan.id === "pro" && (isPro || isPremium);
            const isPremiumDisabledForUser = plan.id === "premium" && isPremium;

            // Highlight border logic
            const isCardHighlighted =
              isPlanActive ||
              (plan.id === "premium" && isPro) ||
              (plan.id === "pro" && isNormal);

            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl backdrop-blur-xl border flex flex-col justify-between transition-all duration-300 ${
                  isPlanActive
                    ? plan.id === "premium"
                      ? "bg-white/95 dark:bg-zinc-900/95 border-amber-500/60 dark:border-amber-500/50 shadow-2xl shadow-amber-500/10 lg:-translate-y-2 ring-2 ring-amber-500/40"
                      : plan.id === "pro"
                      ? "bg-white/95 dark:bg-zinc-900/95 border-emerald-500/60 dark:border-emerald-500/50 shadow-2xl shadow-emerald-500/10 lg:-translate-y-2 ring-2 ring-emerald-500/40"
                      : "bg-white/95 dark:bg-zinc-900/95 border-blue-500/60 dark:border-blue-500/50 shadow-xl"
                    : isCardHighlighted
                    ? "bg-white/95 dark:bg-zinc-900/95 border-blue-500/60 dark:border-blue-500/50 shadow-2xl shadow-blue-500/10 lg:-translate-y-2 ring-2 ring-blue-500/30"
                    : "bg-white/80 dark:bg-zinc-900/80 border-slate-200/80 dark:border-zinc-800 shadow-lg hover:shadow-xl"
                }`}
              >
                {/* Top Badge */}
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span
                    className={`px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider text-white shadow-md flex items-center gap-1.5 whitespace-nowrap ${
                      isPlanActive
                        ? plan.id === "premium"
                          ? "bg-gradient-to-r from-amber-500 to-yellow-600 shadow-amber-500/30"
                          : plan.id === "pro"
                          ? "bg-gradient-to-r from-emerald-600 to-teal-600 shadow-emerald-500/30"
                          : "bg-slate-700 shadow-slate-700/30"
                        : plan.id === "premium" && isPro
                        ? "bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 shadow-violet-500/30 animate-pulse"
                        : plan.isPopular
                        ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 shadow-blue-500/30"
                        : "bg-slate-600 shadow-slate-600/20"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    <span>{plan.badge}</span>
                  </span>
                </div>

                {/* Card Body */}
                <div className="p-6 sm:p-8 flex-1 flex flex-col">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{plan.name}</span>
                      {isPlanActive && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                          Active
                        </span>
                      )}
                    </h3>
                    <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 mt-0.5">
                      {plan.tagline}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-zinc-400 mt-3 leading-relaxed min-h-[36px]">
                      {plan.description}
                    </p>
                  </div>

                  {/* Price Display */}
                  <div className="mt-6 pb-6 border-b border-slate-200/80 dark:border-zinc-800">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white">
                        {plan.price}
                      </span>
                      <span className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-zinc-400">
                        /{plan.period}
                      </span>
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="mt-6 flex-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-3">
                      Features Included:
                    </p>
                    <ul className="space-y-3">
                      {plan.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm">
                          {feat.included ? (
                            <div className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                              <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            </div>
                          ) : (
                            <div className="w-4 h-4 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-600 flex items-center justify-center shrink-0 mt-0.5">
                              <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                              </svg>
                            </div>
                          )}
                          <span
                            className={`${
                              feat.included
                                ? feat.highlight
                                  ? "font-bold text-slate-900 dark:text-white"
                                  : "text-slate-700 dark:text-zinc-300"
                                : "text-slate-400 dark:text-zinc-600 line-through"
                            }`}
                          >
                            {feat.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Bottom Action Area */}
                <div className="p-6 sm:p-8 pt-0">
                  {/* Normal Free Card */}
                  {plan.id === "normal" && (
                    isNormal ? (
                      <Link
                        href={plan.href}
                        className="w-full py-3.5 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-slate-800 dark:text-zinc-200 font-bold text-sm border border-slate-200 dark:border-zinc-700 flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <span>Current Plan • Browse Jobs</span>
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M5 12h14" />
                          <path d="m12 5 7 7-7 7" />
                        </svg>
                      </Link>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="w-full py-3.5 px-6 rounded-2xl bg-slate-100 dark:bg-zinc-800/80 text-slate-400 dark:text-zinc-500 font-semibold text-sm border border-slate-200 dark:border-zinc-700 flex items-center justify-center gap-2 cursor-not-allowed"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span>Included in Your Plan</span>
                      </button>
                    )
                  )}

                  {/* Pro Card */}
                  {plan.id === "pro" && (
                    isProDisabledForUser ? (
                      <div>
                        <button
                          type="button"
                          disabled
                          className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm border flex items-center justify-center gap-2 cursor-not-allowed ${
                            isPro
                              ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700"
                              : "bg-slate-100 dark:bg-zinc-800/80 text-slate-400 dark:text-zinc-500 border-slate-200 dark:border-zinc-700"
                          }`}
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          <span>{isPro ? "Current Active Plan" : "Included in Premium"}</span>
                        </button>
                        <p className="text-[11px] text-center text-slate-500 dark:text-zinc-400 mt-2">
                          {isPro
                            ? "You already have Pro. You cannot purchase Pro again."
                            : "Your VIP Premium subscription already covers Pro."}
                        </p>
                      </div>
                    ) : (
                      <form action="/api/checkout_sessions" method="POST">
                        <input type="hidden" name="plan" value="pro" />
                        <button
                          type="submit"
                          role="link"
                          className="w-full py-3.5 px-6 rounded-2xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-md bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/35 hover:-translate-y-0.5"
                        >
                          <span>Upgrade to Pro</span>
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M5 12h14" />
                            <path d="m12 5 7 7-7 7" />
                          </svg>
                        </button>
                      </form>
                    )
                  )}

                  {/* Premium Card */}
                  {plan.id === "premium" && (
                    isPremiumDisabledForUser ? (
                      <div>
                        <button
                          type="button"
                          disabled
                          className="w-full py-3.5 px-6 rounded-2xl font-bold text-sm bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700/80 flex items-center justify-center gap-2 cursor-not-allowed"
                        >
                          <span>👑</span>
                          <span>Current Active Plan</span>
                        </button>
                        <p className="text-[11px] text-center text-amber-700 dark:text-amber-400 mt-2">
                          You already have the highest VIP Premium tier. You cannot purchase Premium again.
                        </p>
                      </div>
                    ) : (
                      <form action="/api/checkout_sessions" method="POST">
                        <input type="hidden" name="plan" value="premium" />
                        <button
                          type="submit"
                          role="link"
                          className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                            isPro
                              ? "bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-violet-500/30 hover:shadow-lg hover:shadow-violet-500/40 hover:-translate-y-0.5 ring-2 ring-violet-400/50"
                              : "bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-slate-900 shadow-slate-900/10 hover:-translate-y-0.5"
                          }`}
                        >
                          <span>{isPro ? "Upgrade to Premium" : "Get Premium"}</span>
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M5 12h14" />
                            <path d="m12 5 7 7-7 7" />
                          </svg>
                        </button>
                      </form>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Security & Trust Footer */}
        <div className="max-w-4xl mx-auto mt-14 p-5 rounded-2xl bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md border border-slate-200/80 dark:border-zinc-800 flex flex-wrap items-center justify-around gap-4 text-xs text-slate-500 dark:text-zinc-400 font-medium text-center">
          <div className="flex items-center gap-1.5">
            <span className="text-emerald-500 font-bold">✓</span>
            <span>Payments Powered by <strong>Stripe</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-emerald-500 font-bold">✓</span>
            <span>256-Bit SSL Bank Encryption</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-emerald-500 font-bold">✓</span>
            <span>Instant Application Activation</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-emerald-500 font-bold">✓</span>
            <span>30-Day Money-Back Guarantee</span>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 dark:bg-zinc-950" />}>
      <PricingContent />
    </Suspense>
  );
}
