import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import ReviewDecision from "@/components/admin/ReviewDecision";
export const dynamic = "force-dynamic";
export default async function FacultyReviews() {
  await requireAdmin();
  const [assignments, cases, capstones] = await Promise.all([
    prisma.assignmentSubmission.findMany({
      where: { status: { in: ["submitted", "under_review"] } },
      include: { user: { select: { name: true } }, assignment: true },
      orderBy: { submittedAt: "asc" },
    }),
    prisma.caseStudy.findMany({
      where: { status: { in: ["submitted", "under_review"] } },
      include: { user: { select: { name: true } } },
      orderBy: { submittedAt: "asc" },
    }),
    prisma.capstone.findMany({
      where: { status: { in: ["submitted", "under_review"] } },
      include: { user: { select: { name: true } } },
      orderBy: { submittedAt: "asc" },
    }),
  ]);
  const work = [
    ...assignments.map((a) => ({
      id: a.id,
      kind: "assignment" as const,
      title: a.assignment.title,
      name: a.user.name,
      text: `Prompt: ${a.assignment.prompt}\n\n${a.content}`,
    })),
    ...cases.map((c) => ({
      id: c.id,
      kind: "case" as const,
      title: c.title,
      name: c.user.name,
      text: [
        c.scenario,
        c.observations,
        c.wellnessSupport,
        c.safetyConsiderations,
        c.reflection,
      ].join("\n\n"),
    })),
    ...capstones.map((c) => ({
      id: c.id,
      kind: "capstone" as const,
      title: c.title,
      name: c.user.name,
      text: [c.description, c.submission].filter(Boolean).join("\n\n"),
    })),
  ];
  return (
    <div className="space-y-6">
      <header>
        <p className="uppercase tracking-[.25em] text-xs text-[#8a6b30]">
          Faculty & Registrar
        </p>
        <h1 className="font-playfair text-3xl mt-3">Review Room</h1>
        <p className="text-sm mt-2">
          Read the complete submission, record your feedback, and recognize
          demonstrated work.
        </p>
      </header>
      {!work.length && (
        <p className="rounded-xl border p-7">No submissions awaiting review.</p>
      )}
      {work.map((w) => (
        <article
          key={w.id}
          className="rounded-2xl border border-[#DDD5C5] bg-[#FAF7F0] p-6"
        >
          <p className="text-xs uppercase tracking-wider">
            {w.kind} · {w.name}
          </p>
          <h2 className="font-playfair text-xl my-3">{w.title}</h2>
          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
            {w.text}
          </p>
          <ReviewDecision id={w.id} kind={w.kind} />
        </article>
      ))}
    </div>
  );
}
