export const runtime = 'edge';

import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto custom-scrollbar relative bg-grid-pattern">
        {/* Subtle Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/[0.02] via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10">
           {children}
        </div>
      </main>
    </div>
  );
}
