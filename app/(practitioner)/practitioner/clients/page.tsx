import Link from "next/link";
import ClientCard from "@/components/practitioner/ClientCard";

const clients = [
  { id: "c1", name: "Jennifer Mills", email: "jennifer@email.com", goals: "Stress reduction and sleep support through adaptogenic herbs and lifestyle changes", createdAt: "2026-03-15", sessions: [{ id: "s1" }, { id: "s2" }] },
  { id: "c2", name: "Tom Bradley", email: "tom@email.com", goals: "Digestive wellness, energy optimization, gut microbiome support", createdAt: "2026-04-02", sessions: [{ id: "s3" }] },
  { id: "c3", name: "Sarah Okonkwo", email: "sarah@email.com", goals: "Women's hormonal balance, perimenopause support through TCM principles", createdAt: "2026-05-10", sessions: [{ id: "s4" }, { id: "s5" }] },
];

export default function ClientsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-playfair text-3xl font-bold text-[#1a1a1a]">My Clients</h1>
          <p className="text-[#6b6459] mt-1">{clients.length} active clients</p>
        </div>
        <button className="bg-[#4a7c59] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-[#2d5240] transition-colors">
          + Add Client
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {clients.map((client) => (
          <ClientCard key={client.id} client={client} />
        ))}
      </div>
    </div>
  );
}
