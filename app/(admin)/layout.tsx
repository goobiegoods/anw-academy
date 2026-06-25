import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ADMIN_EMAIL } from "@/lib/admin";
import AdminLayout from "@/components/admin/AdminLayout";

export const dynamic = "force-dynamic";

export default async function AdminRootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== ADMIN_EMAIL) {
    redirect("/login");
  }
  return <AdminLayout>{children}</AdminLayout>;
}
