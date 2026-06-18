import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import DiscussionThread from "@/components/dashboard/DiscussionThread";

export const dynamic = "force-dynamic";

export default async function DiscussionPage({
  params,
}: {
  params: Promise<{ discussionId: string }>;
}) {
  const { discussionId } = await params;

  const discussion = await prisma.discussion.findUnique({
    where: { id: discussionId },
    include: {
      course: { include: { school: true } },
      posts: {
        orderBy: { createdAt: "asc" },
        include: { user: { select: { name: true } } },
      },
    },
  });

  if (!discussion) notFound();

  const user = await getCurrentUser();

  const posts = discussion.posts.map((p) => ({
    id: p.id,
    content: p.content,
    parentPostId: p.parentPostId,
    authorName: p.user.name,
    createdAt: p.createdAt.toISOString(),
    isMine: p.userId === user?.id,
  }));

  return (
    <DiscussionThread
      discussion={{
        id: discussion.id,
        title: discussion.title,
        prompt: discussion.prompt,
        courseName: discussion.course.title,
        schoolColor: discussion.course.school.color,
        wuOriginalPost: discussion.wuOriginalPost,
        wuReply: discussion.wuReply,
      }}
      posts={posts}
    />
  );
}
