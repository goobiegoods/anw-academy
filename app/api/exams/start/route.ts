import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// Begins a timed exam attempt: selects a rotated question set, records the
// start time, and returns the questions (without correct answers).
export async function POST(req: Request) {
  const { quizId } = await req.json();

  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { questions: true },
  });
  if (!quiz) return NextResponse.json({ error: "Exam not found." }, { status: 404 });

  // 24h cooldown enforcement based on the last attempt
  if (quiz.cooldownHours > 0) {
    const last = await prisma.quizAttempt.findFirst({
      where: { userId: user.id, quizId },
      orderBy: { startedAt: "desc" },
    });
    if (last) {
      const elapsedH = (Date.now() - new Date(last.startedAt).getTime()) / 3_600_000;
      if (!last.passed && elapsedH < quiz.cooldownHours) {
        return NextResponse.json(
          {
            error: `Please wait ${Math.ceil(quiz.cooldownHours - elapsedH)} more hour(s) before retaking.`,
            cooldown: true,
          },
          { status: 429 }
        );
      }
    }
  }

  // Rotate questions: pick a window based on how many attempts already exist
  const attemptCount = await prisma.quizAttempt.count({ where: { userId: user.id, quizId } });
  const pool = quiz.questions;
  const count = Math.min(quiz.questionCount, pool.length);
  const offset = (attemptCount * count) % Math.max(pool.length, 1);
  const selected: typeof pool = [];
  for (let i = 0; i < count; i++) {
    selected.push(pool[(offset + i) % pool.length]);
  }

  const attempt = await prisma.quizAttempt.create({
    data: {
      userId: user.id,
      quizId,
      score: 0,
      passed: false,
      answers: {},
      questionIds: selected.map((q) => q.id),
      startedAt: new Date(),
    },
  });

  return NextResponse.json({
    attemptId: attempt.id,
    timeLimitMinutes: quiz.timeLimitMinutes,
    passingScore: quiz.passingScore,
    startedAt: attempt.startedAt,
    questions: selected.map((q) => ({
      id: q.id,
      prompt: q.prompt,
      type: q.type,
      options: q.options,
    })),
  });
}
