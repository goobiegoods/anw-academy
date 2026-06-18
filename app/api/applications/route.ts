import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();
  const { name, email, phone, location, motivation, experienceLevel, schoolInterest, pathway } = body;

  if (!name || !email || !motivation || !experienceLevel || !schoolInterest || !pathway) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const application = await prisma.application.create({
    data: {
      name,
      email,
      phone: phone || null,
      location: location || null,
      motivation,
      experienceLevel,
      schoolInterest,
      pathway,
      status: "SUBMITTED",
    },
  });

  return NextResponse.json({ id: application.id, status: application.status });
}
