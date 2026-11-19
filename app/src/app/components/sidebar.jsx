"use client";

import React, { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";

// Safe hydration helper without triggering cascading effect renders
const emptySubscribe = () => () => {};
function useIsMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

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

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const isMounted = useIsMounted();
  const isDark = useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    getServerSnapshot
  );

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
    window.dispatchEvent(new Event("hireme-theme-change"));
  };

  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  const handleToggleDesktop = (open) => {
    setDesktopOpen(open);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("hireme-sidebar-open", String(open));
      } catch {}
    }
  };

  const rawRole = session?.user?.role?.toLowerCase() || "seeker";
  const role = ["admin", "employer", "seeker"].includes(rawRole)
    ? rawRole
    : "seeker";

  const handleSignOut = async () => {
    try {
      setSigningOut(true);
      await signOut();
      router.push("/");
    } catch (err) {
      console.error("Sign out failed:", err);
      router.push("/");
    } finally {
      setSigningOut(false);
    }
  };

  const getInitials = (name = "") => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Role visual identity configurations
  const roleMeta = {
    seeker: {
      title: "Job Seeker",
      short: "Candidate",
      badgeClass:
        "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800",
      avatarRing: "ring-emerald-500/40",
      baseRoute: "/dashboard/seeker",
    },
    employer: {
      title: "Employer",
      short: "Hiring Manager",
      badgeClass:
        "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800",
      avatarRing: "ring-blue-500/40",
      baseRoute: "/dashboard/employer",
    },
    admin: {
      title: "System Admin",
      short: "Superadmin",
      badgeClass:
        "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/60 dark:text-violet-300 dark:border-violet-800",
      avatarRing: "ring-violet-500/40",
      baseRoute: "/dashboard/admin",
    },
  }[role];

  // ==========================================
  // NAVIGATION CONFIGURATION PER USER ROLE
  // ==========================================
  const navConfigs = {
    seeker: [
      {
        name: "Jobs",
        href: "/jobs",
        exact: true,
        icon: (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="20" height="14" x="2" y="7" rx="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
          </svg>
        ),
      },
      {
        name: "Saved Jobs",
        href: "/dashboard/seeker/saved",
        icon: (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
          </svg>
        ),
      },
      {
        name: "Applications",
        href: "/dashboard/seeker/applications",
        badge: "Live",
        icon: (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" x2="8" y1="13" y2="13" />
            <line x1="16" x2="8" y1="17" y2="17" />
            <line x1="10" x2="8" y1="9" y2="9" />
          </svg>
        ),
      },
      {
        name: "Billings",
        href: "/dashboard/seeker/billings",
        icon: (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="20" height="14" x="2" y="5" rx="2" />
            <line x1="2" x2="22" y1="10" y2="10" />
          </svg>
        ),
      },
      {
        name: "Settings",
        href: "/dashboard/seeker/settings",
        icon: (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        ),
      },
    ],

    employer: [
      {
        name: "Create Job",
        href: "/dashboard/employer/create-job",
        badge: "New",
        icon: (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v8M8 12h8" />
          </svg>
        ),
      },
      {
        name: "Manage Jobs",
        href: "/dashboard/employer/manage-jobs",
        icon: (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            <rect width="20" height="14" x="2" y="6" rx="2" />
          </svg>
        ),
      },
      {
        name: "Applications",
        href: "/dashboard/employer/applications",
        icon: (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        ),
      },
      {
        name: "Profile",
        href: "/dashboard/employer/profile",
        icon: (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
            <path d="M9 22v-4h6v4" />
            <path d="M8 6h.01" />
            <path d="M16 6h.01" />
            <path d="M12 6h.01" />
            <path d="M12 10h.01" />
            <path d="M12 14h.01" />
            <path d="M16 10h.01" />
            <path d="M16 14h.01" />
            <path d="M8 10h.01" />
            <path d="M8 14h.01" />
          </svg>
        ),
      },
    ],

    admin: [
      {
        name: "Users",
        href: "/dashboard/admin",
        exact: true,
        icon: (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <circle cx="19" cy="11" r="2" />
            <path d="M19 17v4" />
          </svg>
        ),
      },
      {
        name: "Companies",
        href: "/dashboard/admin/companies",
        icon: (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" x2="21" y1="21" y2="21" />
            <line x1="6" x2="6" y1="18" />
            <line x1="10" x2="10" y1="18" />
            <line x1="14" x2="14" y1="18" />
            <line x1="18" x2="18" y1="18" />
            <path d="M4 21V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16" />
            <path d="M9 9h1" />
            <path d="M9 13h1" />
            <path d="M14 9h1" />
            <path d="M14 13h1" />
          </svg>
        ),
      },
      {
        name: "Jobs",
        href: "/dashboard/admin/jobs",
        icon: (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="20" height="14" x="2" y="7" rx="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
          </svg>
        ),
      },
      {
        name: "Payments",
        href: "/dashboard/admin/payments",
        icon: (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" x2="12" y1="2" y2="22" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        ),
      },
      {
        name: "Settings",
        href: "/dashboard/admin/settings",
        icon: (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        ),
      },
    ],
  };

  const navLinks = navConfigs[role] || navConfigs.seeker;

  const isLinkActive = (item) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname.startsWith(item.href);
  };

  // Render the inner sidebar content as a pure JSX tree
  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-900 border-r border-slate-200/80 dark:border-zinc-800 transition-colors">
      
      {/* 1. BRAND HEADER */}
      <div className="p-5 border-b border-slate-100 dark:border-zinc-800/80 flex items-center justify-between">
        <Link
          href="/"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-2.5 group focus:outline-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center shadow-md shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-all duration-300 group-hover:scale-105">
            <svg
              className="w-5 h-5 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="20" height="14" x="2" y="7" rx="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
              Hire<span className="text-blue-600 dark:text-blue-400">Me</span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
              Workspace
            </span>
          </div>
        </Link>

        {/* Header Actions: Desktop Close & Mobile Close */}
        <div className="flex items-center gap-1">
          {/* Desktop Close Button */}
          <button
            type="button"
            onClick={() => handleToggleDesktop(false)}
            className="hidden lg:flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:text-zinc-500 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer group"
            aria-label="Close Sidebar"
            title="Close Sidebar"
          >
            <svg
              className="w-5 h-5 transition-transform duration-200 group-hover:-translate-x-0.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M9 3v18" />
              <path d="m16 15-3-3 3-3" />
            </svg>
          </button>

          {/* Mobile close button */}
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:text-zinc-500 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="Close Sidebar"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* 2. USER PROFILE HERO CARD */}
      <div className="p-4 mx-3 my-3 rounded-2xl bg-gradient-to-br from-slate-50 via-slate-50/50 to-blue-50/40 dark:from-zinc-800/80 dark:via-zinc-800/40 dark:to-blue-950/20 border border-slate-200/80 dark:border-zinc-700/60 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            {isMounted && session?.user?.image ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={session.user.image}
                alt={session.user.name || "User Avatar"}
                className={`w-11 h-11 rounded-full object-cover ring-2 ${roleMeta.avatarRing}`}
              />
            ) : (
              <div
                className={`w-11 h-11 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 text-white font-bold text-sm flex items-center justify-center ring-2 ${roleMeta.avatarRing} shadow-xs`}
              >
                {getInitials(session?.user?.name || session?.user?.email)}
              </div>
            )}
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-900" />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
              {session?.user?.name || (isPending ? "Loading..." : "User Account")}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
              {session?.user?.email || "Signed in"}
            </p>
          </div>
        </div>

        {/* Dynamic Role Badge */}
        <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-zinc-700/50 flex items-center justify-between text-xs">
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
            Active Mode
          </span>
          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${roleMeta.badgeClass}`}
          >
            {roleMeta.title}
          </span>
        </div>
      </div>

      {/* 3. DYNAMIC NAVIGATION LINKS */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
          Navigation
        </div>

        {navLinks.map((item) => {
          const active = isLinkActive(item);
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                active
                  ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white shadow-md shadow-blue-500/20 font-bold"
                  : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/90 dark:hover:bg-zinc-800/80"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={`transition-transform duration-200 group-hover:scale-110 ${
                    active
                      ? "text-white"
                      : "text-slate-400 dark:text-zinc-500 group-hover:text-slate-700 dark:group-hover:text-zinc-300"
                  }`}
                >
                  {item.icon}
                </span>
                <span className="truncate">{item.name}</span>
              </div>

              {item.badge && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    active
                      ? "bg-white/20 text-white"
                      : "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* 4. BOTTOM ACTIONS AREA */}
      <div className="p-3 mt-auto border-t border-slate-100 dark:border-zinc-800/80 space-y-2.5">
        
        {/* Seekers ONLY: Prominent "Post Resume" Button above logout */}
        {role === "seeker" && (
          <Link
            href="/dashboard/seeker/resume"
            onClick={() => setMobileOpen(false)}
            className="group relative flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:via-indigo-500 hover:to-violet-500 shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/35 transition-all duration-200 active:scale-[0.99] overflow-hidden"
          >
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
            <svg
              className="w-4 h-4 transition-transform duration-200 group-hover:-translate-y-0.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" x2="12" y1="3" y2="15" />
            </svg>
            <span className="relative">Post Resume</span>
          </Link>
        )}

        {/* Employers quick post action (helper) */}
        {role === "employer" && (
          <Link
            href="/dashboard/employer/create-job"
            onClick={() => setMobileOpen(false)}
            className="group flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-200/80 dark:border-indigo-800/60 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span>Create New Job</span>
          </Link>
        )}

        {/* Theme Mode Toggle Switch */}
        <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/60 text-xs">
          <div className="flex items-center gap-2 font-semibold text-slate-700 dark:text-zinc-300">
            {isDark ? (
              <svg className="w-4 h-4 text-indigo-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="4" fill="currentColor" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
              </svg>
            )}
            <span>{isDark ? "Dark Theme" : "Light Theme"}</span>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors cursor-pointer ${
              isDark ? "bg-indigo-600" : "bg-slate-300 dark:bg-zinc-700"
            }`}
            aria-label="Toggle dark mode"
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                isDark ? "translate-x-5" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* 5. LOGOUT BUTTON */}
        <button
          type="button"
          onClick={handleSignOut}
          disabled={signingOut}
          className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50/70 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 border border-rose-200/70 dark:border-rose-900/50 transition-colors cursor-pointer disabled:opacity-60"
        >
          {signingOut ? (
            <>
              <svg className="animate-spin w-4 h-4 text-rose-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
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
                <line x1="21" x2="9" y1="12" y2="12" />
              </svg>
              <span>Sign Out</span>
            </>
          )}
        </button>

      </div>
    </div>
  );

  return (
    <>
      {/* ======================================================== */}
      {/* 1. MOBILE TOP NAVIGATION BAR (Visible on screens < lg) */}
      {/* ======================================================== */}
      <div className="lg:hidden sticky top-0 z-40 w-full bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-xl text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors focus:outline-none"
            aria-label="Open Sidebar Menu"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
          </button>

          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white font-black text-sm">
              H
            </div>
            <span className="font-bold text-sm text-slate-900 dark:text-white">
              Hire<span className="text-blue-600 dark:text-blue-400">Me</span>
            </span>
          </Link>
        </div>

        {/* Mobile current active role badge and avatar */}
        <div className="flex items-center gap-2.5">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${roleMeta.badgeClass}`}>
            {roleMeta.short}
          </span>
          {isMounted && session?.user?.image ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={session.user.image}
              alt="Avatar"
              className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-500/30"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-violet-600 text-white font-bold text-xs flex items-center justify-center">
              {getInitials(session?.user?.name || session?.user?.email)}
            </div>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. MOBILE DRAWER OVERLAY (Slide-over with backdrop) */}
      {/* ======================================================== */}
      <div
        className={`lg:hidden fixed inset-0 z-50 transition-all duration-300 ${
          mobileOpen ? "visible" : "invisible pointer-events-none"
        }`}
      >
        {/* Backdrop overlay */}
        <div
          onClick={() => setMobileOpen(false)}
          className={`fixed inset-0 bg-slate-950/60 dark:bg-black/80 backdrop-blur-xs transition-opacity duration-300 ${
            mobileOpen ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Slide-out drawer panel */}
        <div
          className={`fixed inset-y-0 left-0 w-72 max-w-[85vw] h-full shadow-2xl transition-transform duration-300 ease-out transform ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {sidebarContent}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. DESKTOP PERMANENT SIDEBAR (Visible on screens >= lg) */}
      {/* ======================================================== */}
      {desktopOpen && (
        <aside className="hidden lg:flex flex-col w-64 xl:w-72 h-screen sticky top-0 shrink-0 z-30 transition-all duration-300">
          {sidebarContent}
        </aside>
      )}

      {/* ======================================================== */}
      {/* 4. DESKTOP RE-OPEN BUTTON (Visible when closed on screens >= lg) */}
      {/* ======================================================== */}
      {!desktopOpen && (
        <div className="hidden lg:flex fixed top-4 left-4 z-40 animate-in fade-in zoom-in-95 duration-200">
          <button
            type="button"
            onClick={() => handleToggleDesktop(true)}
            className="group flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-zinc-800 shadow-lg shadow-slate-900/5 hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-500/40 dark:hover:border-blue-500/40 text-slate-700 dark:text-zinc-200 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 active:scale-95 cursor-pointer"
            aria-label="Open Sidebar"
            title="Open Sidebar"
          >
            <div className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M9 3v18" />
                <path d="m14 9 3 3-3 3" />
              </svg>
            </div>
            <span className="text-xs font-bold tracking-tight">Open Sidebar</span>
          </button>
        </div>
      )}
    </>
  );
}
