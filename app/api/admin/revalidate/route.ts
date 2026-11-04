import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function POST() {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  revalidatePath("/admin", "layout");

  return NextResponse.json({ revalidated: true });
}
