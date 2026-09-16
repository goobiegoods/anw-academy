import { prisma } from "@/lib/prisma";
import { deriveCourseProgress, evaluateCredentialRequirements, reconcileWellnessUnits } from "@/lib/academics/policies";

export type StudentNextAction = {
  kind: "course" | "coursework" | "assessment" | "case" | "atlas" | "catalog";
  title: string;
  description: string;
  href: string;
};

export async function buildStudentSnapshot(userId: string) {
  const [profile, enrollments, completedProgress, attempts, submissions, cases, capstones, certifications, ledger] =
    await Promise.all([
      prisma.studentProfile.findUnique({ where: { userId } }),
      prisma.enrollment.findMany({
        where: { userId, status: "active" },
        orderBy: { startedAt: "asc" },
        include: {
          course: {
            include: {
              school: { select: { name: true, slug: true } },
              modules: {
                orderBy: { order: "asc" },
                include: { lessons: { orderBy: { order: "asc" }, select: { id: true, title: true } } },
              },
              assignments: { orderBy: { title: "asc" } },
            },
          },
        },
      }),
      prisma.lessonProgress.findMany({
        where: { userId, completed: true },
        select: { lessonId: true, completedAt: true },
      }),
      prisma.quizAttempt.findMany({
        where: { userId, submittedAt: { not: null } },
        orderBy: { submittedAt: "desc" },
        take: 20,
        select: { id: true, passed: true, score: true, submittedAt: true, quizId: true },
      }),
      prisma.assignmentSubmission.findMany({
        where: { userId },
        orderBy: { submittedAt: "desc" },
        select: { id: true, assignmentId: true, status: true, submittedAt: true, reviewedAt: true },
      }),
      prisma.caseStudy.findMany({
        where: { userId },
        orderBy: { submittedAt: "desc" },
        select: { id: true, title: true, status: true, submittedAt: true, reviewedAt: true },
      }),
      prisma.capstone.findMany({
        where: { userId },
        orderBy: { submittedAt: "desc" },
        select: { id: true, title: true, status: true, submittedAt: true, approvedAt: true },
      }),
      prisma.certification.findMany({ orderBy: { level: "asc" } }),
      prisma.wellnessUnitTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        select: { amount: true, sourceType: true, sourceId: true, createdAt: true },
      }),
    ]);

  const completedLessonIds = new Set(completedProgress.map((item) => item.lessonId));
  const submissionByAssignment = new Map(submissions.map((item) => [item.assignmentId, item]));
  const studies = enrollments.map((enrollment) => {
    const lessons = enrollment.course.modules.flatMap((module) => module.lessons);
    const progress = deriveCourseProgress({
      lessonIds: lessons.map((lesson) => lesson.id),
      completedLessonIds,
    });
    const nextLesson = lessons.find((lesson) => !completedLessonIds.has(lesson.id));
    const pendingAssignments = enrollment.course.assignments.filter((assignment) => {
      const submission = submissionByAssignment.get(assignment.id);
      return !submission || submission.status === "draft" || submission.status === "revision_requested";
    });
    return {
      courseId: enrollment.course.id,
      slug: enrollment.course.slug,
      title: enrollment.course.title,
      school: enrollment.course.school,
      progress,
      nextLesson: nextLesson
        ? { id: nextLesson.id, title: nextLesson.title, href: `/dashboard/courses/${enrollment.course.slug}/lessons/${nextLesson.id}` }
        : null,
      pendingAssignments: pendingAssignments.map((assignment) => ({ id: assignment.id, title: assignment.title })),
    };
  });

  const completedCourseSlugs = new Set(studies.filter((study) => study.progress.isComplete).map((study) => study.slug));
  const recordedWU = profile?.totalWU ?? 0;
  const approvedCases = cases.filter((item) => item.status === "approved").length;
  const approvedCapstones = capstones.filter((item) => item.status === "approved").length;
  const credentialRequirements = certifications.map((certification) => ({
    id: certification.id,
    title: certification.title,
    level: certification.level,
    ...evaluateCredentialRequirements({
      requiredWU: certification.requiredWU,
      recordedWU,
      requiredCourseSlugs: certification.requiredCourses,
      completedCourseSlugs,
      requiredCaseStudies: certification.requiredCaseStudies,
      approvedCaseStudies: approvedCases,
      requiredCapstone: certification.requiredCapstone,
      approvedCapstones,
    }),
  }));

  const nextActions: StudentNextAction[] = [];
  const nextStudy = studies.find((study) => study.nextLesson);
  const nextCoursework = studies.flatMap((study) => study.pendingAssignments.map((assignment) => ({ study, assignment })))[0];
  if (nextStudy?.nextLesson) nextActions.push({ kind: "course", title: `Continue ${nextStudy.title}`, description: nextStudy.nextLesson.title, href: nextStudy.nextLesson.href });
  if (nextCoursework) nextActions.push({ kind: "coursework", title: "Complete assigned coursework", description: `${nextCoursework.assignment.title} · ${nextCoursework.study.title}`, href: "/dashboard/assignments" });
  if (studies.length === 0) nextActions.push({ kind: "catalog", title: "Choose a field of study", description: "Explore the six schools and review their course sequences.", href: "/dashboard/courses" });
  nextActions.push({ kind: "atlas", title: "Strengthen the common foundation", description: "Study the Human Body Atlas and its evidence connections.", href: "/dashboard/atlas" });

  return {
    recordedWU,
    level: profile?.level ?? 1,
    studies,
    completedLessonCount: completedLessonIds.size,
    recentAttempts: attempts,
    submissions,
    cases,
    capstones,
    credentialRequirements,
    nextActions: nextActions.slice(0, 4),
    wuReconciliation: reconcileWellnessUnits(recordedWU, ledger.map((item) => item.amount)),
  };
}
