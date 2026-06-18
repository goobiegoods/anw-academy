import DashboardNav from "./DashboardNav";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-[#faf8f4] overflow-hidden">
      <aside className="w-64 flex-shrink-0 bg-white border-r border-[#e2ddd5] flex flex-col">
        <DashboardNav />
      </aside>
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
