import StatusBadge from "@/components/shared/StatusBadge";
import WUBadge from "@/components/shared/WUBadge";

const courses = [
  { title: "Introduction to Herbal Medicine", school: { name: "Herbal Medicine", icon: "🌿", color: "#4a7c59" }, level: 1, wu: 16, hours: 8, enrollments: 48, status: "published", slug: "intro-herbal-medicine" },
  { title: "Herbal Safety & Responsible Use", school: { name: "Herbal Medicine", icon: "🌿", color: "#4a7c59" }, level: 1, wu: 12, hours: 6, enrollments: 36, status: "published", slug: "herbal-safety" },
  { title: "Introduction to TCM", school: { name: "TCM", icon: "☯️", color: "#c0392b" }, level: 1, wu: 16, hours: 8, enrollments: 30, status: "published", slug: "intro-tcm" },
  { title: "Yin and Yang Foundations", school: { name: "TCM", icon: "☯️", color: "#c0392b" }, level: 1, wu: 14, hours: 8, enrollments: 28, status: "published", slug: "yin-yang-foundations" },
  { title: "Foundations of Nutrition", school: { name: "Functional Wellness", icon: "⚡", color: "#d4882a" }, level: 1, wu: 14, hours: 8, enrollments: 42, status: "published", slug: "foundations-nutrition" },
  { title: "Gut Health Basics", school: { name: "Functional Wellness", icon: "⚡", color: "#d4882a" }, level: 1, wu: 14, hours: 8, enrollments: 38, status: "published", slug: "gut-health" },
  { title: "Core Homeopathic Philosophy", school: { name: "Homeopathic Studies", icon: "💧", color: "#5b4fcf" }, level: 1, wu: 14, hours: 8, enrollments: 24, status: "published", slug: "homeopathic-philosophy" },
  { title: "Client Communication", school: { name: "Practice Building", icon: "🏛️", color: "#2c6e8a" }, level: 1, wu: 12, hours: 6, enrollments: 32, status: "published", slug: "client-communication" },
];

export default function AdminCoursesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-playfair text-3xl font-bold text-[#1a1a1a]">Courses</h1>
        <p className="text-[#6b6459] mt-1">48 courses across 6 schools</p>
      </div>

      <div className="bg-white border border-[#e2ddd5] rounded-[16px] shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#e2ddd5] bg-[#faf8f4]">
                <th className="text-left text-xs font-semibold text-[#6b6459] uppercase tracking-wider px-5 py-3">Course</th>
                <th className="text-left text-xs font-semibold text-[#6b6459] uppercase tracking-wider px-4 py-3">Level</th>
                <th className="text-left text-xs font-semibold text-[#6b6459] uppercase tracking-wider px-4 py-3">WU</th>
                <th className="text-left text-xs font-semibold text-[#6b6459] uppercase tracking-wider px-4 py-3">Hours</th>
                <th className="text-left text-xs font-semibold text-[#6b6459] uppercase tracking-wider px-4 py-3">Enrolled</th>
                <th className="text-left text-xs font-semibold text-[#6b6459] uppercase tracking-wider px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c) => (
                <tr key={c.slug} className="border-b border-[#f5f1ea] hover:bg-[#faf8f4]">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span>{c.school.icon}</span>
                      <div>
                        <p className="font-medium text-sm text-[#1a1a1a]">{c.title}</p>
                        <p className="text-xs text-[#6b6459]">{c.school.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-[#6b6459]">{c.level}</td>
                  <td className="px-4 py-4"><WUBadge value={c.wu} size="sm" /></td>
                  <td className="px-4 py-4 text-sm text-[#6b6459]">{c.hours}h</td>
                  <td className="px-4 py-4 text-sm font-medium text-[#1a1a1a]">{c.enrollments}</td>
                  <td className="px-4 py-4"><StatusBadge status={c.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 text-center text-sm text-[#6b6459] border-t border-[#f5f1ea]">
          Showing 8 of 48 courses
        </div>
      </div>
    </div>
  );
}
