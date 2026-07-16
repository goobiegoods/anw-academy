import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/admin";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();

  // Only allow known fields through
  const data: Record<string, unknown> = {};
  for (const key of [
    "name",
    "title",
    "bio",
    "slug",
    "credentials",
    "specializations",
    "schools",
    "coursesTaught",
    "photoUrl",
    "email",
    "linkedinUrl",
    "personalWebsite",
    "isActive",
    "isFounding",
  ]) {
    if (key in body) data[key] = body[key];
  }

  const faculty = await prisma.faculty.update({ where: { id }, data });
  return NextResponse.json(faculty);
}

// Soft delete only — never hard delete faculty records
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const faculty = await prisma.faculty.update({
    where: { id },
    data: { isActive: false },
  });
  return NextResponse.json(faculty);
}
