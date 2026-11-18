"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import {
  getEmployerJobs,
  deleteJob as deleteJobApi,
  updateJob as updateJobApi,
} from "@/lib/actions/jobs";
import EditDialog from "@/app/components/edit-dialog";
import DeleteDialog from "@/app/components/delete-dialog";

export default function ManageJobsPage() {
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = useSession();

  // State
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // "all" | "active" | "featured" | "remote"
  const [selectedJob, setSelectedJob] = useState(null); // for detail modal
  const [editJob, setEditJob] = useState(null); // for edit dialog modal
  const [deleteJob, setDeleteJob] = useState(null); // for delete dialog modal
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
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

  // Fetch employer's jobs on click
  const handleRefresh = async () => {
    try {
      setLoading(true);
      setError(null);
      const email = session?.user?.email;
      const data = await getEmployerJobs(email);
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Unable to connect to backend server on port 5000. Please ensure it is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    if (sessionLoading) return;

    getEmployerJobs(session?.user?.email)
      .then((data) => {
        if (!ignore) {
          setJobs(Array.isArray(data) ? data : []);
          setError(null);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.error("Fetch error:", err);
          setError("Unable to connect to backend server on port 5000. Please ensure it is running.");
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [sessionLoading, session?.user?.email]);

  // Filtered & searched jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        (job.jobTitle && job.jobTitle.toLowerCase().includes(term)) ||
        (job.companyName && job.companyName.toLowerCase().includes(term)) ||
        (job.category && job.category.toLowerCase().includes(term)) ||
        (job.location && job.location.toLowerCase().includes(term)) ||
        (Array.isArray(job.skills) &&
          job.skills.some((s) => s.toLowerCase().includes(term)));

      if (!matchesSearch) return false;

      if (statusFilter === "featured") return job.isFeatured;
      if (statusFilter === "remote")
        return (
          job.workplaceType === "Remote" ||
          (job.location && job.location.toLowerCase().includes("remote"))
        );
      if (statusFilter === "active")
        return job.status === "active" || !job.status;

      return true;
    });
  }, [jobs, searchTerm, statusFilter]);

  // Metrics KPI calculations
  const totalCount = jobs.length;
  const featuredCount = jobs.filter((j) => j.isFeatured).length;
  const urgentCount = jobs.filter((j) => j.isUrgent).length;
  const remoteCount = jobs.filter(
    (j) =>
      j.workplaceType === "Remote" ||
      (j.location && j.location.toLowerCase().includes("remote"))
  ).length;

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative min-h-screen pb-24 overflow-hidden transition-colors"
    >
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-900 dark:bg-zinc-800 text-white shadow-2xl border border-slate-700/80 dark:border-zinc-700">
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
      {/* 1. LIGHT MODE BACKGROUND (Radiant Sunrise & Tech Architecture) */}
      {/* ======================================================== */}
      <div className="dark:hidden absolute inset-0 -z-10 pointer-events-none overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_70%_50%_at_50%_15%,#000_70%,transparent_100%)] opacity-60" />
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[950px] h-[480px] bg-gradient-to-tr from-blue-300/35 via-sky-200/40 to-indigo-200/35 rounded-full blur-[110px]" />
        <div className="absolute top-1/4 left-5 w-80 h-80 bg-sky-200/30 rounded-full blur-[90px]" />
        <div className="absolute top-1/3 right-5 w-80 h-80 bg-violet-200/30 rounded-full blur-[90px]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-5xl h-[2px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
        <div className="absolute top-20 right-10 w-96 h-96 rounded-full border border-blue-200/40 pointer-events-none" />
        <div className="absolute top-36 right-24 w-64 h-64 rounded-full border border-dashed border-indigo-200/40 pointer-events-none" />
      </div>

      {/* ======================================================== */}
      {/* 2. DARK MODE BACKGROUND (Cyber Minimalist Neon Depth) */}
      {/* ======================================================== */}
      <div className="hidden dark:block absolute inset-0 -z-10 pointer-events-none overflow-hidden bg-gradient-to-b from-[#090d16] via-[#0b0f19] to-[#080c14]">
        <div className="absolute inset-0 bg-[size:3rem_3rem] bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_20%,#000_60%,transparent_100%)] opacity-20" />
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-r from-blue-600/15 via-indigo-600/15 to-violet-600/15 rounded-full blur-[130px]" />
        <div className="absolute top-1/3 -left-32 w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
      </div>

      {/* ======================================================== */}
      {/* 3. INTERACTIVE MOUSE SPOTLIGHT (Desktop Cursor Aura) */}
      {/* ======================================================== */}
      {isHovered && (
        <div
          className="pointer-events-none fixed inset-0 -z-5 transition-opacity duration-300 hidden md:block"
          style={{
            background: `radial-gradient(650px circle at ${mousePos.x}px ${mousePos.y}px, rgba(59, 130, 246, 0.08), transparent 80%)`,
          }}
        />
      )}

      {/* ======================================================== */}
      {/* 4. MAIN PAGE CONTENT CONTAINER */}
      {/* ======================================================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/70 dark:border-blue-800/60 text-blue-600 dark:text-blue-400 text-xs font-bold tracking-wide uppercase mb-3">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              Employer Job Workspace
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Manage Job Postings
            </h1>
            <p className="text-sm sm:text-base text-slate-500 dark:text-zinc-400 mt-1 max-w-2xl">
              Track, inspect, and manage your live job listings, applicants, and posting statuses.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={loading}
              className="p-3 rounded-2xl bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-700/60 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
              title="Refresh job listings"
            >
              <svg
                className={`w-5 h-5 ${loading ? "animate-spin text-blue-500" : ""}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                <path d="M3 21v-5h5" />
              </svg>
            </button>

            <Link
              href="/dashboard/employer/create-job"
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/35 transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Post New Job</span>
            </Link>
          </div>
        </div>

        {/* ======================================================== */}
        {/* KPI METRICS OVERVIEW CARDS */}
        {/* ======================================================== */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
          
          <div className="p-5 rounded-3xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-zinc-800 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Total Posted</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {loading ? "..." : totalCount}
            </p>
            <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1">
              Active on HireMe platform
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-zinc-800 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Featured Openings</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {loading ? "..." : featuredCount}
            </p>
            <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1">
              Top promoted search ranking
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-zinc-800 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Urgent Hires</span>
              <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {loading ? "..." : urgentCount}
            </p>
            <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1">
              Flagged for immediate review
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-zinc-800 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Remote Roles</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                  <path d="M2 12h20" />
                </svg>
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {loading ? "..." : remoteCount}
            </p>
            <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1">
              Global candidate availability
            </p>
          </div>

        </div>

        {/* Error Warning Banner if backend server unreachable */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-800 dark:text-amber-300 text-xs sm:text-sm">
            <div className="flex items-center gap-2.5">
              <svg className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                <line x1="12" x2="12" y1="9" y2="13" />
                <line x1="12" x2="12.01" y1="17" y2="17" />
              </svg>
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={handleRefresh}
              className="px-3.5 py-1.5 rounded-xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-500 transition-colors shrink-0"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* ======================================================== */}
        {/* FILTER & SEARCH TOOLBAR */}
        {/* ======================================================== */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-zinc-800 shadow-sm mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" x2="16.65" y1="21" y2="16.65" />
              </svg>
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by job title, category, skill or city..."
              className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-800 transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "all", label: `All (${jobs.length})` },
              { id: "active", label: "Active" },
              { id: "featured", label: "Featured" },
              { id: "remote", label: "Remote Only" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === tab.id
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md shadow-slate-900/10"
                    : "bg-slate-100 dark:bg-zinc-800/80 text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

        </div>

        {/* ======================================================== */}
        {/* TABLE CONTAINER / JOBS LISTING */}
        {/* ======================================================== */}
        <div className="rounded-3xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-2xl border border-slate-200/90 dark:border-zinc-800 shadow-xl shadow-slate-900/5 overflow-hidden">
          
          {loading ? (
            /* Loading Skeleton */
            <div className="p-8 space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse flex items-center justify-between p-4 rounded-2xl bg-slate-100/70 dark:bg-zinc-800/50">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-zinc-700" />
                    <div className="space-y-2">
                      <div className="w-48 h-4 rounded-md bg-slate-200 dark:bg-zinc-700" />
                      <div className="w-32 h-3 rounded-md bg-slate-200 dark:bg-zinc-700" />
                    </div>
                  </div>
                  <div className="w-24 h-6 rounded-md bg-slate-200 dark:bg-zinc-700 hidden sm:block" />
                  <div className="w-28 h-8 rounded-xl bg-slate-200 dark:bg-zinc-700" />
                </div>
              ))}
            </div>
          ) : filteredJobs.length === 0 ? (
            /* Empty State */
            <div className="py-16 px-6 text-center">
              <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-4 border border-blue-200/60 dark:border-blue-800/60 shadow-inner">
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" x2="8" y1="13" y2="13" />
                  <line x1="16" x2="8" y1="17" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {searchTerm || statusFilter !== "all"
                  ? "No matching jobs found"
                  : "No job postings yet"}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 max-w-sm mx-auto mt-1 mb-6">
                {searchTerm || statusFilter !== "all"
                  ? "Try resetting your search filters or searching with a different keyword."
                  : "Get started by creating and publishing your first company job listing to attract candidates."}
              </p>
              {searchTerm || statusFilter !== "all" ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                  }}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800 text-xs font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors"
                >
                  Reset Filters
                </button>
              ) : (
                <Link
                  href="/dashboard/employer/create-job"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/25 hover:shadow-lg transition-all"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  <span>Create Your First Job</span>
                </Link>
              )}
            </div>
          ) : (
            /* Table Representation */
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/80 dark:border-zinc-800 bg-slate-50/75 dark:bg-zinc-800/40 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                    <th scope="col" className="py-4 px-6">Job Role & Category</th>
                    <th scope="col" className="py-4 px-6">Workplace / Location</th>
                    <th scope="col" className="py-4 px-6">Compensation</th>
                    <th scope="col" className="py-4 px-6">Status & Badges</th>
                    <th scope="col" className="py-4 px-6">Date Posted</th>
                    <th scope="col" className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/70 text-sm">
                  {filteredJobs.map((job) => {
                    const initials = (job.companyName || job.jobTitle || "H")[0].toUpperCase();
                    const formattedDate = job.createdAt
                      ? new Date(job.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "Recent";

                    return (
                      <tr
                        key={job._id || `${job.jobTitle}-${job.createdAt}`}
                        className="hover:bg-blue-50/30 dark:hover:bg-zinc-800/40 transition-colors group"
                      >
                        {/* Job Role & Category */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3.5">
                            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white font-black text-base shadow-sm shrink-0">
                              {initials}
                            </div>
                            <div>
                              <button
                                type="button"
                                onClick={() => setSelectedJob(job)}
                                className="font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left text-sm sm:text-base leading-snug cursor-pointer block"
                              >
                                {job.jobTitle || "Untitled Position"}
                              </button>
                              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                                <span>{job.companyName || "Company"}</span>
                                <span>•</span>
                                <span className="font-medium text-slate-600 dark:text-zinc-300">
                                  {job.category || "General"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Workplace / Location */}
                        <td className="py-4 px-6">
                          <div className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                            {job.location || "Remote"}
                          </div>
                          <span className="inline-block mt-1 text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                            {job.workplaceType || "On-site"} • {job.employmentType || "Full-time"}
                          </span>
                        </td>

                        {/* Compensation */}
                        <td className="py-4 px-6">
                          {job.showSalary && (job.minSalary || job.maxSalary) ? (
                            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                              {job.currency || "USD"}{" "}
                              {Number(job.minSalary).toLocaleString()} –{" "}
                              {Number(job.maxSalary).toLocaleString()}
                              <span className="block text-[10px] font-normal text-slate-400 dark:text-zinc-500">
                                {job.salaryPeriod || "Per Year"}
                                {job.equityIncluded ? " + Equity" : ""}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 dark:text-zinc-500">
                              Competitive / Undisclosed
                            </span>
                          )}
                        </td>

                        {/* Status & Badges */}
                        <td className="py-4 px-6">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Active
                            </span>

                            {job.isFeatured && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                                ★ Featured
                              </span>
                            )}

                            {job.isUrgent && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                                ⚡ Urgent
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Date Posted */}
                        <td className="py-4 px-6 text-xs text-slate-500 dark:text-zinc-400">
                          {formattedDate}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            
                            {/* View Modal Trigger */}
                            <button
                              type="button"
                              onClick={() => setSelectedJob(job)}
                              className="p-2 rounded-xl text-slate-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors cursor-pointer"
                              title="View Job Details"
                            >
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                            </button>

                            {/* Edit Button */}
                            <button
                              type="button"
                              onClick={() => setEditJob(job)}
                              className="p-2 rounded-xl text-slate-500 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/50 transition-colors cursor-pointer"
                              title="Edit Job Listing"
                            >
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 20h9" />
                                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                              </svg>
                            </button>

                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() => setDeleteJob(job)}
                              className="p-2 rounded-xl text-slate-500 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                              title="Delete Job Listing"
                            >
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                <line x1="10" y1="11" x2="10" y2="17" />
                                <line x1="14" y1="11" x2="14" y2="17" />
                              </svg>
                            </button>

                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

        </div>

      </div>

      {/* ======================================================== */}
      {/* 5. VIEW JOB DETAILS DIALOG / MODAL */}
      {/* ======================================================== */}
      {selectedJob && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200"
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

            {/* Modal Footer */}
            <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedJob(null)}
                className="px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs sm:text-sm font-bold hover:bg-slate-800 dark:hover:bg-zinc-200 transition-colors cursor-pointer"
              >
                Close Details
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. EDIT JOB MODAL DIALOG */}
      {/* ======================================================== */}
      <EditDialog
        key={editJob?._id || editJob?.createdAt || "edit-dialog"}
        isOpen={!!editJob}
        job={editJob}
        isSaving={isSaving}
        onClose={() => setEditJob(null)}
        onSave={async (updatedData) => {
          const targetId =
            updatedData?._id || updatedData?.id || editJob?._id || editJob?.id;
          if (!targetId) {
            showToast("Error: Job _id not found.");
            return;
          }
          try {
            setIsSaving(true);
            await updateJobApi(targetId, updatedData);
            // Optimistically update local jobs list
            setJobs((prev) =>
              prev.map((j) =>
                (j._id || j.id) === targetId ? { ...j, ...updatedData } : j
              )
            );
            showToast(`"${updatedData.jobTitle || "Job"}" updated successfully.`);
            setEditJob(null);
            router.refresh();
          } catch (err) {
            console.error("Update error:", err);
            showToast(err.message || "Failed to update job on server.");
          } finally {
            setIsSaving(false);
          }
        }}
      />

      {/* ======================================================== */}
      {/* 7. DELETE CONFIRMATION MODAL DIALOG */}
      {/* ======================================================== */}
      <DeleteDialog
        isOpen={!!deleteJob}
        job={deleteJob}
        isDeleting={isDeleting}
        onClose={() => setDeleteJob(null)}
        onConfirm={async (target) => {
          const targetId =
            typeof target === "string"
              ? target
              : target?._id || target?.id || deleteJob?._id || deleteJob?.id;
          const jobTitle =
            (typeof target === "object" && target ? target?.jobTitle : null) ||
            deleteJob?.jobTitle ||
            "Job";

          if (!targetId) {
            showToast("Error: Job _id not found.");
            return;
          }

          try {
            setIsDeleting(true);
            await deleteJobApi(targetId);
            // Optimistically remove from state using _id
            setJobs((prev) => prev.filter((j) => (j._id || j.id) !== targetId));
            showToast(`"${jobTitle}" was deleted successfully.`);
            setDeleteJob(null);
            router.refresh();
          } catch (err) {
            console.error("Delete error:", err);
            showToast(err.message || "Failed to delete job from server.");
          } finally {
            setIsDeleting(false);
          }
        }}
      />

    </div>
  );
}
