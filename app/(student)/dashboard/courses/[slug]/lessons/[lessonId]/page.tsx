import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { parseLessonContent } from "@/lib/lesson-types";
import LessonPageLayout from "@/components/lesson/LessonPageLayout";

export const dynamic = "force-dynamic";

export default async function LessonDetailPage({
  params,
}: {
  params: Promise<{ slug: string; lessonId: string }>;
}) {
  const { slug, lessonId } = await params;

  const [course, user] = await Promise.all([
    prisma.course.findUnique({
      where: { slug },
      include: {
        school: true,
        modules: {
          orderBy: { order: "asc" },
          include: { lessons: { orderBy: { order: "asc" } } },
        },
      },
    }),
    getCurrentUser(),
  ]);

  if (!course) notFound();

  const orderedLessons = course.modules.flatMap((m) => m.lessons);
  const rawLesson = orderedLessons.find((l) => l.id === lessonId);
  if (!rawLesson) notFound();

  if (!user) redirect("/login");
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: user.id, courseId: course.id } },
  });
  if (!enrollment || !["active", "completed"].includes(enrollment.status))
    redirect("/dashboard/courses");
  const parsedContent = parseLessonContent(rawLesson.content);
  if (!parsedContent) notFound();

  const completedIds = user
    ? new Set(
        (
          await prisma.lessonProgress.findMany({
            where: {
              userId: user.id,
              lessonId: { in: orderedLessons.map((l) => l.id) },
              completed: true,
            },
            select: { lessonId: true },
          })
        ).map((p) => p.lessonId),
      )
    : new Set<string>();

  // Compute lock state: accessible up through the current lesson + one ahead
  const currentIdx = orderedLessons.findIndex((l) => l.id === lessonId);
  const firstIncompleteIdx = orderedLessons.findIndex(
    (l) => !completedIds.has(l.id),
  );
  const accessibleUpTo =
    firstIncompleteIdx === -1 ? orderedLessons.length - 1 : firstIncompleteIdx;
  if (currentIdx > accessibleUpTo)
    redirect(
      `/dashboard/courses/${slug}/lessons/${orderedLessons[accessibleUpTo].id}`,
    );

  return (
    <LessonPageLayout
      lessonIndex={currentIdx}
      totalLessons={orderedLessons.length}
      course={{
        id: course.id,
        title: course.title,
        slug: course.slug,
        level: course.level,
        estimatedHours: course.estimatedHours,
        wuValue: course.wuValue,
        school: {
          name: course.school.name,
          slug: course.school.slug,
          color: course.school.color,
          icon: course.school.icon,
        },
        modules: course.modules.map((m) => ({
          id: m.id,
          title: m.title,
          order: m.order,
          lessons: m.lessons.map((l) => {
            const idx = orderedLessons.findIndex((ol) => ol.id === l.id);
            return {
              id: l.id,
              title: l.title,
              order: l.order,
              isCompleted: completedIds.has(l.id),
              isCurrent: l.id === lessonId,
              isLocked: idx > accessibleUpTo,
            };
          }),
        })),
      }}
      lesson={{
        id: rawLesson.id,
        title: rawLesson.title,
        wuValue: rawLesson.wuValue,
        heroImageUrl: rawLesson.heroImageUrl ?? null,
        content: parsedContent,
      }}
      userId={user?.id ?? null}
    />
  );
}
