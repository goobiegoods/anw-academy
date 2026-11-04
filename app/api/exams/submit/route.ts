import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { awardWUInTransaction, getCurrentUser } from "@/lib/auth";
import { hasExactAnswerIds } from "@/lib/academic-access-policy";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  let input: unknown;
  try { input = await request.json(); } catch { return NextResponse.json({ error: "Invalid request body." }, { status: 400 }); }
  if (!input || typeof input !== "object") return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  const { attemptId, answers } = input as Record<string, unknown>;
  if (typeof attemptId !== "string" || !answers || typeof answers !== "object" || Array.isArray(answers)) return NextResponse.json({ error: "Attempt and answers are required." }, { status: 400 });
  const userAnswers = Object.fromEntries(Object.entries(answers as Record<string, unknown>).map(([id, value]) => [id, typeof value === "string" ? value : ""]));

  for (let transactionAttempt = 0; transactionAttempt < 3; transactionAttempt++) {
    try {
      const result = await prisma.$transaction(async (tx) => {
        const attempt = await tx.quizAttempt.findUnique({ where: { id: attemptId }, include: { quiz: true } });
        if (!attempt || attempt.userId !== user.id) return { error: "Attempt not found.", status: 404 } as const;
        if (attempt.submittedAt) return { error: "This attempt was already submitted.", status: 400 } as const;
        if (!hasExactAnswerIds(attempt.questionIds, userAnswers)) return { error: "Answers must match the assigned question set exactly.", status: 400 } as const;
        const questions = await tx.question.findMany({ where: { id: { in: attempt.questionIds }, quizId: attempt.quizId } });
        if (questions.length !== attempt.questionIds.length) return { error: "The assessment question set is incomplete.", status: 409 } as const;
        const timedOut = attempt.quiz.timeLimitMinutes ? Date.now() - attempt.startedAt.getTime() > (attempt.quiz.timeLimitMinutes * 60 + 30) * 1_000 : false;
        let correct = 0;
        const breakdown = questions.map((question) => { const given = userAnswers[question.id].toLowerCase().trim(); const isCorrect = !timedOut && given === question.correctAnswer.toLowerCase().trim(); if (isCorrect) correct++; return { id: question.id, prompt: question.prompt, correctAnswer: question.correctAnswer, given, isCorrect, explanation: question.explanation }; });
        const score = Math.round((correct / questions.length) * 100);
        const passed = !timedOut && score >= attempt.quiz.passingScore;
        await tx.quizAttempt.update({ where: { id: attempt.id }, data: { score, passed, answers: userAnswers, submittedAt: new Date() } });
        let wuAwarded = 0;
        if (passed) { const priorPass = await tx.quizAttempt.findFirst({ where: { userId: user.id, quizId: attempt.quizId, passed: true, id: { not: attempt.id } }, select: { id: true } }); if (!priorPass && await awardWUInTransaction(tx, user.id, attempt.quiz.wuValue, attempt.quiz.type, `${attempt.quiz.type} passed: ${attempt.quiz.title}`, attempt.quiz.id)) wuAwarded = attempt.quiz.wuValue; }
        return { score, passed, timedOut, passingScore: attempt.quiz.passingScore, correct, total: questions.length, wuAwarded, breakdown };
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
      if ("error" in result) return NextResponse.json({ error: result.error }, { status: result.status });
      return NextResponse.json(result);
    } catch (error) {
      const retryable = error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034";
      if (!retryable || transactionAttempt === 2) throw error;
    }
  }
  return NextResponse.json({ error: "Assessment could not be finalized." }, { status: 503 });
}
