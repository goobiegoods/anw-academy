import AdminLayout from "@/components/admin/AdminLayout";
import { requireAdmin } from "@/lib/admin";

export default async function AdminRootLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return <AdminLayout>{children}</AdminLayout>;
}
