import Link from "next/link";
import Avatar from "@/components/shared/Avatar";
import { formatDate } from "@/lib/utils";

interface ClientCardProps {
  client: {
    id: string;
    name: string;
    email?: string | null;
    goals?: string | null;
    createdAt: Date | string;
    sessions?: { id: string }[];
  };
}

export default function ClientCard({ client }: ClientCardProps) {
  return (
    <Link href={`/practitioner/clients/${client.id}`}>
      <div className="bg-white border border-[#e2ddd5] rounded-[16px] shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 p-5">
        <div className="flex items-start gap-4">
          <Avatar name={client.name} size="md" />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-[#1a1a1a]">{client.name}</h3>
            {client.email && (
              <p className="text-sm text-[#6b6459] truncate">{client.email}</p>
            )}
            {client.goals && (
              <p className="text-sm text-[#6b6459] mt-1 line-clamp-2">{client.goals}</p>
            )}
            <div className="flex items-center gap-3 mt-2 text-xs text-[#6b6459]">
              <span>Since {formatDate(client.createdAt)}</span>
              {client.sessions && (
                <>
                  <span>·</span>
                  <span>{client.sessions.length} session{client.sessions.length !== 1 ? "s" : ""}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
