import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/admin";

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const faculty = await prisma.faculty.findMany({
    orderBy: [{ isFounding: "desc" }, { joinedAt: "asc" }],
  });
  return NextResponse.json(faculty);
}

export async function POST(req: Request) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { name, title, bio, slug } = body;
  if (!name || !title || !bio) {
    return NextResponse.json({ error: "Name, title, and bio are required." }, { status: 400 });
  }

  const finalSlug: string =
    slug ||
    name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");

  const existing = await prisma.faculty.findUnique({ where: { slug: finalSlug } });
  if (existing) {
    return NextResponse.json({ error: `Slug "${finalSlug}" is already in use.` }, { status: 409 });
  }

  const faculty = await prisma.faculty.create({
    data: {
      slug: finalSlug,
      name,
      title,
      bio,
      credentials: body.credentials ?? [],
      specializations: body.specializations ?? [],
      schools: body.schools ?? [],
      coursesTaught: body.coursesTaught ?? [],
      photoUrl: body.photoUrl || null,
      email: body.email || null,
      linkedinUrl: body.linkedinUrl || null,
      personalWebsite: body.personalWebsite || null,
      isActive: body.isActive ?? true,
      isFounding: body.isFounding ?? false,
    },
  });

  return NextResponse.json(faculty, { status: 201 });
}
