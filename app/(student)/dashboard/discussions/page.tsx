import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

export const dynamic = "force-dynamic";

export default async function DiscussionsPage() {
  const user = await getCurrentUser();

  const enrolledCourseIds = user
    ? (
        await prisma.enrollment.findMany({
          where: { userId: user.id },
          select: { courseId: true },
        })
      ).map((e) => e.courseId)
    : [];

  const discussions = await prisma.discussion.findMany({
    where: enrolledCourseIds.length ? { courseId: { in: enrolledCourseIds } } : {},
    include: {
      course: { include: { school: true } },
      posts: { select: { id: true, userId: true } },
    },
    orderBy: { id: "asc" },
    take: 20,
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-playfair text-3xl font-bold text-[#1a1a1a]">Discussions</h1>
        <p className="text-[#6b6459] mt-1">Share perspectives and learn from your cohort</p>
      </div>

      {discussions.length === 0 ? (
        <div className="bg-white border border-[#e2ddd5] rounded-2xl p-8 text-center">
          <p className="text-sm text-[#6b6459]">
            No discussions available yet. Enroll in a course to join its discussions.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {discussions.map((d) => {
            const myPost = user ? d.posts.find((p) => p.userId === user.id) : null;
            const schoolColor = d.course.school.color;
            const [r, g, b] = hexToRgb(schoolColor);
            const cardBg = `rgba(${r},${g},${b},0.10)`;
            const cardBorderColor = `rgba(${r},${g},${b},0.22)`;
            const promptBg = `rgba(255,255,255,0.50)`;
            const labelColor = `rgb(${Math.round(r * 0.62)},${Math.round(g * 0.62)},${Math.round(b * 0.62)})`;
            const titleColor = `rgb(${Math.round(r * 0.52)},${Math.round(g * 0.52)},${Math.round(b * 0.52)})`;

            return (
              <Link key={d.id} href={`/dashboard/discussions/${d.id}`}>
                <div
                  className="rounded-[16px] overflow-hidden border hover:shadow-[0_6px_20px_rgba(0,0,0,0.09)] hover:-translate-y-0.5 transition-all duration-200"
                  style={{ backgroundColor: cardBg, borderColor: cardBorderColor }}
                >
                  <div className="flex">
                    <div className="w-[5px] flex-shrink-0" style={{ backgroundColor: schoolColor }} />
                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between flex-wrap gap-3 mb-3">
                        <div className="min-w-0">
                          <p
                            className="text-[10px] uppercase tracking-[0.18em] font-bold mb-1.5"
                            style={{ color: labelColor }}
                          >
                            {d.course.school.name.replace("School of ", "")} · {d.course.title}
                          </p>
                          <h2
                            className="font-playfair text-xl font-bold leading-snug"
                            style={{ color: titleColor }}
                          >
                            {d.title}
                          </h2>
                        </div>
                        <div
                          className="flex items-center gap-1.5 text-[12px] font-medium flex-shrink-0"
                          style={{ color: labelColor }}
                        >
                          <MessageSquare size={13} strokeWidth={2} />
                          {d.posts.length} {d.posts.length !== 1 ? "posts" : "post"}
                        </div>
                      </div>

                      {/* Prompt — white inset within the tinted card */}
                      <div
                        className="rounded-xl px-4 py-3 mb-4 border"
                        style={{ backgroundColor: promptBg, borderColor: cardBorderColor }}
                      >
                        <p className="text-[13px] italic line-clamp-2" style={{ color: titleColor }}>
                          {d.prompt}
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        {myPost ? (
                          <span
                            className="text-[12px] font-medium flex items-center gap-1.5"
                            style={{ color: labelColor }}
                          >
                            ✓ You have posted in this discussion
                          </span>
                        ) : (
                          <span className="text-[12px]" style={{ color: labelColor }}>
                            Original post{" "}
                            <span className="font-playfair font-bold text-[15px] text-[#c9923a]">
                              +{d.wuOriginalPost}
                            </span>
                            <span className="text-[9px] font-semibold uppercase tracking-wide text-[#c9923a]/70 ml-0.5">
                              WU
                            </span>
                            {" · "}Reply{" "}
                            <span className="font-playfair font-bold text-[15px] text-[#c9923a]">
                              +{d.wuReply}
                            </span>
                            <span className="text-[9px] font-semibold uppercase tracking-wide text-[#c9923a]/70 ml-0.5">
                              WU
                            </span>
                          </span>
                        )}
                        <span
                          className="inline-flex items-center text-[13px] font-bold px-5 py-2 rounded-xl flex-shrink-0"
                          style={
                            myPost
                              ? {
                                  border: `1px solid ${cardBorderColor}`,
                                  color: labelColor,
                                  backgroundColor: "rgba(255,255,255,0.55)",
                                }
                              : { backgroundColor: schoolColor, color: "#ffffff" }
                          }
                        >
                          {myPost ? "View Thread →" : "Join →"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
