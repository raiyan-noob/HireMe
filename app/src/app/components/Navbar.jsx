"use client";

import React, { useState, useEffect, useRef, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";

// Hydration-safe mounted detector without setState in effect
const subscribeNoop = () => () => {};
const useIsMounted = () =>
  useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false
  );

// Theme subscription & snapshot helpers
const subscribeTheme = (callback) => {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  window.addEventListener("hireme-theme-change", callback);
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  mediaQuery.addEventListener("change", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("hireme-theme-change", callback);
    mediaQuery.removeEventListener("change", callback);
  };
};

const getThemeSnapshot = () => {
  if (typeof window === "undefined") return false;
  const storedTheme = localStorage.getItem("hireme-theme");
  if (storedTheme) {
    return storedTheme === "dark";
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
};

const getServerSnapshot = () => false;

const Navbar = () => {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const dropdownRef = useRef(null);

  const { data: session, isPending } = useSession();
  const isMounted = useIsMounted();
  const isDark = useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    getServerSnapshot
  );

  // Sync the DOM html class with the active theme
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  // Handle scroll detection for glassmorphism
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleTheme = () => {
    const currentTheme = getThemeSnapshot();
    const nextDark = !currentTheme;

    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("hireme-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("hireme-theme", "light");
    }
    // Dispatch custom event to notify useSyncExternalStore
    window.dispatchEvent(new Event("hireme-theme-change"));
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      setProfileDropdownOpen(false);
      setMobileMenuOpen(false);
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Sign out error:", err);
    } finally {
      setSigningOut(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const getRoleBadge = (role) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return {
          label: "Admin",
          bg: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/50 dark:text-violet-300 dark:border-violet-800",
        };
      case "employer":
        return {
          label: "Employer",
          bg: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800",
        };
      default:
        return {
          label: "Candidate",
          bg: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800",
        };
    }
  };

  const roleBadge = getRoleBadge(session?.user?.role);

  // Nav links data
  const navLinks = [
    { name: "Browse Jobs", href: "/jobs", badge: "New" },
    { name: "Company", href: "/company" },
    { name: "Pricing", href: "/pricing" },
  ];

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? isDark
            ? "bg-zinc-950/85 border-b border-zinc-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.5)] backdrop-blur-xl"
            : "bg-white/85 border-b border-zinc-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.06)] backdrop-blur-xl"
          : isDark
          ? "bg-zinc-950/50 border-b border-transparent backdrop-blur-md"
          : "bg-white/60 border-b border-transparent backdrop-blur-md"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo / Brand */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="group flex items-center gap-2.5 focus:outline-none"
            >
              {/* Modern Icon Badge */}
              <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 group-hover:scale-105 transition-all duration-300">
                {/* Briefcase & Upward Arrow glyph */}
                <svg
                  className="w-5 h-5 text-white transform transition-transform duration-300 group-hover:-rotate-3"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                  <circle cx="12" cy="13" r="1.5" fill="currentColor" />
                </svg>
                {/* Corner Sparkle / Pip */}
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500 ring-2 ring-white dark:ring-zinc-900"></span>
                </span>
              </div>

              {/* Brand Text */}
              <div className="flex flex-col">
                <span className="text-2xl font-black tracking-tight flex items-center">
                  <span
                    className={
                      isDark
                        ? "text-white"
                        : "text-zinc-900"
                    }
                  >
                    Hire
                  </span>
                  <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-500 bg-clip-text text-transparent">
                    Me
                  </span>
                </span>
                <span
                  className={`text-[10px] font-medium tracking-wider uppercase -mt-1 ${
                    isDark ? "text-zinc-400" : "text-zinc-500"
                  }`}
                >
                  Job Portal
                </span>
              </div>
            </Link>

            {/* Hiring Pill Indicator */}
            <div
              className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ml-2 border transition-colors ${
                isDark
                  ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                  : "bg-blue-50 text-blue-600 border-blue-200"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
              2.5k+ Live Jobs
            </div>
          </div>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`relative px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 group ${
                  isDark
                    ? "text-zinc-300 hover:text-white hover:bg-zinc-800/60"
                    : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100/80"
                }`}
              >
                <span>{link.name}</span>
                {link.badge && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs">
                    {link.badge}
                  </span>
                )}
                {/* Subtle Hover underline bar */}
                <span className="absolute bottom-0.5 left-4 right-4 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full opacity-0 scale-x-0 group-hover:opacity-100 group-hover:scale-x-100 transition-all duration-300 origin-center" />
              </Link>
            ))}
          </nav>

          {/* Right Action Elements */}
          <div className="hidden md:flex items-center gap-3">
            {/* Unique Interactive Dark/Light Mode Toggle */}
            <button
              onClick={toggleTheme}
              type="button"
              aria-label="Toggle light and dark mode"
              className={`relative flex items-center h-10 w-18 p-1 rounded-full transition-all duration-300 cursor-pointer border ${
                isDark
                  ? "bg-zinc-900 border-zinc-700/80 shadow-inner"
                  : "bg-zinc-100 border-zinc-300/80 shadow-inner"
              }`}
            >
              {/* Background icon hints */}
              <div className="flex w-full justify-between px-1.5 items-center text-zinc-400">
                {/* Sun icon hint */}
                <svg
                  className={`w-3.5 h-3.5 transition-opacity duration-200 ${
                    !isDark ? "opacity-0" : "opacity-70 text-amber-400"
                  }`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                </svg>
                {/* Moon icon hint */}
                <svg
                  className={`w-3.5 h-3.5 transition-opacity duration-200 ${
                    isDark ? "opacity-0" : "opacity-70 text-indigo-500"
                  }`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                </svg>
              </div>

              {/* Sliding Switch Knob with Active Icon */}
              <div
                className={`absolute top-1 left-1 w-8 h-8 rounded-full flex items-center justify-center transform transition-transform duration-300 shadow-md ${
                  isDark
                    ? "translate-x-8 bg-zinc-800 text-indigo-400 shadow-indigo-900/40 border border-zinc-700"
                    : "translate-x-0 bg-white text-amber-500 shadow-zinc-300/60 border border-zinc-200"
                }`}
              >
                {isMounted ? (
                  isDark ? (
                    <svg
                      className="w-4 h-4 transform -rotate-12 transition-transform duration-300"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      stroke="currentColor"
                      strokeWidth="1"
                    >
                      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4 transform rotate-45 transition-transform duration-300"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="4" fill="currentColor" />
                      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                    </svg>
                  )
                ) : (
                  <div className="w-4 h-4" />
                )}
              </div>
            </button>

            {/* Authenticated User Profile Dropdown OR Sign-in/Sign-up Buttons */}
            {isMounted && session?.user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  aria-expanded={profileDropdownOpen}
                  aria-label="User profile menu"
                  className={`flex items-center gap-2.5 p-1.5 pr-3 rounded-full border transition-all duration-200 cursor-pointer ${
                    isDark
                      ? "bg-zinc-900/90 hover:bg-zinc-800/90 border-zinc-700/80 shadow-sm"
                      : "bg-white hover:bg-slate-50 border-slate-200/90 shadow-sm"
                  }`}
                >
                  {/* Avatar */}
                  {session.user.image ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={session.user.image}
                      alt={session.user.name || "User Avatar"}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-500/30"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 text-white font-bold text-xs flex items-center justify-center shadow-xs ring-2 ring-blue-500/20">
                      {getInitials(session.user.name || session.user.email)}
                    </div>
                  )}

                  {/* Name & Role label */}
                  <div className="flex flex-col text-left">
                    <span
                      className={`text-xs font-bold leading-tight max-w-[110px] truncate ${
                        isDark ? "text-white" : "text-slate-900"
                      }`}
                    >
                      {session.user.name || session.user.email?.split("@")[0]}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400 dark:text-zinc-500 capitalize">
                      {session.user.role || "Candidate"}
                    </span>
                  </div>

                  {/* Chevron Icon */}
                  <svg
                    className={`w-3.5 h-3.5 transition-transform duration-200 text-slate-400 dark:text-zinc-500 ${
                      profileDropdownOpen ? "rotate-180" : ""
                    }`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>

                {/* Floating Glassmorphic Profile Menu */}
                {profileDropdownOpen && (
                  <div
                    className={`absolute right-0 mt-2 w-64 rounded-2xl p-2 border shadow-2xl backdrop-blur-2xl transition-all z-50 ${
                      isDark
                        ? "bg-zinc-900/95 border-zinc-800 shadow-black/70 text-zinc-200"
                        : "bg-white/95 border-slate-200/90 shadow-slate-300/40 text-slate-700"
                    }`}
                  >
                    {/* User Info Header Card */}
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 mb-1 border border-slate-100 dark:border-zinc-800">
                      <div className="flex items-center gap-3">
                        {session.user.image ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={session.user.image}
                            alt={session.user.name || "User"}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500/30 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
                            {getInitials(session.user.name || session.user.email)}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-sm text-slate-900 dark:text-white truncate">
                            {session.user.name || "User"}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-zinc-400 truncate">
                            {session.user.email}
                          </div>
                        </div>
                      </div>

                      {/* Account Role Badge */}
                      <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-zinc-700/60 flex items-center justify-between">
                        <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                          Role
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${roleBadge.bg}`}
                        >
                          {roleBadge.label}
                        </span>
                      </div>
                    </div>

                    {/* Quick Profile Nav Items */}
                    <div className="space-y-0.5 py-1">
                      <Link
                        href="/jobs"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <svg
                          className="w-4 h-4 text-slate-400 dark:text-zinc-500"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                        </svg>
                        <span>Applied Jobs</span>
                      </Link>

                      {session.user.role === "admin" && (
                        <div className="px-3 py-2 rounded-xl text-xs font-semibold bg-violet-50/50 dark:bg-violet-950/20 text-violet-700 dark:text-violet-300 flex items-center gap-2.5">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                          </svg>
                          <span>Admin Console Active</span>
                        </div>
                      )}
                    </div>

                    {/* Sign Out Button */}
                    <div className="pt-1 mt-1 border-t border-slate-100 dark:border-zinc-800">
                      <button
                        type="button"
                        onClick={handleSignOut}
                        disabled={signingOut}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer disabled:opacity-60"
                      >
                        {signingOut ? (
                          <>
                            <svg
                              className="animate-spin w-4 h-4 text-rose-500"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                            <span>Signing out...</span>
                          </>
                        ) : (
                          <>
                            <svg
                              className="w-4 h-4"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                              <polyline points="16 17 21 12 16 7" />
                              <line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                            <span>Sign Out</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : isMounted && !isPending ? (
              <>
                {/* Log in Button */}
                <Link
                  href="/Login"
                  className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isDark
                      ? "text-zinc-200 hover:text-white hover:bg-zinc-800/80 border border-transparent hover:border-zinc-700"
                      : "text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 border border-transparent hover:border-zinc-200"
                  }`}
                >
                  Log in
                </Link>

                {/* Get Started Button */}
                <Link
                  href="/SignUp"
                  className="group relative inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-300 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:via-indigo-500 hover:to-violet-500 shadow-md shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] overflow-hidden"
                >
                  {/* Subtle shining light beam on hover */}
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
                  
                  <span className="relative">Get Started</span>
                  <svg
                    className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5"
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
                </Link>
              </>
            ) : (
              <div className="w-28 h-9 rounded-xl bg-slate-100 dark:bg-zinc-800/60 animate-pulse" />
            )}
          </div>

          {/* Mobile Actions & Menu Toggle */}
          <div className="flex md:hidden items-center gap-2">
            {/* Quick theme toggle for mobile header */}
            <button
              onClick={toggleTheme}
              type="button"
              aria-label="Toggle theme"
              className={`p-2.5 rounded-xl border transition-colors ${
                isDark
                  ? "bg-zinc-900 border-zinc-800 text-amber-400 hover:bg-zinc-800"
                  : "bg-zinc-100 border-zinc-200 text-zinc-700 hover:bg-zinc-200"
              }`}
            >
              {isDark ? (
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                </svg>
              )}
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              type="button"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
              className={`p-2.5 rounded-xl border transition-colors ${
                isDark
                  ? "bg-zinc-900 border-zinc-800 text-zinc-200 hover:bg-zinc-800"
                  : "bg-zinc-100 border-zinc-200 text-zinc-800 hover:bg-zinc-200"
              }`}
            >
              <svg
                className="w-5 h-5 transition-transform duration-300"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {mobileMenuOpen ? (
                  <>
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </>
                ) : (
                  <>
                    <line x1="4" x2="20" y1="12" y2="12" />
                    <line x1="4" x2="20" y1="6" y2="6" />
                    <line x1="4" x2="20" y1="18" y2="18" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown Drawer */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out border-b ${
          mobileMenuOpen ? "max-h-[600px] opacity-100 py-5" : "max-h-0 opacity-0 py-0"
        } ${
          isDark
            ? "bg-zinc-950/95 border-zinc-800 backdrop-blur-2xl"
            : "bg-white/95 border-zinc-200 backdrop-blur-2xl"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-3">
          {/* Mobile User Profile (When Logged In) */}
          {isMounted && session?.user && (
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3 min-w-0">
                {session.user.image ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500/30 shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
                    {getInitials(session.user.name || session.user.email)}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="font-bold text-sm text-slate-900 dark:text-white truncate">
                    {session.user.name || "User"}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-zinc-400 truncate">
                    {session.user.email}
                  </div>
                </div>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${roleBadge.bg}`}
              >
                {roleBadge.label}
              </span>
            </div>
          )}

          {/* Navigation Links */}
          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-base font-semibold transition-colors ${
                  isDark
                    ? "text-zinc-200 hover:bg-zinc-900 hover:text-white"
                    : "text-zinc-800 hover:bg-zinc-100 hover:text-zinc-950"
                }`}
              >
                <span>{link.name}</span>
                {link.badge ? (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                    {link.badge}
                  </span>
                ) : (
                  <svg
                    className={`w-4 h-4 ${isDark ? "text-zinc-500" : "text-zinc-400"}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                )}
              </Link>
            ))}
          </div>

          {/* Divider */}
          <div
            className={`border-t my-3 ${
              isDark ? "border-zinc-800" : "border-zinc-200"
            }`}
          />

          {/* Theme Toggle in Mobile Drawer */}
          <div className="flex items-center justify-between px-4 py-2">
            <span
              className={`text-sm font-semibold ${
                isDark ? "text-zinc-300" : "text-zinc-700"
              }`}
            >
              Appearance
            </span>
            <button
              onClick={toggleTheme}
              type="button"
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                isDark
                  ? "bg-zinc-900 border-zinc-700 text-zinc-200"
                  : "bg-zinc-100 border-zinc-300 text-zinc-800"
              }`}
            >
              {isDark ? (
                <>
                  <svg
                    className="w-3.5 h-3.5 text-indigo-400"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                  </svg>
                  <span>Dark Mode</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-3.5 h-3.5 text-amber-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <circle cx="12" cy="12" r="4" fill="currentColor" />
                    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                  </svg>
                  <span>Light Mode</span>
                </>
              )}
            </button>
          </div>

          {/* Mobile Auth Actions: Sign Out when logged in, or Login/Register when logged out */}
          <div className="pt-2 flex flex-col gap-2.5">
            {isMounted && session?.user ? (
              <button
                type="button"
                onClick={handleSignOut}
                disabled={signingOut}
                className="w-full py-3 px-4 text-center rounded-xl text-sm font-bold border border-rose-200 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {signingOut ? (
                  <>
                    <svg
                      className="animate-spin w-4 h-4 text-rose-500"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Signing out...</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    <span>Sign Out</span>
                  </>
                )}
              </button>
            ) : isMounted && !isPending ? (
              <>
                <Link
                  href="/Login"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`w-full py-3 text-center rounded-xl text-sm font-semibold border transition-colors ${
                    isDark
                      ? "border-zinc-800 text-zinc-200 hover:bg-zinc-900"
                      : "border-zinc-300 text-zinc-800 hover:bg-zinc-100"
                  }`}
                >
                  Log in
                </Link>

                <Link
                  href="/SignUp"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3 text-center rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 shadow-lg shadow-blue-500/25 active:scale-[0.99] transition-transform"
                >
                  Get Started
                </Link>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
