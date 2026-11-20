"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { getApplications } from "@/lib/actions/applications";
import { getSavedJobs } from "@/lib/actions/saved";
import { getUserPlanStatus } from "@/lib/actions/payment";

export default function SeekerDashboardPage() {
  const { data: session, isPending: sessionLoading } = useSession();
  const user = session?.user;

  const [applicationsCount, setApplicationsCount] = useState(0);
  const [savedCount, setSavedCount] = useState(0);
  const [userPlanData, setUserPlanData] = useState(null);
  const [isFetching, setIsFetching] = useState(true);
  const loading = sessionLoading || (!!user?.email && isFetching);

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

  useEffect(() => {
    if (!user?.email) return;

    let isMounted = true;
    Promise.allSettled([
      getApplications(user.email),
      getSavedJobs(user.email),
      getUserPlanStatus(user.email),
    ]).then(([appsRes, savedRes, planRes]) => {
      if (!isMounted) return;
      if (appsRes.status === "fulfilled" && Array.isArray(appsRes.value)) {
        setApplicationsCount(appsRes.value.length);
      }
      if (savedRes.status === "fulfilled" && Array.isArray(savedRes.value)) {
        setSavedCount(savedRes.value.length);
      }
      if (planRes.status === "fulfilled" && planRes.value) {
        setUserPlanData(planRes.value);
      }
      setIsFetching(false);
    });

    return () => {
      isMounted = false;
    };
  }, [user?.email]);

  const candidateName = user?.name || user?.email?.split("@")[0] || "Candidate";

  // Determine active plan tier: "premium" | "pro" | "normal"
  const plan = (
    userPlanData?.plan ||
    user?.plan ||
    (userPlanData?.premium || user?.premium
      ? "premium"
      : userPlanData?.pro || user?.pro
      ? "pro"
      : "normal")
  ).toLowerCase();

  const isPremium = plan === "premium";
  const isPro = plan === "pro";
  const isNormal = !isPremium && !isPro;

  // Normal tier application usage calculation
  const maxFreeApps = 5;
  const remainingFreeApps = Math.max(0, maxFreeApps - applicationsCount);
  const freeAppsPercent = Math.min(100, (applicationsCount / maxFreeApps) * 100);

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative min-h-[calc(100vh-4rem)] pb-16 overflow-hidden transition-colors"
    >
      {/* Dynamic Background: Light */}
      <div className="dark:hidden absolute inset-0 -z-10 pointer-events-none overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#cbd5e1_1.5px,transparent_1.5px),linear-gradient(to_bottom,#cbd5e1_1.5px,transparent_1.5px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_15%,#000_75%,transparent_100%)] opacity-60" />
        <div className="absolute -top-36 left-1/2 -translate-x-1/2 w-[1100px] h-[500px] bg-gradient-to-tr from-blue-400/30 via-indigo-300/35 to-violet-300/30 rounded-full blur-[120px]" />
      </div>

      {/* Dynamic Background: Dark */}
      <div className="hidden dark:block absolute inset-0 -z-10 pointer-events-none overflow-hidden bg-gradient-to-b from-[#070a12] via-[#090d18] to-[#060910]">
        <div className="absolute inset-0 bg-[size:3.5rem_3.5rem] bg-[linear-gradient(to_right,#1e293b_1.5px,transparent_1.5px),linear-gradient(to_bottom,#1e293b_1.5px,transparent_1.5px)] [mask-image:radial-gradient(ellipse_85%_65%_at_50%_20%,#000_65%,transparent_100%)] opacity-35" />
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[980px] h-[480px] bg-gradient-to-r from-blue-600/20 via-indigo-600/25 to-violet-600/20 rounded-full blur-[140px]" />
      </div>

      {/* Interactive Mouse Spotlight on Desktop */}
      {isHovered && (
        <div
          className="pointer-events-none fixed inset-0 -z-5 transition-opacity duration-300 hidden md:block"
          style={{
            background: `radial-gradient(700px circle at ${mousePos.x}px ${mousePos.y}px, rgba(59, 130, 246, 0.08), transparent 75%)`,
          }}
        />
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8">
        
        {/* ======================================================== */}
        {/* 1. TIER-SPECIFIC MEMBERSHIP HERO BANNER */}
        {/* ======================================================== */}

        {/* --- PREMIUM USER HERO BANNER --- */}
        {isPremium && (
          <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-violet-900/90 via-indigo-900/80 to-purple-950/90 text-white border border-violet-500/40 shadow-2xl shadow-violet-500/20 mb-8 relative overflow-hidden backdrop-blur-xl">
            <div className="absolute -right-16 -top-16 w-64 h-64 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-0 right-0 px-6 py-2 bg-gradient-to-l from-amber-400 via-amber-300 to-yellow-500 text-slate-900 font-black text-xs uppercase tracking-wider rounded-bl-2xl shadow-md">
              👑 Executive Tier Active
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-300 text-xs font-black uppercase tracking-wider mb-4">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>VIP Executive Placement</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Welcome back, {candidateName}!
            </h1>
            <p className="text-xs sm:text-sm text-violet-200 mt-2 max-w-2xl leading-relaxed">
              Your applications are automatically given <strong>#1 Top-of-Queue Priority</strong> on recruiter review dashboards, with Verified Candidate badges and direct recruiter messaging unlocked.
            </p>

            {/* Premium Facilities Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-violet-700/50">
              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-300">Queue Status</div>
                <div className="text-xs sm:text-sm font-black text-white mt-0.5">Top-of-Queue Priority</div>
              </div>
              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">Applications</div>
                <div className="text-xs sm:text-sm font-black text-white mt-0.5">Unlimited Applications</div>
              </div>
              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
                <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">Recruiter Chat</div>
                <div className="text-xs sm:text-sm font-black text-white mt-0.5">Direct Messaging Active</div>
              </div>
              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
                <div className="text-[10px] font-bold uppercase tracking-wider text-purple-300">Candidate Badge</div>
                <div className="text-xs sm:text-sm font-black text-white mt-0.5">Verified Badge Active</div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-6">
              <Link
                href="/jobs"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-400/25 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Browse Priority Jobs</span>
                <span>→</span>
              </Link>
              <Link
                href="/dashboard/seeker/applications"
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 transition-all cursor-pointer"
              >
                Track Applied Jobs ({applicationsCount})
              </Link>
            </div>
          </div>
        )}

        {/* --- PRO USER HERO BANNER --- */}
        {isPro && (
          <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-blue-900/90 via-indigo-900/80 to-slate-900/90 text-white border border-blue-500/40 shadow-2xl shadow-blue-500/20 mb-8 relative overflow-hidden backdrop-blur-xl">
            <div className="absolute -right-16 -top-16 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-0 right-0 px-6 py-2 bg-gradient-to-l from-blue-500 to-indigo-600 text-white font-black text-xs uppercase tracking-wider rounded-bl-2xl shadow-md">
              ★ Pro Member Active
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-400/20 border border-blue-300/40 text-blue-300 text-xs font-black uppercase tracking-wider mb-4">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span>Unlimited Applications Activated</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Welcome back, {candidateName}!
            </h1>
            <p className="text-xs sm:text-sm text-blue-200 mt-2 max-w-2xl leading-relaxed">
              You are on the <strong>HireMe Pro Plan</strong>. You have unlimited job applications, Verified Candidate badges, and your profile appears above normal applicants in recruiter queues.
            </p>

            {/* Pro Facilities Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-blue-700/50">
              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">Applications</div>
                <div className="text-xs sm:text-sm font-black text-white mt-0.5">Unlimited Applications</div>
              </div>
              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
                <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">Verified Badge</div>
                <div className="text-xs sm:text-sm font-black text-white mt-0.5">Verified Candidate Active</div>
              </div>
              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-300">Placement</div>
                <div className="text-xs sm:text-sm font-black text-white mt-0.5">Ahead of Normal Users</div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-6">
              <Link
                href="/jobs"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 via-indigo-600 to-violet-600 hover:from-blue-400 hover:to-violet-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Apply to Open Jobs</span>
                <span>→</span>
              </Link>
              <Link
                href="/pricing"
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>Upgrade to Premium for VIP Top-of-Queue</span>
                <span>👑</span>
              </Link>
            </div>
          </div>
        )}

        {/* --- NORMAL (FREE) USER HERO BANNER --- */}
        {isNormal && (
          <div className="p-8 sm:p-10 rounded-3xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-zinc-800 shadow-xl mb-8 relative">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-zinc-800">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold uppercase tracking-wider mb-3">
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  <span>Free Starter Plan</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                  Welcome back, {candidateName}!
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 mt-2 max-w-xl leading-relaxed">
                  You are currently on the Free plan. Free candidates can submit up to 5 verified job applications.
                </p>
              </div>

              {/* Free Application Usage Meter */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/70 dark:border-zinc-700/70 md:min-w-[260px]">
                <div className="flex justify-between items-center text-xs font-bold mb-2">
                  <span className="text-slate-500 dark:text-zinc-400">Application Usage</span>
                  <span className={applicationsCount >= 5 ? "text-rose-500 font-black" : "text-slate-900 dark:text-white"}>
                    {applicationsCount} / {maxFreeApps} Used
                  </span>
                </div>
                {/* Progress Bar */}
                <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-zinc-700 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      applicationsCount >= 5
                        ? "bg-rose-500"
                        : applicationsCount >= 4
                        ? "bg-amber-500"
                        : "bg-blue-600"
                    }`}
                    style={{ width: `${freeAppsPercent}%` }}
                  />
                </div>
                <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-2">
                  {remainingFreeApps > 0 ? (
                    <span>{remainingFreeApps} application{remainingFreeApps === 1 ? "" : "s"} remaining</span>
                  ) : (
                    <span className="text-rose-500 font-bold">Limit reached — Upgrade to apply more</span>
                  )}
                </div>
              </div>
            </div>

            {/* Upgrade CTA Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6 pt-2">
              <div className="text-xs text-slate-600 dark:text-zinc-400">
                🚀 <strong className="text-slate-900 dark:text-white">Need unlimited applications?</strong> Upgrade to Pro for $19 to bypass limits and get verified badges on your applications.
              </div>
              <Link
                href="/pricing"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/25 transition-all text-center shrink-0 cursor-pointer"
              >
                Upgrade to Pro →
              </Link>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 2. QUICK ACCESS DASHBOARD CARDS */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          
          {/* Applications Card */}
          <Link
            href="/dashboard/seeker/applications"
            className="group p-6 sm:p-7 rounded-3xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-zinc-800 hover:border-blue-400/60 dark:hover:border-blue-500/40 hover:-translate-y-1 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 border border-blue-200/80 dark:border-blue-800/80 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" x2="8" y1="13" y2="13" />
                  <line x1="16" x2="8" y1="17" y2="17" />
                  <line x1="10" x2="8" y1="9" y2="9" />
                </svg>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                  Active Candidacies
                </span>
                {isPremium && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-700">
                    👑 Priority
                  </span>
                )}
                {isPro && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-700">
                    ★ Verified
                  </span>
                )}
              </div>

              <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                My Applied Jobs
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
                Track statuses, inspect full job specs, or withdraw active applications.
              </p>
            </div>

            <div className="pt-5 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between mt-5">
              <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                {loading ? "..." : applicationsCount}
              </span>
              <span className="text-xs font-bold text-slate-600 dark:text-zinc-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-center gap-1">
                <span>Manage</span>
                <span>→</span>
              </span>
            </div>
          </Link>

          {/* Saved Jobs Card */}
          <Link
            href="/dashboard/seeker/saved"
            className="group p-6 sm:p-7 rounded-3xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-zinc-800 hover:border-rose-400/60 dark:hover:border-rose-500/40 hover:-translate-y-1 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4 border border-rose-200/80 dark:border-rose-800/80 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                </svg>
              </div>

              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                Saved Positions
              </span>
              <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                Bookmarked Jobs
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
                Review bookmarked openings, compare salaries, and apply when ready.
              </p>
            </div>

            <div className="pt-5 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between mt-5">
              <span className="text-2xl font-black text-rose-500">
                {loading ? "..." : savedCount}
              </span>
              <span className="text-xs font-bold text-slate-600 dark:text-zinc-300 group-hover:text-rose-500 transition-colors flex items-center gap-1">
                <span>View Saved</span>
                <span>→</span>
              </span>
            </div>
          </Link>
        </div>

      </div>
    </div>
  );
}
