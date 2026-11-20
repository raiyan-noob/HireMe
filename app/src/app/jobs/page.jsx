import React, { Suspense } from "react";
import { getJobs } from "@/lib/actions/jobs";
import JobsFeed from "./JobsFeed";

async function JobsContent({ searchParamsPromise }) {
  const search = await searchParamsPromise;
  const urlSearch = new URLSearchParams(search || {});
  const query = urlSearch.toString();

  let jobs = [];
  try {
    const fetched = await getJobs(query);
    if (Array.isArray(fetched) && fetched.length > 0) {
      jobs = fetched;
    }
  } catch (error) {
    console.warn("Backend fetch failed:", error?.message);
  }

  return <JobsFeed initialJobs={jobs} initialQuery={search || {}} />;
}

export default function JobPage({ searchParams }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 dark:bg-zinc-950" />}>
      <JobsContent searchParamsPromise={searchParams} />
    </Suspense>
  );
}
