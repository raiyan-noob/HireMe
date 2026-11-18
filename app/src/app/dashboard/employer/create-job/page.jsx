"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { createJob } from "@/lib/actions/jobs";
export default function CreateJobPage() {
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = useSession();

  // View Toggle: "editor" or "preview"
  const [activeTab, setActiveTab] = useState("editor");

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const userCompany = session?.user?.companyName || session?.user?.name || "";
  const [customCompanyName, setCustomCompanyName] = useState(null);
  const companyName = customCompanyName !== null ? customCompanyName : userCompany;
  const [jobTitle, setJobTitle] = useState("");
  const [category, setCategory] = useState("Engineering");
  const [employmentType, setEmploymentType] = useState("Full-time");
  const [workplaceType, setWorkplaceType] = useState("Remote");
  const [location, setLocation] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [minSalary, setMinSalary] = useState("90000");
  const [maxSalary, setMaxSalary] = useState("130000");
  const [salaryPeriod, setSalaryPeriod] = useState("Per Year");
  const [showSalary, setShowSalary] = useState(true);
  const [equityIncluded, setEquityIncluded] = useState(false);
  const [experienceLevel, setExperienceLevel] = useState("Mid Level (3-5 yrs)");
  
  // Skills Chip Input
  const [skills, setSkills] = useState([
    "React",
    "Next.js",
    "TypeScript",
    "Tailwind CSS",
  ]);
  const [skillInput, setSkillInput] = useState("");

  // Description & Responsibilities
  const [description, setDescription] = useState(
    "We are seeking a talented professional to join our high-growth engineering team. You will lead the development of mission-critical user interfaces and collaborate with cross-functional product teams to deliver exceptional digital experiences."
  );
  const [responsibilities, setResponsibilities] = useState([
    "Architect and implement responsive, high-performance web applications using modern React and Next.js.",
    "Collaborate with product managers and designers to translate requirements into intuitive user workflows.",
    "Write clean, well-tested, maintainable code and participate in peer code reviews.",
    "Optimize application performance, accessibility, and SEO best practices across modern browsers.",
  ]);
  const [newResponsibility, setNewResponsibility] = useState("");

  // Application Settings
  const userEmail = session?.user?.email || "";
  const [customEmail, setCustomEmail] = useState(null);
  const applicationEmail = customEmail !== null ? customEmail : userEmail;
  const [applicationDeadline, setApplicationDeadline] = useState("2026-12-31");
  const [isFeatured, setIsFeatured] = useState(true);
  const [isUrgent, setIsUrgent] = useState(false);

  // Notification Toast simulation
  const [toastMessage, setToastMessage] = useState(null);

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

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Skill Chip handlers
  const handleAddSkill = (skillToAdd) => {
    const trimmed = (skillToAdd || skillInput).trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  // Responsibility item handlers
  const handleAddResponsibility = () => {
    if (newResponsibility.trim()) {
      setResponsibilities([...responsibilities, newResponsibility.trim()]);
      setNewResponsibility("");
    }
  };

  const handleRemoveResponsibility = (index) => {
    setResponsibilities(responsibilities.filter((_, i) => i !== index));
  };

  // Preset Template loader
  const loadStandardTemplate = () => {
    setJobTitle("Senior Full-Stack Engineer");
    setCategory("Engineering");
    setLocation("San Francisco, CA (or Remote)");
    setMinSalary("120000");
    setMaxSalary("170000");
    setSkills(["React", "Next.js", "Node.js", "TypeScript", "Tailwind CSS", "MongoDB"]);
    if (!companyName) {
      setCustomCompanyName(session?.user?.companyName || session?.user?.name || "Acme Innovations Inc.");
    }
    showToast("Standard engineering template loaded!");
  };

  const quickSkillSuggestions = [
    "GraphQL",
    "Node.js",
    "MongoDB",
    "PostgreSQL",
    "Docker",
    "AWS",
    "Python",
    "Figma",
  ];

  const popularJobTitles = [
    "Senior Full-Stack Engineer",
    "Lead Product Designer",
    "DevOps Specialist",
    "Product Manager",
    "Frontend Architect",
  ];
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Basic validation
    if (!jobTitle.trim() || !companyName.trim() || !location.trim() || !description.trim()) {
      showToast("Please fill in all required fields (Job Title, Company, Location, Description).");
      return;
    }

    // 2. Form data payload
    const jobData = {
      jobTitle: jobTitle.trim(),
      companyName: companyName.trim(),
      category,
      employmentType,
      workplaceType,
      location: location.trim(),
      currency,
      minSalary: Number(minSalary) || 0,
      maxSalary: Number(maxSalary) || 0,
      salaryPeriod,
      showSalary,
      equityIncluded,
      experienceLevel,
      skills,
      description: description.trim(),
      responsibilities: responsibilities.filter((r) => r.trim().length > 0),
      applicationEmail: applicationEmail.trim() || session?.user?.email || "",
      applicationDeadline,
      isFeatured,
      isUrgent,
      employerId: session?.user?.id || null,
      employerEmail: session?.user?.email || null,
      employerName: session?.user?.name || null,
      status: "active",
      createdAt: new Date().toISOString(),
    };

    // 3. Send to backend server
    try {
      setIsSubmitting(true);
      const result = await createJob(jobData);
      console.log("Job created successfully:", result);
      showToast("Job opening successfully published!");

      setTimeout(() => {
        router.push("/dashboard/employer/manage-jobs");
      }, 1500);
    } catch (error) {
      console.error("Submit error:", error);
      showToast(error.message || "Failed to publish job. Please check backend server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative min-h-screen pb-24 overflow-hidden transition-colors"
    >
      
      {/* ======================================================== */}
      {/* 1. LIGHT MODE BACKGROUND (Radiant Sunrise & Tech Architecture) */}
      {/* ======================================================== */}
      <div className="dark:hidden absolute inset-0 -z-10 pointer-events-none overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50">
        {/* Soft architectural grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_70%_50%_at_50%_15%,#000_70%,transparent_100%)] opacity-60" />

        {/* Luminous Top Sunrise Aura */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[950px] h-[480px] bg-gradient-to-tr from-blue-300/35 via-sky-200/40 to-indigo-200/35 rounded-full blur-[110px]" />
        
        {/* Flank accent glows */}
        <div className="absolute top-1/4 left-5 w-80 h-80 bg-sky-200/30 rounded-full blur-[90px]" />
        <div className="absolute top-1/3 right-5 w-80 h-80 bg-violet-200/30 rounded-full blur-[90px]" />

        {/* Top horizon light line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-5xl h-[2px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />

        {/* Decorative Floating Background SVG Rings */}
        <div className="absolute top-20 right-10 w-96 h-96 rounded-full border border-blue-200/40 pointer-events-none" />
        <div className="absolute top-36 right-24 w-64 h-64 rounded-full border border-dashed border-indigo-200/40 pointer-events-none" />
      </div>

      {/* ======================================================== */}
      {/* 2. DARK MODE BACKGROUND (Deep Cyber Obsidian & Neon Aurora) */}
      {/* ======================================================== */}
      <div className="hidden dark:block absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        {/* Dark cyber tech grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#27272a_1px,transparent_1px),linear-gradient(to_bottom,#27272a_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_25%,#000_70%,transparent_100%)] opacity-40" />

        {/* Cosmic Nebula Glow */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[950px] h-[520px] bg-gradient-to-r from-blue-600/30 via-indigo-600/35 to-violet-600/30 rounded-full blur-[130px]" />
        <div className="absolute top-1/3 left-10 w-[420px] h-[380px] bg-cyan-500/15 rounded-full blur-[110px]" />
        <div className="absolute top-1/3 right-10 w-[420px] h-[380px] bg-fuchsia-600/15 rounded-full blur-[110px]" />

        {/* Futuristic Orbital Rings */}
        <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full border border-blue-500/15 pointer-events-none" />
        <div className="absolute top-48 left-1/2 -translate-x-1/2 w-[550px] h-[550px] rounded-full border border-dashed border-indigo-500/15 pointer-events-none" />

        {/* Top laser beam line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-5xl h-[1px] bg-gradient-to-r from-transparent via-blue-500/60 to-transparent" />
      </div>

      {/* ======================================================== */}
      {/* 3. INTERACTIVE MOUSE SPOTLIGHT (Follows user cursor) */}
      {/* ======================================================== */}
      {isHovered && (
        <div
          className="pointer-events-none absolute inset-0 -z-10 transition-opacity duration-300 hidden sm:block opacity-100"
          style={{
            background: `radial-gradient(750px circle at ${mousePos.x}px ${mousePos.y}px, rgba(59, 130, 246, 0.08), transparent 50%)`,
          }}
        />
      )}

      {/* ======================================================== */}
      {/* 2. TOAST NOTIFICATION BANNER */}
      {/* ======================================================== */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-900 dark:bg-zinc-800 text-white shadow-2xl border border-slate-700/80 dark:border-zinc-700">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <span className="text-xs sm:text-sm font-semibold">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. TOP HEADER & BREADCRUMBS */}
      {/* ======================================================== */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6 mb-8">
        
        {/* Breadcrumb line */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-zinc-400 mb-3">
          <Link href="/dashboard/employer" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Employer Dashboard
          </Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-white font-bold">Post a New Job</span>
        </div>

        {/* Title, Badge & Action Switcher */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-zinc-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/60 mb-2.5">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              Hiring Campaign Creator
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Post a New <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">Job Opportunity</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1 max-w-2xl">
              Publish your listing to reach verified top-tier talent. Candidates can easily discover, bookmark, and apply directly.
            </p>
          </div>

          {/* Mode Switcher: Form vs Live Candidate Preview */}
          <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-zinc-800/80 border border-slate-200/80 dark:border-zinc-700/80 self-start md:self-auto shrink-0 shadow-xs">
            <button
              type="button"
              onClick={() => setActiveTab("editor")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                activeTab === "editor"
                  ? "bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              <span>Form Editor</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("preview")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                activeTab === "preview"
                  ? "bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <span>Live Preview</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </button>
          </div>
        </div>

        {/* Quick Helper Banner */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-violet-50/70 dark:from-blue-950/30 dark:via-indigo-950/20 dark:to-violet-950/30 border border-blue-200/60 dark:border-blue-900/40 text-xs">
          <div className="flex items-center gap-2.5 text-slate-700 dark:text-zinc-300">
            <svg className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" x2="12" y1="8" y2="12" />
              <line x1="12" x2="12.01" y1="16" y2="16" />
            </svg>
            <span>Need inspiration? You can autofill a standard engineering position template in 1 click.</span>
          </div>
          <button
            type="button"
            onClick={loadStandardTemplate}
            className="px-3 py-1.5 rounded-xl font-bold bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white shadow-xs border border-blue-200 dark:border-zinc-700 transition-all cursor-pointer shrink-0"
          >
            Auto-Fill Template
          </button>
        </div>

      </div>

      {/* ======================================================== */}
      {/* 4. MAIN CONTAINER: FORM EDITOR OR CANDIDATE PREVIEW */}
      {/* ======================================================== */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6">

        {activeTab === "editor" ? (
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* ---------------------------------------------------- */}
            {/* SECTION 1: CORE JOB DETAILS */}
            {/* ---------------------------------------------------- */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-zinc-800 shadow-sm transition-colors">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    General Role Information
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Define the job title, department category, and employment setup.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                
                {/* Hiring Company (Fetched from user profile) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="companyName" className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">
                      Hiring Company / Organization <span className="text-rose-500">*</span>
                    </label>
                    {session?.user && (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span>Fetched from user account</span>
                      </span>
                    )}
                  </div>
                  <div className="relative flex items-center">
                    <div className="absolute left-4 text-slate-400 pointer-events-none">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
                        <path d="M9 22v-4h6v4" />
                        <line x1="8" x2="8" y1="6" y2="6" />
                        <line x1="16" x2="16" y1="6" y2="6" />
                        <line x1="12" x2="12" y1="6" y2="6" />
                      </svg>
                    </div>
                    <input
                      id="companyName"
                      type="text"
                      value={companyName}
                      onChange={(e) => setCustomCompanyName(e.target.value)}
                      placeholder={sessionLoading ? "Fetching employer data..." : "e.g. Acme Innovations Inc."}
                      required
                      className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:bg-white dark:focus:bg-zinc-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1.5">
                    Retrieved from your employer profile. You can modify it if posting on behalf of a specific division.
                  </p>
                </div>

                {/* Job Title */}
                <div>
                  <label htmlFor="jobTitle" className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                    Job Title <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="jobTitle"
                      type="text"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="e.g. Senior Full-Stack Engineer"
                      required
                      className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:bg-white dark:focus:bg-zinc-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                    />
                  </div>

                  {/* Quick Title Suggestions */}
                  <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-medium text-slate-400 dark:text-zinc-500">Popular:</span>
                    {popularJobTitles.map((title) => (
                      <button
                        key={title}
                        type="button"
                        onClick={() => setJobTitle(title)}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200/60 dark:border-zinc-700 transition-colors cursor-pointer"
                      >
                        + {title}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category & Experience Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="category" className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                      Department / Category <span className="text-rose-500">*</span>
                    </label>
                    <select
                      id="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:bg-white dark:focus:bg-zinc-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer"
                    >
                      <option value="Engineering">Software Engineering & Tech</option>
                      <option value="Design">Product Design & Creative</option>
                      <option value="Product">Product Management</option>
                      <option value="Marketing">Marketing & Communications</option>
                      <option value="Data">Data Science & AI / ML</option>
                      <option value="Sales">Sales & Business Development</option>
                      <option value="Customer Support">Customer Success & Operations</option>
                      <option value="Finance">Finance, Legal & HR</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="experienceLevel" className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                      Experience Level <span className="text-rose-500">*</span>
                    </label>
                    <select
                      id="experienceLevel"
                      value={experienceLevel}
                      onChange={(e) => setExperienceLevel(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:bg-white dark:focus:bg-zinc-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer"
                    >
                      <option value="Entry Level (0-2 yrs)">Entry Level (0 - 2 yrs)</option>
                      <option value="Mid Level (3-5 yrs)">Mid Level (3 - 5 yrs)</option>
                      <option value="Senior Level (5-8 yrs)">Senior Level (5 - 8 yrs)</option>
                      <option value="Lead / Principal (8+ yrs)">Lead / Principal (8+ yrs)</option>
                      <option value="Executive / Director">Executive / Director</option>
                    </select>
                  </div>
                </div>

                {/* Employment Type Radios */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-2.5">
                    Employment Contract Type <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {["Full-time", "Part-time", "Contract", "Internship"].map((type) => {
                      const isSelected = employmentType === type;
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setEmploymentType(type)}
                          className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                            isSelected
                              ? "bg-blue-50/80 dark:bg-blue-950/50 border-blue-500 dark:border-blue-500 text-blue-600 dark:text-blue-400 font-bold ring-2 ring-blue-500/20"
                              : "bg-slate-50/60 dark:bg-zinc-800/60 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
                          }`}
                        >
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect width="20" height="14" x="2" y="7" rx="2" />
                            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                          </svg>
                          <span className="text-xs font-semibold">{type}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Workplace Policy Radios */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-2.5">
                    Workplace Policy <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      {
                        id: "Remote",
                        title: "100% Remote",
                        desc: "Work from anywhere globally",
                        icon: (
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="2" x2="22" y1="12" y2="12" />
                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                          </svg>
                        ),
                      },
                      {
                        id: "Hybrid",
                        title: "Hybrid Arrangement",
                        desc: "Mix of office & work-from-home",
                        icon: (
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                            <polyline points="9 22 9 12 15 12 15 22" />
                          </svg>
                        ),
                      },
                      {
                        id: "On-site",
                        title: "On-Site Office",
                        desc: "Based at company headquarters",
                        icon: (
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
                            <path d="M9 22v-4h6v4" />
                            <line x1="8" x2="8" y1="6" y2="6" />
                            <line x1="16" x2="16" y1="6" y2="6" />
                            <line x1="12" x2="12" y1="6" y2="6" />
                          </svg>
                        ),
                      },
                    ].map((item) => {
                      const isSelected = workplaceType === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setWorkplaceType(item.id)}
                          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3.5 ${
                            isSelected
                              ? "bg-blue-50/80 dark:bg-blue-950/50 border-blue-500 dark:border-blue-500 text-blue-600 dark:text-blue-400 ring-2 ring-blue-500/20"
                              : "bg-slate-50/60 dark:bg-zinc-800/60 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
                          }`}
                        >
                          <div className={`p-2 rounded-xl shrink-0 ${isSelected ? "bg-blue-500 text-white" : "bg-slate-200 dark:bg-zinc-700 text-slate-500 dark:text-zinc-400"}`}>
                            {item.icon}
                          </div>
                          <div>
                            <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                              {item.title}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                              {item.desc}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>

            {/* ---------------------------------------------------- */}
            {/* SECTION 2: LOCATION & COMPENSATION */}
            {/* ---------------------------------------------------- */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-zinc-800 shadow-sm transition-colors">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Location & Compensation Package
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Transparent salary ranges receive up to 40% more qualified applicants.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                
                {/* Office Location */}
                <div>
                  <label htmlFor="location" className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                    Primary Location / Region <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-4 text-slate-400 pointer-events-none">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                    </div>
                    <input
                      id="location"
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. San Francisco, CA or Worldwide (Remote)"
                      required
                      className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:bg-white dark:focus:bg-zinc-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                    />
                  </div>
                </div>

                {/* Salary Range Grid */}
                <div className="p-5 rounded-2xl bg-slate-50/70 dark:bg-zinc-800/50 border border-slate-200/60 dark:border-zinc-700/60 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
                    
                    {/* Currency */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                        Currency
                      </label>
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="w-full px-3 py-3 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs sm:text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500 cursor-pointer"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="BDT">BDT (৳)</option>
                        <option value="CAD">CAD ($)</option>
                      </select>
                    </div>

                    {/* Min Salary */}
                    <div>
                      <label htmlFor="minSalary" className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                        Minimum Salary
                      </label>
                      <input
                        id="minSalary"
                        type="number"
                        value={minSalary}
                        onChange={(e) => setMinSalary(e.target.value)}
                        placeholder="80000"
                        className="w-full px-3.5 py-3 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs sm:text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500"
                      />
                    </div>

                    {/* Max Salary */}
                    <div>
                      <label htmlFor="maxSalary" className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                        Maximum Salary
                      </label>
                      <input
                        id="maxSalary"
                        type="number"
                        value={maxSalary}
                        onChange={(e) => setMaxSalary(e.target.value)}
                        placeholder="120000"
                        className="w-full px-3.5 py-3 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs sm:text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500"
                      />
                    </div>

                    {/* Frequency */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                        Frequency
                      </label>
                      <select
                        value={salaryPeriod}
                        onChange={(e) => setSalaryPeriod(e.target.value)}
                        className="w-full px-3 py-3 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs sm:text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500 cursor-pointer"
                      >
                        <option value="Per Year">Per Year (Annual)</option>
                        <option value="Per Month">Per Month</option>
                        <option value="Per Hour">Per Hour (Contract)</option>
                      </select>
                    </div>

                  </div>

                  {/* Compensation Toggles */}
                  <div className="pt-3 border-t border-slate-200/60 dark:border-zinc-700/60 flex flex-wrap items-center gap-6">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showSalary}
                        onChange={(e) => setShowSalary(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-zinc-700 dark:bg-zinc-800"
                      />
                      <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                        Display salary publicly on job listing
                      </span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={equityIncluded}
                        onChange={(e) => setEquityIncluded(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-zinc-700 dark:bg-zinc-800"
                      />
                      <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                        Includes equity / stock grant options
                      </span>
                    </label>
                  </div>
                </div>

              </div>
            </div>

            {/* ---------------------------------------------------- */}
            {/* SECTION 3: SKILLS & QUALIFICATIONS (CHIP TAGS) */}
            {/* ---------------------------------------------------- */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-zinc-800 shadow-sm transition-colors">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-950/80 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Skills & Tech Stack Tags
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Add the core technologies, tools, and proficiencies required for this role.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                
                {/* Active Skill Chips */}
                <div className="flex flex-wrap items-center gap-2 p-3.5 rounded-2xl min-h-[56px] bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700">
                  {skills.length === 0 ? (
                    <span className="text-xs text-slate-400 dark:text-zinc-500">No skills added yet. Type below or click popular suggestions.</span>
                  ) : (
                    skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 shadow-2xs group"
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="hover:text-rose-500 dark:hover:text-rose-400 p-0.5 rounded-md hover:bg-white/40 transition-colors"
                          aria-label={`Remove ${skill}`}
                        >
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="18" x2="6" y1="6" y2="18" />
                            <line x1="6" x2="18" y1="6" y2="18" />
                          </svg>
                        </button>
                      </span>
                    ))
                  )}
                </div>

                {/* Add Custom Skill Input */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddSkill();
                        }
                      }}
                      placeholder="Type a skill (e.g. React, Python, Figma) and press Enter"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-blue-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddSkill()}
                    className="px-5 py-3 rounded-xl bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-xs sm:text-sm hover:bg-slate-800 dark:hover:bg-white transition-colors cursor-pointer shrink-0"
                  >
                    + Add Skill
                  </button>
                </div>

                {/* Quick Add Suggestions */}
                <div className="pt-2 flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500">Suggested:</span>
                  {quickSkillSuggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => handleAddSkill(suggestion)}
                      className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200/60 dark:border-zinc-700/60 transition-colors cursor-pointer"
                    >
                      + {suggestion}
                    </button>
                  ))}
                </div>

              </div>
            </div>

            {/* ---------------------------------------------------- */}
            {/* SECTION 4: JOB DESCRIPTION & RESPONSIBILITIES */}
            {/* ---------------------------------------------------- */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-zinc-800 shadow-sm transition-colors">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                  4
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Job Description & Role Mission
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Provide candidates with a clear, inspiring picture of the role and team goals.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                
                {/* Description Textarea */}
                <div>
                  <label htmlFor="description" className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                    Role Overview & Summary <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    rows={5}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the company mission, what the role achieves, and why top talent should join your team..."
                    required
                    className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:bg-white dark:focus:bg-zinc-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all leading-relaxed"
                  />
                </div>

                {/* Key Responsibilities Builder */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">
                      Key Responsibilities & Deliverables
                    </label>
                    <span className="text-[11px] font-semibold text-slate-400">{responsibilities.length} items added</span>
                  </div>

                  <div className="space-y-2 mb-3">
                    {responsibilities.map((resp, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/80 group"
                      >
                        <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-zinc-300 flex-1 leading-relaxed">
                          {resp}
                        </p>
                        <button
                          type="button"
                          onClick={() => handleRemoveResponsibility(idx)}
                          className="opacity-60 group-hover:opacity-100 hover:text-rose-500 dark:hover:text-rose-400 p-1 transition-all"
                          aria-label="Remove item"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" x2="6" y1="6" y2="18" />
                            <line x1="6" x2="18" y1="6" y2="18" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add New Responsibility Row */}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newResponsibility}
                      onChange={(e) => setNewResponsibility(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddResponsibility();
                        }
                      }}
                      placeholder="Add another responsibility (e.g. Lead sprint planning and daily standups)"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddResponsibility}
                      className="px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer shrink-0"
                    >
                      + Add
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* ---------------------------------------------------- */}
            {/* SECTION 5: PROMOTIONS & SETTINGS */}
            {/* ---------------------------------------------------- */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-zinc-800 shadow-sm transition-colors">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  5
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Application Route & Visibility Options
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Set application deadline and optional priority promotion.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                <div>
                  <label htmlFor="applicationEmail" className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                    Application Routing Email / Forwarding
                  </label>
                  <input
                    id="applicationEmail"
                    type="email"
                    value={applicationEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    placeholder="hiring@company.com"
                    className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="applicationDeadline" className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                    Application Deadline
                  </label>
                  <input
                    id="applicationDeadline"
                    type="date"
                    value={applicationDeadline}
                    onChange={(e) => setApplicationDeadline(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Promotion Badges Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50/60 to-orange-50/60 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200/70 dark:border-amber-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      Featured Listing Badge
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-zinc-400">
                      Pin this job to the top of search results and highlight it with a gold featured badge.
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setIsFeatured(!isFeatured)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                      isFeatured ? "bg-amber-500" : "bg-slate-300 dark:bg-zinc-700"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isFeatured ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
                    {isFeatured ? "Featured Active" : "Standard"}
                  </span>
                </div>
              </div>

            </div>

            {/* ---------------------------------------------------- */}
            {/* STICKY BOTTOM ACTIONS BAR */}
            {/* ---------------------------------------------------- */}
            <div className="sticky bottom-6 z-30 p-4 rounded-3xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-zinc-800 shadow-2xl shadow-slate-900/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>All changes auto-cached locally</span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => showToast("Draft successfully saved!")}
                  className="px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs sm:text-sm font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  Save as Draft
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("preview")}
                  className="px-4 py-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-xs sm:text-sm font-bold border border-blue-200/80 dark:border-blue-800/60 transition-colors cursor-pointer"
                >
                  Preview Card
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/35 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                        <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75" />
                      </svg>
                      <span>Publishing Job...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="22" x2="11" y1="2" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                      <span>Publish Job Opening</span>
                    </>
                  )}
                </button>
              </div>

            </div>

          </form>
        ) : (
          /* ======================================================== */
          /* LIVE CANDIDATE CARD PREVIEW TAB */
          /* ======================================================== */
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/70 dark:border-blue-900/40 flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-xs text-blue-700 dark:text-blue-300 font-semibold">
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <span>This is how your job posting appears to candidates in the HireMe feed and search results.</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab("editor")}
                className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 font-bold text-xs hover:bg-blue-600 hover:text-white transition-colors cursor-pointer shadow-2xs border border-blue-200 dark:border-zinc-700 shrink-0"
              >
                Back to Editor
              </button>
            </div>

            {/* Candidate Listing Card Preview */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl border border-slate-200/90 dark:border-zinc-800 shadow-xl shadow-slate-900/5 transition-all">
              
              {/* Header Badges */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    {category}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
                    {employmentType}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    {workplaceType}
                  </span>
                </div>

                {isFeatured && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs">
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    <span>Featured Job</span>
                  </span>
                )}
              </div>

              {/* Job Title & Company */}
              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white font-black text-xl shadow-md shadow-blue-500/25 shrink-0 overflow-hidden">
                  {session?.user?.image ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={session.user.image}
                      alt={companyName || "Company"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    (companyName || jobTitle || "H")[0].toUpperCase()
                  )}
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    {jobTitle || "Job Title Preview"}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
                    <span className="font-semibold text-slate-700 dark:text-zinc-300">
                      {companyName || session?.user?.companyName || session?.user?.name || "Your Company Name"}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      {location || "Location Not Specified"}
                    </span>
                    <span>•</span>
                    <span>{experienceLevel}</span>
                  </div>
                </div>
              </div>

              {/* Compensation Pill */}
              {showSalary && minSalary && maxSalary && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/60 mb-6 font-bold text-sm">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" x2="12" y1="2" y2="22" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                  <span>
                    {currency} {Number(minSalary).toLocaleString()} – {currency} {Number(maxSalary).toLocaleString()} {salaryPeriod}
                  </span>
                  {equityIncluded && (
                    <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200">
                      + Equity
                    </span>
                  )}
                </div>
              )}

              {/* Description Preview */}
              <div className="space-y-4 mb-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">About the Role</h4>
                <p className="text-sm text-slate-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
                  {description}
                </p>
              </div>

              {/* Responsibilities Preview */}
              {responsibilities.length > 0 && (
                <div className="space-y-3 mb-6">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Key Responsibilities</h4>
                  <ul className="space-y-2">
                    {responsibilities.map((resp, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-zinc-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 mt-2 shrink-0" />
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Skills Tags */}
              {skills.length > 0 && (
                <div className="space-y-2 mb-8">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Required Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 rounded-xl text-xs font-bold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200/80 dark:border-zinc-700"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons Mock */}
              <div className="pt-6 border-t border-slate-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-4">
                <span className="text-xs text-slate-400">
                  Applications close: <span className="font-bold text-slate-700 dark:text-zinc-300">{applicationDeadline}</span>
                </span>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className="p-3 rounded-xl border border-slate-200 dark:border-zinc-700 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
                    aria-label="Bookmark preview"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white font-bold text-sm shadow-md shadow-blue-500/25"
                  >
                    Apply for this Position
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>

    </div>
  );
}
