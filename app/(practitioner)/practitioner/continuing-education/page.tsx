import Link from "next/link";
import WUBadge from "@/components/shared/WUBadge";

const courses = [
  { title: "Intro to Pattern Recognition", slug: "pattern-recognition", school: { name: "TCM", icon: "☯️", color: "#c0392b" }, wu: 18, level: 3, hours: 10 },
  { title: "Case Taking Foundations", slug: "case-taking", school: { name: "Homeopathic Studies", icon: "💧", color: "#5b4fcf" }, wu: 14, level: 3, hours: 8 },
  { title: "AI Tools for Practitioners", slug: "ai-tools", school: { name: "Wellness Entrepreneurship", icon: "🚀", color: "#7a5c3a" }, wu: 10, level: 2, hours: 4 },
  { title: "Community Workshops", slug: "community-workshops", school: { name: "Wellness Entrepreneurship", icon: "🚀", color: "#7a5c3a" }, wu: 12, level: 2, hours: 6 },
];

export default function ContinuingEducationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-playfair text-3xl font-bold text-[#1a1a1a]">Continuing Education</h1>
        <p className="text-[#6b6459] mt-1">Deepen your knowledge and earn CE credits</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {courses.map((c) => (
          <div key={c.slug} className="bg-white border border-[#e2ddd5] rounded-[16px] shadow-card overflow-hidden">
            <div className="h-1.5" style={{ backgroundColor: c.school.color }} />
            <div className="p-5">
              <p className="text-xs text-[#6b6459] mb-1">{c.school.icon} {c.school.name}</p>
              <h3 className="font-semibold text-[#1a1a1a] mb-3">{c.title}</h3>
              <div className="flex items-center gap-3 text-xs text-[#6b6459] mb-4">
                <span>Level {c.level}</span>
                <span>·</span>
                <span>{c.hours}h</span>
                <WUBadge value={c.wu} size="sm" />
              </div>
              <Link
                href={`/dashboard/courses/${c.slug}`}
                className="block bg-[#4a7c59] text-white text-sm font-medium py-2 rounded-lg text-center hover:bg-[#2d5240] transition-colors"
              >
                Enroll
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
