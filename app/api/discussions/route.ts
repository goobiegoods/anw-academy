import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { awardWU, getCurrentUser } from "@/lib/auth";

const MIN_POST_WORDS = 150;
const MIN_REPLY_WORDS = 75;

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export async function POST(req: Request) {
  const { discussionId, content, parentPostId } = await req.json();

  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const discussion = await prisma.discussion.findUnique({ where: { id: discussionId } });
  if (!discussion) return NextResponse.json({ error: "Discussion not found." }, { status: 404 });

  const isReply = Boolean(parentPostId);
  const words = wordCount(content ?? "");
  const min = isReply ? MIN_REPLY_WORDS : MIN_POST_WORDS;
  if (words < min) {
    return NextResponse.json(
      { error: `${isReply ? "Replies" : "Posts"} must be at least ${min} words (you wrote ${words}).` },
      { status: 400 }
    );
  }

  const post = await prisma.discussionPost.create({
    data: { discussionId, userId: user.id, content, parentPostId: parentPostId ?? null },
  });

  const wu = isReply ? discussion.wuReply : discussion.wuOriginalPost;
  await awardWU(
    user.id,
    wu,
    "discussion",
    `Discussion ${isReply ? "reply" : "post"}: ${discussion.title}`,
    discussion.id
  );

  return NextResponse.json({ id: post.id, wuAwarded: wu });
}
