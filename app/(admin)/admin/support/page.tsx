import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import SupportInbox from "@/components/admin/SupportInbox";

export const dynamic = "force-dynamic";

export default async function AdminSupportPage() {
  await requireAdmin();

  const tickets = await prisma.supportMessage.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  const openCount = tickets.filter((t) => t.status === "open").length;

  const serialized = tickets.map((t) => ({
    id: t.id,
    name: t.name,
    email: t.email,
    subject: t.subject,
    message: t.message,
    status: t.status,
    createdAt: t.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-playfair text-3xl font-bold text-[#1a1a1a]">Support Inbox</h1>
        <p className="text-[#6b6459] mt-1">
          {openCount > 0
            ? `${openCount} open ${openCount === 1 ? "ticket" : "tickets"} awaiting response`
            : tickets.length > 0
            ? "All tickets resolved"
            : "No support messages yet"}
        </p>
      </div>

      <div className="bg-[#faf3e4] border border-[#e8d5a0] rounded-xl px-5 py-3">
        <p className="text-[12px] text-[#7a5c1a]">
          <span className="font-semibold">Student submissions</span> come from the Contact Support form in their profile page.
          Marking a ticket resolved removes it from the open queue but keeps it in the resolved section for reference.
        </p>
      </div>

      <SupportInbox initialTickets={serialized} />
    </div>
  );
}
