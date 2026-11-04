import { Prisma } from "@prisma/client";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { HttpError } from "@/lib/http";
/** Explicit registrar operation only. No GET/page render can issue a credential. */
export async function checkAndAwardCertifications(userId: string) {
  return prisma.$transaction(
    async (tx) => {
      const [
        profile,
        user,
        certifications,
        existing,
        lessons,
        cases,
        capstones,
        ledger,
      ] = await Promise.all([
        tx.studentProfile.findUnique({ where: { userId } }),
        tx.user.findUnique({ where: { id: userId } }),
        tx.certification.findMany({ orderBy: { level: "asc" } }),
        tx.studentCertification.findMany({ where: { userId } }),
        tx.lessonProgress.findMany({
          where: { userId, completed: true },
          select: { lessonId: true },
        }),
        tx.caseStudy.count({ where: { userId, status: "approved" } }),
        tx.capstone.count({ where: { userId, status: "approved" } }),
        tx.wellnessUnitTransaction.aggregate({
          where: { userId },
          _sum: { amount: true },
        }),
      ]);
      if (!profile || !user?.studentId)
        throw new HttpError(
          409,
          "A student identity and academic profile are required.",
        );
      if (profile.totalWU !== (ledger._sum.amount || 0))
        throw new HttpError(
          409,
          "Reconcile this student's WU ledger before issuing credentials.",
        );
      const slugs = [
        ...new Set(certifications.flatMap((c) => c.requiredCourses)),
      ];
      const courses = await tx.course.findMany({
        where: { slug: { in: slugs } },
        include: {
          modules: { include: { lessons: { select: { id: true } } } },
        },
      });
      const completed = new Set(lessons.map((l) => l.lessonId));
      const completedCourses = new Set(
        courses
          .filter((c) => {
            const ids = c.modules.flatMap((m) => m.lessons.map((l) => l.id));
            return ids.length > 0 && ids.every((id) => completed.has(id));
          })
          .map((c) => c.slug),
      );
      const awarded: string[] = [],
        blocked: string[] = [];
      for (const cert of certifications) {
        if (
          existing.some(
            (c) => c.certificationId === cert.id && c.status === "awarded",
          )
        )
          continue;
        if (!cert.requiredCourses.length) {
          blocked.push(
            `${cert.title}: required coursework has not been configured`,
          );
          continue;
        }
        if (
          profile.totalWU < cert.requiredWU ||
          !cert.requiredCourses.every((slug) => completedCourses.has(slug)) ||
          cases < cert.requiredCaseStudies ||
          (cert.requiredCapstone && capstones === 0)
        )
          continue;
        const current = existing.find((c) => c.certificationId === cert.id);
        const data = {
          status: "awarded",
          progressPercent: 100,
          awardedAt: new Date(),
          certificateNumber:
            current?.certificateNumber ||
            `ANW-${new Date().getFullYear()}-${randomUUID().replaceAll("-", "").slice(0, 20).toUpperCase()}`,
        };
        if (current)
          await tx.studentCertification.update({
            where: { id: current.id },
            data,
          });
        else
          await tx.studentCertification.create({
            data: { userId, certificationId: cert.id, ...data },
          });
        awarded.push(cert.title);
      }
      return { awarded, blocked };
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );
}
