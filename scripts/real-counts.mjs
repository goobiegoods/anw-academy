import { config } from "dotenv";
config({ path: ".env.local" });
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  const [
    totalStudents, totalEnrollments, totalLessonsCompleted, totalQuizzesPassed,
    totalCertsAwarded, certsInProgress, totalApplications, totalCaseStudies,
    totalDiscussionPosts, openSupport, schools, courses, certs, wuSum,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.enrollment.count(),
    prisma.lessonProgress.count({ where: { completed: true } }),
    prisma.quizAttempt.count({ where: { passed: true } }),
    prisma.studentCertification.count({ where: { status: "awarded" } }),
    prisma.studentCertification.count({ where: { status: "in_progress" } }),
    prisma.application.count(),
    prisma.caseStudy.count(),
    prisma.discussionPost.count(),
    prisma.supportMessage.count({ where: { status: "open" } }),
    prisma.school.findMany({
      select: { name: true, _count: { select: { courses: true } } },
      orderBy: { order: "asc" },
    }),
    prisma.course.count(),
    prisma.certification.count(),
    prisma.wellnessUnitTransaction.aggregate({ _sum: { amount: true } }),
  ]);

  console.log("\n══ REAL DATABASE COUNTS ══════════════════════════");
  console.log(`  Students (role=STUDENT):    ${totalStudents}`);
  console.log(`  Total Enrollments:          ${totalEnrollments}`);
  console.log(`  Lessons Completed:          ${totalLessonsCompleted}`);
  console.log(`  Quizzes Passed:             ${totalQuizzesPassed}`);
  console.log(`  Certs Awarded:              ${totalCertsAwarded}`);
  console.log(`  Certs In Progress:          ${certsInProgress}`);
  console.log(`  Applications:               ${totalApplications}`);
  console.log(`  Case Studies:               ${totalCaseStudies}`);
  console.log(`  Discussion Posts:           ${totalDiscussionPosts}`);
  console.log(`  Open Support Tickets:       ${openSupport}`);
  console.log(`  Courses (total):            ${courses}`);
  console.log(`  Certifications (catalog):   ${certs}`);
  console.log(`  Total WU Awarded:           ${wuSum._sum.amount ?? 0}`);
  console.log(`\n  Schools:`);
  schools.forEach(s => console.log(`    - ${s.name}: ${s._count.courses} courses`));
  console.log("══════════════════════════════════════════════════\n");
}
main().catch(e => { console.error(e); process.exit(1); }).finally(() => { prisma.$disconnect(); pool.end(); });
