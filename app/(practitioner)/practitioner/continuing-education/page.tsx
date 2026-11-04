import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePractitioner } from "@/lib/practitioner";
export const dynamic = "force-dynamic";
export default async function ContinuingEducation() {
  const { user } = await requirePractitioner();
  const enrollments = await prisma.enrollment.findMany({
    where: { userId: user.id, status: "active" },
    include: { course: { include: { school: true } } },
  });
  return (
    <div className="space-y-6">
      <h1 className="font-playfair text-3xl">Continuing Education</h1>
      <p className="text-sm">
        Your active academic studies. Academy Wellness Units are internal
        educational recognition; external CE acceptance must be verified with
        the relevant body.
      </p>
      {enrollments.map((e) => (
        <section key={e.id} className="border border-[#DDD5C5] rounded-xl p-6">
          <p className="text-xs">{e.course.school.name}</p>
          <h2 className="font-playfair text-xl my-3">{e.course.title}</h2>
          <p className="text-sm">{e.progressPercent}% complete</p>
        </section>
      ))}
      {!enrollments.length && (
        <p>
          No continuing studies have been assigned yet. Contact the registrar to
          arrange enrollment.
        </p>
      )}
      <Link className="text-[#4a7c59]" href="/schools">
        Browse the academic catalog →
      </Link>
    </div>
  );
}
