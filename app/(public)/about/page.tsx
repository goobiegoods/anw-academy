import Link from "next/link";

export const metadata = {
  title: "About — The Academy of Natural Wellness",
};

const PILLARS = [
  {
    title: "Primary sources first",
    body: "We teach from the texts the traditions actually rest on — the Ebers Papyrus, the Huang Di Nei Jing, Hahnemann's Organon, Culpeper's Complete Herbal, Maude Grieve's A Modern Herbal — not from secondhand summaries of summaries.",
  },
  {
    title: "Depth over dabbling",
    body: "Every lesson is a ten-card teaching sequence built to university standard: a hook, two full teachings, the masters in their own words, vocabulary, clinical relevance, and a gated assessment. No filler, no fluff.",
  },
  {
    title: "Safety as a discipline",
    body: "Contraindications, drug-herb interactions, special populations, and scope of practice are core curriculum at ANW — not footnotes. We believe knowing when to refer is the most important skill a wellness practitioner has.",
  },
  {
    title: "Earned credentials",
    body: "Wellness Units are awarded for demonstrated learning — passed quizzes, written case studies, proctored exams, a recorded teaching capstone. Nothing at ANW is purchased; everything is earned.",
  },
];

export default function AboutPage() {
  return (
    <div className="w-full bg-[#faf8f4]">
      {/* Mission */}
      <div className="w-full bg-[#f5f1ea] border-b border-[#e2ddd5] py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="block w-10 h-px bg-[#c9923a]" />
            <span className="uppercase tracking-[0.25em] text-[10px] font-semibold text-[#9a9088]">
              About the Academy
            </span>
          </div>
          <h1 className="font-playfair text-5xl md:text-6xl font-bold text-[#1a1a1a] leading-tight max-w-3xl">
            Rigorous natural wellness education,{" "}
            <span className="italic font-normal text-[#4a7c59]">
              for everyone serious enough to earn it.
            </span>
          </h1>
          <p className="text-sm text-[#6b6459] max-w-2xl mt-6" style={{ lineHeight: 1.9 }}>
            The Academy of Natural Wellness exists because the traditions of
            natural medicine deserve better than weekend certificates and
            recycled blog posts. We built a university-grade institution —
            six schools, structured curricula, real assessment, mentor review
            — for people who want to actually know this material, not merely
            collect it.
          </p>
        </div>
      </div>

      {/* Approach */}
      <div id="approach" className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex items-center gap-3 mb-4">
          <span className="block w-10 h-px bg-[#c9923a]" />
          <span className="uppercase tracking-[0.25em] text-[10px] font-semibold text-[#9a9088]">
            Our Approach
          </span>
        </div>
        <h2 className="font-playfair text-3xl md:text-4xl font-bold text-[#1a1a1a] mb-10">
          Four commitments we don&apos;t bend on
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PILLARS.map((pillar) => (
            <div
              key={pillar.title}
              className="bg-white border border-[#e2ddd5] rounded-2xl p-8"
            >
              <span className="block w-8 h-1 rounded-full bg-[#c9923a] mb-5" />
              <h3 className="font-playfair text-xl font-bold text-[#1a1a1a]">
                {pillar.title}
              </h3>
              <p className="text-[13px] text-[#6b6459] mt-3" style={{ lineHeight: 1.85 }}>
                {pillar.body}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Founders */}
      <div id="faculty" className="w-full bg-[#2d5240] py-20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="block w-10 h-px bg-[#e8b45a]" />
              <span className="uppercase tracking-[0.25em] text-[10px] font-semibold text-white/50">
                The Founders
              </span>
            </div>
            <h2 className="font-playfair text-3xl md:text-4xl font-bold text-white leading-tight">
              Built by practitioners,{" "}
              <span className="italic font-normal text-[#e8b45a]">
                for practitioners.
              </span>
            </h2>
            <p className="text-[13px] text-white/70 mt-6" style={{ lineHeight: 1.9 }}>
              ANW was founded by Orel and his wife — a husband-and-wife team
              who spent years frustrated by the gap between the depth of the
              traditional literature and the shallowness of the courses
              teaching it. The Academy is their answer: an institution where
              the curriculum is drawn from the primary sources, the assessment
              is real, and the community treats natural wellness as the
              serious discipline it is.
            </p>
            <p className="text-[13px] text-white/70 mt-4" style={{ lineHeight: 1.9 }}>
              Today the Academy is supported by a faculty of thirty-six
              working practitioners across herbalism, Traditional Chinese
              Medicine, classical homeopathy, functional wellness, and
              professional practice — each teaching the tradition they
              actually live in.
            </p>
          </div>
          <div className="flex justify-center">
            {/* Founder photo placeholder */}
            <div className="w-full max-w-md aspect-[4/3] rounded-2xl border-2 border-dashed border-white/25 bg-white/5 flex flex-col items-center justify-center text-center px-8">
              <span className="font-playfair text-white/60 text-4xl mb-3">❦</span>
              <p className="text-white/60 text-sm font-playfair italic">
                Founders&apos; portrait — coming soon
              </p>
              <p className="text-white/35 text-[11px] mt-2">
                Orel &amp; family, The Academy of Natural Wellness
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Philosophy */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="block w-10 h-px bg-[#c9923a]" />
              <span className="uppercase tracking-[0.25em] text-[10px] font-semibold text-[#9a9088]">
                Educational Philosophy
              </span>
            </div>
            <h2 className="font-playfair text-3xl md:text-4xl font-bold text-[#1a1a1a] leading-tight">
              Tradition with its{" "}
              <span className="italic font-normal text-[#4a7c59]">
                homework done.
              </span>
            </h2>
          </div>
          <div className="space-y-5">
            <p className="text-[13.5px] text-[#6b6459]" style={{ lineHeight: 1.9 }}>
              We hold two ideas at once. First: the great wellness traditions
              — herbal, Chinese, homeopathic — are sophisticated systems of
              observation refined over centuries, and they deserve to be
              taught on their own terms, from their own texts, with their own
              internal logic intact.
            </p>
            <p className="text-[13.5px] text-[#6b6459]" style={{ lineHeight: 1.9 }}>
              Second: modern safety science, pharmacology, and clinical
              research are not the enemy of tradition — they are its quality
              control. Our students learn contraindications alongside
              correspondences, drug interactions alongside doctrines. A
              practitioner who knows only the romance of a tradition is a
              danger; one who knows only its chemistry is a tourist. We train
              neither.
            </p>
            <p className="text-[13.5px] text-[#6b6459]" style={{ lineHeight: 1.9 }}>
              The result is a graduate who can sit with a client, hear what is
              actually being said, support wellness within a clearly defined
              scope, and know — precisely and without ego — when to refer.
            </p>
          </div>
        </div>
      </div>

      {/* Disclaimer + CTA */}
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
            <strong>Educational Disclaimer:</strong> The Academy of Natural
            Wellness provides educational content for wellness learning only.
            Our programs are not a substitute for professional medical advice,
            diagnosis, or treatment, and our credentials do not confer medical
            licensure. Graduates of ANW are wellness educators, not licensed
            medical practitioners.
          </p>
        </div>
      </div>
    </div>
  );
}
