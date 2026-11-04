import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import PersistedForm from "@/components/shared/PersistedForm";
export const dynamic = "force-dynamic";
export default async function TeachingMedia({
  searchParams,
}: {
  searchParams: Promise<{ course?: string }>;
}) {
  await requireAdmin();
  const { course: slug } = await searchParams;
  const courses = await prisma.course.findMany({
    select: {
      id: true,
      slug: true,
      title: true,
      school: { select: { name: true } },
    },
    orderBy: { title: "asc" },
  });
  const course = slug
    ? await prisma.course.findUnique({
        where: { slug },
        include: {
          modules: {
            orderBy: { order: "asc" },
            include: {
              lessons: {
                orderBy: { order: "asc" },
                select: { id: true, title: true, videoUrl: true },
              },
            },
          },
        },
      })
    : null;
  return (
    <div className="space-y-7">
      <header>
        <p className="text-xs uppercase tracking-[.25em] text-[#9A6749]">
          Faculty Studio
        </p>
        <h1 className="font-playfair text-3xl mt-3">Filmed Teaching</h1>
        <p className="text-sm mt-3 max-w-2xl">
          Connect a recording to the lessons where it belongs. Films appear
          beside the reading; the existing assessments continue to record
          learning.
        </p>
      </header>
      <div className="flex flex-wrap gap-2">
        {courses.map((c) => (
          <Link
            key={c.id}
            href={`/admin/teaching-media?course=${encodeURIComponent(c.slug)}`}
            className={`rounded-xl border px-3 py-2 text-xs ${slug === c.slug ? "bg-[#E9DED0]" : "bg-white"}`}
          >
            {c.title}
          </Link>
        ))}
      </div>
      {course ? (
        course.modules.map((m) => (
          <section key={m.id} className="space-y-4">
            <h2 className="font-playfair text-2xl">{m.title}</h2>
            {m.lessons.map((l) => (
              <article
                key={l.id}
                className="border border-[#D8C8B7] bg-[#FAF7F0] p-5 rounded-2xl"
              >
                <h3 className="font-semibold mb-4">{l.title}</h3>
                <PersistedForm
                  endpoint="/api/admin/teaching-media"
                  method="PATCH"
                  label="Save Teaching Film"
                  success="Film saved. It will appear in this lesson."
                  fields={[
                    {
                      name: "lessonId",
                      label: "Lesson identifier",
                      type: "hidden",
                      value: l.id,
                    },
                    {
                      name: "videoUrl",
                      label: "Video URL · clear to remove",
                      type: "url",
                      value: l.videoUrl || "",
                      maxLength: 2000,
                    },
                  ]}
                />
              </article>
            ))}
          </section>
        ))
      ) : (
        <p className="border rounded-xl p-6">
          Select a course to attach its teaching films.
        </p>
      )}
      <p className="text-xs text-[#76695E]">
        Use the provider&apos;s caption/transcript controls or captioned video
        exports. Video hosting privacy must match the Academy&apos;s intended
        audience. External embeds load only when the student chooses to play.
      </p>
    </div>
  );
}
