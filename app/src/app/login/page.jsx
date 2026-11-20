"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { useSearchParams } from "next/navigation";


const LoginPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // Smooth mouse-following spotlight tracking
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      const res = await authClient.signIn.email({
        email,
        password,
        callbackURL: "/",
      });

      if (res?.error) {
        console.error("Sign in error:", res.error);
        setErrorMessage(
          res.error.message || "Invalid email or password. Please try again."
        );
      } else {
        console.log("Sign in successful:", res?.data);
        router.push("/");
      }
    } catch (err) {
      console.error("Unexpected sign in error:", err);
      setErrorMessage(err.message || "An unexpected error occurred during sign in.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage("");
    setGoogleLoading(true);
    try {
      const res = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      });

      if (res?.error) {
        console.error("Google sign in error:", res.error);
        setErrorMessage(res.error.message || "Failed to sign in with Google.");
        setGoogleLoading(false);
      } else if (res?.data?.url) {
        window.location.href = res.data.url;
      }
    } catch (err) {
      console.error("Unexpected Google sign in error:", err);
      setErrorMessage(err.message || "Failed to connect to Google.");
      setGoogleLoading(false);
    }
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative min-h-[calc(100vh-80px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden transition-colors"
    >
      {/* ======================================================== */}
      {/* 1. LIGHT MODE BACKGROUND (Pristine, Radiant Canvas) */}
      {/* ======================================================== */}
      <div className="dark:hidden absolute inset-0 -z-10 pointer-events-none overflow-hidden bg-gradient-to-b from-slate-50 via-white to-white">
        {/* Soft architectural grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_75%_55%_at_50%_25%,#000_70%,transparent_100%)] opacity-60" />

        {/* Luminous top sunrise aura */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-tr from-blue-300/35 via-sky-200/40 to-indigo-200/35 rounded-full blur-[100px]" />
        
        {/* Flank accent glows */}
        <div className="absolute top-1/3 left-10 w-72 h-72 bg-sky-200/25 rounded-full blur-[90px]" />
        <div className="absolute top-1/3 right-10 w-72 h-72 bg-violet-200/25 rounded-full blur-[90px]" />

        {/* Top horizon light line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-4xl h-[2px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
      </div>

      {/* ======================================================== */}
      {/* 2. DARK MODE BACKGROUND (Deep Cyber Obsidian & Neon Aurora) */}
      {/* ======================================================== */}
      <div className="hidden dark:block absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        {/* Dark tech grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#27272a_1px,transparent_1px),linear-gradient(to_bottom,#27272a_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_30%,#000_70%,transparent_100%)] opacity-40" />

        {/* Electric nebula glow */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[850px] h-[500px] bg-gradient-to-r from-blue-600/30 via-indigo-600/35 to-violet-600/30 rounded-full blur-[130px]" />
        <div className="absolute top-1/3 left-1/4 w-[380px] h-[350px] bg-cyan-500/15 rounded-full blur-[100px]" />
        <div className="absolute top-1/3 right-1/4 w-[380px] h-[350px] bg-fuchsia-600/15 rounded-full blur-[100px]" />

        {/* Cyber glowing orbital ring */}
        <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[750px] h-[750px] rounded-full border border-blue-500/20 pointer-events-none" />

        {/* Top laser beam line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-4xl h-[1px] bg-gradient-to-r from-transparent via-blue-500/60 to-transparent" />
      </div>

      {/* 3. Interactive Mouse Spotlight Hover Effect */}
      {isHovered && (
        <div
          className="pointer-events-none absolute inset-0 -z-10 transition-opacity duration-300 hidden sm:block opacity-100"
          style={{
            background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(37, 99, 235, 0.08), transparent 45%)`,
          }}
        />
      )}

      <div className="w-full max-w-md mx-auto">
        
        {/* Main Floating Glassmorphic Auth Card */}
        <div className="relative p-7 sm:p-9 rounded-3xl bg-white/95 dark:bg-zinc-900/95 border border-slate-200/90 dark:border-zinc-800 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.09)] dark:shadow-2xl dark:shadow-black/70 backdrop-blur-2xl">
          
          {/* Brand Logo & Header */}
          <div className="text-center mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 group focus:outline-none mb-4"
            >
              <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform duration-300">
                <svg
                  className="w-5 h-5 text-white"
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
              </div>
              <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Hire<span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-500 bg-clip-text text-transparent">Me</span>
              </span>
            </Link>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Welcome back
            </h1>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mt-2">
              Sign in to manage your career or active job listings
            </p>
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="mb-6 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 text-rose-700 dark:text-rose-300 text-sm font-medium flex items-center gap-2.5 shadow-xs">
              <svg className="w-5 h-5 shrink-0 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Google Sign In Button */}
          <div className="mb-6">
            <button
              type="button"
              disabled={googleLoading}
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-slate-200 dark:border-zinc-700/80 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-zinc-700/60 shadow-xs hover:border-slate-300 dark:hover:border-zinc-600 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {googleLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-slate-600 dark:text-zinc-300" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Connecting to Google...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center mb-6">
            <div className="w-full border-t border-slate-200 dark:border-zinc-800" />
            <span className="absolute bg-white dark:bg-zinc-900 px-3 text-xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
              Or continue with email
            </span>
          </div>

          {/* Main Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5 text-left"
              >
                Email Address
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-slate-400 dark:text-zinc-500 pointer-events-none">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700/80 text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:bg-white dark:focus:bg-zinc-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5 text-left"
              >
                Password
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-slate-400 dark:text-zinc-500 pointer-events-none">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700/80 text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:bg-white dark:focus:bg-zinc-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                  className="absolute right-3.5 text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 cursor-pointer"
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                      <line x1="2" x2="22" y1="2" y2="22" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:via-indigo-500 hover:to-violet-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm shadow-md shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign in to HireMe</span>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>
            </div>

          </form>

          {/* Bottom Switch to Sign Up */}
          <div className="mt-7 pt-5 border-t border-slate-100 dark:border-zinc-800 text-center">
            <p className="text-sm text-slate-500 dark:text-zinc-400">
              Don&apos;t have an account yet?{" "}
              <Link
                href="/SignUp"
                className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Create an account
              </Link>
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};

export default LoginPage;