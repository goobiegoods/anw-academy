import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePractitioner } from "@/lib/practitioner";
import { formatDate } from "@/lib/utils";
import PersistedForm from "@/components/shared/PersistedForm";
export const dynamic = "force-dynamic";
export default async function ClientDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { profile } = await requirePractitioner();
  const { id } = await params;
  const client = await prisma.client.findFirst({
    where: { id, practitionerId: profile.id },
    include: { sessions: { orderBy: { sessionDate: "desc" } } },
  });
  if (!client) notFound();
  return (
    <div className="space-y-6 max-w-3xl">
      <Link href="/practitioner/clients" className="text-sm text-[#4a7c59]">
        ← My Clients
      </Link>
      <header>
        <h1 className="font-playfair text-3xl">{client.name}</h1>
        <p className="text-sm mt-2">
          {client.email} · Client since {formatDate(client.createdAt)}
        </p>
      </header>
      <div className="grid sm:grid-cols-2 gap-4">
        {[
          ["Goals", client.goals],
          ["Private intake notes", client.notes],
        ].map(([title, body]) => (
          <section key={title} className="rounded-xl bg-[#F3ECDA] p-5">
            <h2 className="font-semibold mb-2">{title}</h2>
            <p className="whitespace-pre-wrap break-words text-sm">
              {body || "None recorded."}
            </p>
          </section>
        ))}
      </div>
      <h2 className="font-playfair text-2xl">Session History</h2>
      {client.sessions.map((session) => (
        <article
          key={session.id}
          className="border border-[#DDD5C5] rounded-xl p-5"
        >
          <h3 className="font-semibold">{formatDate(session.sessionDate)}</h3>
          <p className="whitespace-pre-wrap break-words text-sm mt-3">
            {session.notes}
          </p>
          {session.followUpDate && (
            <p className="text-sm mt-3 text-[#8a6b30]">
              Follow-up: {formatDate(session.followUpDate)}
            </p>
          )}
        </article>
      ))}
      {!client.sessions.length && (
        <p className="text-sm">No sessions recorded yet.</p>
      )}
      <section className="border border-[#DDD5C5] bg-[#FAF7F0] rounded-2xl p-6">
        <h2 className="font-playfair text-xl mb-4">Log a Session</h2>
        <PersistedForm
          endpoint={`/api/practitioner/clients/${id}/sessions`}
          label="Save Session"
          fields={[
            {
              name: "sessionDate",
              label: "Session date",
              type: "date",
              required: true,
            },
            {
              name: "notes",
              label: "Session notes and educational support",
              type: "textarea",
              required: true,
              maxLength: 12000,
            },
            { name: "followUpDate", label: "Follow-up date", type: "date" },
          ]}
        />
      </section>
    </div>
  );
}
