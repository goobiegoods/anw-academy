import Link from "next/link";

const schools = [
  { name: "School of Herbal Medicine", slug: "herbal-medicine", icon: "🌿", color: "#4a7c59", courses: 8, departments: 6, enrollments: 142, avgProgress: 54 },
  { name: "School of Traditional Chinese Medicine", slug: "traditional-chinese-medicine", icon: "☯️", color: "#c0392b", courses: 8, departments: 7, enrollments: 96, avgProgress: 41 },
  { name: "School of Homeopathic Studies", slug: "homeopathic-studies", icon: "💧", color: "#5b4fcf", courses: 8, departments: 7, enrollments: 72, avgProgress: 38 },
  { name: "School of Functional Wellness", slug: "functional-wellness", icon: "⚡", color: "#d4882a", courses: 8, departments: 7, enrollments: 118, avgProgress: 47 },
  { name: "School of Practice Building", slug: "practice-building", icon: "🏛️", color: "#2c6e8a", courses: 8, departments: 7, enrollments: 87, avgProgress: 62 },
  { name: "School of Wellness Entrepreneurship", slug: "wellness-entrepreneurship", icon: "🚀", color: "#7a5c3a", courses: 8, departments: 8, enrollments: 65, avgProgress: 44 },
];

export default function AdminSchoolsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-playfair text-3xl font-bold text-[#1a1a1a]">Schools</h1>
        <p className="text-[#6b6459] mt-1">Manage the six schools and their curricula</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {schools.map((school) => (
          <div key={school.slug} className="bg-white border border-[#e2ddd5] rounded-[16px] shadow-card overflow-hidden">
            <div className="h-1.5" style={{ backgroundColor: school.color }} />
            <div className="p-5">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ backgroundColor: `${school.color}15` }}>
                  {school.icon}
                </div>
                <div className="flex-1">
                  <h2 className="font-playfair font-bold text-[#1a1a1a]">{school.name}</h2>
                  <div className="flex items-center gap-3 mt-1 text-xs text-[#6b6459]">
                    <span>{school.departments} departments</span>
                    <span>·</span>
                    <span>{school.courses} courses</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-[#f5f1ea] rounded-xl p-3">
                  <p className="text-2xl font-bold font-playfair text-[#1a1a1a]">{school.enrollments}</p>
                  <p className="text-xs text-[#6b6459]">Enrollments</p>
                </div>
                <div className="bg-[#f5f1ea] rounded-xl p-3">
                  <p className="text-2xl font-bold font-playfair text-[#1a1a1a]">{school.avgProgress}%</p>
                  <p className="text-xs text-[#6b6459]">Avg Progress</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
