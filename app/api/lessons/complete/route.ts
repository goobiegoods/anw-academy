import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { awardWUInTransaction, getCurrentUser } from "@/lib/auth";
import { gradeLessonFinal } from "@/lib/lesson-types";
import { prisma } from "@/lib/prisma";

type CompletionResult = {
  wuAwarded: number;
  alreadyCompleted: boolean;
};

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  const input = body as Record<string, unknown>;
  const lessonId = typeof input.lessonId === "string" ? input.lessonId : "";
  const attempt =
    typeof input.attempt === "number" && Number.isInteger(input.attempt)
      ? input.attempt
      : 0;
  const rawAnswers = input.answers;

  if (!lessonId || lessonId.length > 100 || attempt < 0 || attempt > 1_000) {
    return NextResponse.json(
      { error: "Invalid lesson assessment." },
      { status: 400 },
    );
  }

  if (
    !rawAnswers ||
    typeof rawAnswers !== "object" ||
    Array.isArray(rawAnswers)
  ) {
    return NextResponse.json(
      { error: "Answers are required." },
      { status: 400 },
    );
  }

  const answers: Record<string, number> = {};
  for (const [key, value] of Object.entries(rawAnswers)) {
    if (
      !/^\d+$/.test(key) ||
      !Number.isInteger(value) ||
      Number(value) < 0 ||
      Number(value) > 3
    ) {
      return NextResponse.json(
        { error: "Invalid answer data." },
        { status: 400 },
      );
    }
    answers[key] = Number(value);
  }

  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      module: {
        include: {
          course: {
            include: {
              modules: {
                orderBy: { order: "asc" },
                include: {
                  lessons: { orderBy: { order: "asc" }, select: { id: true } },
                },
              },
            },
          },
        },
      },
    },
  });
  if (!lesson)
    return NextResponse.json({ error: "Lesson not found." }, { status: 404 });

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: { userId: user.id, courseId: lesson.module.course.id },
    },
    select: { status: true },
  });
  if (!enrollment || enrollment.status !== "active") {
    return NextResponse.json(
      { error: "This lesson is not available in your active studies." },
      { status: 403 },
    );
  }

  const orderedLessonIds = lesson.module.course.modules.flatMap(
    (courseModule) =>
      courseModule.lessons.map((courseLesson) => courseLesson.id),
  );
  const lessonIndex = orderedLessonIds.indexOf(lessonId);
  const prerequisiteIds = orderedLessonIds.slice(0, Math.max(0, lessonIndex));
  if (prerequisiteIds.length > 0) {
    const completedPrerequisites = await prisma.lessonProgress.count({
      where: {
        userId: user.id,
        lessonId: { in: prerequisiteIds },
        completed: true,
      },
    });
    if (completedPrerequisites !== prerequisiteIds.length) {
      return NextResponse.json(
        { error: "Complete the preceding lessons first." },
        { status: 403 },
      );
    }
  }

  const grade = gradeLessonFinal(lesson.content, attempt, answers);
  if (!grade) {
    return NextResponse.json(
      { error: "This lesson has no valid final assessment." },
      { status: 422 },
    );
  }
  if (Object.keys(answers).length !== grade.total) {
    return NextResponse.json(
      { error: "Answer every question before submitting." },
      { status: 400 },
    );
  }

  const quiz = await prisma.quiz.findUnique({ where: { lessonId } });
  let completion: CompletionResult | undefined;

  for (
    let transactionAttempt = 0;
    transactionAttempt < 3;
    transactionAttempt++
  ) {
    try {
      completion = await prisma.$transaction(
        async (tx) => {
          if (quiz) {
            await tx.quizAttempt.create({
              data: {
                userId: user.id,
                quizId: quiz.id,
                score: grade.score,
                passed: grade.passed,
                answers,
                submittedAt: new Date(),
              },
            });
          }

          if (!grade.passed) return { wuAwarded: 0, alreadyCompleted: false };

          const existing = await tx.lessonProgress.findUnique({
            where: { userId_lessonId: { userId: user.id, lessonId } },
          });
          if (existing?.completed)
            return { wuAwarded: 0, alreadyCompleted: true };

          await tx.lessonProgress.upsert({
            where: { userId_lessonId: { userId: user.id, lessonId } },
            update: { completed: true, completedAt: new Date() },
            create: {
              userId: user.id,
              lessonId,
              completed: true,
              completedAt: new Date(),
            },
          });

          const done = await tx.lessonProgress.count({
            where: {
              userId: user.id,
              lessonId: { in: orderedLessonIds },
              completed: true,
            },
          });
          await tx.enrollment.update({
            where: {
              userId_courseId: {
                userId: user.id,
                courseId: lesson.module.course.id,
              },
            },
            data: {
              progressPercent: Math.round(
                (done / orderedLessonIds.length) * 100,
              ),
              completedAt: done === orderedLessonIds.length ? new Date() : null,
            },
          });

          const awarded = await awardWUInTransaction(
            tx,
            user.id,
            lesson.wuValue,
            "lesson",
            `Lesson completed: ${lesson.title}`,
            lesson.id,
          );

          return {
            wuAwarded: awarded ? lesson.wuValue : 0,
            alreadyCompleted: false,
          };
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
      break;
    } catch (error) {
      const retryable =
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2034";
      if (!retryable || transactionAttempt === 2) throw error;
    }
  }

  if (!completion) {
    return NextResponse.json(
      { error: "Assessment could not be recorded." },
      { status: 503 },
    );
  }

  return NextResponse.json({
    completed: grade.passed,
    passed: grade.passed,
    score: grade.score,
    correct: grade.correct,
    total: grade.total,
    wuAwarded: completion.wuAwarded,
    alreadyCompleted: completion.alreadyCompleted,
  });
}
