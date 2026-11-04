import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { apiError, HttpError, readObject } from "@/lib/http";
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    if (!(await getAdminUser()))
      throw new HttpError(403, "Registrar access required.");
    const { id } = await params,
      b = await readObject(req),
      slugs = b.requiredCourses;
    if (
      !Array.isArray(slugs) ||
      !slugs.length ||
      slugs.length > 100 ||
      slugs.some((s) => typeof s !== "string" || s.length > 180) ||
      new Set(slugs).size !== slugs.length
    )
      throw new HttpError(400, "Select at least one distinct required course.");
    const count = await prisma.course.count({
      where: { slug: { in: slugs }, status: "published" },
    });
    if (count !== slugs.length)
      throw new HttpError(
        400,
        "Only published Academy courses can be required.",
      );
    await prisma.certification.update({
      where: { id },
      data: { requiredCourses: slugs },
    });
    return NextResponse.json({ saved: true });
  } catch (error) {
    return apiError(error);
  }
}
