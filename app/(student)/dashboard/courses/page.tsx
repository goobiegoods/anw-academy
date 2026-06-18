import Link from "next/link";
import ProgressBar from "@/components/shared/ProgressBar";
import WUBadge from "@/components/shared/WUBadge";
import SectionHeader from "@/components/shared/SectionHeader";

const enrolledCourses = [
  { title: "Introduction to Herbal Medicine", slug: "intro-herbal-medicine", school: { name: "Herbal Medicine", icon: "🌿", color: "#4a7c59" }, progress: 67, wu: 16, level: 1, hours: 8 },
  { title: "Yin and Yang Foundations", slug: "yin-yang-foundations", school: { name: "TCM", icon: "☯️", color: "#c0392b" }, progress: 40, wu: 14, level: 1, hours: 8 },
  { title: "Foundations of Nutrition", slug: "foundations-nutrition", school: { name: "Functional Wellness", icon: "⚡", color: "#d4882a" }, progress: 20, wu: 14, level: 1, hours: 8 },
];

const availableCourses = [
  { title: "Herbal Safety & Responsible Use", slug: "herbal-safety", school: { name: "Herbal Medicine", icon: "🌿", color: "#4a7c59" }, wu: 12, level: 1, hours: 6 },
  { title: "Core Homeopathic Philosophy", slug: "homeopathic-philosophy", school: { name: "Homeopathic Studies", icon: "💧", color: "#5b4fcf" }, wu: 14, level: 1, hours: 8 },
  { title: "Client Communication", slug: "client-communication", school: { name: "Practice Building", icon: "🏛️", color: "#2c6e8a" }, wu: 12, level: 1, hours: 6 },
  { title: "Sleep and Circadian Rhythm", slug: "sleep-circadian", school: { name: "Functional Wellness", icon: "⚡", color: "#d4882a" }, wu: 12, level: 1, hours: 6 },
  { title: "Building Your Wellness Brand", slug: "wellness-brand", school: { name: "Wellness Entrepreneurship", icon: "🚀", color: "#7a5c3a" }, wu: 12, level: 1, hours: 6 },
  { title: "Seasonal Living", slug: "seasonal-living", school: { name: "TCM", icon: "☯️", color: "#c0392b" }, wu: 12, level: 1, hours: 6 },
];

export default function CoursesPage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-playfair text-3xl font-bold text-[#1a1a1a]">My Courses</h1>
        <p className="text-[#6b6459] mt-1">Your enrolled courses and progress</p>
      </div>

      <section>
        <h2 className="font-playfair text-xl font-bold text-[#1a1a1a] mb-5">Enrolled Courses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {enrolledCourses.map((course) => (
            <Link key={course.slug} href={`/dashboard/courses/${course.slug}`}>
              <div className="bg-white border border-[#e2ddd5] rounded-[16px] shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 overflow-hidden h-full">
                <div className="h-1.5" style={{ backgroundColor: course.school.color }} />
                <div className="p-5">
                  <p className="text-xs text-[#6b6459] mb-2 flex items-center gap-1">
                    {course.school.icon} {course.school.name}
                  </p>
                  <h3 className="font-semibold text-[#1a1a1a] mb-1 leading-snug">{course.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-[#6b6459] mb-4">
                    <span>Level {course.level}</span>
                    <span>·</span>
                    <span>{course.hours}h</span>
                  </div>
                  <ProgressBar value={course.progress} />
                  <div className="flex items-center justify-between mt-2 text-xs text-[#6b6459]">
                    <span>{course.progress}% complete</span>
                    <WUBadge value={course.wu} size="sm" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-playfair text-xl font-bold text-[#1a1a1a]">Available Courses</h2>
          <Link href="/schools" className="text-sm text-[#4a7c59] font-medium hover:underline">Browse all schools →</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {availableCourses.map((course) => (
            <div key={course.slug} className="bg-white border border-[#e2ddd5] rounded-[16px] shadow-card overflow-hidden">
              <div className="h-1.5" style={{ backgroundColor: course.school.color }} />
              <div className="p-5">
                <p className="text-xs text-[#6b6459] mb-2 flex items-center gap-1">
                  {course.school.icon} {course.school.name}
                </p>
                <h3 className="font-semibold text-[#1a1a1a] mb-1 leading-snug">{course.title}</h3>
                <div className="flex items-center gap-3 text-xs text-[#6b6459] mb-4">
                  <span>Level {course.level}</span>
                  <span>·</span>
                  <span>{course.hours}h</span>
                  <WUBadge value={course.wu} size="sm" />
                </div>
                <button className="w-full bg-[#4a7c59] text-white text-sm font-medium py-2 rounded-lg hover:bg-[#2d5240] transition-colors">
                  Enroll Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
