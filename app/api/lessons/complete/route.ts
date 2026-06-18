import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { awardWU, getCurrentUser } from "@/lib/auth";

export async function POST(req: Request) {
  const { lessonId, score, answers } = await req.json();
  if (!lessonId) {
    return NextResponse.json({ error: "lessonId is required." }, { status: 400 });
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found." }, { status: 404 });
  }

  // Record the attempt against the lesson's quiz record when one exists
  const quiz = await prisma.quiz.findUnique({ where: { lessonId } });
  if (quiz) {
    await prisma.quizAttempt.create({
      data: {
        userId: user.id,
        quizId: quiz.id,
        score: typeof score === "number" ? score : 100,
        passed: true,
        answers: answers ?? {},
        submittedAt: new Date(),
      },
    });
  }

  // Idempotent completion — WU is only awarded the first time
  const existing = await prisma.lessonProgress.findUnique({
    where: { userId_lessonId: { userId: user.id, lessonId } },
  });

  if (existing?.completed) {
    return NextResponse.json({ completed: true, wuAwarded: 0 });
  }

  await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId: user.id, lessonId } },
    update: { completed: true, completedAt: new Date() },
    create: { userId: user.id, lessonId, completed: true, completedAt: new Date() },
  });

  await awardWU(
    user.id,
    lesson.wuValue,
    "lesson",
    `Lesson completed: ${lesson.title}`,
    lesson.id
  );

  return NextResponse.json({ completed: true, wuAwarded: lesson.wuValue });
}
