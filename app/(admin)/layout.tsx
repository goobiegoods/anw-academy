import { requireAdmin } from "@/lib/admin";
import AdminLayout from "@/components/admin/AdminLayout";
export const dynamic = "force-dynamic";
export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();
  return <AdminLayout>{children}</AdminLayout>;
}
