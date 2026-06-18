import StatsCard from "@/components/admin/StatsCard";
import StatusBadge from "@/components/shared/StatusBadge";
import Avatar from "@/components/shared/Avatar";
import { Users, GraduationCap, FileText, Coins, TrendingUp, AlertTriangle } from "lucide-react";

const stats = [
  { title: "Total Students", value: 248, subtitle: "registered accounts", icon: Users, color: "#4a7c59", trend: { value: 12, label: "vs last month" } },
  { title: "Active Students", value: 186, subtitle: "activity in last 14 days", icon: TrendingUp, color: "#2c6e8a", trend: { value: 8, label: "vs last month" } },
  { title: "Applications Pending", value: 14, subtitle: "awaiting review", icon: FileText, color: "#c9923a", trend: { value: -3, label: "vs last month" } },
  { title: "Total WU Awarded", value: "42,180", subtitle: "wellness units earned", icon: Coins, color: "#c9923a", trend: { value: 18, label: "vs last month" } },
  { title: "Graduates", value: 31, subtitle: "certified practitioners", icon: GraduationCap, color: "#4a7c59", trend: { value: 6, label: "vs last month" } },
  { title: "At-Risk Students", value: 12, subtitle: "no activity 14+ days", icon: AlertTriangle, color: "#c0392b" },
];

const recentApplications = [
  { name: "Sarah Thompson", email: "sarah.t@email.com", school: "Herbal Medicine", status: "submitted", date: "2h ago" },
  { name: "Marcus Williams", email: "mwilliams@email.com", school: "TCM", status: "under_review", date: "5h ago" },
  { name: "Priya Nair", email: "priya.n@email.com", school: "Functional Wellness", status: "accepted", date: "1d ago" },
  { name: "James Chen", email: "jchen@email.com", school: "Homeopathic Studies", status: "rejected", date: "2d ago" },
  { name: "Luna Rivera", email: "luna.r@email.com", school: "Practice Building", status: "waitlisted", date: "3d ago" },
];

const recentActivity = [
  { type: "enrollment", text: "Emma Clarke enrolled in Yin and Yang Foundations", time: "10 min ago" },
  { type: "case_study", text: "Marcus Chen submitted a case study for review", time: "1h ago" },
  { type: "application", text: "New application from Sarah Thompson", time: "2h ago" },
  { type: "certification", text: "Sophia Andersson earned Natural Wellness Practitioner certification", time: "4h ago" },
  { type: "quiz", text: "15 quiz attempts submitted today", time: "5h ago" },
];

const popularSchools = [
  { name: "Herbal Medicine", icon: "🌿", color: "#4a7c59", enrollments: 142 },
  { name: "Functional Wellness", icon: "⚡", color: "#d4882a", enrollments: 118 },
  { name: "TCM", icon: "☯️", color: "#c0392b", enrollments: 96 },
  { name: "Practice Building", icon: "🏛️", color: "#2c6e8a", enrollments: 87 },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-playfair text-3xl font-bold text-[#1a1a1a]">Admin Dashboard</h1>
        <p className="text-[#6b6459] mt-1">Academy overview and analytics</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {stats.map((s) => (
          <StatsCard key={s.title} {...s} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-[#e2ddd5] rounded-[16px] shadow-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-playfair text-lg font-bold text-[#1a1a1a]">Recent Applications</h2>
            <a href="/admin/applications" className="text-xs text-[#4a7c59] font-medium hover:underline">View all</a>
          </div>
          <div className="space-y-3">
            {recentApplications.map((app) => (
              <div key={app.email} className="flex items-center gap-3">
                <Avatar name={app.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1a1a1a] truncate">{app.name}</p>
                  <p className="text-xs text-[#6b6459]">{app.school} · {app.date}</p>
                </div>
                <StatusBadge status={app.status} />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-[#e2ddd5] rounded-[16px] shadow-card p-6">
          <h2 className="font-playfair text-lg font-bold text-[#1a1a1a] mb-4">Popular Schools</h2>
          <div className="space-y-3">
            {popularSchools.map((school) => (
              <div key={school.name} className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                  style={{ backgroundColor: `${school.color}15` }}
                >
                  {school.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-[#1a1a1a]">{school.name}</p>
                    <span className="text-sm font-semibold" style={{ color: school.color }}>{school.enrollments}</span>
                  </div>
                  <div className="w-full bg-[#ede8de] rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full"
                      style={{ width: `${(school.enrollments / 150) * 100}%`, backgroundColor: school.color }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#e2ddd5] rounded-[16px] shadow-card p-6">
        <h2 className="font-playfair text-lg font-bold text-[#1a1a1a] mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {recentActivity.map((a, i) => (
            <div key={i} className="flex items-start gap-3 pb-3 border-b border-[#f5f1ea] last:border-0">
              <div className="w-2 h-2 rounded-full bg-[#4a7c59] mt-2 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-[#1a1a1a]">{a.text}</p>
                <p className="text-xs text-[#6b6459]">{a.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
