import { SCHOOLS } from "@/prisma/curriculum";
export const catalogSchools = SCHOOLS.map((s) => ({
  id: s.slug,
  name: s.name,
  slug: s.slug,
  description: s.description,
  color: s.color,
  accent: s.accent,
  icon: s.icon,
  order: s.order,
  _count: { courses: s.courses.length },
  departments: s.departments.map((name, i) => ({
    id: `${s.slug}-${i}`,
    name,
    description: null,
  })),
  courses: s.courses.map((c, i) => ({
    id: `${s.slug}-${i}`,
    title: c.title,
    slug: c.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, ""),
    description: c.description,
    level: c.level,
    estimatedHours: c.estimatedHours,
    wuValue: c.wuValue,
    order: i,
    modules: c.modules.map((m, j) => ({
      id: `${s.slug}-${i}-${j}`,
      title: m.title,
      lessons: m.lessons.map((l, k) => ({
        id: `${s.slug}-${i}-${j}-${k}`,
        title: l.title,
      })),
    })),
  })),
}));
export const catalogLessonCount = catalogSchools.reduce(
  (n, s) =>
    n +
    s.courses.reduce(
      (a, c) => a + c.modules.reduce((b, m) => b + m.lessons.length, 0),
      0,
    ),
  0,
);
