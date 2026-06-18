import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ExamRunner from "@/components/dashboard/ExamRunner";

export const dynamic = "force-dynamic";

export default async function ExamPage({
  params,
}: {
  params: Promise<{ examId: string }>;
}) {
  const { examId } = await params;

  const quiz = await prisma.quiz.findUnique({
    where: { id: examId },
    include: {
      course: { include: { school: true } },
      school: true,
    },
  });

  if (!quiz || quiz.type === "lesson") notFound();

  const school = quiz.school ?? quiz.course?.school;
  const color = school?.color ?? "#4a7c59";

  return (
    <ExamRunner
      exam={{
        id: quiz.id,
        title: quiz.title,
        type: quiz.type,
        passingScore: quiz.passingScore,
        wuValue: quiz.wuValue,
        questionCount: quiz.questionCount,
        timeLimitMinutes: quiz.timeLimitMinutes,
        cooldownHours: quiz.cooldownHours,
        contextName: quiz.course?.title ?? school?.name ?? "ANW Academy",
        schoolColor: color,
      }}
    />
  );
}
