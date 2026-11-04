import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ensureAcademyUser } from "@/lib/user-provisioning";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { email, name } = body as Record<string, unknown>;

  if (typeof email !== "string" || typeof name !== "string" || !email.trim() || !name.trim()) {
    return NextResponse.json({ error: "Email and name are required." }, { status: 400 });
  }

  if (email.length > 320 || name.length > 120) {
    return NextResponse.json({ error: "Registration details are too long." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser?.email) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  if (authUser.email.toLowerCase() !== email.trim().toLowerCase()) {
    return NextResponse.json({ error: "Authenticated email does not match." }, { status: 403 });
  }

  const user = await ensureAcademyUser(authUser, name);

  return NextResponse.json({ id: user.id });
}
