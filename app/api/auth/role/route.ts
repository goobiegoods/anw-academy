import { NextResponse } from "next/server";
import { ensureAcademyUser } from "@/lib/user-provisioning";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin-emails";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser?.email) {
    return NextResponse.json({ role: null }, { status: 401 });
  }

  const user = await ensureAcademyUser(authUser);
  if (!user) return NextResponse.json({ role: null }, { status: 404 });
  if (authUser.email_confirmed_at && isAdminEmail(authUser.email))
    return NextResponse.json({ role: "ADMIN" });

  return NextResponse.json({ role: user.role });
}
