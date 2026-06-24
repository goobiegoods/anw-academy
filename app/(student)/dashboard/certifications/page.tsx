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

// Double-concentric-circle wax seal — gold on dark green
function CertSeal() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="40" r="37" fill="rgba(212,169,74,0.12)" stroke="#D4A94A" strokeWidth="1.5" />
      <circle cx="40" cy="40" r="27" fill="rgba(212,169,74,0.18)" stroke="#D4A94A" strokeWidth="1.5" />
      <path d="M27 41 L35 49 L54 30" stroke="#D4A94A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Shared bottom row — dark=true for awarded card on dark green background
function CardFooter({ currentWU, requiredWU, completedCourses, requiredCourses, dark = false }: {
  currentWU: number; requiredWU: number; completedCourses: number; requiredCourses: number; dark?: boolean;
}) {
  return (
    <div
      className="px-6 py-3.5 flex items-center justify-center gap-5"
      style={{ borderTop: dark ? "0.5px solid rgba(255,255,255,0.10)" : "0.5px solid #DDD5C5" }}
    >
      <span className="text-[12px]" style={{ color: dark ? "rgba(255,255,255,0.50)" : "#6b6459" }}>
        <span className="font-semibold" style={{ color: dark ? "rgba(255,255,255,0.85)" : "#3a3028" }}>
          {currentWU.toLocaleString()}
        </span>
        /{requiredWU.toLocaleString()} WU
      </span>
      <span
        className="w-1 h-1 rounded-full flex-shrink-0"
        style={{ backgroundColor: dark ? "rgba(255,255,255,0.20)" : "#c8bfb0" }}
      />
      <span className="text-[12px]" style={{ color: dark ? "rgba(255,255,255,0.50)" : "#6b6459" }}>
        <span className="font-semibold" style={{ color: dark ? "rgba(255,255,255,0.85)" : "#3a3028" }}>
          {completedCourses}
        </span>
        /{requiredCourses} courses
      </span>
    </div>
  );
}

export default function CertificationsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-playfair text-3xl font-bold text-[#1a1a1a]">Certifications</h1>
        <p className="text-[#6b6459] mt-1">Track your progress toward ANW certifications</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {certifications.map((cert) => {
          const progress = Math.min(100, Math.round((cert.currentWU / cert.requiredWU) * 100));
          const isAwarded = cert.status === "completed";

          return (
            <div
              key={cert.title}
              className="rounded-[16px] overflow-hidden flex flex-col"
              style={
                isAwarded
                  ? { backgroundColor: "#1C3327", border: "0.5px solid rgba(255,255,255,0.08)" }
                  : { backgroundColor: "#FAF7F0", border: "0.5px solid #DDD5C5" }
              }
            >
              {isAwarded ? (
                /* ── Awarded card — dark green hero ───────────── */
                <div className="flex-1 p-8 text-center flex flex-col items-center justify-center">
                  <div className="mb-3">
                    <CertSeal />
                  </div>
                  <p className="font-playfair italic text-[13px] text-[#D4A94A] mb-3">
                    Awarded
                  </p>
                  <p className="text-[10px] uppercase tracking-[0.22em] font-semibold mb-2"
                    style={{ color: "rgba(255,255,255,0.45)" }}>
                    Level {cert.level}
                  </p>
                  <h2 className="font-playfair text-2xl font-bold text-white leading-snug mb-2">
                    {cert.title}
                  </h2>
                  {cert.awardedAt && (
                    <p className="text-[12px] mt-1" style={{ color: "rgba(255,255,255,0.50)" }}>
                      Awarded {cert.awardedAt}
                    </p>
                  )}
                </div>
              ) : (
                /* ── In-progress card ─────────────────────────── */
                <div className="flex-1 p-8">
                  <p className="text-[10px] uppercase tracking-[0.22em] font-semibold text-[#8a7a6a] mb-2">
                    Level {cert.level} · In Progress
                  </p>
                  <h2 className="font-playfair text-2xl font-bold text-[#1a1a1a] leading-snug mb-1">
                    {cert.title}
                  </h2>
                  <p className="text-[13px] text-[#6b6459] mb-6">
                    Complete {cert.requiredCourses} courses and earn {cert.requiredWU.toLocaleString()} WU to be awarded this certification.
                  </p>

                  {/* WU progress bar */}
                  <div
                    className="h-1.5 rounded-full overflow-hidden mb-2"
                    style={{ backgroundColor: "#EDE5D5" }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${progress}%`, backgroundColor: "#B98A2E" }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#8a7a6a]">
                    <span>
                      {cert.currentWU.toLocaleString()} of {cert.requiredWU.toLocaleString()} WU
                    </span>
                    <span>{progress}%</span>
                  </div>
                </div>
              )}

              <CardFooter
                currentWU={cert.currentWU}
                requiredWU={cert.requiredWU}
                completedCourses={cert.completedCourses}
                requiredCourses={cert.requiredCourses}
                dark={isAwarded}
              />
            </div>
          );
        })}
      </div>

      {/* Callout */}
      <div
        className="rounded-[16px] p-6"
        style={{ backgroundColor: "#FAF7F0", border: "0.5px solid #DDD5C5" }}
      >
        <h2 className="font-playfair text-lg font-bold text-[#1a1a1a] mb-1">
          Certification Pathways
        </h2>
        <p className="text-[13px] text-[#6b6459] mb-3 leading-relaxed">
          ANW certifications are awarded upon completing required courses and Wellness Unit milestones. Continue learning to advance through each level.
        </p>
        <a href="/programs" className="text-[13px] text-[#4a7c59] font-medium hover:underline">
          View all certification programs →
        </a>
      </div>
    </div>
  );
}
