import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePractitioner } from "@/lib/practitioner";
import { formatDate } from "@/lib/utils";
import AcademySeal from "@/components/ui/academy-seal";
export const dynamic = "force-dynamic";
export default async function PractitionerDashboard() {
  const { user, profile } = await requirePractitioner();
  const [clients, followups, credentials] = await Promise.all([
    prisma.client.findMany({
      where: { practitionerId: profile.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.clientSession.findMany({
      where: { practitionerId: profile.id, followUpDate: { gte: new Date() } },
      include: { client: { select: { name: true } } },
      orderBy: { followUpDate: "asc" },
      take: 8,
    }),
    prisma.studentCertification.count({
      where: { userId: user.id, status: "awarded" },
    }),
  ]);
  return (
    <div className="space-y-7">
      <header className="rounded-2xl bg-[#1C3327] text-[#F3ECDA] p-7 flex gap-5 items-center">
        <AcademySeal size="md" variant="gold" />
        <div>
          <p className="text-xs tracking-[.22em] uppercase text-[#D4A94A]">
            Practitioner Wellness OS
          </p>
          <h1 className="font-playfair text-3xl mt-2">{profile.displayName}</h1>
          <p className="text-sm mt-2">
            {profile.location || "Your private practice workspace"}
          </p>
          {profile.verifiedGraduate && (
            <p className="text-sm mt-2">Verified ANW Graduate</p>
          )}
        </div>
      </header>
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          ["Clients", clients.length],
          ["Upcoming follow-ups", followups.length],
          ["Awarded credentials", credentials],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-[#DDD5C5] p-6">
            <p className="font-playfair text-3xl">{value}</p>
            <p className="text-sm mt-2">{label}</p>
          </div>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <section className="border border-[#DDD5C5] rounded-2xl p-6">
          <h2 className="font-playfair text-xl">Recent Clients</h2>
          {clients.slice(0, 5).map((c) => (
            <Link
              key={c.id}
              href={`/practitioner/clients/${c.id}`}
              className="block py-4 border-b border-[#DDD5C5]"
            >
              {c.name}
            </Link>
          ))}
          <Link
            className="block mt-5 text-sm text-[#4a7c59]"
            href="/practitioner/clients"
          >
            Manage clients →
          </Link>
        </section>
        <section className="border border-[#DDD5C5] rounded-2xl p-6">
          <h2 className="font-playfair text-xl mb-4">Follow-up Calendar</h2>
          {followups.map((s) => (
            <p key={s.id} className="py-3 text-sm">
              {s.client.name} · {formatDate(s.followUpDate!)}
            </p>
          ))}
          {!followups.length && (
            <p className="text-sm">No upcoming follow-ups recorded.</p>
          )}
        </section>
      </div>
    </div>
  );
}
