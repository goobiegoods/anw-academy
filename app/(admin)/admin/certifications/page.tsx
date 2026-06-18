import ProgressBar from "@/components/shared/ProgressBar";

const certifications = [
  { title: "Foundations of Natural Wellness", level: 1, wu: 150, awarded: 31, inProgress: 48, duration: "3–6 months" },
  { title: "Herbal Wellness Consultant", level: 2, wu: 500, awarded: 12, inProgress: 24, duration: "6–12 months" },
  { title: "TCM Lifestyle Consultant", level: 2, wu: 500, awarded: 8, inProgress: 16, duration: "6–12 months" },
  { title: "Homeopathic Foundations Consultant", level: 2, wu: 500, awarded: 5, inProgress: 11, duration: "6–12 months" },
  { title: "Family Wellness Guide", level: 3, wu: 750, awarded: 4, inProgress: 9, duration: "12–18 months" },
  { title: "Natural Wellness Practitioner", level: 4, wu: 1000, awarded: 3, inProgress: 7, duration: "18 months" },
  { title: "Community Wellness Leader", level: 5, wu: 1250, awarded: 1, inProgress: 3, duration: "24 months" },
  { title: "Senior Natural Wellness Practitioner", level: 6, wu: 1750, awarded: 0, inProgress: 1, duration: "30–36 months" },
];

export default function AdminCertificationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-playfair text-3xl font-bold text-[#1a1a1a]">Certifications</h1>
        <p className="text-[#6b6459] mt-1">Certification pathway overview and student progress</p>
      </div>

      <div className="space-y-4">
        {certifications.map((cert) => (
          <div key={cert.title} className="bg-white border border-[#e2ddd5] rounded-[16px] shadow-card p-5">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#4a7c59] text-white flex items-center justify-center font-bold font-playfair flex-shrink-0">
                {cert.level}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div>
                    <h2 className="font-playfair font-bold text-[#1a1a1a]">{cert.title}</h2>
                    <p className="text-xs text-[#6b6459]">Level {cert.level} · ✦ {cert.wu.toLocaleString()} WU · {cert.duration}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold font-playfair text-[#4a7c59]">{cert.awarded}</p>
                    <p className="text-xs text-[#6b6459]">awarded</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-6 text-sm">
                  <div>
                    <span className="font-semibold text-[#c9923a]">{cert.inProgress}</span>
                    <span className="text-[#6b6459] ml-1">in progress</span>
                  </div>
                  <div>
                    <span className="font-semibold text-[#4a7c59]">{cert.awarded}</span>
                    <span className="text-[#6b6459] ml-1">completed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
