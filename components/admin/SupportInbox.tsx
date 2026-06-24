"use client";

import { useState } from "react";
import { CheckCircle2, Inbox } from "lucide-react";

type Ticket = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
};

export default function SupportInbox({ initialTickets }: { initialTickets: Ticket[] }) {
  const [tickets, setTickets] = useState(initialTickets);
  const [resolving, setResolving] = useState<string | null>(null);

  const handleResolve = async (id: string) => {
    setResolving(id);
    try {
      const res = await fetch(`/api/admin/support/${id}`, { method: "PATCH" });
      if (res.ok) {
        setTickets((prev) =>
          prev.map((t) => (t.id === id ? { ...t, status: "resolved" } : t))
        );
      }
    } finally {
      setResolving(null);
    }
  };

  const open = tickets.filter((t) => t.status === "open");
  const resolved = tickets.filter((t) => t.status === "resolved");

  if (tickets.length === 0) {
    return (
      <div className="bg-white border border-[#e2ddd5] rounded-[16px] p-12 text-center">
        <Inbox size={36} className="mx-auto mb-3 text-[#c8bfb0]" />
        <p className="font-playfair text-xl font-bold text-[#1a1a1a] mb-1">No support messages yet</p>
        <p className="text-sm text-[#6b6459]">
          When students submit support requests, they'll appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Open tickets */}
      {open.length > 0 && (
        <div>
          <h2 className="font-playfair text-xl font-bold text-[#1a1a1a] mb-4">
            Open <span className="text-[#c9923a]">({open.length})</span>
          </h2>
          <div className="space-y-3">
            {open.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                onResolve={handleResolve}
                resolving={resolving === ticket.id}
              />
            ))}
          </div>
        </div>
      )}

      {/* Resolved tickets */}
      {resolved.length > 0 && (
        <div>
          <h2 className="font-playfair text-xl font-bold text-[#6b6459] mb-4">
            Resolved ({resolved.length})
          </h2>
          <div className="space-y-3 opacity-70">
            {resolved.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                onResolve={handleResolve}
                resolving={false}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TicketCard({
  ticket,
  onResolve,
  resolving,
}: {
  ticket: Ticket;
  onResolve: (id: string) => void;
  resolving: boolean;
}) {
  const isResolved = ticket.status === "resolved";

  return (
    <div className={`bg-white border rounded-[16px] p-5 shadow-[0_1px_4px_rgba(0,0,0,0.04)] ${
      isResolved ? "border-[#f0ece4]" : "border-[#e2ddd5]"
    }`}>
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-[13px] font-semibold text-[#1a1a1a]">{ticket.name}</span>
            <span className="text-[10px] text-[#8a7a6a]">·</span>
            <span className="text-[12px] text-[#6b6459]">{ticket.email}</span>
            <span className="text-[10px] text-[#b0a090]">
              {new Date(ticket.createdAt).toLocaleDateString("en-US", {
                month: "short", day: "numeric", year: "numeric",
              })}
            </span>
          </div>
          <h3 className="font-playfair text-[15px] font-bold text-[#1a1a1a] mb-2">{ticket.subject}</h3>
          <p className="text-[13px] text-[#3a3028] leading-relaxed">{ticket.message}</p>
        </div>

        <div className="flex-shrink-0">
          {isResolved ? (
            <div className="flex items-center gap-1.5 text-[12px] font-medium text-green-600">
              <CheckCircle2 size={14} />
              Resolved
            </div>
          ) : (
            <button
              onClick={() => onResolve(ticket.id)}
              disabled={resolving}
              className="flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-lg border border-[#4a7c59] text-[#4a7c59] hover:bg-[#4a7c59] hover:text-white transition-colors disabled:opacity-50"
            >
              <CheckCircle2 size={13} />
              {resolving ? "Resolving…" : "Mark resolved"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
