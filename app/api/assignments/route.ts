import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  let input: unknown;
  try { input = await request.json(); } catch { return NextResponse.json({ error: "Invalid request body." }, { status: 400 }); }
  if (!input || typeof input !== "object") return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  const { assignmentId, content, action } = input as Record<string, unknown>;
  if (typeof assignmentId !== "string" || typeof content !== "string" || (action !== "draft" && action !== "submit")) return NextResponse.json({ error: "Assignment, response, and action are required." }, { status: 400 });
  const trimmed = content.trim();
  if (!trimmed || trimmed.length > 20_000 || (action === "submit" && trimmed.length < 50)) return NextResponse.json({ error: "Submitted responses must contain 50–20,000 characters." }, { status: 400 });
  const assignment = await prisma.assignment.findFirst({ where: { id: assignmentId, course: { enrollments: { some: { userId: user.id, status: "active" } } } }, select: { id: true } });
  if (!assignment) return NextResponse.json({ error: "This assignment is not available in your active studies." }, { status: 403 });
  const existing = await prisma.assignmentSubmission.findFirst({ where: { assignmentId, userId: user.id }, orderBy: { submittedAt: "desc" } });
  if (existing && ["submitted", "under_review", "approved"].includes(existing.status)) return NextResponse.json({ error: "This submission is already in faculty review." }, { status: 409 });
  const status = action === "submit" ? "submitted" : "draft";
  const submission = existing ? await prisma.assignmentSubmission.update({ where: { id: existing.id }, data: { content: trimmed, status, feedback: null, reviewedAt: null, submittedAt: new Date() } }) : await prisma.assignmentSubmission.create({ data: { assignmentId, userId: user.id, content: trimmed, status } });
  return NextResponse.json({ id: submission.id, status: submission.status });
}
