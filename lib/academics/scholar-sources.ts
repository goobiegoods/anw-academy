import { prisma } from "@/lib/prisma";
import { parseLessonContent } from "@/lib/lesson-types";
export async function retrieveScholarSources(
  userId: string,
  question: string,
  course?: string,
) {
  const lessons = await prisma.lesson.findMany({
    where: {
      module: {
        course: {
          ...(course ? { title: course } : {}),
          enrollments: {
            some: { userId, status: { in: ["active", "completed"] } },
          },
        },
      },
    },
    select: {
      id: true,
      title: true,
      content: true,
      module: { select: { course: { select: { title: true, slug: true } } } },
    },
    take: 300,
  });
  const terms = [
    ...new Set(question.toLowerCase().match(/[a-z]{3,}/g) || []),
  ].filter(
    (t) =>
      ![
        "what",
        "how",
        "the",
        "and",
        "are",
        "can",
        "with",
        "this",
        "that",
      ].includes(t),
  );
  const ranked = lessons
    .map((lesson) => {
      const cards = parseLessonContent(lesson.content)?.cards || [];
      // Never give the model assessment answers; only authored instructional cards.
      const text = cards
        .flatMap((card) => {
          if (
            card.type === "teaching" ||
            card.type === "deeper" ||
            card.type === "hook"
          )
            return [`${card.title}: ${card.body}`];
          if (card.type === "vocabulary")
            return card.terms.map((t) => `${t.name}: ${t.definition}`);
          return [];
        })
        .join("\n");
      const score = terms.reduce(
        (n, t) =>
          n +
          (lesson.title.toLowerCase().includes(t) ? 5 : 0) +
          (text.toLowerCase().includes(t) ? 1 : 0),
        0,
      );
      return { lesson, text, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
  return ranked
    .map(
      ({ lesson, text }, i) =>
        `[A${i + 1}] ${lesson.module.course.title} — ${lesson.title}\nAcademy link: /dashboard/courses/${lesson.module.course.slug}/lessons/${lesson.id}\n${text.slice(0, 6500)}`,
    )
    .join("\n\n");
}
