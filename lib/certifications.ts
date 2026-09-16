import { prisma } from "@/lib/prisma";
import { formatCertificateNumber } from "@/lib/student-id";

/**
 * Awards any certifications whose requirements the student now meets:
 * WU threshold, approved case studies, and (if required) an approved capstone.
 * Idempotent — already-awarded certifications are left untouched.
 */
export async function checkAndAwardCertifications(userId: string) {
  const [user, profile, certifications, existing, approvedCaseStudies, approvedCapstones, completedLessons] =
    await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { studentId: true } }),
      prisma.studentProfile.findUnique({ where: { userId } }),
      prisma.certification.findMany({ orderBy: { level: "asc" } }),
      prisma.studentCertification.findMany({ where: { userId } }),
      prisma.caseStudy.count({ where: { userId, status: "approved" } }),
      prisma.capstone.count({ where: { userId, status: "approved" } }),
      prisma.lessonProgress.findMany({
        where: { userId, completed: true },
        select: { lessonId: true },
      }),
    ]);

  if (!profile) return;

  const byCertId = new Map(existing.map((sc) => [sc.certificationId, sc]));
  const requiredCourseSlugs = [...new Set(certifications.flatMap((cert) => cert.requiredCourses))];
  const requiredCourses = requiredCourseSlugs.length
    ? await prisma.course.findMany({
        where: { slug: { in: requiredCourseSlugs } },
        select: {
          slug: true,
          modules: { select: { lessons: { select: { id: true } } } },
        },
      })
    : [];
  const completedLessonIds = new Set(completedLessons.map((item) => item.lessonId));
  const completedCourseSlugs = new Set(
    requiredCourses
      .filter((course) => {
        const lessonIds = course.modules.flatMap((module) => module.lessons.map((lesson) => lesson.id));
        return lessonIds.length > 0 && lessonIds.every((id) => completedLessonIds.has(id));
      })
      .map((course) => course.slug)
  );
  let numbered = existing.filter((sc) => sc.certificateNumber).length;

  for (const cert of certifications) {
    const current = byCertId.get(cert.id);
    if (current?.status === "awarded") continue;

    const meetsWU = profile.totalWU >= cert.requiredWU;
    const meetsCourses = cert.requiredCourses.every((slug) => completedCourseSlugs.has(slug));
    const meetsCaseStudies = approvedCaseStudies >= cert.requiredCaseStudies;
    const meetsCapstone = !cert.requiredCapstone || approvedCapstones > 0;
    if (!meetsWU || !meetsCourses || !meetsCaseStudies || !meetsCapstone) continue;

    numbered += 1;
    const certificateNumber = user?.studentId
      ? formatCertificateNumber(user.studentId, numbered)
      : null;

    if (current) {
      await prisma.studentCertification.update({
        where: { id: current.id },
        data: {
          status: "awarded",
          progressPercent: 100,
          awardedAt: new Date(),
          certificateNumber: current.certificateNumber ?? certificateNumber,
        },
      });
    } else {
      await prisma.studentCertification.create({
        data: {
          userId,
          certificationId: cert.id,
          status: "awarded",
          progressPercent: 100,
          awardedAt: new Date(),
          certificateNumber,
        },
      });
    }
  }
}
