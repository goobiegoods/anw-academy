import { prisma } from "@/lib/prisma";
import { requirePractitioner } from "@/lib/practitioner";
import ClientCard from "@/components/practitioner/ClientCard";
import PersistedForm from "@/components/shared/PersistedForm";
export const dynamic = "force-dynamic";
export default async function ClientsPage() {
  const { profile } = await requirePractitioner();
  const clients = await prisma.client.findMany({
    where: { practitionerId: profile.id },
    include: { sessions: { select: { id: true } } },
    orderBy: { createdAt: "desc" },
  });
  return (
    <div className="space-y-7">
      <header>
        <p className="text-xs uppercase tracking-[.25em] text-[#8a6b30]">
          Practitioner Wellness OS
        </p>
        <h1 className="font-playfair text-3xl mt-3">My Clients</h1>
        <p className="text-sm text-[#6b6459] mt-2">
          {clients.length} private client records
        </p>
      </header>
      <div className="grid md:grid-cols-2 gap-4">
        {clients.map((client) => (
          <ClientCard key={client.id} client={client} />
        ))}
      </div>
      {!clients.length && (
        <p className="rounded-xl border border-[#DDD5C5] p-6">
          Your practice starts here. Add your first client below.
        </p>
      )}
      <details className="rounded-2xl border border-[#DDD5C5] bg-[#FAF7F0] p-6">
        <summary className="font-playfair text-xl cursor-pointer">
          Add a client
        </summary>
        <div className="mt-5">
          <PersistedForm
            endpoint="/api/practitioner/clients"
            label="Create Client"
            destination="$client"
            fields={[
              {
                name: "name",
                label: "Full name",
                required: true,
                maxLength: 120,
              },
              { name: "email", label: "Email", type: "email" },
              { name: "goals", label: "Wellness goals", type: "textarea" },
              {
                name: "notes",
                label: "Private intake notes",
                type: "textarea",
              },
            ]}
          />
        </div>
      </details>
    </div>
  );
}
