import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getAcademicAccessContext } from "@/lib/academic-access";
import { canAccessAssessment, isAttemptActive } from "@/lib/academic-access-policy";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  let input: unknown;
  try { input = await request.json(); } catch { return NextResponse.json({ error: "Invalid request body." }, { status: 400 }); }
  const quizId = input && typeof input === "object" ? (input as Record<string, unknown>).quizId : null;
  if (typeof quizId !== "string") return NextResponse.json({ error: "Exam ID is required." }, { status: 400 });

  const [quiz, access] = await Promise.all([
    prisma.quiz.findUnique({ where: { id: quizId }, include: { questions: true } }),
    getAcademicAccessContext(user.id),
  ]);
  if (!quiz) return NextResponse.json({ error: "Exam not found." }, { status: 404 });
  if (!canAccessAssessment(access, quiz)) return NextResponse.json({ error: "This assessment is not available in your active studies." }, { status: 403 });
  if (quiz.questions.length === 0 || quiz.questionCount < 1) return NextResponse.json({ error: "This assessment is not ready for students." }, { status: 409 });

  const last = await prisma.quizAttempt.findFirst({ where: { userId: user.id, quizId }, orderBy: { startedAt: "desc" } });
  if (last && isAttemptActive(last.startedAt, last.submittedAt, quiz.timeLimitMinutes, new Date())) return NextResponse.json({ error: "An assessment attempt is already active.", attemptId: last.id }, { status: 409 });
  if (last && !last.passed && quiz.cooldownHours > 0) {
    const elapsedHours = (Date.now() - last.startedAt.getTime()) / 3_600_000;
    if (elapsedHours < quiz.cooldownHours) return NextResponse.json({ error: `Please wait ${Math.ceil(quiz.cooldownHours - elapsedHours)} more hour(s) before retaking.`, cooldown: true }, { status: 429 });
  }

  const attemptCount = await prisma.quizAttempt.count({ where: { userId: user.id, quizId } });
  const count = Math.min(quiz.questionCount, quiz.questions.length);
  const offset = (attemptCount * count) % quiz.questions.length;
  const selected = Array.from({ length: count }, (_, index) => quiz.questions[(offset + index) % quiz.questions.length]);
  const attempt = await prisma.quizAttempt.create({ data: { userId: user.id, quizId, score: 0, passed: false, answers: {}, questionIds: selected.map((question) => question.id), startedAt: new Date() } });
  return NextResponse.json({ attemptId: attempt.id, timeLimitMinutes: quiz.timeLimitMinutes, passingScore: quiz.passingScore, startedAt: attempt.startedAt, questions: selected.map((question) => ({ id: question.id, prompt: question.prompt, type: question.type, options: question.options })) });
}
