"use client";

import React, { useState } from "react";
import Link from "next/link";

// Categories spanning all major job markets with icons & counts
const categories = [
  {
    name: "Tech & Software",
    count: "14.2k jobs",
    query: "Software",
    color: "from-blue-500 to-indigo-600",
    bgLight: "bg-blue-50 text-blue-700 border-blue-200",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
  {
    name: "Healthcare & Medicine",
    count: "9.5k jobs",
    query: "Healthcare",
    color: "from-rose-500 to-red-600",
    bgLight: "bg-rose-50 text-rose-700 border-rose-200",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </svg>
    ),
  },
  {
    name: "Finance & Banking",
    count: "8.1k jobs",
    query: "Finance",
    color: "from-emerald-500 to-teal-600",
    bgLight: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
  },
  {
    name: "Marketing & Growth",
    count: "7.4k jobs",
    query: "Marketing",
    color: "from-amber-500 to-orange-600",
    bgLight: "bg-amber-50 text-amber-700 border-amber-200",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      </svg>
    ),
  },
  {
    name: "Creative & Design",
    count: "6.2k jobs",
    query: "Design",
    color: "from-purple-500 to-violet-600",
    bgLight: "bg-purple-50 text-purple-700 border-purple-200",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
        <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
        <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
        <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.563-2.512 5.563-5.563C22 6.5 17.5 2 12 2Z" />
      </svg>
    ),
  },
  {
    name: "Management & HR",
    count: "5.8k jobs",
    query: "Operations",
    color: "from-sky-500 to-blue-600",
    bgLight: "bg-sky-50 text-sky-700 border-sky-200",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
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
    <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24">
      {/* ======================================================== */}
      {/* 1. LIGHT MODE BACKGROUND: Luminous, Clean & Warm */}
      {/* ======================================================== */}
      <div className="dark:hidden absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        {/* Soft, clean gradient mesh with zero dirty artifacts */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[650px] bg-gradient-to-b from-blue-50/70 via-indigo-50/30 to-transparent" />
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-gradient-to-r from-blue-400/15 via-indigo-300/20 to-purple-400/15 rounded-full blur-[100px]" />
        <div className="absolute top-20 left-10 w-80 h-80 bg-sky-300/20 rounded-full blur-[90px]" />
        <div className="absolute top-20 right-10 w-80 h-80 bg-violet-300/15 rounded-full blur-[90px]" />
      </div>

      {/* ======================================================== */}
      {/* 2. DARK MODE BACKGROUND: Deep Obsidian, Glow & Laser Horizon */}
      {/* ======================================================== */}
      <div className="hidden dark:block absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[950px] h-[500px] bg-gradient-to-r from-blue-600/25 via-indigo-600/30 to-violet-600/25 rounded-full blur-[130px]" />
        <div className="absolute top-10 left-1/4 w-[400px] h-[350px] bg-cyan-500/10 rounded-full blur-[100px]" />
        <div className="absolute top-10 right-1/4 w-[400px] h-[350px] bg-fuchsia-600/10 rounded-full blur-[100px]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-4xl h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header & Search Area */}
        <div className="text-center max-w-4xl mx-auto">
          {/* Chic Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold mb-6 border border-blue-200/90 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/80 shadow-[0_2px_12px_rgba(37,99,235,0.06)] dark:shadow-none text-zinc-800 dark:text-zinc-200 backdrop-blur-md hover:border-blue-500/50 hover:shadow-md transition-all duration-300 cursor-default">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
            </span>
            <span className="text-zinc-500 dark:text-zinc-400 font-normal">
              Empowering Careers:
            </span>
            <span className="font-bold text-blue-600 dark:text-blue-400">
              50,000+ Verified Positions Live
            </span>
            <span className="text-blue-500 dark:text-zinc-500">→</span>
          </div>

          {/* Master Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.12]">
            Discover Roles That Match{" "}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 dark:from-blue-400 dark:via-indigo-300 dark:to-violet-400 bg-clip-text text-transparent">
              Your True Ambition
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-5 text-base sm:text-lg lg:text-xl text-slate-600 dark:text-zinc-300 max-w-2xl mx-auto leading-relaxed">
            The modern job ecosystem for all professions. Connect directly with hiring managers across technology, healthcare, business, creative, and finance.
          </p>

          {/* Executive Multi-Segment Search Box */}
          <div className="mt-9">
            <div className="p-2 sm:p-2.5 rounded-2xl sm:rounded-3xl bg-white dark:bg-zinc-900/95 border border-slate-200 dark:border-zinc-800 shadow-[0_15px_45px_-10px_rgba(0,0,0,0.09)] dark:shadow-2xl dark:shadow-black/70 flex flex-col md:flex-row items-stretch md:items-center gap-2 transition-all focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10">
              
              {/* Segment 1: Role / Title / Keyword */}
              <div className="flex-1 flex items-center px-3.5 py-2.5">
                <svg
                  className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3 shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
                <div className="text-left w-full">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                    What
                  </label>
                  <input
                    type="text"
                    value={searchTitle}
                    onChange={(e) => setSearchTitle(e.target.value)}
                    placeholder="Job title, keywords, or company..."
                    className="w-full bg-transparent text-sm sm:text-base font-semibold text-slate-900 dark:text-white outline-none placeholder-slate-400"
                  />
                </div>
              </div>

              {/* Divider */}
              <div className="hidden md:block w-[1px] h-9 bg-slate-200 dark:bg-zinc-800" />

              {/* Segment 2: Location */}
              <div className="flex-1 flex items-center px-3.5 py-2.5 border-t md:border-t-0 border-slate-100 dark:border-zinc-800/80">
                <svg
                  className="w-5 h-5 text-indigo-500 dark:text-indigo-400 mr-3 shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                >
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <div className="text-left w-full">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                    Where
                  </label>
                  <input
                    type="text"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    placeholder="City, country, or 'Remote'..."
                    className="w-full bg-transparent text-sm sm:text-base font-semibold text-slate-900 dark:text-white outline-none placeholder-slate-400"
                  />
                </div>
              </div>

              {/* Divider */}
              <div className="hidden md:block w-[1px] h-9 bg-slate-200 dark:bg-zinc-800" />

              {/* Segment 3: Industry Category Select */}
              <div className="flex items-center px-3.5 py-2.5 border-t md:border-t-0 border-slate-100 dark:border-zinc-800/80 md:w-48">
                <div className="text-left w-full">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                    Industry
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    aria-label="Filter by industry"
                    className="w-full bg-transparent text-sm font-semibold text-slate-800 dark:text-zinc-200 outline-none cursor-pointer"
                  >
                    <option value="all" className="bg-white dark:bg-zinc-900">
                      All Industries
                    </option>
                    <option value="tech" className="bg-white dark:bg-zinc-900">
                      Tech & Software
                    </option>
                    <option value="healthcare" className="bg-white dark:bg-zinc-900">
                      Healthcare & Medicine
                    </option>
                    <option value="finance" className="bg-white dark:bg-zinc-900">
                      Finance & Banking
                    </option>
                    <option value="creative" className="bg-white dark:bg-zinc-900">
                      Creative & Design
                    </option>
                    <option value="marketing" className="bg-white dark:bg-zinc-900">
                      Marketing & Sales
                    </option>
                  </select>
                </div>
              </div>

              {/* Search Submit CTA Button */}
              <button
                type="button"
                className="w-full md:w-auto px-8 py-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:via-indigo-500 hover:to-violet-500 text-white font-bold text-sm sm:text-base shadow-md shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
              >
                <span>Find Jobs</span>
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
              </button>
            </div>
          </div>

          {/* Category Chips Carousel */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mr-1">
              Popular:
            </span>
            {categories.map((cat) => {
              const isActive = activeCategory === cat.name;
              return (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => handleCategoryClick(cat)}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer border ${
                    isActive
                      ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/30 scale-102"
                      : "bg-white dark:bg-zinc-900/90 text-slate-700 dark:text-zinc-300 border-slate-200/90 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 shadow-xs hover:-translate-y-0.5"
                  }`}
                >
                  <span
                    className={
                      isActive
                        ? "text-white"
                        : "text-blue-600 dark:text-blue-400"
                    }
                  >
                    {cat.icon}
                  </span>
                  <span>{cat.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400"
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Visual Showcase: 3 High-Fidelity Feature Cards */}
        <div className="mt-16 lg:mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Featured Live Job Preview */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/80 border border-slate-200/90 dark:border-zinc-800 shadow-[0_10px_35px_-8px_rgba(0,0,0,0.06)] dark:shadow-none hover:shadow-[0_20px_45px_-12px_rgba(37,99,235,0.12)] dark:hover:shadow-[0_20px_45px_-12px_rgba(0,0,0,0.7)] transition-all hover:-translate-y-1.5 flex flex-col justify-between text-left">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-black text-lg">
                    ♫
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                      Spotify
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      Stockholm / Remote Worldwide
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSavedJob(!savedJob)}
                  aria-label="Bookmark job"
                  className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                    savedJob
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-500"
                      : "bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-400 hover:text-slate-600"
                  }`}
                >
                  ★
                </button>
              </div>

              {/* Title & Pay */}
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Senior Product Marketing Manager
              </h3>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-base font-extrabold text-blue-600 dark:text-blue-400">
                  $140k – $175k
                </span>
                <span className="text-xs text-slate-400">• Full Benefits + Equity</span>
              </div>

              {/* Badges */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                  Brand Growth
                </span>
                <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                  Strategy
                </span>
                <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                  Remote
                </span>
              </div>
            </div>

            {/* 1-Click Apply */}
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-zinc-800/80">
              <button
                type="button"
                onClick={() => setAppliedJob(!appliedJob)}
                className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  appliedJob
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-900 dark:bg-zinc-800 text-white hover:bg-blue-600 dark:hover:bg-blue-600"
                }`}
              >
                {appliedJob ? "✓ Applied Successfully" : "Quick Apply (1-Click)"}
              </button>
            </div>
          </div>

          {/* Card 2: AI Compatibility & Real Matches */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/80 border border-slate-200/90 dark:border-zinc-800 shadow-[0_10px_35px_-8px_rgba(0,0,0,0.06)] dark:shadow-none hover:shadow-[0_20px_45px_-12px_rgba(37,99,235,0.12)] dark:hover:shadow-[0_20px_45px_-12px_rgba(0,0,0,0.7)] transition-all hover:-translate-y-1.5 flex flex-col justify-between text-left">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 font-black text-lg">
                  ⚡
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  98% Match Rate
                </span>
              </div>

              <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                Direct Candidate Match
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                Our smart matching engine introduces your credentials directly to the team lead within 24 hours.
              </p>

              {/* Applicant Avatar Stack */}
              <div className="mt-5 p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800 flex items-center gap-3">
                <div className="flex -space-x-2 overflow-hidden">
                  <span className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-zinc-900 bg-blue-500 text-white text-xs font-bold flex items-center justify-center">
                    JD
                  </span>
                  <span className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-zinc-900 bg-indigo-500 text-white text-xs font-bold flex items-center justify-center">
                    SL
                  </span>
                  <span className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-zinc-900 bg-violet-500 text-white text-xs font-bold flex items-center justify-center">
                    AM
                  </span>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    38,000+ Professionals Placed
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Average hiring turnaround: 4 days
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400">
              <span>View Placement Stories</span>
              <span>→</span>
            </div>
          </div>

          {/* Card 3: 100% Upfront Verified Guarantee */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/80 border border-slate-200/90 dark:border-zinc-800 shadow-[0_10px_35px_-8px_rgba(0,0,0,0.06)] dark:shadow-none hover:shadow-[0_20px_45px_-12px_rgba(37,99,235,0.12)] dark:hover:shadow-[0_20px_45px_-12px_rgba(0,0,0,0.7)] transition-all hover:-translate-y-1.5 flex flex-col justify-between text-left">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-600 dark:text-violet-400 font-black text-lg">
                  🛡️
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Verified Only
                </span>
              </div>

              <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                Zero Ghost Postings
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                Every listing is verified with official employer domains and requires explicit salary disclosure upfront.
              </p>

              {/* Security Points */}
              <div className="mt-5 space-y-2">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-zinc-300">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>100% Transparent Compensation</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-zinc-300">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>Direct Communication With Hiring Leads</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-zinc-300">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>Encrypted & Privacy-First Applications</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400">
              <span>Our Verification Standards</span>
              <span>→</span>
            </div>
          </div>

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
                className="text-slate-400 hover:text-slate-800 dark:text-zinc-500 dark:hover:text-white transition-colors duration-200 flex items-center justify-center cursor-default opacity-85 hover:opacity-100 hover:scale-105 transform transition-transform"
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