import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { isAdminEmail } from "@/lib/admin-emails";

export { ADMIN_EMAILS, isAdminEmail } from "@/lib/admin-emails";

/** Page-level guard: allowlisted email or DB ADMIN role, else silently back to /dashboard. */
export async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) redirect("/login");

  if (isAdminEmail(user.email)) return user;

  const dbUser = await prisma.user.findUnique({ where: { email: user.email } });
  if (!dbUser || dbUser.role !== "ADMIN") redirect("/dashboard");

  return user;
}

/** API-level guard: returns the Supabase user when admin, otherwise null. */
export async function getAdminUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return null;
  if (isAdminEmail(user.email)) return user;

  const dbUser = await prisma.user.findUnique({ where: { email: user.email } });
  return dbUser?.role === "ADMIN" ? user : null;
}
