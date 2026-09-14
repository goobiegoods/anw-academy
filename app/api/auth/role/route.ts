import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin-emails";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser?.email) {
    return NextResponse.json({ role: null }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email: authUser.email.toLowerCase() } });
  if (!user) return NextResponse.json({ role: null }, { status: 404 });
  if (isAdminEmail(authUser.email)) return NextResponse.json({ role: "ADMIN" });
  if (user.role === "ADMIN") return NextResponse.json({ role: null }, { status: 403 });

  return NextResponse.json({ role: user.role });
}
