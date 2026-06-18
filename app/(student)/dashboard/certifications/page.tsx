import ProgressBar from "@/components/shared/ProgressBar";
import ProgressRing from "@/components/shared/ProgressRing";
import StatusBadge from "@/components/shared/StatusBadge";

const certifications = [
  {
    title: "Foundations of Natural Wellness",
    level: 1,
    requiredWU: 150,
    currentWU: 150,
    status: "completed",
    awardedAt: "3 months ago",
    requiredCourses: 4,
    completedCourses: 4,
  },
  {
    title: "Natural Wellness Practitioner",
    level: 4,
    requiredWU: 1000,
    currentWU: 342,
    status: "in_progress",
    awardedAt: null,
    requiredCourses: 12,
    completedCourses: 3,
  },
];

export default function CertificationsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-playfair text-3xl font-bold text-[#1a1a1a]">Certifications</h1>
        <p className="text-[#6b6459] mt-1">Track your progress toward ANW certifications</p>
      </div>

      <div className="space-y-5">
        {certifications.map((cert) => {
          const progress = Math.min(100, Math.round((cert.currentWU / cert.requiredWU) * 100));
          return (
            <div key={cert.title} className="bg-white border border-[#e2ddd5] rounded-[16px] shadow-card p-6">
              <div className="flex items-start gap-5 mb-5">
                <ProgressRing value={progress} size={72} strokeWidth={6} color="#4a7c59">
                  <span className="text-xs font-bold text-[#4a7c59]">{progress}%</span>
                </ProgressRing>
                <div className="flex-1">
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 rounded-full bg-[#4a7c59] text-white text-xs font-bold flex items-center justify-center">
                          {cert.level}
                        </div>
                        <span className="text-xs text-[#6b6459]">Level {cert.level}</span>
                      </div>
                      <h2 className="font-playfair text-xl font-bold text-[#1a1a1a]">{cert.title}</h2>
                    </div>
                    <StatusBadge status={cert.status} />
                  </div>
                  {cert.awardedAt && (
                    <p className="text-sm text-[#4a7c59] font-medium mt-1">✓ Awarded {cert.awardedAt}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-[#6b6459] mb-1.5">Wellness Units</p>
                  <ProgressBar value={cert.currentWU} max={cert.requiredWU} showLabel color="#c9923a" />
                  <p className="text-xs text-[#6b6459] mt-1">{cert.currentWU.toLocaleString()} / {cert.requiredWU.toLocaleString()} WU</p>
                </div>
                <div>
                  <p className="text-xs text-[#6b6459] mb-1.5">Required Courses</p>
                  <ProgressBar value={cert.completedCourses} max={cert.requiredCourses} showLabel color="#4a7c59" />
                  <p className="text-xs text-[#6b6459] mt-1">{cert.completedCourses} / {cert.requiredCourses} courses completed</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-[#f5f1ea] border border-[#e2ddd5] rounded-[16px] p-6">
        <h2 className="font-playfair text-lg font-bold text-[#1a1a1a] mb-2">Available Certifications</h2>
        <p className="text-sm text-[#6b6459] mb-4">Continue learning to unlock more certification pathways.</p>
        <a href="/programs" className="text-sm text-[#4a7c59] font-medium hover:underline">
          View all certification programs →
        </a>
      </div>
    </div>
  );
}
