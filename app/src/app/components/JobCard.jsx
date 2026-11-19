"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function JobCard({
  job,
  onSave,
  onViewDetails,
}) {
  const [isSaved, setIsSaved] = useState(false);
  const [saveAnimating, setSaveAnimating] = useState(false);

  if (!job) return null;

  const handleSaveClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSaved(!isSaved);
    setSaveAnimating(true);
    setTimeout(() => setSaveAnimating(false), 400);
    if (onSave) {
      onSave(job);
    }
  };

  // Safe fallback values
  const companyName = job.companyName || "Top Employer";
  const jobTitle = job.jobTitle || "Software Engineer";
  const location = job.location || "Remote / Worldwide";
  const category = job.category || "Technology";
  const workplaceType = job.workplaceType || "Remote";
  const employmentType = job.employmentType || "Full-time";
  const description =
    job.description ||
    "Join our high-performing team to build scalable, mission-critical digital products and solve real-world problems.";
  const skills = Array.isArray(job.skills) ? job.skills : ["React", "Next.js", "TypeScript"];
  const displaySkills = skills.slice(0, 3);
  const remainingSkillsCount = skills.length - 3;
  const initial = (companyName || jobTitle || "H")[0].toUpperCase();

  // Date formatting
  const formattedDate = job.createdAt
    ? new Date(job.createdAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })
    : "Recently";

  return (
    <div className="group relative rounded-3xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-zinc-800 shadow-md hover:shadow-2xl hover:border-blue-500/50 dark:hover:border-blue-500/40 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden">
      
      {/* Subtle Card Ambient Glow on Hover */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Top Banner Accent Line for Featured / Urgent */}
      {job.isFeatured && (
        <div className="h-1 w-full bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500" />
      )}
      {!job.isFeatured && job.isUrgent && (
        <div className="h-1 w-full bg-gradient-to-r from-rose-500 via-red-500 to-rose-600" />
      )}

      {/* Card Content Area */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
        
        <div>
          {/* Header: Company Monogram + Badges + Save Button */}
          <div className="flex items-start justify-between gap-3 mb-4">
            
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white font-black text-lg shadow-sm shadow-blue-500/20 shrink-0 group-hover:scale-105 transition-transform">
                {initial}
              </div>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-bold text-slate-700 dark:text-zinc-300 truncate">
                  {companyName}
                </h4>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  <svg className="w-3.5 h-3.5 shrink-0 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span className="truncate">{location}</span>
                </div>
              </div>
            </div>

            {/* Save / Bookmark Button */}
            <button
              type="button"
              onClick={handleSaveClick}
              title={isSaved ? "Remove from saved jobs" : "Save this job"}
              aria-label={isSaved ? "Remove from saved jobs" : "Save this job"}
              className={`p-2.5 rounded-2xl border transition-all cursor-pointer shrink-0 ${
                saveAnimating ? "scale-125" : "scale-100"
              } ${
                isSaved
                  ? "bg-rose-50 dark:bg-rose-950/60 text-rose-500 border-rose-200 dark:border-rose-900/60 shadow-xs"
                  : "bg-slate-50 dark:bg-zinc-800/80 text-slate-400 hover:text-rose-500 hover:bg-rose-50/80 dark:hover:bg-rose-950/30 border-slate-200/80 dark:border-zinc-700/80"
              }`}
            >
              <svg
                className={`w-4 h-4 transition-transform ${isSaved ? "fill-rose-500 text-rose-500" : "fill-none"}`}
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
              </svg>
            </button>

          </div>

          {/* Badges Strip */}
          <div className="flex flex-wrap items-center gap-1.5 mb-3">
            {job.isFeatured && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                ★ Featured
              </span>
            )}
            {job.isUrgent && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                ⚡ Urgent
              </span>
            )}
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/50">
              {category}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
              {workplaceType}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
              {employmentType}
            </span>
          </div>

          {/* Job Title */}
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
            {jobTitle}
          </h3>

          {/* Brief Snippet */}
          <p className="text-xs text-slate-600 dark:text-zinc-400 line-clamp-2 mt-2 leading-relaxed">
            {description}
          </p>

          {/* Tech Stack Chips */}
          {displaySkills.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 mt-3.5">
              {displaySkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-[11px] font-medium border border-slate-200/70 dark:border-zinc-700/70"
                >
                  {skill}
                </span>
              ))}
              {remainingSkillsCount > 0 && (
                <span className="px-2 py-0.5 rounded-lg bg-slate-50 dark:bg-zinc-800/50 text-slate-500 dark:text-zinc-400 text-[10px] font-bold border border-slate-200/50 dark:border-zinc-700/50">
                  +{remainingSkillsCount} more
                </span>
              )}
            </div>
          )}

        </div>

        {/* Bottom Card Footer: Compensation & View Details Button */}
        <div className="pt-4 mt-5 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between gap-3">
          
          {/* Compensation Pill */}
          <div className="min-w-0">
            {job.showSalary && (job.minSalary || job.maxSalary) ? (
              <div>
                <div className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400 truncate">
                  {job.currency || "USD"}{" "}
                  {Number(job.minSalary).toLocaleString()}
                  {job.maxSalary && job.maxSalary !== job.minSalary
                    ? ` – ${Number(job.maxSalary).toLocaleString()}`
                    : ""}
                </div>
                <span className="block text-[10px] text-slate-400 dark:text-zinc-500 font-medium">
                  {job.salaryPeriod || "Per Year"}
                  {job.equityIncluded ? " • Equity" : ""}
                </span>
              </div>
            ) : (
              <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
                Competitive Salary
              </span>
            )}
          </div>

          {/* View Details Action Button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onViewDetails && onViewDetails(job)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-bold text-xs sm:text-sm shadow-sm shadow-blue-500/20 hover:shadow-md hover:shadow-blue-500/30 transition-all flex items-center gap-1.5 cursor-pointer shrink-0 group/btn"
            >
              <span>View Details</span>
              <svg
                className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform"
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

      </div>

    </div>
  );
}
