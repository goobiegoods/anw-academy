import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { awardWU, getCurrentUser } from "@/lib/auth";

const MIN_POST_WORDS = 150;
const MIN_REPLY_WORDS = 75;
const wordCount = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  let input: unknown;
  try { input = await request.json(); } catch { return NextResponse.json({ error: "Invalid request body." }, { status: 400 }); }
  if (!input || typeof input !== "object") return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  const { discussionId, content, parentPostId } = input as Record<string, unknown>;
  if (typeof discussionId !== "string" || typeof content !== "string" || (parentPostId !== undefined && parentPostId !== null && typeof parentPostId !== "string")) return NextResponse.json({ error: "Discussion and content are required." }, { status: 400 });
  const trimmed = content.trim();
  if (trimmed.length > 12_000) return NextResponse.json({ error: "Discussion content is too long." }, { status: 400 });
  const discussion = await prisma.discussion.findFirst({ where: { id: discussionId, course: { enrollments: { some: { userId: user.id, status: "active" } } } } });
  if (!discussion) return NextResponse.json({ error: "This discussion is not available in your active studies." }, { status: 403 });
  const parentId = typeof parentPostId === "string" ? parentPostId : null;
  if (parentId) { const parent = await prisma.discussionPost.findFirst({ where: { id: parentId, discussionId }, select: { id: true } }); if (!parent) return NextResponse.json({ error: "The reply target does not belong to this discussion." }, { status: 400 }); }
  const words = wordCount(trimmed);
  const minimum = parentId ? MIN_REPLY_WORDS : MIN_POST_WORDS;
  if (words < minimum) return NextResponse.json({ error: `${parentId ? "Replies" : "Posts"} must be at least ${minimum} words (you wrote ${words}).` }, { status: 400 });
  const post = await prisma.discussionPost.create({ data: { discussionId, userId: user.id, content: trimmed, parentPostId: parentId } });
  const configuredWU = parentId ? discussion.wuReply : discussion.wuOriginalPost;
  const awarded = await awardWU(user.id, configuredWU, parentId ? "discussion_reply" : "discussion_original", `Discussion ${parentId ? "reply" : "post"}: ${discussion.title}`, parentId ? post.id : discussion.id);
  return NextResponse.json({ id: post.id, wuAwarded: awarded ? configuredWU : 0 });
}
