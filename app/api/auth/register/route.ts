import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { email, name } = await req.json();

  if (!email || !name) {
    return NextResponse.json({ error: "Email and name are required." }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
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

  return NextResponse.json({ id: user.id });
}
