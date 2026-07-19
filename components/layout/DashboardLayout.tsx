import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full bg-background overflow-hidden print:h-auto print:overflow-visible print:block">
      <Sidebar />
      <div className="flex flex-col flex-1 h-full min-w-0 print:h-auto print:block">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6 md:p-8 relative print:overflow-visible print:p-0 print:h-auto print:block">
          <div className="max-w-7xl mx-auto w-full print:max-w-none print:w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
