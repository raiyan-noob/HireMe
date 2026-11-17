"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

const rolesToCycle = [
  "Tech & Software",
  "AI & Data Science",
  "Product Design",
  "Remote Careers",
  "DevOps & Cloud",
];

const trendingTags = [
  "⚡ Remote Worldwide",
  "🤖 AI Engineer",
  "💻 React & Next.js",
  "🎨 Senior UI/UX",
  "💰 $140k+",
  "🚀 Fast Hiring",
];

const sampleCompanies = [
  { name: "Google", icon: "G" },
  { name: "Stripe", icon: "S" },
  { name: "Vercel", icon: "▲" },
  { name: "Spotify", icon: "♫" },
  { name: "Airbnb", icon: "A" },
  { name: "Slack", icon: "#" },
];

const Hero = () => {
  const [roleIndex, setRoleIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [activeTab, setActiveTab] = useState("candidate"); // candidate | employer
  const [hasApplied, setHasApplied] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Smooth rotating text animation
  useEffect(() => {
    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setRoleIndex((prev) => (prev + 1) % rolesToCycle.length);
        setIsFading(false);
      }, 300);
    }, 3200);

    return () => clearInterval(interval);
  }, []);

  const handleTagClick = (tag) => {
    // Strip emojis for cleaner query input
    const cleanTag = tag.replace(/^[^\w\s$]+/, "").trim();
    setSearchQuery(cleanTag);
  };

  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24">
      {/* Background ambient lighting gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[650px] pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-100px] left-1/4 w-[500px] h-[500px] bg-gradient-to-tr from-blue-600/20 via-indigo-500/15 to-violet-500/10 rounded-full blur-[120px] dark:from-blue-600/25 dark:via-indigo-500/20 dark:to-purple-600/15" />
        <div className="absolute top-[100px] right-1/4 w-[450px] h-[450px] bg-gradient-to-bl from-violet-600/15 via-blue-400/15 to-cyan-400/10 rounded-full blur-[110px] dark:from-violet-500/20 dark:via-indigo-600/15 dark:to-cyan-500/10" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-zinc-200 dark:via-zinc-800 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main 2-Column Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Headline, Description & Dynamic Search */}
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left">
            
            {/* Top Interactive Pill / Announcement */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold mb-6 border border-blue-500/25 bg-blue-50/70 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 backdrop-blur-md shadow-xs transition-all hover:scale-[1.02] cursor-default">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600 dark:bg-blue-400"></span>
              </span>
              <span className="font-medium text-zinc-600 dark:text-zinc-300">
                Over 12,800+ verified tech jobs
              </span>
              <span className="font-bold text-blue-600 dark:text-blue-400 pl-1">
                Explore Now →
              </span>
            </div>

            {/* Dynamic Headline with cycling specialty */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight text-zinc-950 dark:text-white leading-[1.12]">
              Land Your Next Career in{" "}
              <span className="relative inline-block mt-1 sm:mt-0">
                <span
                  className={`bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 dark:from-blue-400 dark:via-indigo-400 dark:to-violet-400 bg-clip-text text-transparent transition-all duration-300 inline-block transform ${
                    isFading
                      ? "opacity-0 -translate-y-2 scale-95"
                      : "opacity-100 translate-y-0 scale-100"
                  }`}
                >
                  {rolesToCycle[roleIndex]}
                </span>
                {/* Decorative underline curve */}
                <svg
                  className="absolute -bottom-2 left-0 w-full h-3 text-blue-500/40 dark:text-blue-400/30 overflow-visible"
                  viewBox="0 0 200 9"
                  fill="none"
                >
                  <path
                    d="M2 7C55 2 145 2 198 7"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            {/* Sub-headline */}
            <p className="mt-6 text-base sm:text-lg lg:text-xl text-zinc-600 dark:text-zinc-300 max-w-2xl leading-relaxed">
              Connect directly with verified hiring founders and tech leaders.
              No ghosting, transparent salaries, and personalized AI job matches tailored to your superpowers.
            </p>

            {/* Switchable Role Context Tabs (For Job Seekers vs For Employers) */}
            <div className="mt-8 flex items-center p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-inner">
              <button
                onClick={() => setActiveTab("candidate")}
                type="button"
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === "candidate"
                    ? "bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
                }`}
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="7" r="4" />
                  <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
                </svg>
                <span>Find a Job</span>
              </button>

              <button
                onClick={() => setActiveTab("employer")}
                type="button"
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === "employer"
                    ? "bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
                }`}
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="2" y="7" width="20" height="14" rx="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
                <span>Post a Job (Hire)</span>
              </button>
            </div>

            {/* Dynamic Search Box for Candidates */}
            {activeTab === "candidate" ? (
              <div className="mt-4 w-full max-w-2xl">
                <form
                  onSubmit={(e) => e.preventDefault()}
                  className="p-2 sm:p-2.5 rounded-2xl sm:rounded-3xl bg-white/90 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800/80 shadow-2xl shadow-blue-500/10 dark:shadow-black/50 backdrop-blur-xl flex flex-col md:flex-row items-stretch gap-2 transition-all focus-within:border-blue-500/60 dark:focus-within:border-blue-500/50"
                >
                  {/* Keyword / Role input */}
                  <div className="relative flex-1 flex items-center px-3 py-2.5">
                    <svg
                      className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2.5 shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.3-4.3" />
                    </svg>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Title, skill, or company (e.g. React)..."
                      className="w-full bg-transparent text-sm sm:text-base outline-none text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 font-medium"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xs px-1"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Location / Remote input */}
                  <div className="relative flex-1 flex items-center px-3 py-2.5 border-t md:border-t-0 md:border-l border-zinc-200 dark:border-zinc-800">
                    <svg
                      className="w-5 h-5 text-indigo-500 dark:text-indigo-400 mr-2.5 shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <input
                      type="text"
                      value={locationQuery}
                      onChange={(e) => setLocationQuery(e.target.value)}
                      placeholder="Location or 'Remote'..."
                      className="w-full bg-transparent text-sm sm:text-base outline-none text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 font-medium"
                    />
                  </div>

                  {/* Search Button */}
                  <button
                    type="submit"
                    className="w-full md:w-auto px-7 py-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:via-indigo-500 hover:to-violet-500 text-white font-bold text-sm sm:text-base shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                  >
                    <span>Search Jobs</span>
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </button>
                </form>

                {/* Trending Search Pills */}
                <div className="mt-3.5 flex flex-wrap items-center justify-center lg:justify-start gap-1.5 text-xs">
                  <span className="font-semibold text-zinc-500 dark:text-zinc-400 mr-1 flex items-center gap-1">
                    <span className="text-amber-500">🔥</span> Popular:
                  </span>
                  {trendingTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTagClick(tag)}
                      className="px-2.5 py-1 rounded-lg bg-zinc-100/90 dark:bg-zinc-800/80 hover:bg-blue-50 dark:hover:bg-blue-900/40 hover:text-blue-600 dark:hover:text-blue-300 text-zinc-700 dark:text-zinc-300 border border-zinc-200/70 dark:border-zinc-700/60 transition-all active:scale-95 cursor-pointer font-medium"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Employer Quick CTA Card */
              <div className="mt-4 w-full max-w-2xl p-6 rounded-3xl bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-violet-600/10 border border-blue-500/20 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-left">
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                    Looking to hire elite talent?
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 mt-1">
                    Post a role in under 3 minutes and reach 150,000+ vetted engineers & designers.
                  </p>
                </div>
                <Link
                  href="/pricing"
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-md shadow-blue-500/25 shrink-0 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Post a Job Now →
                </Link>
              </div>
            )}

            {/* Quick Metrics & Highlights */}
            <div className="mt-10 grid grid-cols-3 gap-4 sm:gap-8 border-t border-zinc-200/80 dark:border-zinc-800/80 pt-6 w-full max-w-xl">
              <div>
                <div className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
                  15k+
                </div>
                <div className="text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Live Roles
                </div>
              </div>

              <div>
                <div className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
                  1,800+
                </div>
                <div className="text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Tech Companies
                </div>
              </div>

              <div>
                <div className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
                  96%
                </div>
                <div className="text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Fast Match Rate
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Live Interactive Glassmorphic Job Card & Floating Widgets */}
          <div className="lg:col-span-5 relative flex justify-center items-center">
            
            {/* Background Glow Ring */}
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 via-indigo-500/20 to-violet-500/20 rounded-3xl blur-2xl transform rotate-3 scale-95 -z-10" />

            {/* Main Interactive Showcase Card */}
            <div className="w-full max-w-md rounded-3xl bg-white/95 dark:bg-zinc-900/95 border border-zinc-200 dark:border-zinc-800 shadow-2xl shadow-blue-500/10 dark:shadow-black/70 p-6 backdrop-blur-2xl transition-all hover:shadow-blue-500/20">
              
              {/* Card Header: Company & Action */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 via-blue-600 to-violet-600 flex items-center justify-center text-white text-lg font-black shadow-md shadow-indigo-500/30">
                    S
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-zinc-900 dark:text-white text-base">
                        Stripe
                      </h4>
                      <span className="w-4 h-4 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center text-[10px] font-bold">
                        ✓
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                      <span>Fintech & Payments</span>
                      <span>•</span>
                      <span>San Francisco / Remote</span>
                    </p>
                  </div>
                </div>

                {/* Bookmark Toggle Button */}
                <button
                  type="button"
                  onClick={() => setIsBookmarked(!isBookmarked)}
                  aria-label="Save job"
                  className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                    isBookmarked
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-500"
                      : "bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                  }`}
                >
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill={isBookmarked ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                  </svg>
                </button>
              </div>

              {/* Job Title & Compensation */}
              <div className="mt-4">
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                  Senior Full-Stack Engineer
                </h3>
                <div className="mt-2 flex items-center gap-2 flex-wrap">
                  <span className="text-base font-extrabold text-blue-600 dark:text-blue-400">
                    $160k – $210k
                  </span>
                  <span className="text-xs text-zinc-400">• Equity (0.15%)</span>
                  <span className="ml-auto px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Actively Hiring
                  </span>
                </div>
              </div>

              {/* Tech Stack Pills */}
              <div className="mt-4 flex flex-wrap gap-1.5">
                {["Next.js", "TypeScript", "Node.js", "GraphQL", "Tailwind"].map(
                  (tech) => (
                    <span
                      key={tech}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700/60"
                    >
                      {tech}
                    </span>
                  )
                )}
              </div>

              {/* Match Score Meter */}
              <div className="mt-5 p-3 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-violet-500/10 border border-blue-500/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                    ⚡
                  </div>
                  <div>
                    <div className="text-xs font-bold text-zinc-900 dark:text-white">
                      Profile Compatibility
                    </div>
                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Matches 5 of your primary skills
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-blue-600 dark:text-blue-400">
                    98% Match
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setHasApplied(!hasApplied)}
                  className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                    hasApplied
                      ? "bg-emerald-600 text-white shadow-emerald-500/25"
                      : "bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:via-indigo-500 hover:to-violet-500 text-white shadow-blue-500/25 hover:scale-[1.01]"
                  }`}
                >
                  {hasApplied ? (
                    <>
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>Applied Successfully!</span>
                    </>
                  ) : (
                    <>
                      <span>Quick Apply (1-Click)</span>
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path d="M5 12h14" />
                        <path d="m12 5 7 7-7 7" />
                      </svg>
                    </>
                  )}
                </button>
              </div>

              {/* Candidate applicant avatars */}
              <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2 overflow-hidden">
                    <span className="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-zinc-900 bg-blue-500 text-white text-[10px] font-bold flex items-center justify-center">
                      JD
                    </span>
                    <span className="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-zinc-900 bg-indigo-500 text-white text-[10px] font-bold flex items-center justify-center">
                      AL
                    </span>
                    <span className="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-zinc-900 bg-violet-500 text-white text-[10px] font-bold flex items-center justify-center">
                      MK
                    </span>
                  </div>
                  <span>14 applicants this week</span>
                </div>
                <span className="text-[11px] text-zinc-400">Posted 2h ago</span>
              </div>
            </div>

            {/* Floating Live Activity Pill (Top Right) */}
            <div className="hidden sm:flex absolute -top-5 -right-3 px-3.5 py-2 rounded-2xl bg-white/95 dark:bg-zinc-900/95 border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-zinc-300/40 dark:shadow-black/60 items-center gap-2.5 backdrop-blur-xl">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <div className="text-left">
                <div className="text-[11px] font-bold text-zinc-900 dark:text-white">
                  Alex S. got hired!
                </div>
                <div className="text-[10px] text-zinc-500 dark:text-zinc-400">
                  Senior Frontend • Vercel
                </div>
              </div>
            </div>

            {/* Floating Verified Badge (Bottom Left) */}
            <div className="hidden sm:flex absolute -bottom-5 -left-4 px-3.5 py-2.5 rounded-2xl bg-white/95 dark:bg-zinc-900/95 border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-zinc-300/40 dark:shadow-black/60 items-center gap-2 backdrop-blur-xl">
              <div className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                🛡️
              </div>
              <div className="text-left">
                <div className="text-[11px] font-bold text-zinc-900 dark:text-white">
                  100% Verified
                </div>
                <div className="text-[10px] text-zinc-500 dark:text-zinc-400">
                  Zero spam or fake postings
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Company Logos Social Proof Row */}
        <div className="mt-16 lg:mt-24 pt-8 border-t border-zinc-200/80 dark:border-zinc-800/80">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-6">
            Trusted by hiring teams from modern tech giants
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 opacity-75 grayscale hover:grayscale-0 transition-all duration-300">
            {sampleCompanies.map((company) => (
              <div
                key={company.name}
                className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 font-extrabold text-base sm:text-lg tracking-tight hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <span className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-black">
                  {company.icon}
                </span>
                <span>{company.name}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default Hero;