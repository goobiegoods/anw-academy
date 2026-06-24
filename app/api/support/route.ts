import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const { name, email, subject, message } = await req.json();

  if (!name || !email || !subject || !message) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 });
  }

  // Attempt to link to Prisma user if authenticated
  let userId: string | undefined;
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    if (authUser?.email) {
      const dbUser = await prisma.user.findUnique({
        where: { email: authUser.email },
        select: { id: true },
      });
      userId = dbUser?.id;
    }
  } catch {
    // unauthenticated — still accept the message
  }

  const ticket = await prisma.supportMessage.create({
    data: { name, email, subject, message, userId },
  });

  return NextResponse.json({ id: ticket.id });
}
