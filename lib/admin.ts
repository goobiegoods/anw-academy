import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export const ADMIN_EMAIL = "orel.shemen@gmail.com";

export async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) redirect("/login");

  const dbUser = await prisma.user.findUnique({ where: { email: user!.email! } });
  if (!dbUser || dbUser.role !== "ADMIN") redirect("/login");

  return user!;
}
