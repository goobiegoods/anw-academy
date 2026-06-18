import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import StatusBadge from "@/components/shared/StatusBadge";
import WUBadge from "@/components/shared/WUBadge";

export const dynamic = "force-dynamic";

export default async function ExamsPage() {
  const user = await getCurrentUser();

  const enrolledCourseIds = user
    ? (
        await prisma.enrollment.findMany({
          where: { userId: user.id },
          select: { courseId: true },
        })
      ).map((e) => e.courseId)
    : [];

  const [quizzes, attempts] = await Promise.all([
    prisma.quiz.findMany({
      where: {
        type: { in: ["midterm", "final"] },
        ...(enrolledCourseIds.length
          ? { OR: [{ courseId: { in: enrolledCourseIds } }, { type: "final" }] }
          : {}),
      },
      include: {
        course: { include: { school: true } },
        school: true,
      },
      orderBy: { title: "asc" },
      take: 30,
    }),
    user
      ? prisma.quizAttempt.findMany({
          where: { userId: user.id },
          select: { quizId: true, passed: true, score: true },
          orderBy: { attemptedAt: "desc" },
        })
      : Promise.resolve([]),
  ]);

  const attemptMap = new Map<string, { passed: boolean; score: number }>();
  for (const a of attempts) {
    if (!attemptMap.has(a.quizId)) {
      attemptMap.set(a.quizId, { passed: a.passed, score: a.score });
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-playfair text-3xl font-bold text-[#1a1a1a]">Exams & Quizzes</h1>
        <p className="text-[#6b6459] mt-1">Test your knowledge and earn Wellness Units</p>
      </div>

      {quizzes.length === 0 ? (
        <div className="bg-white border border-[#e2ddd5] rounded-2xl p-8 text-center">
          <p className="text-sm text-[#6b6459]">
            No exams available yet. Enroll in a course to unlock midterm and final exams.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {quizzes.map((quiz) => {
            const attempt = attemptMap.get(quiz.id);
            const school = quiz.school ?? quiz.course?.school;
            const contextName = quiz.course?.title ?? school?.name ?? "ANW Academy";
            const schoolColor = school?.color ?? "#4a7c59";
            const status = attempt ? (attempt.passed ? "completed" : "pending") : "pending";

            return (
              <div
                key={quiz.id}
                className="bg-white border border-[#e2ddd5] rounded-[16px] shadow-card p-5"
              >
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div>
                    <p className="text-xs text-[#6b6459] mb-1 flex items-center gap-1.5">
                      <span
                        className="inline-block w-2 h-2 rounded-full"
                        style={{ backgroundColor: schoolColor }}
                      />
                      {contextName}
                    </p>
                    <h2 className="font-semibold text-[#1a1a1a]">{quiz.title}</h2>
                    <div className="flex items-center gap-3 mt-2">
                      <StatusBadge status={status} />
                      <span className="text-xs text-[#6b6459]">
                        Passing score: {quiz.passingScore}%
                      </span>
                      {attempt && (
                        <span
                          className={`text-xs font-semibold ${
                            attempt.passed ? "text-[#4a7c59]" : "text-red-600"
                          }`}
                        >
                          Your score: {attempt.score}%
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <WUBadge value={quiz.wuValue} />
                    <Link
                      href={`/dashboard/exams/${quiz.id}`}
                      className={
                        attempt?.passed
                          ? "border border-[#e2ddd5] text-sm text-[#6b6459] px-4 py-2 rounded-lg hover:bg-[#f5f1ea] transition-colors"
                          : "bg-[#4a7c59] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#2d5240] transition-colors"
                      }
                    >
                      {attempt?.passed ? "Review" : attempt ? "Retry" : "Begin Exam"}
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
