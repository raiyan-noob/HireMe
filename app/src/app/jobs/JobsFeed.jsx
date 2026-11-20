"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import JobCard from "@/app/components/JobCard";
import { useSession } from "@/lib/auth-client";
import { applyForJob, getApplications, getApplicationsCount } from "@/lib/actions/applications";
import { saveJob, getSavedJobs, unsaveJob } from "@/lib/actions/saved";
import { getUserPlanStatus } from "@/lib/actions/payment";

// Normalizes workplace strings from query params (e.g. "remote", "hybrid", "onsite")
function normalizeWorkplaceParam(val) {
  if (!val) return "All";
  const lower = val.toLowerCase().trim();
  if (lower === "all") return "All";
  if (lower === "remote") return "Remote";
  if (lower === "hybrid") return "Hybrid";
  if (lower === "onsite" || lower === "on-site") return "On-site";
  return val;
}

export default function JobsFeed({ initialJobs = [], initialQuery = {} }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const user = session?.user;

  // URL-driven query extraction (Source of truth)
  const urlSearch =
    searchParams?.get("search") ||
    searchParams?.get("title") ||
    searchParams?.get("q") ||
    initialQuery.search ||
    initialQuery.title ||
    initialQuery.q ||
    "";

  const urlCategory =
    searchParams?.get("category") || initialQuery.category || "All";

  const rawWorkplace =
    searchParams?.get("workplace") ||
    searchParams?.get("workplaceType") ||
    searchParams?.get("location") ||
    initialQuery.workplace ||
    initialQuery.workplaceType ||
    initialQuery.location ||
    "All";

  const urlWorkplace = normalizeWorkplaceParam(rawWorkplace);
  const urlSort =
    searchParams?.get("sort") || initialQuery.sort || "featured";
  const urlOnlyFeatured =
    searchParams?.get("featured") === "true" ||
    initialQuery.featured === "true" ||
    false;

  // Local text input state (keeps typing 100% fluid, uninterrupted, and focused)
  const [inputSearch, setInputSearch] = useState(urlSearch);
  const [prevUrlSearch, setPrevUrlSearch] = useState(urlSearch);

  // Synchronize state when URL changes externally without cascading useEffect renders
  if (prevUrlSearch !== urlSearch) {
    setPrevUrlSearch(urlSearch);
    setInputSearch(urlSearch);
  }

  const [viewMode, setViewMode] = useState("grid"); // "grid" | "compact"

  // Selected Job for View Details Modal Dialog
  const [selectedJob, setSelectedJob] = useState(null);

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Saved Jobs tracking
  const [savedJobIds, setSavedJobIds] = useState(new Set());
  // Applied Jobs tracking (to hide applied jobs from the browse jobs feed)
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());

  // Fetch user's applied and saved jobs when user session loads
  useEffect(() => {
    if (!user?.email) return;

    let isMounted = true;

    // Fetch applied jobs to filter them out of the feed
    getApplications(user.email)
      .then((apps) => {
        if (isMounted && Array.isArray(apps)) {
          const ids = new Set(
            apps
              .map((a) => a.jobId || a.job?._id || a.job?.id)
              .filter(Boolean)
              .map(String)
          );
          setAppliedJobIds(ids);
        }
      })
      .catch(() => {});

    // Fetch saved jobs
    getSavedJobs(user.email)
      .then((saved) => {
        if (isMounted && Array.isArray(saved)) {
          const ids = new Set(
            saved
              .map((s) => s.jobId || s._id)
              .filter(Boolean)
              .map(String)
          );
          setSavedJobIds(ids);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [user?.email]);

  const handleToggleSave = async (job) => {
    if (!user) {
      showToast("Please log in to save jobs.");
      return;
    }

    const id = String(job._id || job.id || job.jobTitle);
    const wasSaved = savedJobIds.has(id);

    // Optimistic UI update
    setSavedJobIds((prev) => {
      const updated = new Set(prev);
      if (wasSaved) updated.delete(id);
      else updated.add(id);
      return updated;
    });

    if (wasSaved) {
      showToast(`Removed "${job.jobTitle}" from saved jobs.`);
      try {
        await unsaveJob(id, user.email);
      } catch (err) {
        console.error("Failed to unsave job:", err);
      }
    } else {
      showToast(`Saved "${job.jobTitle}" to your saved jobs list!`);
      try {
        await saveJob({
          jobId: id,
          userId: user.id || user._id,
          email: user.email,
          jobTitle: job.jobTitle,
          companyName: job.companyName,
          location: job.location,
          workplaceType: job.workplaceType,
          employmentType: job.employmentType,
          category: job.category,
          skills: job.skills,
          minSalary: job.minSalary,
          maxSalary: job.maxSalary,
          currency: job.currency,
          salaryPeriod: job.salaryPeriod,
          description: job.description,
        });
      } catch (err) {
        console.error("Failed to save job:", err);
      }
    }
  };

  // Push updates to URL so the browser URL changes and drives the job listings
  const updateUrlFilters = useCallback(
    (updates = {}) => {
      const current = new URLSearchParams(searchParams?.toString() || "");

      // Clean legacy alias keys first
      if ("search" in updates) {
        current.delete("title");
        current.delete("q");
      }
      if ("workplace" in updates) {
        current.delete("workplaceType");
        current.delete("location");
      }

      Object.entries(updates).forEach(([key, val]) => {
        if (!val || val === "All" || val === false || val === "all") {
          current.delete(key);
        } else {
          current.set(key, String(val));
        }
      });

      const qs = current.toString();
      router.replace(qs ? `/jobs?${qs}` : "/jobs", { scroll: false });
    },
    [router, searchParams]
  );

  // Debounce syncing inputSearch to URL so typing is uninterrupted
  useEffect(() => {
    if (inputSearch.trim() === urlSearch.trim()) return;

    const timer = setTimeout(() => {
      updateUrlFilters({ search: inputSearch.trim() });
    }, 350);

    return () => clearTimeout(timer);
  }, [inputSearch, urlSearch, updateUrlFilters]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateUrlFilters({ search: inputSearch.trim() });
  };

  const handleClearSearch = () => {
    setInputSearch("");
    updateUrlFilters({ search: "" });
  };

  // Mouse Spotlight Tracking State
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // Categories list
  const categoryOptions = [
    "All",
    "Engineering",
    "Product Management",
    "Design & Creative",
    "Marketing & Growth",
    "Sales & BizDev",
    "Customer Support",
    "Finance & Accounting",
    "Operations & HR",
  ];

  // Filtered jobs computed from live search input or active URL parameters
  const filteredJobs = useMemo(() => {
    const activeSearch = (inputSearch !== undefined ? inputSearch : urlSearch).trim().toLowerCase();

    return initialJobs
      .filter((job) => {
        // Keyword Search matching (instant typing feedback)
        if (activeSearch) {
          const matchesTitle = (job.jobTitle || "").toLowerCase().includes(activeSearch);
          const matchesCompany = (job.companyName || "").toLowerCase().includes(activeSearch);
          const matchesLocation = (job.location || "").toLowerCase().includes(activeSearch);
          const matchesCategory = (job.category || "").toLowerCase().includes(activeSearch);
          const matchesSkills =
            Array.isArray(job.skills) &&
            job.skills.some((s) => (s || "").toLowerCase().includes(activeSearch));
          const matchesDesc = (job.description || "").toLowerCase().includes(activeSearch);

          if (
            !matchesTitle &&
            !matchesCompany &&
            !matchesLocation &&
            !matchesCategory &&
            !matchesSkills &&
            !matchesDesc
          ) {
            return false;
          }
        }

        // Category filter
        if (urlCategory !== "All") {
          const cat = urlCategory.toLowerCase().trim();
          const jobCat = (job.category || "").toLowerCase().trim();
          if (!jobCat.includes(cat) && !cat.includes(jobCat)) {
            return false;
          }
        }

        // Workplace filter
        if (urlWorkplace !== "All") {
          const wp = urlWorkplace.toLowerCase().trim();
          const jobWp = (job.workplaceType || "").toLowerCase().trim();
          const jobLoc = (job.location || "").toLowerCase().trim();

          if (wp === "remote") {
            if (jobWp !== "remote" && !jobLoc.includes("remote")) return false;
          } else if (wp === "hybrid") {
            if (jobWp !== "hybrid") return false;
          } else if (wp === "on-site" || wp === "onsite") {
            if (jobWp !== "on-site" && jobWp !== "onsite") return false;
          } else {
            if (!jobLoc.includes(wp)) return false;
          }
        }

        // Only featured toggle
        if (urlOnlyFeatured && !job.isFeatured) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (urlSort === "featured") {
          if (a.isFeatured && !b.isFeatured) return -1;
          if (!a.isFeatured && b.isFeatured) return 1;
        }
        if (urlSort === "salary-high") {
          const salaryA = Number(a.maxSalary || a.minSalary) || 0;
          const salaryB = Number(b.maxSalary || b.minSalary) || 0;
          return salaryB - salaryA;
        }
        if (urlSort === "newest") {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
        }
        return 0;
      });
  }, [
    initialJobs,
    inputSearch,
    urlSearch,
    urlCategory,
    urlWorkplace,
    urlOnlyFeatured,
    urlSort,
  ]);

  // Metrics
  const totalCount = initialJobs.length;
  const remoteCount = initialJobs.filter(
    (j) =>
      j.workplaceType === "Remote" ||
      (j.location && j.location.toLowerCase().includes("remote"))
  ).length;
  const featuredCount = initialJobs.filter((j) => j.isFeatured).length;

  const handleApply = async (job) => {
    const target = job || selectedJob;
    if (!target) return;

    if (!user) {
      showToast("Please log in to apply for this position.");
      const jobId = target?._id || target?.id;
      const redirectPath = jobId ? `/jobs/${jobId}` : "/jobs";
      setTimeout(() => {
        router.push(`/Login?redirect=${encodeURIComponent(redirectPath)}`);
      }, 1200);
      return;
    }

    const role = (user?.role || "seeker").toLowerCase();
    if (role === "employer") {
      showToast("Employer accounts cannot apply for positions. Please use a job seeker account.");
      return;
    }

    try {

      // Check if user has an active Pro or Premium subscription with unlimited applications
      const isPaidPlan =
        user?.plan === "pro" ||
        user?.plan === "premium" ||
        user?.pro === true ||
        user?.premium === true;

      if (!isPaidPlan) {
        const planStatus = await getUserPlanStatus(user.email).catch(() => null);
        const hasPaidPlan =
          planStatus?.plan === "pro" ||
          planStatus?.plan === "premium" ||
          planStatus?.pro ||
          planStatus?.premium;

        if (!hasPaidPlan) {
          const countResult = await getApplicationsCount(user.email).catch(() => null);
          const appliedCount =
            typeof countResult?.count === "number"
              ? countResult.count
              : appliedJobIds.size;

          if (appliedCount >= 5) {
            
            router.push("/pricing");
            showToast("You have reached the 5-application limit on the Free plan. Please upgrade to Pro for unlimited applications.");
            return;
          }
        }
      }

      const userPlan = (user?.plan || (user?.premium ? "premium" : user?.pro ? "pro" : "normal")).toLowerCase();

      const application = {
        jobId: target._id || target.id,
        userId: user.id || user._id,
        email: user.email,
        plan: userPlan,
        priorityScore: userPlan === "premium" ? 3 : userPlan === "pro" ? 2 : 1,
        verifiedBadge: userPlan === "pro" || userPlan === "premium",
        priorityCandidate: userPlan === "premium",
        jobTitle: target.jobTitle,
        companyName: target.companyName,
        location: target.location || "Remote",
        workplaceType: target.workplaceType || "Remote",
        employmentType: target.employmentType || "Full-time",
        category: target.category || "General",
        skills: Array.isArray(target.skills) ? target.skills : [],
        minSalary: target.minSalary || null,
        maxSalary: target.maxSalary || null,
        currency: target.currency || "USD",
        salaryPeriod: target.salaryPeriod || "Per Year",
        description: target.description || "",
        responsibilities: Array.isArray(target.responsibilities) ? target.responsibilities : [],
        experienceLevel: target.experienceLevel || "",
        applicationDeadline: target.applicationDeadline || "",
        showSalary: target.showSalary !== undefined ? target.showSalary : true,
        equityIncluded: !!target.equityIncluded,
        appliedAt: new Date().toISOString(),
      };

      const res = await applyForJob(application);
      if (res && (res.insertedId || res.acknowledged)) {
        showToast("Application submitted successfully!");
        setAppliedJobIds((prev) => new Set(prev).add(String(target._id || target.id)));
        setSelectedJob(null);
      } else {
        showToast("Could not submit application. Please try again.");
      }
    } catch (error) {
      console.error("Apply error:", error);
      showToast(error.message || "Failed to submit application.");
    }
  };
  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative min-h-screen pb-28 overflow-hidden transition-colors"
    >
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-[100] animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-auto">
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-900/95 dark:bg-zinc-800/95 text-white shadow-2xl border border-slate-700/80 dark:border-zinc-700 backdrop-blur-md">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <span className="text-xs sm:text-sm font-semibold">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. LIGHT MODE DYNAMIC BACKGROUND (Radiant Grid & Sunrise Aura) */}
      {/* ======================================================== */}
      <div className="dark:hidden absolute inset-0 -z-10 pointer-events-none overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#cbd5e1_1.5px,transparent_1.5px),linear-gradient(to_bottom,#cbd5e1_1.5px,transparent_1.5px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_15%,#000_75%,transparent_100%)] opacity-70" />
        <div className="absolute -top-36 left-1/2 -translate-x-1/2 w-[1150px] h-[520px] bg-gradient-to-tr from-blue-400/35 via-sky-300/40 to-indigo-300/35 rounded-full blur-[125px]" />
        <div className="absolute top-1/4 -left-12 w-96 h-96 bg-cyan-300/30 rounded-full blur-[100px]" />
        <div className="absolute top-1/3 -right-12 w-96 h-96 bg-violet-300/30 rounded-full blur-[100px]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4/5 max-w-6xl h-[2px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
        <div className="absolute top-28 right-12 w-[420px] h-[420px] rounded-full border border-blue-400/25 pointer-events-none" />
        <div className="absolute top-44 right-28 w-[280px] h-[280px] rounded-full border border-dashed border-indigo-400/30 pointer-events-none" />
        <div className="absolute top-80 -left-24 w-[480px] h-[480px] rounded-full border border-slate-300/40 pointer-events-none" />
      </div>

      {/* ======================================================== */}
      {/* 2. DARK MODE DYNAMIC BACKGROUND (Cyber Obsidian & Neon Depth) */}
      {/* ======================================================== */}
      <div className="hidden dark:block absolute inset-0 -z-10 pointer-events-none overflow-hidden bg-gradient-to-b from-[#070a12] via-[#090d18] to-[#060910]">
        <div className="absolute inset-0 bg-[size:3.5rem_3.5rem] bg-[linear-gradient(to_right,#1e293b_1.5px,transparent_1.5px),linear-gradient(to_bottom,#1e293b_1.5px,transparent_1.5px)] [mask-image:radial-gradient(ellipse_85%_65%_at_50%_20%,#000_65%,transparent_100%)] opacity-35" />
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[980px] h-[480px] bg-gradient-to-r from-blue-600/20 via-indigo-600/25 to-violet-600/20 rounded-full blur-[140px]" />
        <div className="absolute top-1/4 -left-36 w-[520px] h-[520px] bg-cyan-500/15 rounded-full blur-[130px]" />
        <div className="absolute top-1/2 -right-36 w-[520px] h-[520px] bg-violet-600/15 rounded-full blur-[130px]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
        <div className="absolute top-24 right-16 w-96 h-96 rounded-full border border-blue-500/15 pointer-events-none" />
        <div className="absolute top-40 right-32 w-64 h-64 rounded-full border border-dashed border-indigo-500/20 pointer-events-none" />
      </div>

      {/* ======================================================== */}
      {/* 3. INTERACTIVE MOUSE SPOTLIGHT (Desktop Cursor Aura) */}
      {/* ======================================================== */}
      {isHovered && (
        <div
          className="pointer-events-none fixed inset-0 -z-5 transition-opacity duration-300 hidden md:block"
          style={{
            background: `radial-gradient(750px circle at ${mousePos.x}px ${mousePos.y}px, rgba(59, 130, 246, 0.11), transparent 75%)`,
          }}
        />
      )}

      {/* ======================================================== */}
      {/* 4. MAIN PAGE CONTAINER */}
      {/* ======================================================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14">
        
        {/* Hero Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50/90 dark:bg-blue-950/70 border border-blue-200/80 dark:border-blue-800/70 text-blue-600 dark:text-blue-400 text-xs font-bold tracking-wider uppercase mb-4 shadow-2xs backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span>Discover Top Careers • Vetted & Active</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            Explore Open Positions
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-400 mt-3 leading-relaxed">
            Find verified roles at innovative startups, tech leaders, and remote-first organizations. Apply directly with zero friction.
          </p>

          {/* Active URL Filter Indicator if parameters exist */}
          {(urlSearch || urlCategory !== "All" || urlWorkplace !== "All" || urlOnlyFeatured) && (
            <div className="inline-flex flex-wrap items-center justify-center gap-2 mt-4 px-4 py-2 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/50 text-xs text-blue-700 dark:text-blue-300">
              <span className="font-semibold">Active Filter:</span>
              {urlSearch && <span className="font-bold">&ldquo;{urlSearch}&rdquo;</span>}
              {urlCategory !== "All" && <span className="bg-white dark:bg-zinc-800 px-2 py-0.5 rounded-md font-semibold">{urlCategory}</span>}
              {urlWorkplace !== "All" && <span className="bg-white dark:bg-zinc-800 px-2 py-0.5 rounded-md font-semibold">{urlWorkplace}</span>}
              {urlOnlyFeatured && <span className="bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-md font-bold">Featured Only</span>}
              <button
                type="button"
                onClick={() => {
                  setInputSearch("");
                  router.replace("/jobs", { scroll: false });
                }}
                className="text-blue-600 dark:text-blue-400 hover:underline font-bold ml-1 cursor-pointer"
              >
                Clear
              </button>
            </div>
          )}

          {/* KPI Mini-Pills */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-5 text-xs font-semibold">
            <span className="px-3 py-1 rounded-xl bg-white/80 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 shadow-2xs backdrop-blur-sm">
              🚀 <strong className="text-slate-900 dark:text-white">{totalCount}</strong> Total Roles
            </span>
            <span className="px-3 py-1 rounded-xl bg-white/80 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 shadow-2xs backdrop-blur-sm">
              🌐 <strong className="text-slate-900 dark:text-white">{remoteCount}</strong> Remote Positions
            </span>
            <span className="px-3 py-1 rounded-xl bg-white/80 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 shadow-2xs backdrop-blur-sm">
              ★ <strong className="text-slate-900 dark:text-white">{featuredCount}</strong> Featured Today
            </span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 5. SEARCH & FILTER TOOLBAR CAPSULE */}
        {/* ======================================================== */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-2xl border border-slate-200/90 dark:border-zinc-800 shadow-xl shadow-slate-900/5 mb-8">
          
          {/* Main Search Row Form */}
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-4">
            
            {/* Search Input */}
            <div className="relative md:col-span-5">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" x2="16.65" y1="21" y2="16.65" />
                </svg>
              </div>
              <input
                type="text"
                value={inputSearch}
                onChange={(e) => setInputSearch(e.target.value)}
                placeholder="Job title, company, skills, or city..."
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-800 transition-all"
              />
              {inputSearch && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 text-xs font-bold cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category Dropdown */}
            <div className="md:col-span-3">
              <select
                value={urlCategory}
                onChange={(e) => updateUrlFilters({ category: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-500 cursor-pointer"
              >
                {categoryOptions.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === "All" ? "All Categories" : cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Workplace Dropdown */}
            <div className="md:col-span-2">
              <select
                value={urlWorkplace}
                onChange={(e) => updateUrlFilters({ workplace: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="All">All Locations</option>
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
              </select>
            </div>

            {/* Sort Order */}
            <div className="md:col-span-2">
              <select
                value={urlSort}
                onChange={(e) => updateUrlFilters({ sort: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="featured">Featured First</option>
                <option value="newest">Newest First</option>
                <option value="salary-high">Highest Salary</option>
              </select>
            </div>

          </form>

          {/* Quick Filter Chips Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
            
            {/* Pill chips */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setInputSearch("");
                  router.replace("/jobs", { scroll: false });
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  urlCategory === "All" &&
                  urlWorkplace === "All" &&
                  !urlOnlyFeatured &&
                  !urlSearch
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm"
                    : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700"
                }`}
              >
                All Roles
              </button>

              <button
                type="button"
                onClick={() =>
                  updateUrlFilters({
                    workplace: urlWorkplace === "Remote" ? "All" : "Remote",
                  })
                }
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  urlWorkplace === "Remote"
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-500/25"
                    : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700"
                }`}
              >
                🌐 Remote Only
              </button>

              <button
                type="button"
                onClick={() =>
                  updateUrlFilters({
                    featured: !urlOnlyFeatured,
                  })
                }
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  urlOnlyFeatured
                    ? "bg-amber-500 text-white shadow-sm shadow-amber-500/25"
                    : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700"
                }`}
              >
                ★ Featured Only
              </button>

              {["Engineering", "Design & Creative", "Marketing & Growth"].map(
                (cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() =>
                      updateUrlFilters({
                        category: urlCategory === cat ? "All" : cat,
                      })
                    }
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer hidden sm:inline-block ${
                      urlCategory === cat
                        ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm"
                        : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700"
                    }`}
                  >
                    {cat}
                  </button>
                )
              )}
            </div>

            {/* Results Count & View Toggle */}
            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-zinc-400">
              <span>
                Showing <strong className="text-slate-900 dark:text-white font-bold">{filteredJobs.length}</strong> jobs
              </span>

              {/* View Toggle (Grid vs Compact) */}
              <div className="flex items-center bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  title="Grid View"
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === "grid"
                      ? "bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-2xs"
                      : "text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                  }`}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect width="7" height="7" x="3" y="3" rx="1" />
                    <rect width="7" height="7" x="14" y="3" rx="1" />
                    <rect width="7" height="7" x="14" y="14" rx="1" />
                    <rect width="7" height="7" x="3" y="14" rx="1" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("compact")}
                  title="Compact View"
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === "compact"
                      ? "bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-2xs"
                      : "text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                  }`}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="8" x2="21" y1="6" y2="6" />
                    <line x1="8" x2="21" y1="12" y2="12" />
                    <line x1="8" x2="21" y1="18" y2="18" />
                    <line x1="3" x2="3.01" y1="6" y2="6" />
                    <line x1="3" x2="3.01" y1="12" y2="12" />
                    <line x1="3" x2="3.01" y1="18" y2="18" />
                  </svg>
                </button>
              </div>

            </div>

          </div>

        </div>

        {/* ======================================================== */}
        {/* 6. JOBS CARDS GRID */}
        {/* ======================================================== */}
        {filteredJobs.length === 0 ? (
          /* Empty Search State */
          <div className="py-16 px-6 text-center rounded-3xl bg-white/70 dark:bg-zinc-900/70 border border-slate-200/80 dark:border-zinc-800 backdrop-blur-xl">
            <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-4 border border-blue-200/60 dark:border-blue-800/60">
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" x2="16.65" y1="21" y2="16.65" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              No matching job listings found
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 max-w-md mx-auto mt-1.5 mb-6">
              We couldn&apos;t find any open positions matching your query. Try clearing your filters or searching with another keyword.
            </p>
            <button
              type="button"
              onClick={() => {
                setInputSearch("");
                router.replace("/jobs", { scroll: false });
              }}
              className="px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 dark:hover:bg-zinc-200 transition-colors cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : viewMode === "grid" ? (
          /* 3-Column Card Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job) => (
              <JobCard
                key={job._id || `${job.jobTitle}-${job.companyName}`}
                job={job}
                saved={savedJobIds.has(String(job._id || job.id || job.jobTitle))}
                isApplied={appliedJobIds.has(String(job._id || job.id))}
                onSave={handleToggleSave}
                onViewDetails={(j) => setSelectedJob(j)}
              />
            ))}
          </div>
        ) : (
          /* Compact List View */
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <JobCard
                key={job._id || `${job.jobTitle}-${job.companyName}`}
                job={job}
                saved={savedJobIds.has(String(job._id || job.id || job.jobTitle))}
                isApplied={appliedJobIds.has(String(job._id || job.id))}
                onSave={handleToggleSave}
                onViewDetails={(j) => setSelectedJob(j)}
              />
            ))}
          </div>
        )}

      </div>

      {/* ======================================================== */}
      {/* 7. VIEW JOB DETAILS DIALOG / MODAL */}
      {/* ======================================================== */}
      {selectedJob && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/65 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setSelectedJob(null)}
        >
          <div
            className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xl p-6 sm:p-8 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-6 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white font-black text-xl shadow-md shrink-0">
                  {(selectedJob.companyName || selectedJob.jobTitle || "H")[0].toUpperCase()}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                      {selectedJob.category || "General"}
                    </span>
                    {selectedJob.isFeatured && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                        ★ Featured
                      </span>
                    )}
                    {selectedJob.isUrgent && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                        ⚡ Urgent
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    {selectedJob.jobTitle}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-semibold mt-0.5">
                    {selectedJob.companyName} • {selectedJob.location || "Remote"}
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setSelectedJob(null)}
                className="p-2 rounded-2xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                aria-label="Close dialog"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Quick Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 block">Workplace</span>
                <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-zinc-200 mt-1 block">
                  {selectedJob.workplaceType || "On-site"}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 block">Type</span>
                <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-zinc-200 mt-1 block">
                  {selectedJob.employmentType || "Full-time"}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 block">Experience</span>
                <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-zinc-200 mt-1 block">
                  {selectedJob.experienceLevel || "Mid Level"}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 block">Deadline</span>
                <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-zinc-200 mt-1 block">
                  {selectedJob.applicationDeadline || "Open"}
                </span>
              </div>
            </div>

            {/* Compensation Box */}
            {selectedJob.showSalary && (selectedJob.minSalary || selectedJob.maxSalary) && (
              <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-800/60 flex items-center justify-between mb-6">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                    Target Compensation
                  </span>
                  <div className="text-base sm:text-lg font-black text-emerald-700 dark:text-emerald-400">
                    {selectedJob.currency || "USD"} {Number(selectedJob.minSalary).toLocaleString()} –{" "}
                    {Number(selectedJob.maxSalary).toLocaleString()} {selectedJob.salaryPeriod || "Per Year"}
                  </div>
                </div>
                {selectedJob.equityIncluded && (
                  <span className="px-3 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 text-xs font-bold">
                    + Equity Included
                  </span>
                )}
              </div>
            )}

            {/* Tech Stack & Required Skills */}
            {Array.isArray(selectedJob.skills) && selectedJob.skills.length > 0 && (
              <div className="mb-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-2.5">
                  Tech Stack & Required Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedJob.skills.map((skill) => (
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
            {selectedJob.description && (
              <div className="mb-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-2">
                  Role Overview & Description
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
                  {selectedJob.description}
                </p>
              </div>
            )}

            {/* Responsibilities */}
            {Array.isArray(selectedJob.responsibilities) && selectedJob.responsibilities.length > 0 && (
              <div className="mb-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-2">
                  Key Responsibilities
                </h4>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-zinc-300">
                  {selectedJob.responsibilities.map((r, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Application Routing */}
            {selectedJob.applicationEmail && (
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-700 flex items-center justify-between text-xs mb-6">
                <span className="text-slate-500 dark:text-zinc-400">Applications routed to:</span>
                <span className="font-bold text-slate-800 dark:text-zinc-200">{selectedJob.applicationEmail}</span>
              </div>
            )}

            {/* Modal Footer Actions */}
            <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handleToggleSave(selectedJob)}
                className={`px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  selectedJob && savedJobIds.has(String(selectedJob._id || selectedJob.id || selectedJob.jobTitle))
                    ? "bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/60"
                    : "border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800"
                }`}
              >
                <svg
                  className={`w-4 h-4 text-rose-500 ${
                    selectedJob && savedJobIds.has(String(selectedJob._id || selectedJob.id || selectedJob.jobTitle))
                      ? "fill-rose-500"
                      : "fill-none"
                  }`}
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                </svg>
                <span>
                  {selectedJob && savedJobIds.has(String(selectedJob._id || selectedJob.id || selectedJob.jobTitle))
                    ? "Saved"
                    : "Save Job"}
                </span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedJob(null)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs sm:text-sm font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  Close
                </button>

                {selectedJob && appliedJobIds.has(String(selectedJob._id || selectedJob.id)) ? (
                  <button
                    type="button"
                    disabled
                    className="px-6 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-bold text-xs sm:text-sm cursor-not-allowed flex items-center gap-1.5 shadow-xs"
                  >
                    <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Already Applied</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleApply(selectedJob)}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/25 transition-all cursor-pointer"
                  >
                    Apply for Position
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
