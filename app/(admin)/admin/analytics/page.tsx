import StatsCard from "@/components/admin/StatsCard";
import { Users, GraduationCap, Coins, TrendingUp, BookOpen, Award } from "lucide-react";

const schoolStats = [
  { name: "Herbal Medicine", icon: "🌿", color: "#4a7c59", enrollments: 142, completions: 28, wuAwarded: 11420, avgScore: 84 },
  { name: "Functional Wellness", icon: "⚡", color: "#d4882a", enrollments: 118, completions: 22, wuAwarded: 9480, avgScore: 82 },
  { name: "TCM", icon: "☯️", color: "#c0392b", enrollments: 96, completions: 16, wuAwarded: 7680, avgScore: 79 },
  { name: "Practice Building", icon: "🏛️", color: "#2c6e8a", enrollments: 87, completions: 14, wuAwarded: 6960, avgScore: 88 },
  { name: "Homeopathic Studies", icon: "💧", color: "#5b4fcf", enrollments: 72, completions: 9, wuAwarded: 5760, avgScore: 76 },
  { name: "Wellness Entrepreneurship", icon: "🚀", color: "#7a5c3a", enrollments: 65, completions: 8, wuAwarded: 4880, avgScore: 85 },
];

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-playfair text-3xl font-bold text-[#1a1a1a]">Analytics</h1>
        <p className="text-[#6b6459] mt-1">Academy-wide performance metrics</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
        <StatsCard title="Total Students" value={248} icon={Users} color="#4a7c59" />
        <StatsCard title="Total WU Awarded" value="42,180" icon={Coins} color="#c9923a" />
        <StatsCard title="Course Completions" value={97} icon={BookOpen} color="#2c6e8a" />
        <StatsCard title="Certifications Awarded" value={64} icon={Award} color="#5b4fcf" />
        <StatsCard title="Avg Completion Rate" value="39%" icon={TrendingUp} color="#d4882a" />
        <StatsCard title="Verified Practitioners" value={31} icon={GraduationCap} color="#4a7c59" />
      </div>

      <div className="bg-white border border-[#e2ddd5] rounded-[16px] shadow-card p-6">
        <h2 className="font-playfair text-xl font-bold text-[#1a1a1a] mb-5">School Performance Breakdown</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#e2ddd5]">
                {["School", "Enrollments", "Completions", "WU Awarded", "Avg Quiz Score"].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-[#6b6459] uppercase tracking-wider px-4 py-3 first:px-0">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {schoolStats.map((s) => (
                <tr key={s.name} className="border-b border-[#f5f1ea]">
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-2">
                      <span>{s.icon}</span>
                      <span className="font-medium text-sm text-[#1a1a1a]">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-[#1a1a1a]">{s.enrollments}</td>
                  <td className="px-4 py-4 text-sm text-[#1a1a1a]">{s.completions}</td>
                  <td className="px-4 py-4 text-sm font-semibold text-[#c9923a]">{s.wuAwarded.toLocaleString()}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-[#ede8de] rounded-full h-1.5 w-24">
                        <div className="h-1.5 rounded-full bg-[#4a7c59]" style={{ width: `${s.avgScore}%` }} />
                      </div>
                      <span className="text-sm text-[#1a1a1a]">{s.avgScore}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
