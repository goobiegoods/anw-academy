"use client";

import { useState } from "react";
import { Trash2, MessageSquare } from "lucide-react";

type Post = {
  id: string;
  content: string;
  createdAt: string;
  isReply: boolean;
  author: { name: string; email: string };
  discussionTitle: string;
  courseName: string;
  schoolName: string;
  schoolColor: string;
};

export default function DiscussionsModerator({ initialPosts }: { initialPosts: Post[] }) {
  const [posts, setPosts] = useState(initialPosts);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (confirm !== id) {
      setConfirm(id);
      return;
    }
    setDeleting(id);
    setConfirm(null);
    try {
      const res = await fetch(`/api/admin/discussions/${id}`, { method: "DELETE" });
      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p.id !== id));
      }
    } finally {
      setDeleting(null);
    }
  };

  if (posts.length === 0) {
    return (
      <div className="bg-white border border-[#e2ddd5] rounded-[16px] p-10 text-center">
        <MessageSquare size={32} className="mx-auto mb-3 text-[#c8bfb0]" />
        <p className="font-playfair text-lg font-bold text-[#1a1a1a] mb-1">No posts yet</p>
        <p className="text-sm text-[#6b6459]">Discussion posts will appear here once students start participating.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {posts.map((post) => (
        <div
          key={post.id}
          className="bg-white border border-[#e2ddd5] rounded-[16px] p-5 shadow-[0_1px_4px_rgba(0,0,0,0.04)]"
        >
          <div className="flex items-start gap-4">
            <div className="flex-1 min-w-0">
              {/* Meta row */}
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span className="text-[11px] font-semibold text-[#1a1a1a]">{post.author.name}</span>
                <span className="text-[10px] text-[#8a7a6a]">·</span>
                <span className="text-[10px] text-[#8a7a6a]">{post.author.email}</span>
                {post.isReply && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#f0ece4] text-[#8a7a6a]">
                    reply
                  </span>
                )}
                <span className="text-[10px] text-[#b0a090]">
                  {new Date(post.createdAt).toLocaleDateString("en-US", {
                    month: "short", day: "numeric", year: "numeric",
                  })}
                </span>
              </div>

              {/* Discussion context */}
              <p className="text-[10px] uppercase tracking-[0.12em] font-semibold mb-1" style={{ color: post.schoolColor }}>
                {post.schoolName} · {post.courseName}
              </p>
              <p className="text-[11px] text-[#6b6459] italic mb-2">"{post.discussionTitle}"</p>

              {/* Post content */}
              <p className="text-[13px] text-[#1a1a1a] leading-relaxed">{post.content}</p>
            </div>

            {/* Delete button */}
            <div className="flex-shrink-0 flex flex-col items-end gap-2">
              <button
                onClick={() => handleDelete(post.id)}
                disabled={deleting === post.id}
                className={`flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-lg transition-colors ${
                  confirm === post.id
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "border border-[#e2ddd5] text-[#8a7a6a] hover:border-red-300 hover:text-red-600"
                } disabled:opacity-50`}
              >
                <Trash2 size={13} />
                {deleting === post.id ? "Deleting…" : confirm === post.id ? "Confirm delete" : "Delete"}
              </button>
              {confirm === post.id && (
                <button
                  onClick={() => setConfirm(null)}
                  className="text-[11px] text-[#8a7a6a] hover:text-[#1a1a1a] transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
