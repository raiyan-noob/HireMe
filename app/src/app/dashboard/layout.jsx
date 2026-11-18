import Sidebar from "@/app/components/sidebar";

export const metadata = {
  title: "Dashboard - HireMe",
  description: "Manage your jobs, applications, profile, and settings on HireMe.",
};

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 antialiased">
      {/* Dynamic Responsive Role-Based Sidebar */}
      <Sidebar />

      {/* Main Dashboard Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
