import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin-emails";
import AdminLayout from "@/components/admin/AdminLayout";

export const dynamic = "force-dynamic";

export default async function AdminRootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }
  if (!isAdminEmail(user.email)) {
    redirect("/dashboard");
  }
  return <AdminLayout>{children}</AdminLayout>;
}
