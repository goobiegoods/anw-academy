import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser?.email) {
    return NextResponse.json({ role: null }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email: authUser.email } });
  return NextResponse.json({ role: user?.role ?? "STUDENT" });
}
