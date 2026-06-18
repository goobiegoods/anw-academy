import Link from "next/link";
import Avatar from "@/components/shared/Avatar";
import StatusBadge from "@/components/shared/StatusBadge";
import { Users, Calendar, Award, BookOpen } from "lucide-react";

const practitioner = {
  name: "Dr. Evelyn Hartwood",
  cert: "Natural Wellness Practitioner",
  location: "Portland, OR",
  directoryStatus: "active",
  verifiedGraduate: true,
  clientCount: 12,
  upcomingFollowUps: 3,
};

const clients = [
  { id: "c1", name: "Jennifer Mills", lastSession: "Jun 5, 2026", goals: "Stress reduction and sleep support", followUp: "Jun 19, 2026" },
  { id: "c2", name: "Tom Bradley", lastSession: "May 30, 2026", goals: "Digestive wellness and energy", followUp: "Jun 13, 2026" },
];

const upcomingFollowUps = [
  { client: "Tom Bradley", date: "Jun 13, 2026", note: "Check in on digestive protocol" },
  { client: "Jennifer Mills", date: "Jun 19, 2026", note: "2-week stress review" },
  { client: "Sarah Okonkwo", date: "Jun 22, 2026", note: "Monthly check-in" },
];

export default function PractitionerDashboard() {
  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Avatar name={practitioner.name} size="xl" />
          <div>
            <h1 className="font-playfair text-2xl font-bold text-[#1a1a1a]">{practitioner.name}</h1>
            <p className="text-[#4a7c59] font-medium text-sm">{practitioner.cert}</p>
            <p className="text-[#6b6459] text-sm">{practitioner.location}</p>
            {practitioner.verifiedGraduate && (
              <div className="flex items-center gap-1.5 text-xs font-medium text-[#4a7c59] mt-1">
                ✓ Verified ANW Graduate
              </div>
            )}
          </div>
        </div>
        <StatusBadge status={practitioner.directoryStatus} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Clients", value: practitioner.clientCount, icon: Users, color: "#4a7c59" },
          { label: "Follow-Ups Due", value: practitioner.upcomingFollowUps, icon: Calendar, color: "#c9923a" },
          { label: "Certifications", value: 1, icon: Award, color: "#2c6e8a" },
          { label: "CE Courses", value: 2, icon: BookOpen, color: "#5b4fcf" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-[#e2ddd5] rounded-[16px] shadow-card p-4 text-center">
            <div className="w-9 h-9 rounded-lg mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: `${stat.color}15` }}>
              <stat.icon size={18} style={{ color: stat.color }} />
            </div>
            <p className="text-2xl font-bold font-playfair text-[#1a1a1a]">{stat.value}</p>
            <p className="text-xs text-[#6b6459]">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-[#e2ddd5] rounded-[16px] shadow-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-playfair text-lg font-bold text-[#1a1a1a]">Recent Clients</h2>
            <Link href="/practitioner/clients" className="text-xs text-[#4a7c59] font-medium hover:underline">View all</Link>
          </div>
          <div className="space-y-4">
            {clients.map((c) => (
              <Link key={c.id} href={`/practitioner/clients/${c.id}`}>
                <div className="flex items-center gap-3 hover:bg-[#faf8f4] rounded-xl p-2 -mx-2 transition-colors">
                  <Avatar name={c.name} size="sm" />
                  <div className="flex-1">
                    <p className="font-medium text-sm text-[#1a1a1a]">{c.name}</p>
                    <p className="text-xs text-[#6b6459]">Last session: {c.lastSession}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-white border border-[#e2ddd5] rounded-[16px] shadow-card p-6">
          <h2 className="font-playfair text-lg font-bold text-[#1a1a1a] mb-4">Upcoming Follow-Ups</h2>
          <div className="space-y-3">
            {upcomingFollowUps.map((f) => (
              <div key={f.client} className="flex items-start gap-3 pb-3 border-b border-[#f5f1ea] last:border-0">
                <div className="w-2 h-2 rounded-full bg-[#c9923a] mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-[#1a1a1a]">{f.client}</p>
                  <p className="text-xs text-[#6b6459]">{f.date} · {f.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
