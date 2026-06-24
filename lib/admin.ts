import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const ADMIN_EMAIL = "orel.shemen@gmail.com";

export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.email !== ADMIN_EMAIL) {
    redirect("/login");
  }
  return user;
}
