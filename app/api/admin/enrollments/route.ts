import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { apiError, HttpError, readObject, textField } from "@/lib/http";
export async function POST(req: Request) {
  try {
    if (!(await getAdminUser()))
      throw new HttpError(403, "Administrator access required.");
    const body = await readObject(req);
    const userId = textField(body, "userId", 100, true),
      courseId = textField(body, "courseId", 100, true);
    const [user, course] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.course.findFirst({ where: { id: courseId, status: "published" } }),
    ]);
    if (!user || !course)
      throw new HttpError(404, "Student or published course not found.");
    if (user.role !== "STUDENT")
      throw new HttpError(400, "A student profile is required.");
    const enrollment = await prisma.enrollment.upsert({
      where: { userId_courseId: { userId, courseId } },
      update: { status: "active" },
      create: { userId, courseId },
    });
    return NextResponse.json({ id: enrollment.id });
  } catch (error) {
    return apiError(error);
  }
}
