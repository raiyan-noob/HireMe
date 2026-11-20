"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { getApplications, withdrawApplication } from "@/lib/actions/applications";
import { getUserPlanStatus } from "@/lib/actions/payment";

export default function SeekerApplicationsPage() {
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = useSession();
  const user = session?.user;

  const [applications, setApplications] = useState([]);
  const [userPlanData, setUserPlanData] = useState(null);
  const [isFetching, setIsFetching] = useState(true);
  const loading = sessionLoading || (!!user?.email && isFetching);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApp, setSelectedApp] = useState(null); // Full job details modal
  const [withdrawTarget, setWithdrawTarget] = useState(null); // Confirmation dialog
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Mouse spotlight tracking
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // Fetch applications and user plan
  useEffect(() => {
    if (!user?.email) return;

    let isMounted = true;

    Promise.allSettled([
      getApplications(user.email),
      getUserPlanStatus(user.email),
    ]).then(([appsRes, planRes]) => {
      if (!isMounted) return;
      if (appsRes.status === "fulfilled" && Array.isArray(appsRes.value)) {
        setApplications(appsRes.value);
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

  // Handle Withdraw
  const handleConfirmWithdraw = async () => {
    if (!withdrawTarget) return;
    setIsWithdrawing(true);
    try {
      const appId = withdrawTarget._id || withdrawTarget.id;
      await withdrawApplication(appId);
      setApplications((prev) => prev.filter((a) => (a._id || a.id) !== appId));
      if (selectedApp && (selectedApp._id || selectedApp.id) === appId) {
        setSelectedApp(null);
      }
      showToast(`Application for "${withdrawTarget.jobTitle}" has been withdrawn.`);
      setWithdrawTarget(null);
    } catch (err) {
      console.error("Failed to withdraw application:", err);
      showToast(err.message || "Failed to withdraw application.");
    } finally {
      setIsWithdrawing(false);
    }
  };

  // Filter applications by search
  const filteredApplications = useMemo(() => {
    if (!searchQuery.trim()) return applications;
    const term = searchQuery.toLowerCase().trim();
    return applications.filter(
      (app) =>
        (app.jobTitle || "").toLowerCase().includes(term) ||
        (app.companyName || "").toLowerCase().includes(term) ||
        (app.category || "").toLowerCase().includes(term)
    );
  }, [applications, searchQuery]);

  const userPlan = (
    userPlanData?.plan ||
    user?.plan ||
    (userPlanData?.premium || user?.premium
      ? "premium"
      : userPlanData?.pro || user?.pro
      ? "pro"
      : "normal")
  ).toLowerCase();

  const isPremium = userPlan === "premium";
  const isPro = userPlan === "pro";
  const isNormal = !isPremium && !isPro;

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative min-h-[calc(100vh-4rem)] pb-20 overflow-hidden transition-colors"
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-[120] animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-auto">
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-900/95 dark:bg-zinc-800/95 text-white shadow-2xl border border-slate-700/80 dark:border-zinc-700 backdrop-blur-md">
            <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <span className="text-xs sm:text-sm font-semibold">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Dynamic Background: Light */}
      <div className="dark:hidden absolute inset-0 -z-10 pointer-events-none overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#cbd5e1_1.5px,transparent_1.5px),linear-gradient(to_bottom,#cbd5e1_1.5px,transparent_1.5px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_15%,#000_75%,transparent_100%)] opacity-60" />
        <div className="absolute -top-36 left-1/2 -translate-x-1/2 w-[1100px] h-[500px] bg-gradient-to-tr from-blue-400/30 via-indigo-300/35 to-violet-300/30 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 -left-12 w-80 h-80 bg-cyan-300/25 rounded-full blur-[100px]" />
      </div>

      {/* Dynamic Background: Dark */}
      <div className="hidden dark:block absolute inset-0 -z-10 pointer-events-none overflow-hidden bg-gradient-to-b from-[#070a12] via-[#090d18] to-[#060910]">
        <div className="absolute inset-0 bg-[size:3.5rem_3.5rem] bg-[linear-gradient(to_right,#1e293b_1.5px,transparent_1.5px),linear-gradient(to_bottom,#1e293b_1.5px,transparent_1.5px)] [mask-image:radial-gradient(ellipse_85%_65%_at_50%_20%,#000_65%,transparent_100%)] opacity-35" />
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[980px] h-[480px] bg-gradient-to-r from-blue-600/20 via-indigo-600/25 to-violet-600/20 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 -left-32 w-96 h-96 bg-cyan-500/15 rounded-full blur-[130px]" />
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

      {/* Header Container */}
      <div className="max-w-6xl mx-auto">
        {/* Title & Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50/90 dark:bg-blue-950/70 border border-blue-200/80 dark:border-blue-800/70 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-2 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span>Job Seeker Hub • Track Applications</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              My Applied Jobs
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 mt-1">
              Review your active job submissions, view full position details, and manage candidacies.
            </p>
          </div>

          <Link
            href="/jobs"
            className="self-start sm:self-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/25 transition-all flex items-center gap-2 cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" x2="16.65" y1="21" y2="16.65" />
            </svg>
            <span>Browse More Jobs</span>
          </Link>
        </div>

        {/* ======================================================== */}
        {/* MEMBERSHIP TIER PRIORITY BANNER */}
        {/* ======================================================== */}
        {isPremium && (
          <div className="p-5 rounded-2xl bg-gradient-to-r from-violet-950/90 via-indigo-950/80 to-purple-950/90 border border-violet-500/40 text-white mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-md shadow-lg shadow-violet-950/20">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center text-lg font-black shrink-0 shadow-md">
                👑
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                    VIP Top-of-Queue Recruiter Placement Active
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400/20 text-amber-300 border border-amber-300/30">
                    #1 Priority
                  </span>
                </div>
                <p className="text-xs text-violet-200 mt-0.5">
                  Your candidacies are pinned at the very top of employer review feeds and highlighted with verified executive badges.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="px-3.5 py-1.5 rounded-xl bg-white/10 text-xs font-bold text-amber-300 border border-amber-300/30">
                Unlimited Applications
              </span>
            </div>
          </div>
        )}

        {isPro && (
          <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/90 via-indigo-950/80 to-slate-900/90 border border-blue-500/40 text-white mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-md shadow-lg shadow-blue-950/20">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center text-lg font-black shrink-0 shadow-md">
                ★
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-blue-300">
                    Pro Verified Applications Active
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-400/20 text-blue-300 border border-blue-300/30">
                    Priority Tier
                  </span>
                </div>
                <p className="text-xs text-blue-200 mt-0.5">
                  Your applications appear ahead of free applicants on recruiter dashboards with Verified Candidate badges.
                </p>
              </div>
            </div>
            <Link
              href="/pricing"
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-amber-300 border border-white/20 transition-all shrink-0 flex items-center gap-1.5"
            >
              <span>Upgrade to VIP Premium</span>
              <span>👑</span>
            </Link>
          </div>
        )}

        {isNormal && (
          <div className="p-5 rounded-2xl bg-white/90 dark:bg-zinc-900/90 border border-slate-200/80 dark:border-zinc-800 text-slate-800 dark:text-zinc-200 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Free Starter Plan • {applications.length} of 5 Applications Used
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                  Standard Queue
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Free applications are placed behind Pro and Premium applicants. Upgrade to Pro for unlimited submissions and priority placement.
              </p>
            </div>
            <Link
              href="/pricing"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition-all shrink-0 text-center"
            >
              Upgrade to Pro ($19) →
            </Link>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="p-5 rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-zinc-800 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
              Total Applications
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              {applications.length}
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
              {applications.length > 0 ? "Active submissions" : "No submissions yet"}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-zinc-800 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Under Review
            </span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {applications.length}
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
              Sent directly to hiring teams
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-zinc-800 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Profile Email
            </span>
            <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-1 truncate">
              {user?.email || "Guest"}
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
              Default application contact
            </p>
          </div>
        </div>

        {/* Search Bar if applications exist */}
        {applications.length > 0 && (
          <div className="mb-6">
            <div className="relative max-w-md">
              <svg
                className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" x2="16.65" y1="21" y2="16.65" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by role, company, or category..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/90 dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-blue-500 transition-all shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        )}

        {/* Content Section */}
        {loading ? (
          /* Skeleton Loader */
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="p-6 rounded-3xl bg-white/80 dark:bg-zinc-900/80 border border-slate-200/80 dark:border-zinc-800 animate-pulse flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-zinc-800 shrink-0" />
                  <div className="space-y-2">
                    <div className="w-48 h-4 rounded-md bg-slate-200 dark:bg-zinc-800" />
                    <div className="w-32 h-3 rounded-md bg-slate-200 dark:bg-zinc-800" />
                  </div>
                </div>
                <div className="w-28 h-9 rounded-xl bg-slate-200 dark:bg-zinc-800" />
              </div>
            ))}
          </div>
        ) : applications.length === 0 ? (
          /* Empty State */
          <div className="py-16 px-6 text-center rounded-3xl bg-white/80 dark:bg-zinc-900/80 border border-slate-200/80 dark:border-zinc-800 backdrop-blur-xl shadow-sm">
            <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-4 border border-blue-200/70 dark:border-blue-800/70">
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" x2="8" y1="13" y2="13" />
                <line x1="16" x2="8" y1="17" y2="17" />
                <line x1="10" x2="8" y1="9" y2="9" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              No applications submitted yet
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 max-w-md mx-auto mt-1.5 mb-6">
              You haven&apos;t applied for any positions yet. Explore thousands of active listings, submit applications in one click, and track responses here.
            </p>
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/25 transition-all"
            >
              <span>Explore Open Jobs</span>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          </div>
        ) : filteredApplications.length === 0 ? (
          /* Search Empty State */
          <div className="py-12 text-center rounded-3xl bg-white/70 dark:bg-zinc-900/70 border border-slate-200 dark:border-zinc-800">
            <p className="text-sm font-semibold text-slate-600 dark:text-zinc-400">
              No applications match &ldquo;{searchQuery}&rdquo;
            </p>
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="mt-3 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              Clear search
            </button>
          </div>
        ) : (
          /* Application Cards List */
          <div className="space-y-4">
            {filteredApplications.map((app) => {
              const appId = app._id || app.id;
              const companyInitial = (app.companyName || app.jobTitle || "H")[0].toUpperCase();
              const appliedDate = app.appliedAt
                ? new Date(app.appliedAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : "Recently";

              return (
                <div
                  key={appId}
                  className="group relative p-5 sm:p-6 rounded-3xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-zinc-800 hover:border-blue-400/50 dark:hover:border-blue-500/40 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-5"
                >
                  {/* Left: Info */}
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white font-black text-lg shadow-sm shadow-blue-500/20 shrink-0 group-hover:scale-105 transition-transform">
                      {companyInitial}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/70 dark:border-blue-800/70">
                          {app.companyName || "Company"}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/70 dark:border-emerald-800/70 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Submitted</span>
                        </span>
                        {app.priorityScore === 3 || app.plan === "premium" || isPremium ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-300/80 dark:border-amber-700/80 flex items-center gap-1 shadow-2xs">
                            <span>👑</span>
                            <span>VIP Priority</span>
                          </span>
                        ) : app.priorityScore === 2 || app.plan === "pro" || isPro ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/80 flex items-center gap-1 shadow-2xs">
                            <span>★</span>
                            <span>Verified</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400">
                            Standard
                          </span>
                        )}
                        {app.category && (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                            {app.category}
                          </span>
                        )}
                        {app.workplaceType && (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                            {app.workplaceType}
                          </span>
                        )}
                      </div>

                      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
                        {app.jobTitle}
                      </h3>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-zinc-400 mt-1">
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                            <line x1="16" x2="16" y1="2" y2="6" />
                            <line x1="8" x2="8" y1="2" y2="6" />
                            <line x1="3" x2="21" y1="10" y2="10" />
                          </svg>
                          <span>Applied on {appliedDate}</span>
                        </span>

                        <span>•</span>

                        <span className="truncate">Contact: {app.email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-wrap items-center gap-2.5 self-end md:self-auto shrink-0">
                    {/* View Details Button */}
                    <button
                      type="button"
                      onClick={() => setSelectedApp(app)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-bold text-xs shadow-sm shadow-blue-500/20 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z" />
                      </svg>
                      <span>View Details</span>
                    </button>

                    {/* View in Jobs Button */}
                    <button
                      type="button"
                      onClick={() =>
                        router.push(`/jobs?search=${encodeURIComponent(app.jobTitle || "")}`)
                      }
                      className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                      View in Jobs
                    </button>

                    {/* Withdraw Button */}
                    <button
                      type="button"
                      onClick={() => setWithdrawTarget(app)}
                      className="px-3.5 py-2 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 bg-rose-50/80 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-950/80 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      </svg>
                      <span>Withdraw</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* FULL JOB DETAILS DIALOG / MODAL */}
      {/* ======================================================== */}
      {selectedApp && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-950/65 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setSelectedApp(null)}
        >
          <div
            className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xl p-6 sm:p-8 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-6 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-start gap-4 min-w-0">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white font-black text-xl shadow-md shrink-0">
                  {(selectedApp.companyName || selectedApp.jobTitle || "H")[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                      {selectedApp.category || "General"}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>{selectedApp.status || "Application Submitted"}</span>
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white truncate">
                    {selectedApp.jobTitle}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-semibold mt-0.5">
                    {selectedApp.companyName} • {selectedApp.location || "Remote"}
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="p-2 rounded-2xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
                aria-label="Close dialog"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Application Submission Banner */}
            <div className="my-5 p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/70 dark:border-blue-800/60 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300 font-semibold">
                <svg className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <span>
                  Applied on{" "}
                  {selectedApp.appliedAt
                    ? new Date(selectedApp.appliedAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "Recently"}
                </span>
              </div>
              <span className="text-slate-500 dark:text-zinc-400">
                Contact: <strong className="text-slate-800 dark:text-zinc-200">{selectedApp.email}</strong>
              </span>
            </div>

            {/* Quick Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 block">
                  Workplace
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-zinc-200 mt-1 block">
                  {selectedApp.workplaceType || "Remote"}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 block">
                  Type
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-zinc-200 mt-1 block">
                  {selectedApp.employmentType || "Full-time"}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 block">
                  Experience
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-zinc-200 mt-1 block">
                  {selectedApp.experienceLevel || "All Levels"}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 block">
                  Deadline
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-zinc-200 mt-1 block">
                  {selectedApp.applicationDeadline || "Open"}
                </span>
              </div>
            </div>

            {/* Compensation Box */}
            {(selectedApp.minSalary || selectedApp.maxSalary) && (
              <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-800/60 flex items-center justify-between mb-6">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                    Compensation
                  </span>
                  <div className="text-base sm:text-lg font-black text-emerald-700 dark:text-emerald-400">
                    {selectedApp.currency || "USD"}{" "}
                    {Number(selectedApp.minSalary || 0).toLocaleString()}
                    {selectedApp.maxSalary ? ` – ${Number(selectedApp.maxSalary).toLocaleString()}` : ""}{" "}
                    {selectedApp.salaryPeriod || "Per Year"}
                  </div>
                </div>
                {selectedApp.equityIncluded && (
                  <span className="px-3 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 text-xs font-bold">
                    + Equity Included
                  </span>
                )}
              </div>
            )}

            {/* Tech Stack & Required Skills */}
            {Array.isArray(selectedApp.skills) && selectedApp.skills.length > 0 && (
              <div className="mb-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-2.5">
                  Tech Stack & Required Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedApp.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-semibold border border-slate-200 dark:border-zinc-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="mb-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-2">
                Role Overview & Description
              </h4>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
                {selectedApp.description ||
                  "This role is an active position at " +
                    (selectedApp.companyName || "the company") +
                    ". Your profile and application have been delivered to the hiring team for review."}
              </p>
            </div>

            {/* Responsibilities */}
            {Array.isArray(selectedApp.responsibilities) && selectedApp.responsibilities.length > 0 && (
              <div className="mb-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-2">
                  Key Responsibilities
                </h4>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-zinc-300">
                  {selectedApp.responsibilities.map((r, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Modal Footer Actions */}
            <div className="pt-5 border-t border-slate-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setWithdrawTarget(selectedApp);
                }}
                className="px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 bg-rose-50/80 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-950/80 font-bold text-xs sm:text-sm transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18" />
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                </svg>
                <span>Withdraw Application</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const title = selectedApp.jobTitle || "";
                    setSelectedApp(null);
                    router.push(`/jobs?search=${encodeURIComponent(title)}`);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs sm:text-sm font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  View in Jobs
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedApp(null)}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs sm:text-sm hover:bg-slate-800 dark:hover:bg-zinc-200 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog Modal */}
      {withdrawTarget && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => !isWithdrawing && setWithdrawTarget(null)}
        >
          <div
            className="w-full max-w-md p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4 border border-rose-200/80 dark:border-rose-800/80">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 7.5h.008v.008H12v-.008Z" />
              </svg>
            </div>

            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              Withdraw Application?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 mt-2 leading-relaxed">
              Are you sure you want to withdraw your application for{" "}
              <strong className="text-slate-900 dark:text-white">
                {withdrawTarget.jobTitle}
              </strong>{" "}
              at <span className="font-semibold">{withdrawTarget.companyName}</span>?
              Once withdrawn, the apply button will become active again in your open jobs feed.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={isWithdrawing}
                onClick={() => setWithdrawTarget(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs sm:text-sm font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isWithdrawing}
                onClick={handleConfirmWithdraw}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-rose-600/25 transition-all cursor-pointer flex items-center gap-1.5"
              >
                {isWithdrawing ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="12" />
                    </svg>
                    <span>Withdrawing...</span>
                  </>
                ) : (
                  <span>Yes, Withdraw</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
