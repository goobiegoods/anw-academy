import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

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
        <div className="rounded-2xl p-8 text-center" style={{ backgroundColor: "#FAF7F0", border: "0.5px solid #DDD5C5" }}>
          <p className="text-sm text-[#6b6459]">
            No exams available yet. Enroll in a course to unlock midterm and final exams.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {quizzes.map((quiz) => {
            const attempt = attemptMap.get(quiz.id);
            const school = quiz.school ?? quiz.course?.school;
            const contextName = quiz.course?.title ?? school?.name ?? "ANW Academy";
            const schoolColor = school?.color ?? "#4a7c59";

            // Button: sole status indicator — no pill anywhere on card
            const btnStyle: React.CSSProperties = attempt?.passed
              ? { border: "1px solid #DDD5C5", color: "#6b6459", backgroundColor: "rgba(255,255,255,0.80)" }
              : attempt
              ? { backgroundColor: "#C0392B", color: "#ffffff" }
              : { backgroundColor: "#27500A", color: "#ffffff" };
            const btnLabel = attempt?.passed
              ? `Review · ${attempt.score}%`
              : attempt
              ? `Retry · ${attempt.score}%`
              : "Begin Exam →";

            return (
              <div
                key={quiz.id}
                className="rounded-[16px] overflow-hidden hover:shadow-[0_4px_16px_rgba(0,0,0,0.07)] hover:-translate-y-0.5 transition-all"
                style={{ backgroundColor: "#FAF7F0", border: "0.5px solid #DDD5C5" }}
              >
                <div className="flex">
                  {/* School identity: ONLY this 4px stripe */}
                  <div className="w-[4px] flex-shrink-0" style={{ backgroundColor: schoolColor }} />

                  <div className="flex-1 px-5 py-4">
                    <div className="flex items-center justify-between gap-4 flex-wrap">

                      {/* Left: school label + title + pass threshold */}
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-[10px] uppercase tracking-[0.18em] font-bold mb-1"
                          style={{ color: schoolColor }}
                        >
                          {contextName.replace("School of ", "")}
                        </p>
                        <h2 className="font-playfair font-bold text-[15px] text-[#1a1a1a] leading-snug mb-1">
                          {quiz.title}
                        </h2>
                        <p className="text-[11px] text-[#8a7a6a]">
                          Pass threshold: {quiz.passingScore}%
                        </p>
                      </div>

                      {/* Right: WU + action button */}
                      <div className="flex items-center gap-4 flex-shrink-0">
                        <div className="flex flex-col items-end">
                          <span className="font-playfair font-bold text-[#c9923a] text-2xl leading-none">
                            {quiz.wuValue}
                          </span>
                          <span className="text-[9px] font-semibold uppercase tracking-wide text-[#c9923a]/70 mt-0.5">
                            WU
                          </span>
                        </div>
                        <Link
                          href={`/dashboard/exams/${quiz.id}`}
                          className="inline-flex items-center text-[13px] font-bold px-5 py-2.5 rounded-xl transition-opacity hover:opacity-90 flex-shrink-0 whitespace-nowrap"
                          style={btnStyle}
                        >
                          {btnLabel}
                        </Link>
                      </div>

                    </div>
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
