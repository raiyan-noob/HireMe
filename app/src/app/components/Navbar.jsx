"use client";

import React, { useState, useEffect, useSyncExternalStore } from "react";
import Link from "next/link";

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
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

            {/* Log in Button */}
            <Link
              href="/pages/Login"
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
              href="/pages/SignUp"
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
          mobileMenuOpen ? "max-h-[500px] opacity-100 py-5" : "max-h-0 opacity-0 py-0"
        } ${
          isDark
            ? "bg-zinc-950/95 border-zinc-800 backdrop-blur-2xl"
            : "bg-white/95 border-zinc-200 backdrop-blur-2xl"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-3">
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

          {/* Mobile Buttons */}
          <div className="pt-2 flex flex-col gap-2.5">
            <Link
              href="/login"
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
              href="/signup"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3 text-center rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 shadow-lg shadow-blue-500/25 active:scale-[0.99] transition-transform"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;