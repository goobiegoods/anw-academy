import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import CourseContent from "@/components/lesson/CourseContent";

export const dynamic = "force-dynamic";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      school: true,
      modules: {
        orderBy: { order: "asc" },
        include: { lessons: { orderBy: { order: "asc" } } },
      },
      discussions: true,
      quizzes: { where: { type: { in: ["midterm", "final"] } } },
    },
  });

  if (!course) notFound();

  const user = await getCurrentUser();
  const progress = user
    ? await prisma.lessonProgress.findMany({
        where: {
          userId: user.id,
          lessonId: { in: course.modules.flatMap((m) => m.lessons.map((l) => l.id)) },
        },
      })
    : [];

  const completedLessonIds = progress
    .filter((p) => p.completed)
    .map((p) => p.lessonId);

  return (
    <CourseContent
      course={{
        id: course.id,
        slug: course.slug,
        title: course.title,
        description: course.description,
        level: course.level,
        estimatedHours: course.estimatedHours,
        wuValue: course.wuValue,
        school: {
          name: course.school.name,
          color: course.school.color,
          slug: course.school.slug,
        },
        modules: course.modules.map((m) => ({
          id: m.id,
          title: m.title,
          order: m.order,
          lessons: m.lessons.map((l) => ({
            id: l.id,
            title: l.title,
            order: l.order,
            wuValue: l.wuValue,
          })),
        })),
        discussions: course.discussions.map((d) => ({
          id: d.id,
          title: d.title,
          moduleId: d.moduleId,
        })),
        exams: course.quizzes.map((q) => ({
          id: q.id,
          title: q.title,
          type: q.type,
          wuValue: q.wuValue,
        })),
      }}
      completedLessonIds={completedLessonIds}
    />
  );
}
