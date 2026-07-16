import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureStudentId } from "@/lib/student-id";

export async function POST(req: Request) {
  const { email, name } = await req.json();

  if (!email || !name) {
    return NextResponse.json({ error: "Email and name are required." }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    await ensureStudentId(existing.id);
    return NextResponse.json({ id: existing.id });
  }

  const user = await prisma.user.create({
    data: {
      email,
      name,
      role: "STUDENT",
      studentProfile: { create: {} },
    },
  });
  await ensureStudentId(user.id);

  return NextResponse.json({ id: user.id });
}
