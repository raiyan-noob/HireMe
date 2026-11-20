"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { getUserPlanStatus, getBillingHistory } from "@/lib/actions/payment";
import { getApplications } from "@/lib/actions/applications";

export default function SeekerBillingsPage() {
  const { data: session, isPending: sessionLoading } = useSession();
  const user = session?.user;

  const [planStatus, setPlanStatus] = useState(null);
  const [billingHistory, setBillingHistory] = useState([]);
  const [applicationsCount, setApplicationsCount] = useState(0);
  const [isFetching, setIsFetching] = useState(true);
  const loading = sessionLoading || (!!user?.email && isFetching);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Mouse spotlight tracking
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const copyToClipboard = (text, id) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  useEffect(() => {
    if (!user?.email) return;

    let isMounted = true;
    Promise.allSettled([
      getUserPlanStatus(user.email),
      getBillingHistory(user.email),
      getApplications(user.email),
    ]).then(([planRes, historyRes, appsRes]) => {
      if (!isMounted) return;

      if (planRes.status === "fulfilled" && planRes.value) {
        setPlanStatus(planRes.value);
      }
      if (historyRes.status === "fulfilled" && Array.isArray(historyRes.value)) {
        setBillingHistory(historyRes.value);
      }
      if (appsRes.status === "fulfilled" && Array.isArray(appsRes.value)) {
        setApplicationsCount(appsRes.value.length);
      }
      setIsFetching(false);
    });

    return () => {
      isMounted = false;
    };
  }, [user?.email]);

  // Determine active plan tier
  const activePlan = (
    planStatus?.plan ||
    user?.plan ||
    (planStatus?.premium || user?.premium
      ? "premium"
      : planStatus?.pro || user?.pro
      ? "pro"
      : "normal")
  ).toLowerCase();

  const isPremium = activePlan === "premium";
  const isPro = activePlan === "pro";
  const isNormal = !isPremium && !isPro;

  // Filter billing history
  const filteredHistory = useMemo(() => {
    if (!searchQuery.trim()) return billingHistory;
    const q = searchQuery.toLowerCase().trim();
    return billingHistory.filter(
      (item) =>
        item.sessionId?.toLowerCase().includes(q) ||
        item.plan?.toLowerCase().includes(q) ||
        item.paymentIntent?.toLowerCase().includes(q) ||
        item.paymentStatus?.toLowerCase().includes(q)
    );
  }, [billingHistory, searchQuery]);

  // Calculate total amount spent
  const totalSpentCents = useMemo(() => {
    return billingHistory.reduce((acc, curr) => {
      if (curr.paymentStatus === "paid" || curr.status === "complete") {
        return acc + (curr.amountTotal || 0);
      }
      return acc;
    }, 0);
  }, [billingHistory]);

  const totalSpentFormatted = (totalSpentCents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8"
    >
      {/* Dynamic Cursor Spotlight */}
      {isHovered && (
        <div
          className="pointer-events-none fixed inset-0 -z-5 transition-opacity duration-300 hidden md:block"
          style={{
            background: `radial-gradient(700px circle at ${mousePos.x}px ${mousePos.y}px, rgba(59, 130, 246, 0.08), transparent 75%)`,
          }}
        />
      )}

      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* ======================================================== */}
        {/* HEADER */}
        {/* ======================================================== */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50/90 dark:bg-blue-950/70 border border-blue-200/80 dark:border-blue-800/70 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-2 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span>Job Seeker Hub • Financials</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Billing & Subscriptions
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 mt-1">
              Review your active membership plan, view payment receipts, and manage your billing history.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isNormal && (
              <Link
                href="/pricing"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/25 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Upgrade to Pro</span>
                <span>★</span>
              </Link>
            )}
            {isPro && (
              <Link
                href="/pricing"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-violet-500/25 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Upgrade to VIP Premium</span>
                <span>👑</span>
              </Link>
            )}
            <Link
              href="/pricing"
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 font-bold text-xs sm:text-sm border border-slate-200 dark:border-zinc-700 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>View Pricing Plans</span>
              <span>→</span>
            </Link>
          </div>
        </div>

        {/* ======================================================== */}
        {/* SUMMARY STATS TILES */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Tile 1: Current Membership */}
          <div className="p-5 rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-slate-200/80 dark:border-zinc-800 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 ${
              isPremium
                ? "bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-300"
                : isPro
                ? "bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-300"
                : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400"
            }`}>
              {isPremium ? "👑" : isPro ? "★" : "⚡"}
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Current Plan
              </p>
              <h4 className="text-lg font-black text-slate-900 dark:text-white capitalize">
                {activePlan} Tier
              </h4>
              <span className="inline-block mt-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                ● Active Membership
              </span>
            </div>
          </div>

          {/* Tile 2: Total Spent */}
          <div className="p-5 rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-slate-200/80 dark:border-zinc-800 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-300 flex items-center justify-center text-xl shrink-0">
              💳
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Total Invoiced
              </p>
              <h4 className="text-lg font-black text-slate-900 dark:text-white">
                {loading ? "..." : totalSpentFormatted}
              </h4>
              <span className="inline-block mt-0.5 text-[10px] font-medium text-slate-500 dark:text-zinc-400">
                {billingHistory.length} Transaction{billingHistory.length === 1 ? "" : "s"}
              </span>
            </div>
          </div>

          {/* Tile 3: Application Allowance */}
          <div className="p-5 rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-slate-200/80 dark:border-zinc-800 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-300 flex items-center justify-center text-xl shrink-0">
              📄
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Applications
              </p>
              <h4 className="text-lg font-black text-slate-900 dark:text-white">
                {isNormal ? `${applicationsCount} / 5 Used` : "Unlimited"}
              </h4>
              <span className="inline-block mt-0.5 text-[10px] font-medium text-slate-500 dark:text-zinc-400">
                {isNormal ? "Starter Limit" : "No Quota Limits"}
              </span>
            </div>
          </div>

          {/* Tile 4: Payment Processor */}
          <div className="p-5 rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-slate-200/80 dark:border-zinc-800 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-violet-100 dark:bg-violet-950/80 text-violet-600 dark:text-violet-300 flex items-center justify-center text-xl shrink-0">
              🔒
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Security
              </p>
              <h4 className="text-lg font-black text-slate-900 dark:text-white">
                Stripe Verified
              </h4>
              <span className="inline-block mt-0.5 text-[10px] font-medium text-slate-500 dark:text-zinc-400">
                256-Bit SSL Encrypted
              </span>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* CURRENT SUBSCRIPTION CARD */}
        {/* ======================================================== */}
        {loading ? (
          <div className="h-48 rounded-3xl bg-slate-200/60 dark:bg-zinc-800/60 animate-pulse" />
        ) : isPremium ? (
          /* PREMIUM SUBSCRIPTION CARD */
          <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-violet-950 via-indigo-950 to-slate-950 text-white border border-violet-500/40 shadow-2xl shadow-violet-950/30 overflow-hidden">
            <div className="absolute -top-16 -right-16 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-violet-800/40">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-md">
                    👑 VIP Executive Membership
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Active
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  HireMe VIP Premium Tier
                </h2>
                <p className="text-xs sm:text-sm text-violet-200 max-w-xl">
                  You are on our highest tier with lifetime top-of-queue priority on all recruiter feeds, verified executive candidate badge, and unlimited applications.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:text-right shrink-0">
                <div>
                  <span className="text-3xl sm:text-4xl font-black text-white">$39.00</span>
                  <span className="text-xs text-violet-300 block">USD • One-time Investment</span>
                </div>
              </div>
            </div>

            {/* Unlocked Facilities Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-6 text-xs sm:text-sm">
              <div className="flex items-center gap-2.5 text-violet-100">
                <span className="text-emerald-400 font-black">✓</span>
                <span><strong>#1 Top-of-Queue Priority</strong> on Recruiter Feeds</span>
              </div>
              <div className="flex items-center gap-2.5 text-violet-100">
                <span className="text-emerald-400 font-black">✓</span>
                <span><strong>Unlimited</strong> Job Applications</span>
              </div>
              <div className="flex items-center gap-2.5 text-violet-100">
                <span className="text-emerald-400 font-black">✓</span>
                <span><strong>Verified Candidate Badge</strong> Active</span>
              </div>
              <div className="flex items-center gap-2.5 text-violet-100">
                <span className="text-emerald-400 font-black">✓</span>
                <span><strong>Direct Recruiter Messaging</strong> Unlocked</span>
              </div>
              <div className="flex items-center gap-2.5 text-violet-100">
                <span className="text-emerald-400 font-black">✓</span>
                <span><strong>AI Resume & Skill Match Score</strong> Active</span>
              </div>
              <div className="flex items-center gap-2.5 text-violet-100">
                <span className="text-emerald-400 font-black">✓</span>
                <span><strong>Instant Job Alerts</strong> via Email</span>
              </div>
            </div>
          </div>
        ) : isPro ? (
          /* PRO SUBSCRIPTION CARD */
          <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-blue-950 via-indigo-950 to-slate-900 text-white border border-blue-500/40 shadow-2xl shadow-blue-950/30 overflow-hidden">
            <div className="absolute -top-16 -right-16 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-blue-800/40">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md">
                    ★ Pro Accelerator Membership
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Active
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  HireMe Pro Plan
                </h2>
                <p className="text-xs sm:text-sm text-blue-200 max-w-xl">
                  You have unlimited job applications, Verified Candidate badges, and elevated placement ahead of standard applicants.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:text-right shrink-0">
                <div>
                  <span className="text-3xl sm:text-4xl font-black text-white">$19.00</span>
                  <span className="text-xs text-blue-300 block">USD • One-time Investment</span>
                </div>
                <Link
                  href="/pricing"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Upgrade to Premium</span>
                  <span>👑</span>
                </Link>
              </div>
            </div>

            {/* Unlocked Facilities Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-6 text-xs sm:text-sm">
              <div className="flex items-center gap-2.5 text-blue-100">
                <span className="text-emerald-400 font-black">✓</span>
                <span><strong>Unlimited</strong> Job Applications</span>
              </div>
              <div className="flex items-center gap-2.5 text-blue-100">
                <span className="text-emerald-400 font-black">✓</span>
                <span><strong>Verified Candidate Badge</strong> Active</span>
              </div>
              <div className="flex items-center gap-2.5 text-blue-100">
                <span className="text-emerald-400 font-black">✓</span>
                <span><strong>Priority Queue</strong> Ahead of Free Applicants</span>
              </div>
              <div className="flex items-center gap-2.5 text-blue-100">
                <span className="text-emerald-400 font-black">✓</span>
                <span><strong>AI Resume & Skill Match Score</strong></span>
              </div>
              <div className="flex items-center gap-2.5 text-blue-100">
                <span className="text-emerald-400 font-black">✓</span>
                <span><strong>Instant Job Alerts</strong> via Email</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-400">
                <span className="text-slate-500 font-black">○</span>
                <span>Recruiter Direct Messaging (Premium Only)</span>
              </div>
            </div>
          </div>
        ) : (
          /* NORMAL (FREE) SUBSCRIPTION CARD */
          <div className="rounded-3xl p-6 sm:p-8 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-zinc-800 shadow-xl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-zinc-800">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                    Free Starter Plan
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700">
                    Active
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                  Free Starter Account
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 max-w-xl">
                  You are currently using the Free Starter tier, limited to 5 job applications with standard candidate queue placement.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-4 shrink-0">
                <div>
                  <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">$0.00</span>
                  <span className="text-xs text-slate-500 dark:text-zinc-400 block">USD • Forever Free</span>
                </div>
                <Link
                  href="/pricing"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Upgrade to Pro ($19)</span>
                  <span>★</span>
                </Link>
              </div>
            </div>

            {/* Application Meter */}
            <div className="mt-6 pt-2">
              <div className="flex justify-between items-center text-xs font-bold mb-2">
                <span className="text-slate-600 dark:text-zinc-400">Application Quota Usage:</span>
                <span className={applicationsCount >= 5 ? "text-rose-500 font-black" : "text-slate-900 dark:text-white"}>
                  {applicationsCount} / 5 Applications Used ({Math.max(0, 5 - applicationsCount)} remaining)
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden p-0.5 border border-slate-200 dark:border-zinc-700">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    applicationsCount >= 5
                      ? "bg-rose-500"
                      : applicationsCount >= 3
                      ? "bg-amber-500"
                      : "bg-blue-600"
                  }`}
                  style={{ width: `${Math.min(100, (applicationsCount / 5) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* PAYMENT HISTORY & INVOICES */}
        {/* ======================================================== */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Payment History & Receipts
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400">
                Official transaction statements and downloadable VAT receipts powered by Stripe.
              </p>
            </div>

            {/* Search filter */}
            {billingHistory.length > 0 && (
              <div className="w-full sm:w-72">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by ID or plan..."
                    className="w-full px-4 py-2 pl-9 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                  <svg
                    className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="22" x2="16.65" y2="17.65" />
                  </svg>
                </div>
              </div>
            )}
          </div>

          {/* History Content */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-20 rounded-2xl bg-slate-200/60 dark:bg-zinc-800/60 animate-pulse" />
              ))}
            </div>
          ) : billingHistory.length === 0 ? (
            /* EMPTY STATE */
            <div className="p-8 sm:p-12 text-center rounded-3xl bg-white/70 dark:bg-zinc-900/70 border border-slate-200/80 dark:border-zinc-800">
              <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center text-3xl mx-auto mb-4 shadow-sm">
                🧾
              </div>
              <h4 className="text-lg font-black text-slate-900 dark:text-white">
                No Payment Records Found
              </h4>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1 max-w-md mx-auto">
                You are currently on the Free Starter tier. When you upgrade to Pro or Premium, your verified Stripe checkout receipts and statements will appear here.
              </p>
              <div className="mt-6">
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-slate-900 font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-md"
                >
                  <span>Explore Membership Plans</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          ) : (
            /* TRANSACTION LIST TABLE */
            <div className="rounded-3xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-slate-200/80 dark:border-zinc-800 shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50/80 dark:bg-zinc-850/80 border-b border-slate-200/80 dark:border-zinc-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                    <tr>
                      <th className="py-4 px-6">Transaction ID</th>
                      <th className="py-4 px-6">Plan Description</th>
                      <th className="py-4 px-6">Date & Time</th>
                      <th className="py-4 px-6">Amount</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6 text-right">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                    {filteredHistory.map((item, idx) => {
                      const displayId = item.sessionId
                        ? `TXN-${item.sessionId.slice(-8).toUpperCase()}`
                        : `PAY-${idx + 1001}`;
                      const amountFormatted = item.amountTotal
                        ? (item.amountTotal / 100).toLocaleString("en-US", {
                            style: "currency",
                            currency: (item.currency || "USD").toUpperCase(),
                          })
                        : item.plan === "premium"
                        ? "$39.00 USD"
                        : "$19.00 USD";

                      const formattedDate = item.verifiedAt
                        ? new Date(item.verifiedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Recent";

                      return (
                        <tr
                          key={item._id || item.sessionId || idx}
                          className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 transition-colors"
                        >
                          {/* Transaction ID */}
                          <td className="py-4 px-6 font-mono text-xs text-slate-800 dark:text-zinc-200">
                            <div className="flex items-center gap-2">
                              <span>{displayId}</span>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(item.sessionId || displayId, item._id || idx)}
                                title="Copy Full ID"
                                className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                              >
                                {copiedId === (item._id || idx) ? (
                                  <span className="text-emerald-500 text-[10px] font-bold">Copied!</span>
                                ) : (
                                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                  </svg>
                                )}
                              </button>
                            </div>
                          </td>

                          {/* Plan Description */}
                          <td className="py-4 px-6 font-semibold text-slate-900 dark:text-white">
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                  item.plan === "premium"
                                    ? "bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700"
                                    : "bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700"
                                }`}
                              >
                                {item.plan === "premium" ? "👑 VIP Premium" : "★ Pro Member"}
                              </span>
                              <span>HireMe {item.plan?.toUpperCase()} Access</span>
                            </div>
                          </td>

                          {/* Date */}
                          <td className="py-4 px-6 text-slate-500 dark:text-zinc-400 text-xs">
                            {formattedDate}
                          </td>

                          {/* Amount */}
                          <td className="py-4 px-6 font-bold text-slate-900 dark:text-white">
                            {amountFormatted}
                          </td>

                          {/* Status */}
                          <td className="py-4 px-6">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              <span>Paid</span>
                            </span>
                          </td>

                          {/* Action Button */}
                          <td className="py-4 px-6 text-right">
                            <button
                              type="button"
                              onClick={() => setSelectedInvoice(item)}
                              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 font-bold text-xs transition-colors cursor-pointer"
                            >
                              View Receipt
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* PAYMENT SECURITY & STRIPE BADGES */}
        {/* ======================================================== */}
        <div className="p-6 rounded-3xl bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md border border-slate-200/80 dark:border-zinc-800 flex flex-wrap items-center justify-around gap-6 text-xs text-slate-500 dark:text-zinc-400 font-medium text-center">
          <div className="flex items-center gap-2">
            <span className="text-emerald-500 font-black">✓</span>
            <span>All Transactions Securely Processed by <strong>Stripe Checkout</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-500 font-black">✓</span>
            <span>PCI-DSS Level 1 Banking Compliance</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-500 font-black">✓</span>
            <span>Instant Membership Rights Grant</span>
          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* OFFICIAL RECEIPT MODAL */}
      {/* ======================================================== */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xl p-6 sm:p-8 space-y-6">
            
            {/* Top Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black text-sm flex items-center justify-center">
                  H
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                    HireMe Official Receipt
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Order Confirmation & Payment Statement
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 flex items-center justify-center cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Receipt Body */}
            <div className="space-y-4 text-xs sm:text-sm">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-850/80 border border-slate-200/70 dark:border-zinc-700/70 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-zinc-400">Receipt / Session ID:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white break-all max-w-[240px] text-right">
                    {selectedInvoice.sessionId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-zinc-400">Payment Status:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    ● PAID & VERIFIED
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-zinc-400">Billing Customer:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {selectedInvoice.customerName || user?.name || "Candidate"} ({selectedInvoice.userEmail})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-zinc-400">Transaction Date:</span>
                  <span className="text-slate-900 dark:text-white font-semibold">
                    {selectedInvoice.verifiedAt
                      ? new Date(selectedInvoice.verifiedAt).toLocaleString()
                      : "Recent"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-zinc-400">Processor:</span>
                  <span className="text-slate-900 dark:text-white font-semibold">
                    Stripe Hosted Checkout
                  </span>
                </div>
              </div>

              {/* Line Items Breakdown */}
              <div className="pt-2">
                <div className="flex justify-between items-center py-2.5 border-b border-slate-100 dark:border-zinc-800">
                  <span className="font-bold text-slate-900 dark:text-white capitalize">
                    HireMe {selectedInvoice.plan} Membership
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {selectedInvoice.amountTotal
                      ? (selectedInvoice.amountTotal / 100).toLocaleString("en-US", {
                          style: "currency",
                          currency: (selectedInvoice.currency || "USD").toUpperCase(),
                        })
                      : selectedInvoice.plan === "premium"
                      ? "$39.00 USD"
                      : "$19.00 USD"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 text-slate-500 dark:text-zinc-400 text-xs">
                  <span>Sales Tax & VAT (0%):</span>
                  <span>$0.00 USD</span>
                </div>
                <div className="flex justify-between items-center py-3 border-t border-slate-200 dark:border-zinc-700 text-base font-black text-slate-900 dark:text-white">
                  <span>Total Amount Paid:</span>
                  <span className="text-emerald-600 dark:text-emerald-400">
                    {selectedInvoice.amountTotal
                      ? (selectedInvoice.amountTotal / 100).toLocaleString("en-US", {
                          style: "currency",
                          currency: (selectedInvoice.currency || "USD").toUpperCase(),
                        })
                      : selectedInvoice.plan === "premium"
                      ? "$39.00 USD"
                      : "$19.00 USD"}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 6 2 18 2 18 9" />
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                  <rect x="6" y="14" width="12" height="8" />
                </svg>
                <span>Print Statement</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-slate-900 font-bold text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
