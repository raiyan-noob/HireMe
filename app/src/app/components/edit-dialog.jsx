"use client";

import React, { useState, useEffect } from "react";

export default function EditDialog({
  isOpen,
  onClose,
  onSave,
  job,
  isSaving = false,
}) {
  // Form State initialized from job
  const [jobTitle, setJobTitle] = useState(job?.jobTitle || "");
  const [category, setCategory] = useState(job?.category || "Engineering");
  const [employmentType, setEmploymentType] = useState(job?.employmentType || "Full-time");
  const [workplaceType, setWorkplaceType] = useState(job?.workplaceType || "Remote");
  const [location, setLocation] = useState(job?.location || "");
  const [currency, setCurrency] = useState(job?.currency || "USD");
  const [minSalary, setMinSalary] = useState(job?.minSalary ? String(job.minSalary) : "");
  const [maxSalary, setMaxSalary] = useState(job?.maxSalary ? String(job.maxSalary) : "");
  const [salaryPeriod, setSalaryPeriod] = useState(job?.salaryPeriod || "Per Year");
  const [showSalary, setShowSalary] = useState(job?.showSalary ?? true);
  const [equityIncluded, setEquityIncluded] = useState(job?.equityIncluded ?? false);
  const [experienceLevel, setExperienceLevel] = useState(job?.experienceLevel || "Mid Level (3-5 yrs)");
  const [skills, setSkills] = useState(Array.isArray(job?.skills) ? job.skills : []);
  const [skillInput, setSkillInput] = useState("");
  const [description, setDescription] = useState(job?.description || "");
  const [responsibilities, setResponsibilities] = useState(
    Array.isArray(job?.responsibilities) ? job.responsibilities : []
  );
  const [newResponsibility, setNewResponsibility] = useState("");
  const [applicationEmail, setApplicationEmail] = useState(job?.applicationEmail || "");
  const [applicationDeadline, setApplicationDeadline] = useState(job?.applicationDeadline || "");
  const [isFeatured, setIsFeatured] = useState(job?.isFeatured ?? false);
  const [isUrgent, setIsUrgent] = useState(job?.isUrgent ?? false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen && !isSaving) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSaving, onClose]);

  if (!isOpen || !job) return null;

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

  // Responsibility handlers
  const handleAddResponsibility = () => {
    if (newResponsibility.trim()) {
      setResponsibilities([...responsibilities, newResponsibility.trim()]);
      setNewResponsibility("");
    }
  };

  const handleRemoveResponsibility = (index) => {
    setResponsibilities(responsibilities.filter((_, i) => i !== index));
  };

  // Form submission handler
  const handleSubmit = (e) => {
    e.preventDefault();

    const updatedData = {
      ...job,
      _id: job?._id || job?.id,
      jobTitle: jobTitle.trim(),
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
      applicationEmail: applicationEmail.trim(),
      applicationDeadline,
      isFeatured,
      isUrgent,
      updatedAt: new Date().toISOString(),
    };

    if (onSave) {
      onSave(updatedData);
    }
  };

  const categories = [
    "Engineering",
    "Product Management",
    "Design & Creative",
    "Marketing & Growth",
    "Sales & BizDev",
    "Customer Support",
    "Finance & Accounting",
    "Operations & HR",
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/65 backdrop-blur-md animate-in fade-in duration-200"
      onClick={() => {
        if (!isSaving) onClose();
      }}
    >
      <div
        className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xl p-6 sm:p-8 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-5 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60 flex items-center justify-center shrink-0 shadow-xs">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            </div>
            <div>
              <h2 id="edit-dialog-title" className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Edit Job Opening
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Update specifications for <strong className="text-slate-700 dark:text-zinc-200">{job.jobTitle}</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="p-2 rounded-2xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-50"
            aria-label="Close dialog"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-6 pt-5">
          
          {/* Section: Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="edit-jobTitle" className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                Job Title <span className="text-rose-500">*</span>
              </label>
              <input
                id="edit-jobTitle"
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-800 transition-all"
              />
            </div>

            <div>
              <label htmlFor="edit-category" className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                Category
              </label>
              <select
                id="edit-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-500 cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section: Workplace, Type, Location */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="edit-workplaceType" className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                Workplace Setup
              </label>
              <select
                id="edit-workplaceType"
                value={workplaceType}
                onChange={(e) => setWorkplaceType(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
              </select>
            </div>

            <div>
              <label htmlFor="edit-employmentType" className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                Employment Type
              </label>
              <select
                id="edit-employmentType"
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>

            <div>
              <label htmlFor="edit-location" className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                Location / City <span className="text-rose-500">*</span>
              </label>
              <input
                id="edit-location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-800 transition-all"
              />
            </div>
          </div>

          {/* Section: Compensation */}
          <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-800 space-y-4">
            <span className="text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider block">
              Compensation Range
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label htmlFor="edit-currency" className="block text-[11px] font-semibold text-slate-500 dark:text-zinc-400 mb-1">
                  Currency
                </label>
                <select
                  id="edit-currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-slate-900 dark:text-white outline-none"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="CAD">CAD ($)</option>
                  <option value="AUD">AUD ($)</option>
                </select>
              </div>

              <div>
                <label htmlFor="edit-minSalary" className="block text-[11px] font-semibold text-slate-500 dark:text-zinc-400 mb-1">
                  Min Salary
                </label>
                <input
                  id="edit-minSalary"
                  type="number"
                  value={minSalary}
                  onChange={(e) => setMinSalary(e.target.value)}
                  placeholder="e.g. 80000"
                  className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div>
                <label htmlFor="edit-maxSalary" className="block text-[11px] font-semibold text-slate-500 dark:text-zinc-400 mb-1">
                  Max Salary
                </label>
                <input
                  id="edit-maxSalary"
                  type="number"
                  value={maxSalary}
                  onChange={(e) => setMaxSalary(e.target.value)}
                  placeholder="e.g. 120000"
                  className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div>
                <label htmlFor="edit-salaryPeriod" className="block text-[11px] font-semibold text-slate-500 dark:text-zinc-400 mb-1">
                  Frequency
                </label>
                <select
                  id="edit-salaryPeriod"
                  value={salaryPeriod}
                  onChange={(e) => setSalaryPeriod(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-slate-900 dark:text-white outline-none"
                >
                  <option value="Per Year">Per Year</option>
                  <option value="Per Month">Per Month</option>
                  <option value="Per Hour">Per Hour</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showSalary}
                  onChange={(e) => setShowSalary(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
                />
                <span>Display salary on public card</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={equityIncluded}
                  onChange={(e) => setEquityIncluded(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
                />
                <span>Includes equity / stock options</span>
              </label>
            </div>
          </div>

          {/* Section: Experience & Tech Stack */}
          <div>
            <div className="mb-4">
              <label htmlFor="edit-experienceLevel" className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                Experience Level
              </label>
              <select
                id="edit-experienceLevel"
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="Entry Level (0-2 yrs)">Entry Level (0-2 yrs)</option>
                <option value="Mid Level (3-5 yrs)">Mid Level (3-5 yrs)</option>
                <option value="Senior Level (5-8 yrs)">Senior Level (5-8 yrs)</option>
                <option value="Lead / Staff (8+ yrs)">Lead / Staff (8+ yrs)</option>
                <option value="Executive / Director">Executive / Director</option>
              </select>
            </div>

            {/* Skills Chips */}
            <div>
              <label htmlFor="edit-skillInput" className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                Tech Stack & Required Skills
              </label>
              <div className="flex flex-wrap items-center gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 min-h-[50px] mb-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 text-xs font-bold border border-slate-200 dark:border-zinc-700 shadow-2xs"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-slate-400 hover:text-rose-500 font-bold ml-0.5 cursor-pointer"
                    >
                      ✕
                    </button>
                  </span>
                ))}
                <input
                  id="edit-skillInput"
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  placeholder="Type skill & press Enter..."
                  className="flex-1 min-w-[140px] bg-transparent outline-none text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Section: Description */}
          <div>
            <label htmlFor="edit-description" className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
              Role Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="edit-description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-sm font-medium text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-800 transition-all leading-relaxed"
            />
          </div>

          {/* Section: Responsibilities */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
              Key Responsibilities
            </label>
            <div className="space-y-2 mb-3">
              {responsibilities.map((r, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/70 dark:border-zinc-700/70 text-xs text-slate-700 dark:text-zinc-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                  <span className="flex-1">{r}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveResponsibility(idx)}
                    className="text-slate-400 hover:text-rose-500 text-xs px-1 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

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
                placeholder="Add another responsibility & press enter..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-slate-900 dark:text-white outline-none"
              />
              <button
                type="button"
                onClick={handleAddResponsibility}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-bold cursor-pointer transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          {/* Section: Routing Email & Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="edit-applicationEmail" className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                Routing Email
              </label>
              <input
                id="edit-applicationEmail"
                type="email"
                value={applicationEmail}
                onChange={(e) => setApplicationEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="edit-applicationDeadline" className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                Application Deadline
              </label>
              <input
                id="edit-applicationDeadline"
                type="date"
                value={applicationDeadline}
                onChange={(e) => setApplicationDeadline(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Section: Priority Promotion Toggles */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50/60 to-orange-50/60 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200/70 dark:border-amber-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shrink-0">
                ★
              </div>
              <div>
                <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                  Featured & Urgent Promotion
                </h4>
                <p className="text-[11px] text-amber-700 dark:text-amber-400">
                  Boost listing visibility at the top of candidate feeds.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-600 border-amber-300"
                />
                <span>Featured</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-bold text-rose-800 dark:text-rose-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isUrgent}
                  onChange={(e) => setIsUrgent(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-600 border-rose-300"
                />
                <span>Urgent Hire</span>
              </label>
            </div>
          </div>

          {/* Modal Actions Footer */}
          <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs sm:text-sm font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/25 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <svg
                    className="w-4 h-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75" />
                  </svg>
                  <span>Updating Job...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                    <polyline points="17 21 17 13 7 13 7 21" />
                    <polyline points="7 3 7 8 15 8" />
                  </svg>
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
