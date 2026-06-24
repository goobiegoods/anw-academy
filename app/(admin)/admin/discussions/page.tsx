import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import DiscussionsModerator from "@/components/admin/DiscussionsModerator";

export const dynamic = "force-dynamic";

export default async function AdminDiscussionsPage({
  searchParams,
}: {
  searchParams: Promise<{ courseId?: string }>;
}) {
  await requireAdmin();
  const { courseId } = await searchParams;

  const [posts, courses, totalPosts] = await Promise.all([
    prisma.discussionPost.findMany({
      where: courseId ? { discussion: { courseId } } : undefined,
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        user: { select: { name: true, email: true } },
        discussion: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                school: { select: { name: true, color: true } },
              },
            },
          },
        },
      },
    }),

    prisma.course.findMany({
      where: { discussions: { some: { posts: { some: {} } } } },
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    }),

    prisma.discussionPost.count(),
  ]);

  const serialized = posts.map((p) => ({
    id: p.id,
    content: p.content,
    createdAt: p.createdAt.toISOString(),
    isReply: !!p.parentPostId,
    author: { name: p.user.name, email: p.user.email },
    discussionTitle: p.discussion.title,
    courseName: p.discussion.course.title,
    schoolName: p.discussion.course.school.name.replace("School of ", ""),
    schoolColor: p.discussion.course.school.color,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-6 flex-wrap">
        <div>
          <h1 className="font-playfair text-3xl font-bold text-[#1a1a1a]">Discussion Moderation</h1>
          <p className="text-[#6b6459] mt-1">
            {totalPosts.toLocaleString()} {totalPosts === 1 ? "post" : "posts"} platform-wide
          </p>
        </div>
      </div>

      {/* Filter bar */}
      {courses.length > 0 && (
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-[12px] font-semibold text-[#6b6459] uppercase tracking-[0.12em]">Filter:</span>
          <a
            href="/admin/discussions"
            className={`text-[12px] font-medium px-3 py-1.5 rounded-lg border transition-colors ${
              !courseId
                ? "bg-[#1C3327] text-white border-[#1C3327]"
                : "border-[#e2ddd5] text-[#6b6459] hover:border-[#c8bfb0]"
            }`}
          >
            All courses
          </a>
          {courses.map((c) => (
            <a
              key={c.id}
              href={`/admin/discussions?courseId=${c.id}`}
              className={`text-[12px] font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                courseId === c.id
                  ? "bg-[#1C3327] text-white border-[#1C3327]"
                  : "border-[#e2ddd5] text-[#6b6459] hover:border-[#c8bfb0]"
              }`}
            >
              {c.title}
            </a>
          ))}
        </div>
      )}

      {/* Note on flagging */}
      <div className="bg-[#faf3e4] border border-[#e8d5a0] rounded-xl px-5 py-3">
        <p className="text-[12px] text-[#7a5c1a]">
          <span className="font-semibold">Flagging not yet modeled</span> — no flag field exists in the schema.
          Short posts (under 40 characters) are shown first when reviewing manually. Delete removes a post permanently.
        </p>
      </div>

      <DiscussionsModerator initialPosts={serialized} />
    </div>
  );
}
