"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getInitials } from "@/lib/utils";

type Post = {
  id: string;
  content: string;
  parentPostId: string | null;
  authorName: string;
  createdAt: string;
  isMine: boolean;
};

type DiscussionThreadProps = {
  discussion: {
    id: string;
    title: string;
    prompt: string;
    courseName: string;
    schoolColor: string;
    wuOriginalPost: number;
    wuReply: number;
  };
  posts: Post[];
};

const MIN_POST = 150;
const MIN_REPLY = 75;

function wordCount(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export default function DiscussionThread({ discussion, posts }: DiscussionThreadProps) {
  const router = useRouter();
  const color = discussion.schoolColor;

  const [postText, setPostText] = useState("");
  const [replyText, setReplyText] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const myOriginal = posts.find((p) => p.isMine && !p.parentPostId);
  const myReply = posts.find((p) => p.isMine && p.parentPostId);
  const requirementsMet = Boolean(myOriginal && myReply);

  const topLevel = useMemo(() => posts.filter((p) => !p.parentPostId), [posts]);
  const repliesByParent = useMemo(() => {
    const map: Record<string, Post[]> = {};
    posts.filter((p) => p.parentPostId).forEach((p) => {
      (map[p.parentPostId!] ??= []).push(p);
    });
    return map;
  }, [posts]);

  const submit = async (content: string, parentPostId: string | null) => {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/discussions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ discussionId: discussion.id, content, parentPostId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Could not post.");
      }
      setPostText("");
      setReplyText("");
      setReplyTo(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not post.");
    } finally {
      setSubmitting(false);
    }
  };

  const postWords = wordCount(postText);
  const replyWords = wordCount(replyText);

  return (
    <div className="space-y-6 max-w-3xl">
      <Link href="/dashboard/courses" className="text-[13px] text-[#6b6459] hover:text-[#1a1a1a]">
        ← Back to courses
      </Link>

      {/* Prompt */}
      <div className="rounded-2xl px-7 py-7 text-white" style={{ backgroundColor: color }}>
        <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-white/60 mb-2">
          Module Discussion · {discussion.courseName}
        </p>
        <h1 className="font-playfair text-2xl font-bold">{discussion.title}</h1>
        <p className="text-[13.5px] text-white/85 mt-3" style={{ lineHeight: 1.8 }}>
          {discussion.prompt}
        </p>
      </div>

      {/* Requirements */}
      <div className="bg-white border border-[#e2ddd5] rounded-xl px-6 py-4 flex flex-wrap gap-4 text-[12.5px]">
        <span className={myOriginal ? "text-[#4a7c59] font-semibold" : "text-[#6b6459]"}>
          {myOriginal ? "✓" : "○"} Original post (≥{MIN_POST} words · {discussion.wuOriginalPost} WU)
        </span>
        <span className={myReply ? "text-[#4a7c59] font-semibold" : "text-[#6b6459]"}>
          {myReply ? "✓" : "○"} Peer reply (≥{MIN_REPLY} words · {discussion.wuReply} WU)
        </span>
        <span className="ml-auto font-semibold" style={{ color: requirementsMet ? "#4a7c59" : "#c9923a" }}>
          {requirementsMet ? "Next module unlocked" : "Both required to unlock next module"}
        </span>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Original post composer */}
      {!myOriginal && (
        <div className="bg-white border border-[#e2ddd5] rounded-xl p-6">
          <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-[#c9923a] mb-3">
            Your Original Post
          </p>
          <textarea
            rows={6}
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
            placeholder="Share your insight (minimum 150 words)…"
            className="w-full border border-[#e2ddd5] rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2"
            style={{ outlineColor: color }}
          />
          <div className="flex items-center justify-between mt-3">
            <span className="text-[11px]" style={{ color: postWords >= MIN_POST ? "#4a7c59" : "#9a9088" }}>
              {postWords} / {MIN_POST} words
            </span>
            <button
              disabled={submitting || postWords < MIN_POST}
              onClick={() => submit(postText, null)}
              className="text-white text-sm font-semibold px-6 py-2.5 rounded-full min-h-[44px] disabled:opacity-40"
              style={{ backgroundColor: color }}
            >
              Post
            </button>
          </div>
        </div>
      )}

      {/* Thread */}
      <div className="space-y-4">
        <h2 className="font-playfair text-lg font-bold text-[#1a1a1a]">
          Discussion ({posts.length})
        </h2>
        {topLevel.length === 0 && (
          <p className="text-[13px] text-[#9a9088]">Be the first to post.</p>
        )}
        {topLevel.map((post) => (
          <div key={post.id} className="bg-white border border-[#e2ddd5] rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-[#4a7c59] flex items-center justify-center flex-shrink-0">
                <span className="text-white text-[10px] font-bold">{getInitials(post.authorName)}</span>
              </div>
              <div>
                <p className="text-[13px] font-semibold text-[#1a1a1a]">
                  {post.authorName}
                  {post.isMine && <span className="text-[#9a9088] font-normal"> (you)</span>}
                </p>
                <p className="text-[10px] text-[#9a9088]">
                  {new Date(post.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <p className="text-[13px] text-[#3d3a34] whitespace-pre-wrap" style={{ lineHeight: 1.8 }}>
              {post.content}
            </p>

            {/* Replies */}
            {(repliesByParent[post.id] ?? []).map((reply) => (
              <div key={reply.id} className="mt-4 ml-6 pl-4 border-l-2 border-[#f0ece4]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-[#c9923a] flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-[9px] font-bold">{getInitials(reply.authorName)}</span>
                  </div>
                  <p className="text-[12px] font-semibold text-[#1a1a1a]">
                    {reply.authorName}
                    {reply.isMine && <span className="text-[#9a9088] font-normal"> (you)</span>}
                  </p>
                </div>
                <p className="text-[12.5px] text-[#3d3a34] whitespace-pre-wrap" style={{ lineHeight: 1.75 }}>
                  {reply.content}
                </p>
              </div>
            ))}

            {/* Reply composer — only on others' posts, when you have not replied yet */}
            {!post.isMine && !myReply && (
              <div className="mt-4 ml-6">
                {replyTo === post.id ? (
                  <div>
                    <textarea
                      rows={4}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write a thoughtful reply (minimum 75 words)…"
                      className="w-full border border-[#e2ddd5] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
                      style={{ outlineColor: color }}
                    />
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[11px]" style={{ color: replyWords >= MIN_REPLY ? "#4a7c59" : "#9a9088" }}>
                        {replyWords} / {MIN_REPLY} words
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setReplyTo(null); setReplyText(""); }}
                          className="text-[13px] text-[#6b6459] px-3 py-2 min-h-[44px]"
                        >
                          Cancel
                        </button>
                        <button
                          disabled={submitting || replyWords < MIN_REPLY}
                          onClick={() => submit(replyText, post.id)}
                          className="text-white text-[13px] font-semibold px-5 py-2 rounded-full min-h-[44px] disabled:opacity-40"
                          style={{ backgroundColor: color }}
                        >
                          Reply
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setReplyTo(post.id)}
                    className="text-[12px] font-semibold min-h-[36px]"
                    style={{ color }}
                  >
                    Reply to this post →
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
