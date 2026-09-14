import Link from "next/link";
import AcademySeal from "@/components/ui/academy-seal";

export const metadata = {
  title: "Curriculum Methodology — Academy of Natural Wellness",
};

const FOREST = "#1C3327";
const GOLD = "#D4A94A";

const EVIDENCE_LEVELS = [
  {
    label: "Established science",
    color: "#2D6A4F",
    description: "Supported by strong scientific consensus or replicated, high-quality evidence.",
    example: "Core anatomy, physiology, and well-established safety guidance.",
  },
  {
    label: "Evidence-informed practice",
    color: "#3B6F8F",
    description: "Supported by meaningful evidence, with limits that depend on context, population, or method.",
    example: "Promising practices that require calibrated claims and individual judgment.",
  },
  {
    label: "Emerging research",
    color: "#8A6B30",
    description: "Actively studied and potentially useful, but not yet settled enough for confident conclusions.",
    example: "Early findings, plausible mechanisms, and questions still under investigation.",
  },
  {
    label: "Traditional / historical",
    color: "#76568A",
    description: "Taught to understand a tradition on its own terms; longevity and cultural importance are not proof of efficacy.",
    example: "Classical texts, lineage concepts, and historical systems of interpretation.",
  },
  {
    label: "Theoretical / speculative",
    color: "#8B4A3C",
    description: "A model or claim with limited direct evidence, presented as a possibility rather than an established fact.",
    example: "Contested explanations and hypotheses that require explicit uncertainty.",
  },
];

const SECTIONS = [
  {
    title: "How ANW Curricula Are Structured",
    paragraphs: [
      "Every curriculum is organized inside one of the six schools and moves through ordered modules, each built from ten-card lessons: a hook, two full teachings, the masters quoted in their own words, key vocabulary, clinical relevance, a reflection, and a gated quiz. A lesson is not complete until its assessment is passed — progress at ANW is demonstrated, never assumed.",
      "Curricula are sequenced from foundations upward. Prerequisite lessons unlock the next; midterm and final examinations gate the curriculum as a whole. Case studies and capstone work sit above coursework, where knowledge becomes practice.",
    ],
  },
  {
    title: "Why Primary Sources",
    paragraphs: [
      "The great traditions we teach are systems of thought with their own internal logic. Teaching them from modern summaries strips the logic and leaves trivia. Our lessons return to the founding texts — the Organon, the Nei Jing, Culpeper, Grieve — so students learn the reasoning of a tradition, not just its conclusions.",
      "Where modern research qualifies or contradicts a classical claim, we teach that too. Safety science, contraindications, and drug–herb interactions appear beside the classical material, because honest curriculum shows the whole picture.",
    ],
  },
  {
    title: "How Wellness Units Are Calculated",
    paragraphs: [
      "Wellness Units (WU) are the Academy's academic credit. Each is tied to a verified demonstration of learning: a passed lesson quiz (1 WU), an original discussion contribution (2 WU) or peer reply (1 WU), a passed curriculum midterm (10 WU), a school final (25 WU), an approved case study (10–25 WU), and an approved capstone (50 WU).",
      "WU accumulate on a transparent ledger visible to every student, and thresholds mark academic levels from Seedling through Senior Practitioner. Nothing at the Academy is purchased into a transcript; every unit on it was earned.",
    ],
  },
  {
    title: "What a Certification Means — and What a Diploma Is",
    paragraphs: [
      "A certification is the academic achievement: a defined body of coursework, Wellness Units, case studies, and (at advanced levels) capstone work, all completed to standard. A diploma is the document that attests to it — issued with a certificate number built on the student's ID, signed, sealed, and publicly verifiable at our verification page.",
      "Because verification is public, an ANW credential is an assertion the Academy stands behind permanently. Anyone — a client, an employer, a colleague — can confirm a diploma in seconds.",
    ],
  },
  {
    title: "The Role of the Academy Scholar",
    paragraphs: [
      "The Academy Scholar is our AI study companion, trained on the ANW curriculum. Students use it to test understanding, explore connections between traditions, and get unstuck at midnight before an exam. It explains; it does not certify.",
      "Assessment, case study review, and capstone evaluation remain with human faculty. The Scholar's role is that of an infinitely patient tutor working alongside human mentors — never in place of them.",
    ],
  },
];

export default function MethodologyPage() {
  return (
    <div className="w-full bg-[#faf8f4]">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div className="w-full py-20" style={{ backgroundColor: FOREST }}>
        <div className="max-w-3xl mx-auto px-6 flex flex-col items-center text-center">
          <AcademySeal size="md" variant="gold" />
          <h1
            className="font-playfair text-4xl md:text-5xl font-bold mt-6 leading-tight"
            style={{ color: "#F3ECDA" }}
          >
            Curriculum Methodology
          </h1>
          <p className="font-playfair italic text-[14px] text-white/60 mt-3 max-w-md">
            How the Academy builds curricula, counts credit, and stands behind its diplomas.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 pt-16">
        <section aria-labelledby="evidence-standard-title">
          <div className="max-w-3xl">
            <span className="block w-8 h-1 rounded-full mb-4" style={{ backgroundColor: GOLD }} />
            <p className="text-[10px] uppercase tracking-[0.22em] font-bold text-[#8a6b30]">
              The ANW Evidence Standard
            </p>
            <h2 id="evidence-standard-title" className="font-playfair text-3xl font-bold text-[#1a1a1a] mt-2">
              Learn the claim—and the kind of knowing behind it.
            </h2>
            <p className="text-[14px] text-[#4a4238] leading-[1.9] mt-4">
              Academy 2.0 does not flatten science, tradition, early research, and theory into one voice.
              We teach each seriously, label it clearly, and show where different frameworks agree,
              conflict, or remain uncertain.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            {EVIDENCE_LEVELS.map((level, index) => (
              <article
                key={level.label}
                className={`bg-white rounded-2xl border border-[#e2ddd5] p-6 ${index === EVIDENCE_LEVELS.length - 1 ? "md:col-span-2" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: level.color }} />
                  <h3 className="font-playfair text-lg font-bold text-[#1a1a1a]">{level.label}</h3>
                </div>
                <p className="text-[13px] text-[#4a4238] leading-relaxed mt-3">{level.description}</p>
                <p className="text-[11.5px] text-[#8a7a6a] leading-relaxed mt-3">
                  <span className="font-semibold uppercase tracking-[0.08em]">For example:</span>{" "}
                  {level.example}
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-16 space-y-10">
        {SECTIONS.map((section) => (
          <div key={section.title}>
            <span className="block w-8 h-1 rounded-full mb-4" style={{ backgroundColor: GOLD }} />
            <h2 className="font-playfair text-2xl font-bold text-[#1a1a1a] leading-snug mb-4">
              {section.title}
            </h2>
            {section.paragraphs.map((p, i) => (
              <p key={i} className={`text-[14px] text-[#4a4238] leading-[1.9] ${i > 0 ? "mt-4" : ""}`}>
                {p}
              </p>
            ))}
          </div>
        ))}

        <div className="flex items-center justify-between pt-4" style={{ borderTop: "1px solid #e2ddd5" }}>
          <Link href="/about" className="text-[13px] text-[#6b6459] hover:text-[#1a1a1a] transition-colors">
            ← The Institution
          </Link>
          <Link href="/verify" className="text-[13px] font-semibold text-[#4a7c59] hover:underline">
            Verify a Graduate →
          </Link>
        </div>
      </div>
    </div>
  );
}
