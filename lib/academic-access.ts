import "server-only";

import { prisma } from "@/lib/prisma";
import type { AcademicAccessContext } from "@/lib/academic-access-policy";

export async function getAcademicAccessContext(userId: string): Promise<AcademicAccessContext> {
  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    select: { courseId: true, course: { select: { schoolId: true } } },
  });

  return {
    courseIds: new Set(enrollments.map((enrollment) => enrollment.courseId)),
    schoolIds: new Set(enrollments.map((enrollment) => enrollment.course.schoolId)),
  };
}
