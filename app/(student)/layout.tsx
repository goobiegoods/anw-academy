import DashboardLayout from "@/components/dashboard/DashboardLayout";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
