"use client";

import React, { useState } from "react";
import Link from "next/link";

const filterChips = [
  { label: "⚡ Remote Only", query: "Remote" },
  { label: "💻 React & Next.js", query: "Next.js" },
  { label: "🤖 AI & Machine Learning", query: "AI Engineer" },
  { label: "🎨 Product Design", query: "UI/UX Design" },
  { label: "💰 $150k+ Compensation", query: "$150k" },
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
    badge: "Verified",
    title: "100% Vetted Positions",
    description:
      "Every single role is verified directly with hiring founders. Zero ghost jobs, no automated spam.",
    stat: "12.5k+ live postings",
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
    badge: "Transparent",
    title: "Upfront Compensation",
    description:
      "Never interview blindly again. Clear salary bands, equity stakes, and full benefits disclosed upfront.",
    stat: "Avg. $145,000/yr",
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
    badge: "Fast Track",
    title: "Direct Founder Access",
    description:
      "Skip the applicant black hole. Your profile lands straight on the hiring manager's desk.",
    stat: "48h avg. response time",
  },
];

const companies = [
  "Google",
  "Stripe",
  "Vercel",
  "Spotify",
  "Airbnb",
  "Slack",
  "OpenAI",
];

const Hero = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("Anywhere");
  const [activeChip, setActiveChip] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // Dynamic interactive spotlight tracking
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleChipClick = (chip) => {
    if (activeChip === chip.label) {
      setActiveChip(null);
      setSearchQuery("");
    } else {
      setActiveChip(chip.label);
      setSearchQuery(chip.query);
    }
  };

  return (
    <section
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32 transition-colors"
    >
      {/* 1. Subtle Dot Grid Pattern with Feathered Radial Mask */}
      <div className="absolute inset-0 -z-20 h-full w-full bg-[radial-gradient(#d4d4d8_1px,transparent_1px)] dark:bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_10%,#000_60%,transparent_100%)] pointer-events-none" />

      {/* 2. Top Center Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-80 bg-gradient-to-b from-blue-500/10 via-indigo-500/5 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* 3. Interactive Mouse-following Spotlight (Smooth glow effect) */}
      {isHovered && (
        <div
          className="pointer-events-none absolute inset-0 -z-10 transition-opacity duration-500 hidden sm:block"
          style={{
            background: `radial-gradient(650px circle at ${mousePos.x}px ${mousePos.y}px, rgba(99, 102, 241, 0.08), transparent 45%)`,
          }}
        />
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Modern Pill Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold mb-8 border border-zinc-200/90 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-xs text-zinc-700 dark:text-zinc-300 hover:border-blue-500/40 hover:shadow-md transition-all duration-300 cursor-default">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
          </span>
          <span className="text-zinc-500 dark:text-zinc-400 font-normal">
            New Platform:
          </span>
          <span className="font-bold text-blue-600 dark:text-blue-400">
            HireMe 2.0 is Live
          </span>
          <span className="text-zinc-400 dark:text-zinc-500">→</span>
        </div>

        {/* Clean, Grand Hero Typography */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-zinc-950 dark:text-white leading-[1.15] max-w-4xl mx-auto">
          Where Top Tech Talent Meets{" "}
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 dark:from-blue-400 dark:via-indigo-300 dark:to-violet-400 bg-clip-text text-transparent">
            World-Class Work
          </span>
        </h1>

        {/* Spacious, Breathable Sub-headline */}
        <p className="mt-6 text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed font-normal">
          Discover verified engineering, design, and product opportunities at
          high-growth companies. Transparent compensation, zero agency spam, and direct founder reviews.
        </p>

        {/* Unified Modern Search Capsule */}
        <div className="mt-10 max-w-3xl mx-auto">
          <div className="group relative p-2 sm:p-2.5 rounded-2xl sm:rounded-3xl bg-white/95 dark:bg-zinc-900/95 border border-zinc-200/90 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-black/50 backdrop-blur-xl transition-all duration-300 focus-within:border-blue-500/80 focus-within:ring-4 focus-within:ring-blue-500/10 dark:focus-within:ring-blue-500/20">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              
              {/* Role / Keyword Input */}
              <div className="flex-1 flex items-center px-3 py-2.5">
                <svg
                  className="w-5 h-5 text-zinc-400 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 mr-3 transition-colors shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
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
                  placeholder="Job title, skill, or company..."
                  className="w-full bg-transparent text-sm sm:text-base outline-none text-zinc-900 dark:text-white placeholder-zinc-400 font-medium"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setActiveChip(null);
                    }}
                    className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 px-1 text-sm cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Location Selector Divider */}
              <div className="hidden sm:block w-[1px] h-8 bg-zinc-200 dark:bg-zinc-800" />

              {/* Location Select Option */}
              <div className="flex items-center px-3 py-2.5 sm:w-44">
                <svg
                  className="w-4 h-4 text-zinc-400 mr-2 shrink-0"
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
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  aria-label="Filter by location"
                  className="w-full bg-transparent text-sm font-semibold text-zinc-700 dark:text-zinc-300 outline-none cursor-pointer"
                >
                  <option value="Anywhere" className="dark:bg-zinc-900">
                    Worldwide
                  </option>
                  <option value="Remote" className="dark:bg-zinc-900">
                    Remote Only
                  </option>
                  <option value="US" className="dark:bg-zinc-900">
                    United States
                  </option>
                  <option value="Europe" className="dark:bg-zinc-900">
                    Europe
                  </option>
                </select>
              </div>

              {/* Search Submit Button */}
              <button
                type="button"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:via-indigo-500 hover:to-violet-500 text-white font-bold text-sm sm:text-base shadow-md shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
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
            </div>
          </div>

          {/* Interactive Filter Chips with Smooth Hover and Active States */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm">
            <span className="text-zinc-400 dark:text-zinc-500 font-medium mr-1">
              Popular:
            </span>
            {filterChips.map((chip) => {
              const isActive = activeChip === chip.label;
              return (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => handleChipClick(chip)}
                  className={`px-3 py-1.5 rounded-xl font-medium transition-all duration-200 cursor-pointer border ${
                    isActive
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/30 scale-102"
                      : "bg-white/70 dark:bg-zinc-900/70 text-zinc-600 dark:text-zinc-300 border-zinc-200/80 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/80 hover:-translate-y-0.5"
                  }`}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3 Modern Feature Cards with Generous Breathing Room and 3D Hover Lift */}
        <div className="mt-16 sm:mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {featureCards.map((card, idx) => (
            <div
              key={card.title}
              className="group relative text-left p-6 sm:p-7 rounded-3xl bg-white/70 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 backdrop-blur-xl shadow-xs transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-500/40 dark:hover:border-blue-400/40 flex flex-col justify-between"
            >
              {/* Top Accent Icon & Badge */}
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-700/60 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/40 transition-all duration-300">
                    {card.icon}
                  </div>
                  <span className="text-[11px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 group-hover:bg-blue-500/10 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {card.badge}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-zinc-950 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {card.title}
                </h3>

                <p className="mt-2.5 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {card.description}
                </p>
              </div>

              {/* Bottom Stat with Hover Arrow Accent */}
              <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                  {card.stat}
                </span>
                <span className="text-zinc-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all">
                  →
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Minimalist, Spaced Company Trust Bar */}
        <div className="mt-16 sm:mt-24 pt-8 border-t border-zinc-200/60 dark:border-zinc-800/60">
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-6">
            Trusted by hiring leaders at top tech companies
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 text-zinc-400 dark:text-zinc-500 font-bold text-sm sm:text-base">
            {companies.map((company) => (
              <span
                key={company}
                className="hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-default tracking-wide"
              >
                {company}
              </span>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default Hero;