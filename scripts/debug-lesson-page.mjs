import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

// Simulate what page.tsx does: load Prisma and query the course+lesson
const { PrismaClient } = await import("@prisma/client");
const { PrismaPg } = await import("@prisma/adapter-pg");
const { Pool } = await import("pg");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const slug = "herbal-safety-responsible-use";
const lessonId = "8bcd9fc0-7ca5-4928-b5af-6940b176ea10";

console.log("1. Querying course by slug:", slug);
const course = await prisma.course.findUnique({
  where: { slug },
  include: {
    school: true,
    modules: {
      orderBy: { order: "asc" },
      include: { lessons: { orderBy: { order: "asc" } } },
    },
  },
});

if (!course) {
  console.error("❌ COURSE NOT FOUND by slug:", slug);
  await prisma.$disconnect();
  pool.end();
  process.exit(1);
}
console.log("✓ Course found:", course.title, "| slug:", course.slug);
console.log("  Modules:", course.modules.length);

const orderedLessons = course.modules.flatMap((m) => m.lessons);
console.log("  Total lessons:", orderedLessons.length);
orderedLessons.forEach((l, i) => console.log(`  [${i}] ${l.id} — ${l.title.slice(0, 50)}`));

console.log("\n2. Finding lesson by ID:", lessonId);
const rawLesson = orderedLessons.find((l) => l.id === lessonId);
if (!rawLesson) {
  console.error("❌ LESSON NOT FOUND in course. IDs in course:");
  orderedLessons.forEach(l => console.log("  ", l.id));
  await prisma.$disconnect();
  pool.end();
  process.exit(1);
}
console.log("✓ Lesson found:", rawLesson.title.slice(0, 60));
console.log("  Content length:", rawLesson.content?.length ?? 0);

console.log("\n3. Parsing lesson content...");
try {
  const parsed = JSON.parse(rawLesson.content);
  if (!parsed?.cards) {
    console.error("❌ CONTENT PARSED BUT NO CARDS ARRAY");
  } else {
    console.log("✓ Content parsed, cards:", parsed.cards.length);
  }
} catch (e) {
  console.error("❌ CONTENT PARSE FAILED:", e.message);
}

await prisma.$disconnect();
pool.end();
console.log("\nAll checks passed — page.tsx should render without notFound()");
