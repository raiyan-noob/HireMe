"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { getSavedJobs, unsaveJob } from "@/lib/actions/saved";

export default function SeekerSavedJobsPage() {
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = useSession();
  const user = session?.user;

  const [savedJobs, setSavedJobs] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const loading = sessionLoading || (!!user?.email && isFetching);
  const [searchQuery, setSearchQuery] = useState("");
  const [removingId, setRemovingId] = useState(null);
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

  // Fetch saved jobs
  useEffect(() => {
    if (!user?.email) return;

    let isMounted = true;

    getSavedJobs(user.email)
      .then((data) => {
        if (isMounted) {
          setSavedJobs(Array.isArray(data) ? data : []);
          setIsFetching(false);
        }
      })
      .catch((err) => {
        console.error("Error fetching saved jobs:", err);
        if (isMounted) setIsFetching(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user?.email]);

  // Remove saved job
  const handleRemove = async (savedItem) => {
    const id = savedItem._id || savedItem.id || savedItem.jobId;
    setRemovingId(id);
    try {
      await unsaveJob(id, user?.email);
      setSavedJobs((prev) =>
        prev.filter((j) => (j._id || j.id || j.jobId) !== id)
      );
      showToast(`Removed "${savedItem.jobTitle}" from saved jobs.`);
    } catch (err) {
      console.error("Failed to remove saved job:", err);
      showToast(err.message || "Failed to remove saved job.");
    } finally {
      setRemovingId(null);
    }
  };

  // Filter saved jobs by search query
  const filteredJobs = useMemo(() => {
    if (!searchQuery.trim()) return savedJobs;
    const term = searchQuery.toLowerCase().trim();
    return savedJobs.filter(
      (j) =>
        (j.jobTitle || "").toLowerCase().includes(term) ||
        (j.companyName || "").toLowerCase().includes(term) ||
        (j.category || "").toLowerCase().includes(term) ||
        (Array.isArray(j.skills) &&
          j.skills.some((s) => (s || "").toLowerCase().includes(term)))
    );
  }, [savedJobs, searchQuery]);

  // Metrics
  const remoteCount = savedJobs.filter(
    (j) =>
      (j.workplaceType || "").toLowerCase() === "remote" ||
      (j.location || "").toLowerCase().includes("remote")
  ).length;

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative min-h-[calc(100vh-4rem)] pb-20 overflow-hidden transition-colors"
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-[100] animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-auto">
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-900/95 dark:bg-zinc-800/95 text-white shadow-2xl border border-slate-700/80 dark:border-zinc-700 backdrop-blur-md">
            <div className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
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
        <div className="absolute -top-36 left-1/2 -translate-x-1/2 w-[1100px] h-[500px] bg-gradient-to-tr from-rose-400/25 via-indigo-300/35 to-violet-300/30 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 -right-12 w-80 h-80 bg-pink-300/20 rounded-full blur-[100px]" />
      </div>

      {/* Dynamic Background: Dark */}
      <div className="hidden dark:block absolute inset-0 -z-10 pointer-events-none overflow-hidden bg-gradient-to-b from-[#070a12] via-[#090d18] to-[#060910]">
        <div className="absolute inset-0 bg-[size:3.5rem_3.5rem] bg-[linear-gradient(to_right,#1e293b_1.5px,transparent_1.5px),linear-gradient(to_bottom,#1e293b_1.5px,transparent_1.5px)] [mask-image:radial-gradient(ellipse_85%_65%_at_50%_20%,#000_65%,transparent_100%)] opacity-35" />
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[980px] h-[480px] bg-gradient-to-r from-rose-600/15 via-indigo-600/25 to-violet-600/20 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 bg-purple-500/15 rounded-full blur-[130px]" />
      </div>

      {/* Interactive Mouse Spotlight on Desktop */}
      {isHovered && (
        <div
          className="pointer-events-none fixed inset-0 -z-5 transition-opacity duration-300 hidden md:block"
          style={{
            background: `radial-gradient(700px circle at ${mousePos.x}px ${mousePos.y}px, rgba(244, 63, 94, 0.08), transparent 75%)`,
          }}
        />
      )}

      {/* Header Container */}
      <div className="max-w-6xl mx-auto">
        {/* Title & Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50/90 dark:bg-rose-950/70 border border-rose-200/80 dark:border-rose-800/70 text-rose-600 dark:text-rose-400 text-xs font-bold uppercase tracking-wider mb-2 backdrop-blur-md">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
              </svg>
              <span>Saved Roles • Bookmarked</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              My Saved Jobs
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 mt-1">
              Keep track of positions you&apos;re interested in, compare compensation, and apply anytime.
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

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="p-5 rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-zinc-800 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
              Total Bookmarked
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              {savedJobs.length}
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
              Roles saved for later
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-zinc-800 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Remote Positions
            </span>
            <div className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 mt-1">
              {remoteCount}
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
              Work from anywhere
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-zinc-800 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Account Email
            </span>
            <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-1 truncate">
              {user?.email || "Guest"}
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
              Saved to your profile
            </p>
          </div>
        </div>

        {/* Search Bar if items exist */}
        {savedJobs.length > 0 && (
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
                placeholder="Search saved jobs by title, company, or skills..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/90 dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-rose-500 transition-all shadow-2xs"
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="p-6 rounded-3xl bg-white/80 dark:bg-zinc-900/80 border border-slate-200/80 dark:border-zinc-800 animate-pulse space-y-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-zinc-800 shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="w-3/4 h-4 rounded-md bg-slate-200 dark:bg-zinc-800" />
                    <div className="w-1/2 h-3 rounded-md bg-slate-200 dark:bg-zinc-800" />
                  </div>
                </div>
                <div className="w-full h-8 rounded-xl bg-slate-200 dark:bg-zinc-800" />
              </div>
            ))}
          </div>
        ) : savedJobs.length === 0 ? (
          /* Empty State */
          <div className="py-16 px-6 text-center rounded-3xl bg-white/80 dark:bg-zinc-900/80 border border-slate-200/80 dark:border-zinc-800 backdrop-blur-xl shadow-sm">
            <div className="w-16 h-16 rounded-3xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-200/70 dark:border-rose-800/70">
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              No saved jobs yet
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 max-w-md mx-auto mt-1.5 mb-6">
              When exploring open roles, click the bookmark icon on any card to save positions here and easily review them anytime.
            </p>
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-rose-500/25 transition-all"
            >
              <span>Explore Open Jobs</span>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          </div>
        ) : filteredJobs.length === 0 ? (
          /* Search Empty State */
          <div className="py-12 text-center rounded-3xl bg-white/70 dark:bg-zinc-900/70 border border-slate-200 dark:border-zinc-800">
            <p className="text-sm font-semibold text-slate-600 dark:text-zinc-400">
              No saved jobs match &ldquo;{searchQuery}&rdquo;
            </p>
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="mt-3 text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
            >
              Clear search
            </button>
          </div>
        ) : (
          /* Saved Job Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredJobs.map((item) => {
              const itemId = item._id || item.id || item.jobId;
              const companyInitial = (item.companyName || item.jobTitle || "H")[0].toUpperCase();
              const savedDate = item.savedAt
                ? new Date(item.savedAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "Recently";

              const hasSalary = item.minSalary || item.maxSalary;

              return (
                <div
                  key={itemId}
                  className="group relative p-6 rounded-3xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-zinc-800 hover:border-rose-400/50 dark:hover:border-rose-500/40 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Top Header: Monogram, Badges & Remove button */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-600 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-sm shadow-rose-500/20 shrink-0 group-hover:scale-105 transition-transform">
                          {companyInitial}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-500 dark:text-zinc-400 truncate">
                            {item.companyName || "Top Employer"}
                          </h4>
                          <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                            {item.jobTitle}
                          </h3>
                        </div>
                      </div>

                      {/* Remove from Saved Bookmark Button */}
                      <button
                        type="button"
                        disabled={removingId === itemId}
                        onClick={() => handleRemove(item)}
                        title="Remove from saved jobs"
                        className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200/60 dark:border-rose-900/40 transition-colors cursor-pointer shrink-0"
                      >
                        {removingId === itemId ? (
                          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="12" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 fill-rose-500" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                          </svg>
                        )}
                      </button>
                    </div>

                    {/* Metadata Badges */}
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      {item.category && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                          {item.category}
                        </span>
                      )}
                      {item.workplaceType && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                          {item.workplaceType}
                        </span>
                      )}
                      {item.employmentType && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                          {item.employmentType}
                        </span>
                      )}
                      {item.location && (
                        <span className="text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                          <span className="truncate">{item.location}</span>
                        </span>
                      )}
                    </div>

                    {/* Skills Chips */}
                    {Array.isArray(item.skills) && item.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {item.skills.slice(0, 4).map((skill) => (
                          <span
                            key={skill}
                            className="px-2 py-0.5 rounded-lg bg-slate-50 dark:bg-zinc-800/80 text-slate-600 dark:text-zinc-300 text-[10px] font-semibold border border-slate-200/80 dark:border-zinc-700"
                          >
                            {skill}
                          </span>
                        ))}
                        {item.skills.length > 4 && (
                          <span className="text-[10px] text-slate-400 self-center">
                            +{item.skills.length - 4} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Bottom Footer: Compensation & View CTA */}
                  <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-3 mt-2">
                    <div>
                      {hasSalary ? (
                        <div>
                          <span className="text-xs font-black text-slate-900 dark:text-white">
                            {item.currency || "$"}
                            {Number(item.minSalary).toLocaleString()}
                            {item.maxSalary ? ` - ${Number(item.maxSalary).toLocaleString()}` : ""}
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-zinc-500 block">
                            {item.salaryPeriod || "Per Year"}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs font-medium text-slate-400">
                          Saved on {savedDate}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          router.push(`/jobs?search=${encodeURIComponent(item.jobTitle || "")}`)
                        }
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-sm shadow-blue-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>Apply / View</span>
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M5 12h14" />
                          <path d="m12 5 7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
