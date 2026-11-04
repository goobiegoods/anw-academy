import { prisma } from "@/lib/prisma";
import AITutor from "@/components/dashboard/AITutor";

export const dynamic = "force-dynamic";

export default async function AITutorPage({
  searchParams,
}: {
  searchParams: Promise<{ question?: string | string[] }>;
}) {
  const requestedQuestion = (await searchParams).question;
  const initialQuestion = typeof requestedQuestion === "string" ? requestedQuestion.slice(0, 2_000) : "";
  const schools = await prisma.school.findMany({
    orderBy: { order: "asc" },
    include: { courses: { orderBy: { order: "asc" }, select: { title: true } } },
  });

  return (
    <AITutor
      initialQuestion={initialQuestion}
      schools={schools.map((s) => ({
        name: s.name,
        color: s.color,
        courses: s.courses.map((c) => c.title),
      }))}
    />
  );
}
