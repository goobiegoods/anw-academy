import Link from "next/link";
import AcademySeal from "@/components/ui/academy-seal";

export const metadata = {
  title: "The Institution — Academy of Natural Wellness",
};

const FOREST = "#1C3327";
const GOLD = "#D4A94A";

const LINKS = [
  {
    href: "/about/founder",
    title: "Welcome from the Founder",
    body: "A letter from Orel Fitch on why the Academy exists and where it is going.",
  },
  {
    href: "/about/philosophy",
    title: "Academic Philosophy",
    body: "The three pillars that shape every curriculum: primary sources, structure, and human mentorship.",
  },
  {
    href: "/about/methodology",
    title: "Curriculum Methodology",
    body: "How ANW curricula are built, how Wellness Units are calculated, and what a diploma means.",
  },
  {
    href: "/faculty",
    title: "Faculty & Practitioners",
    body: "The practitioners, scholars, and healers who teach at the Academy.",
  },
  {
    href: "/about/advisory-board",
    title: "Advisory Board",
    body: "The independent board being assembled to guide the Academy's standards.",
  },
  {
    href: "/academic-calendar",
    title: "Academic Calendar",
    body: "Terms, faculty office hours, and upcoming Academy events.",
  },
];

export default function InstitutionPage() {
  return (
    <div className="w-full bg-[#faf8f4]">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div className="w-full py-24" style={{ backgroundColor: FOREST }}>
        <div className="max-w-4xl mx-auto px-6 flex flex-col items-center text-center">
          <AcademySeal size="md" variant="gold" />
          <h1
            className="font-playfair text-5xl md:text-6xl font-bold mt-6 leading-tight"
            style={{ color: "#F3ECDA" }}
          >
            The Institution
          </h1>
          <p className="font-playfair italic text-[15px] tracking-[0.1em] mt-4" style={{ color: GOLD }}>
            Natura Sanat, Sapientia Docet
          </p>
          <p className="text-[11px] text-white/45 mt-1 tracking-[0.06em]">
            Nature Heals, Wisdom Teaches
          </p>
          <p className="text-[11px] uppercase tracking-[0.3em] text-white/50 mt-5">
            Established 2026
          </p>
        </div>
      </div>

      {/* ── Institutional statement ──────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <span className="block w-10 h-px mx-auto mb-8" style={{ backgroundColor: GOLD }} />
        <p className="font-playfair text-2xl md:text-[28px] leading-relaxed text-[#1a1a1a]">
          The Academy of Natural Wellness is a teaching institution for the great traditions of
          natural medicine — herbal, Chinese, homeopathic, and functional — taught from primary
          sources, assessed with rigor, and credentialed in public.
        </p>
        <p className="text-[14px] text-[#6b6459] mt-8 leading-relaxed max-w-2xl mx-auto">
          Six schools. Forty-eight curricula. Eight verifiable certifications. Every student earns
          a permanent academic record — a transcript, a student number, and diplomas that anyone
          can verify. We built the Academy because these traditions deserve better than weekend
          certificates, and the people who study them deserve an institution.
        </p>
        <span className="block w-10 h-px mx-auto mt-10" style={{ backgroundColor: GOLD }} />
      </div>

      {/* ── Links ────────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href}>
              <div className="bg-white border border-[#e2ddd5] rounded-2xl p-7 h-full hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all">
                <span className="block w-8 h-1 rounded-full mb-5" style={{ backgroundColor: GOLD }} />
                <h2 className="font-playfair text-lg font-bold text-[#1a1a1a] leading-snug">
                  {l.title}
                </h2>
                <p className="text-[12.5px] text-[#6b6459] mt-2 leading-relaxed">{l.body}</p>
                <span className="inline-block text-[12px] font-semibold mt-4" style={{ color: "#4a7c59" }}>
                  Read more →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Disclaimer + CTA ─────────────────────────────────────────── */}
      <div className="w-full bg-[#f5f1ea] py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-playfair text-3xl md:text-4xl font-bold text-[#1a1a1a]">
            Join us.
          </h2>
          <Link
            href="/admissions"
            className="inline-block bg-[#4a7c59] text-white text-sm font-bold px-9 py-3.5 rounded-full hover:bg-[#2d5240] transition-colors mt-8"
          >
            Apply for Admission
          </Link>
          <p className="text-[11px] text-[#9a9088] mt-12" style={{ lineHeight: 1.8 }}>
            <strong>Educational Disclaimer:</strong> The Academy of Natural Wellness provides
            educational content for wellness learning only. Our programs are not a substitute for
            professional medical advice, diagnosis, or treatment, and our credentials do not confer
            medical licensure. Graduates of ANW are wellness educators, not licensed medical
            practitioners.
          </p>
        </div>
      </div>
    </div>
  );
}
