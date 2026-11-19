import React, { Suspense } from "react";
import { getJobs } from "@/lib/actions/jobs";
import JobsFeed from "./JobsFeed";

// Curated preview jobs fallback if backend database is empty or offline

export default async function JobPage({ searchParams }) {
  const search = await searchParams;
  const urlSearch = new URLSearchParams(search || {});
  const query = urlSearch.toString();

  let jobs = [];
  try {
    const fetched = await getJobs(query);
    if (Array.isArray(fetched) && fetched.length > 0) {
      jobs = fetched;
    } 
  } catch (error) {
    console.warn("Backend fetch failed", error?.message);
    
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 dark:bg-zinc-950" />}>
      <JobsFeed initialJobs={jobs} initialQuery={search || {}} />
    </Suspense>
  );
}
