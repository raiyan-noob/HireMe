"use client";

import React, { useState } from "react";

// Categorized filter chips spanning diverse industries
const categoryChips = [
  { label: "⚡ Remote & Flexible", query: "Remote" },
  { label: "💻 Tech & Software", query: "Software" },
  { label: "🏥 Healthcare & Medical", query: "Healthcare" },
  { label: "📈 Marketing & Sales", query: "Marketing" },
  { label: "💼 Finance & Accounting", query: "Finance" },
  { label: "🎨 Creative & Design", query: "Design" },
  { label: "🤝 Management & HR", query: "Operations" },
];

const featureCards = [
  {
    icon: (
      <svg
        className="w-6 h-6 text-blue-600 dark:text-blue-400"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
    badge: "Authentic",
    title: "100% Vetted Positions",
    description:
      "Every job is verified directly with accredited companies. Zero ghost postings, no automated recruiter spam.",
    stat: "50,000+ Active Roles",
    accentLight: "before:bg-gradient-to-r before:from-blue-500 before:to-indigo-500",
    iconBgLight: "bg-blue-50 text-blue-600",
  },
  {
    icon: (
      <svg
        className="w-6 h-6 text-indigo-600 dark:text-indigo-400"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
        <path d="M12 18V6" />
      </svg>
    ),
    badge: "Transparency",
    title: "Honest, Upfront Pay",
    description:
      "Never interview blindly again. Clear salary brackets, bonus structures, and benefits disclosed before applying.",
    stat: "Pay on 100% of listings",
    accentLight: "before:bg-gradient-to-r before:from-indigo-500 before:to-violet-500",
    iconBgLight: "bg-indigo-50 text-indigo-600",
  },
  {
    icon: (
      <svg
        className="w-6 h-6 text-violet-600 dark:text-violet-400"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
    badge: "Direct",
    title: "Fast-Track Applications",
    description:
      "Skip lengthy intermediary agencies. Your profile is delivered directly to hiring managers and decision-makers.",
    stat: "48h avg. response time",
    accentLight: "before:bg-gradient-to-r before:from-violet-500 before:to-pink-500",
    iconBgLight: "bg-violet-50 text-violet-600",
  },
];

// Authentic SVG Company Logos
const companyLogos = [
  {
    name: "Google",
    svg: (
      <svg className="h-6 w-auto" viewBox="0 0 74 24" fill="currentColor">
        <path d="M9.24 8.19v2.46h5.88c-.18 1.38-.64 2.39-1.34 3.1-.86.86-2.2 1.8-4.54 1.8-3.62 0-6.44-2.93-6.44-6.55s2.82-6.55 6.44-6.55c1.95 0 3.39.77 4.43 1.76L15.4 2.47C13.91 1.05 11.92 0 9.24 0 4.28 0 .2 4.05.2 9s4.08 9 9.04 9c2.68 0 4.69-.88 6.27-2.52 1.62-1.62 2.13-3.91 2.13-5.75 0-.57-.05-1.1-.14-1.54H9.24z" />
        <path d="M26.2 5.86c-3.15 0-5.72 2.42-5.72 5.64s2.57 5.64 5.72 5.64c3.15 0 5.72-2.42 5.72-5.64s-2.57-5.64-5.72-5.64zm0 9.06c-1.72 0-3.23-1.43-3.23-3.42 0-2.02 1.51-3.42 3.23-3.42 1.72 0 3.23 1.4 3.23 3.42 0 1.99-1.51 3.42-3.23 3.42z" />
        <path d="M38.87 5.86c-3.15 0-5.72 2.42-5.72 5.64s2.57 5.64 5.72 5.64c3.15 0 5.72-2.42 5.72-5.64s-2.57-5.64-5.72-5.64zm0 9.06c-1.72 0-3.23-1.43-3.23-3.42 0-2.02 1.51-3.42 3.23-3.42 1.72 0 3.23 1.4 3.23 3.42 0 1.99-1.51 3.42-3.23 3.42z" />
        <path d="M51.13 5.86c-3.03 0-5.59 2.45-5.59 5.64 0 3.16 2.56 5.64 5.59 5.64 1.76 0 2.97-.77 3.63-1.56v1.22c0 2.16-1.16 3.32-3.02 3.32-1.52 0-2.46-1.09-2.85-2.01l-2.17.91c.63 1.51 2.29 3.32 5.02 3.32 2.91 0 5.38-1.71 5.38-5.88V6.2h-2.38v1.07c-.69-.88-1.93-1.41-3.61-1.41zm.28 9.06c-1.68 0-3.06-1.43-3.06-3.42 0-2.02 1.38-3.45 3.06-3.45 1.65 0 2.99 1.43 2.99 3.45 0 1.99-1.34 3.42-2.99 3.42z" />
        <path d="M58.74.55h2.51v16.59h-2.51z" />
        <path d="M69.07 14.92c-1.28 0-2.18-.58-2.77-1.73l7.63-3.15-.26-.65c-.48-1.3-1.95-3.53-4.95-3.53-2.98 0-5.46 2.34-5.46 5.64 0 3.16 2.45 5.64 5.81 5.64 2.71 0 4.28-1.66 4.93-2.63l-2.01-1.34c-.67.99-1.58 1.75-2.92 1.75zm-.19-7.05c1.01 0 1.87.52 2.16 1.25l-5.16 2.14c0-2.41 1.72-3.39 3-3.39z" />
      </svg>
    ),
  },
  {
    name: "Microsoft",
    svg: (
      <svg className="h-6 w-auto" viewBox="0 0 95 24" fill="currentColor">
        <path d="M1 2.5h9v9H1zm11 0h9v9h-9zm-11 11h9v9H1zm11 0h9v9h-9z" />
        <text
          x="26"
          y="18.5"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="16.5"
          fontWeight="600"
          letterSpacing="-0.5px"
        >
          Microsoft
        </text>
      </svg>
    ),
  },
  {
    name: "Amazon",
    svg: (
      <svg className="h-6 w-auto" viewBox="0 0 80 24" fill="currentColor">
        <text
          x="0"
          y="15.5"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="18"
          fontWeight="800"
          letterSpacing="-0.8px"
        >
          amazon
        </text>
        <path
          d="M3 20c15 5 45 5 62-2"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M62 17l4 2-3 3"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    ),
  },
  {
    name: "Spotify",
    svg: (
      <svg className="h-6 w-auto" viewBox="0 0 88 24" fill="currentColor">
        <circle cx="11" cy="12" r="10" />
        <path
          d="M7 10c4-1 9-1 12 1M8 12.5c3-.8 7-.8 9.5.8M9 15c2.5-.6 5.5-.6 7.5.5"
          stroke="var(--color-background, #fff)"
          strokeWidth="1.6"
          strokeLinecap="round"
          fill="none"
        />
        <text
          x="26"
          y="17.5"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="16"
          fontWeight="700"
          letterSpacing="-0.5px"
        >
          Spotify
        </text>
      </svg>
    ),
  },
  {
    name: "Airbnb",
    svg: (
      <svg className="h-6 w-auto" viewBox="0 0 82 24" fill="currentColor">
        <path d="M10 2.5C6.5 2.5 3.8 5 3.2 8.5c-.4 2.5 0 5 1.2 7.2L9.2 22c.2.4.5.6.8.6s.6-.2.8-.6l4.8-6.3c1.2-2.2 1.6-4.7 1.2-7.2-.6-3.5-3.3-6-6.8-6zm0 14c-2 0-3.6-1.6-3.6-3.6s1.6-3.6 3.6-3.6 3.6 1.6 3.6 3.6-1.6 3.6-3.6 3.6z" />
        <text
          x="24"
          y="17.5"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="17"
          fontWeight="700"
          letterSpacing="-0.5px"
        >
          airbnb
        </text>
      </svg>
    ),
  },
  {
    name: "Nike",
    svg: (
      <svg className="h-6 w-auto" viewBox="0 0 55 24" fill="currentColor">
        <path d="M52.3 4.2C44.8 9.1 34.6 14.5 23.5 18.2 11.2 22.3.2 18.2.2 18.2s8.5-4.4 15.6-7.3c10.8-4.4 24.3-7.5 36.5-6.7z" />
      </svg>
    ),
  },
  {
    name: "Netflix",
    svg: (
      <svg className="h-6 w-auto" viewBox="0 0 78 24" fill="currentColor">
        <text
          x="0"
          y="18"
          fontFamily="Impact, system-ui, sans-serif"
          fontSize="21"
          fontWeight="900"
          letterSpacing="1px"
        >
          NETFLIX
        </text>
      </svg>
    ),
  },
];

const Hero = () => {
  const [searchTitle, setSearchTitle] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeCategory, setActiveCategory] = useState(null);
  const [savedJob, setSavedJob] = useState(false);
  const [appliedJob, setAppliedJob] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // Smooth mouse-following glow for interactive feel in dark mode
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleCategoryClick = (cat) => {
    if (activeCategory === cat.name) {
      setActiveCategory(null);
      setSearchTitle("");
    } else {
      setActiveCategory(cat.name);
      setSearchTitle(cat.query);
    }
  };

  return (
    <section
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative overflow-hidden pt-10 pb-20 lg:pt-16 lg:pb-28 transition-colors"
    >
      {/* ======================================================== */}
      {/* 1. LIGHT MODE BACKGROUND: Pristine, Elegant, Warm Canvas */}
      {/* ======================================================== */}
      <div className="dark:hidden absolute inset-0 -z-10 pointer-events-none overflow-hidden bg-gradient-to-b from-slate-50 via-white to-white">
        {/* Soft, ultra-faint architectural dot-grid with smooth radial mask */}
        <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_70%_50%_at_50%_15%,#000_70%,transparent_100%)] opacity-40" />

        {/* Luminous, warm sky and indigo aura at top center */}
        <div className="absolute -top-36 left-1/2 -translate-x-1/2 w-[850px] h-[450px] bg-gradient-to-b from-blue-200/40 via-indigo-100/35 to-transparent rounded-full blur-3xl opacity-80" />
        
        {/* Soft atmospheric glow on flanks */}
        <div className="absolute top-16 left-12 w-72 h-72 bg-sky-200/30 rounded-full blur-3xl" />
        <div className="absolute top-16 right-12 w-72 h-72 bg-indigo-200/25 rounded-full blur-3xl" />
      </div>

      {/* ======================================================== */}
      {/* 2. DARK MODE BACKGROUND: Kept 100% Intact as Requested */}
      {/* ======================================================== */}
      <div className="hidden dark:block absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        {/* Deep tech grid with subtle ambient brightness */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#27272a_1px,transparent_1px),linear-gradient(to_bottom,#27272a_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_70%,transparent_100%)] opacity-40" />

        {/* Deep electric nebula glow */}
        <div className="absolute -top-44 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-r from-blue-600/30 via-indigo-600/35 to-violet-600/30 rounded-full blur-[130px]" />
        <div className="absolute top-12 left-1/4 w-[420px] h-[380px] bg-cyan-500/15 rounded-full blur-[100px]" />
        <div className="absolute top-12 right-1/4 w-[420px] h-[380px] bg-fuchsia-600/15 rounded-full blur-[100px]" />

        {/* Cyber glowing orbital rings */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 w-[850px] h-[850px] rounded-full border border-blue-500/20 pointer-events-none" />
        <div className="absolute top-28 left-1/2 -translate-x-1/2 w-[650px] h-[650px] rounded-full border border-indigo-500/25 pointer-events-none" />
        <div className="absolute top-48 left-1/2 -translate-x-1/2 w-[450px] h-[450px] rounded-full border border-violet-500/20 pointer-events-none" />

        {/* Top laser beam highlight */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-4xl h-[1px] bg-gradient-to-r from-transparent via-blue-500/60 to-transparent" />
      </div>

      {/* 3. Interactive Mouse Spotlight (Elevates desktop engagement in dark mode) */}
      {isHovered && (
        <div
          className="pointer-events-none absolute inset-0 -z-10 transition-opacity duration-300 hidden sm:block dark:opacity-100 opacity-0"
          style={{
            background: `radial-gradient(650px circle at ${mousePos.x}px ${mousePos.y}px, rgba(59, 130, 246, 0.08), transparent 45%)`,
          }}
        />
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Announcement Pill Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold mb-8 border border-slate-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/80 shadow-[0_2px_12px_rgba(37,99,235,0.06)] dark:shadow-none text-slate-800 dark:text-zinc-200 backdrop-blur-md hover:border-blue-500/50 hover:shadow-md transition-all duration-300 cursor-default">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
          </span>
          <span className="text-slate-500 dark:text-zinc-400 font-normal">
            Empowering Careers:
          </span>
          <span className="font-bold text-blue-600 dark:text-blue-400">
            50,000+ Verified Positions Live
          </span>
          <span className="text-blue-500 dark:text-zinc-500">→</span>
        </div>

        {/* Clean, High-Impact Hero Headline for All Careers */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.12] max-w-4xl mx-auto">
          Discover Roles That Match{" "}
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 dark:from-blue-400 dark:via-indigo-300 dark:to-violet-400 bg-clip-text text-transparent">
            Your True Ambition
          </span>
        </h1>

        {/* Crisp, Spacious Subtitle */}
        <p className="mt-5 text-base sm:text-lg lg:text-xl text-slate-600 dark:text-zinc-300 max-w-2xl mx-auto leading-relaxed font-normal">
          Connecting ambitious professionals with premier employers. Explore vetted
          roles in technology, healthcare, business, creative, and finance with upfront compensation.
        </p>

        {/* Floating High-Contrast Search Capsule */}
        <div className="mt-10 max-w-3xl mx-auto">
          <div className="group relative p-2 sm:p-2.5 rounded-2xl sm:rounded-3xl bg-white dark:bg-zinc-900/95 border border-slate-200/90 dark:border-zinc-800 shadow-[0_16px_40px_-12px_rgba(15,23,42,0.08),0_2px_8px_-2px_rgba(15,23,42,0.04)] dark:shadow-2xl dark:shadow-black/70 backdrop-blur-xl transition-all duration-300 focus-within:border-blue-600 dark:focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 dark:focus-within:ring-blue-500/20">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              
              {/* Role / Industry / Keyword Input */}
              <div className="flex-1 flex items-center px-4 py-2.5">
                <svg
                  className="w-5 h-5 text-slate-400 group-focus-within:text-blue-600 dark:text-zinc-400 dark:group-focus-within:text-blue-400 mr-3 transition-colors shrink-0"
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
                  value={searchTitle}
                  onChange={(e) => setSearchTitle(e.target.value)}
                  placeholder="Job title, keywords, or company..."
                  className="w-full bg-transparent text-sm sm:text-base outline-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-400 font-medium"
                />
                {searchTitle && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTitle("");
                      setActiveCategory(null);
                    }}
                    className="text-slate-400 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200 px-1 text-sm cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Location / Workplace Divider */}
              <div className="hidden sm:block w-[1px] h-8 bg-slate-200 dark:bg-zinc-800" />

              {/* Workplace Preference Selector */}
              <div className="flex items-center px-4 py-2.5 sm:w-44">
                <svg
                  className="w-4 h-4 text-slate-400 dark:text-zinc-400 mr-2 shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  aria-label="Filter by workplace type"
                  className="w-full bg-transparent text-sm font-semibold text-slate-700 dark:text-zinc-300 outline-none cursor-pointer"
                >
                  <option value="all" className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-white">
                    Worldwide
                  </option>
                  <option value="remote" className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-white">
                    Remote Only
                  </option>
                  <option value="hybrid" className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-white">
                    Hybrid
                  </option>
                  <option value="onsite" className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-white">
                    On-Site
                  </option>
                </select>
              </div>

              {/* Search Submit CTA Button */}
              <button
                type="button"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:via-indigo-500 hover:to-violet-500 text-white font-bold text-sm sm:text-base shadow-md shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
              >
                <span>Find Jobs</span>
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
            </div>
          </div>

          {/* Interactive Multi-Industry Filter Chips */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm">
            <span className="text-slate-500 dark:text-zinc-400 font-semibold mr-1">
              Popular fields:
            </span>
            {categoryChips.map((chip) => {
              const isActive = activeCategory === chip.label;
              return (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => handleCategoryClick(chip)}
                  className={`px-3.5 py-1.5 rounded-xl font-medium transition-all duration-200 cursor-pointer border ${
                    isActive
                      ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/25 scale-[1.02]"
                      : "bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border-slate-200/90 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/80 hover:border-slate-300 dark:hover:border-zinc-700 shadow-xs hover:-translate-y-0.5"
                  }`}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3 Modern Feature Cards with Distinct Light Mode Accent Bars & Dark Mode Intact */}
        <div className="mt-16 sm:mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {featureCards.map((card) => (
            <div
              key={card.title}
              className={`relative overflow-hidden group text-left p-7 rounded-3xl bg-white dark:bg-zinc-900/80 border border-slate-200/90 dark:border-zinc-800 shadow-[0_10px_35px_-8px_rgba(15,23,42,0.06)] dark:shadow-none hover:shadow-[0_20px_45px_-12px_rgba(37,99,235,0.12)] dark:hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.7)] hover:border-blue-400 dark:hover:border-blue-400/50 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between before:absolute before:top-0 before:left-0 before:right-0 before:h-1 dark:before:hidden ${card.accentLight}`}
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div
                    className={`w-12 h-12 rounded-2xl border border-slate-100 dark:border-zinc-700/60 dark:bg-zinc-800/80 flex items-center justify-center group-hover:scale-110 transition-all duration-300 ${card.iconBgLight} dark:group-hover:bg-blue-950/40`}
                  >
                    {card.icon}
                  </div>
                  <span className="text-[11px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 group-hover:bg-blue-500/10 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {card.badge}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {card.title}
                </h3>

                <p className="mt-2.5 text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                  {card.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
                  {card.stat}
                </span>
                <span className="text-slate-400 dark:text-zinc-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all">
                  →
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Authentic Company SVG Logos Social Proof Bar */}
        <div className="mt-16 sm:mt-24 pt-10 border-t border-slate-200/80 dark:border-zinc-800/80">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-500 mb-8">
            Trusted by hiring teams from leading global organizations
          </p>

          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 lg:gap-16">
            {companyLogos.map((logo) => (
              <div
                key={logo.name}
                title={logo.name}
                className="text-slate-400 hover:text-slate-800 dark:text-zinc-500 dark:hover:text-zinc-200 transition-colors duration-200 flex items-center justify-center cursor-default opacity-85 hover:opacity-100 hover:scale-105 transform transition-transform"
              >
                {logo.svg}
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default Hero;