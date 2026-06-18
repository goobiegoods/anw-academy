import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

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

            return (
              <Link key={d.id} href={`/dashboard/discussions/${d.id}`}>
                <div className="bg-white border border-[#e2ddd5] rounded-[16px] shadow-card overflow-hidden hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200">
                  <div className="h-1" style={{ backgroundColor: schoolColor }} />
                  <div className="p-6">
                    <div className="flex items-start justify-between flex-wrap gap-3 mb-3">
                      <div>
                        <p className="text-xs text-[#6b6459] mb-1">
                          {d.course.school.icon} {d.course.title}
                        </p>
                        <h2 className="font-playfair text-xl font-bold text-[#1a1a1a]">
                          {d.title}
                        </h2>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-[#6b6459]">
                        <MessageSquare size={14} />
                        {d.posts.length} post{d.posts.length !== 1 ? "s" : ""}
                      </div>
                    </div>

                    <div className="bg-[#f5f1ea] rounded-xl p-4 mb-4">
                      <p className="text-sm text-[#6b6459] italic line-clamp-2">{d.prompt}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      {myPost ? (
                        <span className="flex items-center gap-2 text-sm text-[#4a7c59] font-medium">
                          ✓ You have posted in this discussion
                        </span>
                      ) : (
                        <span className="text-sm text-[#6b6459]">
                          Original post +{d.wuOriginalPost} WU · Reply +{d.wuReply} WU
                        </span>
                      )}
                      <span
                        className="text-[11px] font-bold uppercase tracking-[0.1em]"
                        style={{ color: schoolColor }}
                      >
                        {myPost ? "View Thread →" : "Join →"}
                      </span>
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
