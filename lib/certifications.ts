import { prisma } from "@/lib/prisma";
import { formatCertificateNumber } from "@/lib/student-id";

/**
 * Awards any certifications whose requirements the student now meets:
 * WU threshold, approved case studies, and (if required) an approved capstone.
 * Idempotent — already-awarded certifications are left untouched.
 */
export async function checkAndAwardCertifications(userId: string) {
  const [user, profile, certifications, existing, approvedCaseStudies, approvedCapstones] =
    await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { studentId: true } }),
      prisma.studentProfile.findUnique({ where: { userId } }),
      prisma.certification.findMany({ orderBy: { level: "asc" } }),
      prisma.studentCertification.findMany({ where: { userId } }),
      prisma.caseStudy.count({ where: { userId, status: "approved" } }),
      prisma.capstone.count({ where: { userId, status: "approved" } }),
    ]);

  if (!profile) return;

  const byCertId = new Map(existing.map((sc) => [sc.certificationId, sc]));
  let numbered = existing.filter((sc) => sc.certificateNumber).length;

  for (const cert of certifications) {
    const current = byCertId.get(cert.id);
    if (current?.status === "awarded") continue;

    const meetsWU = profile.totalWU >= cert.requiredWU;
    const meetsCaseStudies = approvedCaseStudies >= cert.requiredCaseStudies;
    const meetsCapstone = !cert.requiredCapstone || approvedCapstones > 0;
    if (!meetsWU || !meetsCaseStudies || !meetsCapstone) continue;

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
