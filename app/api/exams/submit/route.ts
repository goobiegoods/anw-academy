import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { awardWU, getCurrentUser } from "@/lib/auth";

// Grades a timed exam attempt, enforcing the time limit on the server side.
export async function POST(req: Request) {
  const { attemptId, answers } = await req.json();

  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const attempt = await prisma.quizAttempt.findUnique({ where: { id: attemptId } });
  if (!attempt || attempt.userId !== user.id) {
    return NextResponse.json({ error: "Attempt not found." }, { status: 404 });
  }
  if (attempt.submittedAt) {
    return NextResponse.json({ error: "This attempt was already submitted." }, { status: 400 });
  }

  const quiz = await prisma.quiz.findUnique({ where: { id: attempt.quizId } });
  if (!quiz) return NextResponse.json({ error: "Exam not found." }, { status: 404 });

  // Server-side time-limit enforcement
  let timedOut = false;
  if (quiz.timeLimitMinutes) {
    const elapsedMin = (Date.now() - new Date(attempt.startedAt).getTime()) / 60_000;
    if (elapsedMin > quiz.timeLimitMinutes + 0.5) timedOut = true;
  }

  const questions = await prisma.question.findMany({
    where: { id: { in: attempt.questionIds } },
  });

  const userAnswers: Record<string, string> = answers ?? {};
  let correct = 0;
  const breakdown = questions.map((q) => {
    const given = (userAnswers[q.id] ?? "").toString().toLowerCase().trim();
    const isCorrect = !timedOut && given === q.correctAnswer.toLowerCase().trim();
    if (isCorrect) correct++;
    return {
      id: q.id,
      prompt: q.prompt,
      correctAnswer: q.correctAnswer,
      given,
      isCorrect,
      explanation: q.explanation,
    };
  });

  const score = questions.length ? Math.round((correct / questions.length) * 100) : 0;
  const passed = !timedOut && score >= quiz.passingScore;

  await prisma.quizAttempt.update({
    where: { id: attemptId },
    data: { score, passed, answers: userAnswers, submittedAt: new Date() },
  });

  // Award WU on first pass only
  if (passed) {
    const priorPass = await prisma.quizAttempt.findFirst({
      where: { userId: user.id, quizId: quiz.id, passed: true, id: { not: attemptId } },
    });
    if (!priorPass) {
      await awardWU(user.id, quiz.wuValue, quiz.type, `${quiz.type} passed: ${quiz.title}`, quiz.id);
    }
  }

  return NextResponse.json({
    score,
    passed,
    timedOut,
    passingScore: quiz.passingScore,
    correct,
    total: questions.length,
    wuValue: quiz.wuValue,
    breakdown,
  });
}
