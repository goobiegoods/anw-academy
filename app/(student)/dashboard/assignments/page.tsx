import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AssignmentWorkspace from "@/components/dashboard/AssignmentWorkspace";

export const dynamic = "force-dynamic";

export default async function AssignmentsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const enrollments = await prisma.enrollment.findMany({ where: { userId: user.id, status: "active" }, select: { courseId: true } });
  const courseIds = enrollments.map((item) => item.courseId);
  const assignments = courseIds.length ? await prisma.assignment.findMany({ where: { courseId: { in: courseIds } }, orderBy: [{ course: { order: "asc" } }, { title: "asc" }], include: { course: { include: { school: true } }, submissions: { where: { userId: user.id }, orderBy: { submittedAt: "desc" }, take: 1 } } }) : [];
  return <div className="space-y-8"><header><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8a6b30]">Faculty-reviewed learning</p><h1 className="mt-2 font-playfair text-3xl font-bold text-[#1a1a1a]">Coursework</h1><p className="mt-2 text-[13px] text-[#6b6459]">Save work in progress, submit when ready, and return here for the Academy&apos;s recorded feedback.</p></header><AssignmentWorkspace items={assignments.map((assignment) => ({ id: assignment.id, title: assignment.title, prompt: assignment.prompt, course: assignment.course.title, school: assignment.course.school.name, wuValue: assignment.wuValue, submission: assignment.submissions[0] ? { content: assignment.submissions[0].content, status: assignment.submissions[0].status, feedback: assignment.submissions[0].feedback } : null }))} /></div>;
}
