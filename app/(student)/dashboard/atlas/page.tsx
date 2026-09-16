import Link from "next/link";
import { ArrowRight, BookOpenCheck, Compass, Network, ShieldCheck } from "lucide-react";
import { EVIDENCE_LEVELS } from "@/lib/academy-2.0/evidence-standard";
import { HUMAN_BODY_SPINE, LYMPHATIC_SYSTEM } from "@/lib/academy-2.0/knowledge-atlas";

const FOREST = "#1C3327";
const GOLD = "#D4A94A";

export default function AtlasPage() {
  return (
    <div className="space-y-10 pb-12">
      <header className="overflow-hidden rounded-[28px] border border-[#2f4b3b] px-6 py-8 text-white sm:px-9 sm:py-10" style={{ background: `linear-gradient(135deg, ${FOREST}, #2d5240)` }}>
        <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.26em]" style={{ color: GOLD }}>Academy 2.0 · Common Core</p>
            <h1 className="mt-3 font-playfair text-4xl font-bold leading-tight sm:text-5xl">The Human Body Atlas</h1>
            <p className="mt-4 max-w-xl text-[15px] leading-7 text-white/75">
              Learn the body as one connected system. Begin with clear anatomy and physiology, then follow each idea into evidence, traditions, preparations, safety, labs, and the six schools.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center sm:min-w-[340px]">
            {[
              ["01", "System open"],
              ["06", "Claim records"],
              ["05", "Cross-links"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-2xl border border-white/15 bg-white/[0.06] px-3 py-4">
                <p className="font-playfair text-2xl font-bold" style={{ color: GOLD }}>{value}</p>
                <p className="mt-1 text-[9px] uppercase tracking-[0.14em] text-white/55">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </header>

      <section aria-labelledby="atlas-open-title">
        <div className="mb-5 flex items-end justify-between gap-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8a6b30]">Atlas plate 001</p>
            <h2 id="atlas-open-title" className="mt-1 font-playfair text-2xl font-bold text-[#1a1a1a]">Now open for study</h2>
          </div>
          <span className="hidden rounded-full border border-[#cbd8ce] bg-[#edf4ef] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#2d6245] sm:inline-flex">Reviewed prototype</span>
        </div>

        <Link href={`/dashboard/atlas/${LYMPHATIC_SYSTEM.slug}`} className="group block">
          <article className="relative overflow-hidden rounded-[26px] border border-[#d8d0c3] bg-white shadow-[0_8px_30px_rgba(28,51,39,0.08)] transition-transform duration-200 group-hover:-translate-y-0.5">
            <div className="grid lg:grid-cols-[0.8fr_1.2fr]">
              <div className="flex min-h-[250px] items-center justify-center p-8" style={{ background: "radial-gradient(circle at 50% 50%, #e4efe7 0%, #f4f0e7 68%)" }}>
                <div className="relative h-44 w-44 rounded-full border border-[#9bb6a2]">
                  <div className="absolute left-1/2 top-1/2 h-[132px] w-[2px] -translate-x-1/2 -translate-y-1/2 bg-[#789984]" />
                  {["18% 25%", "72% 28%", "28% 58%", "70% 65%", "46% 78%"].map((position) => {
                    const [left, top] = position.split(" ");
                    return <span key={position} className="absolute h-3 w-3 rounded-full border-2 border-[#f4f0e7] bg-[#4f7b5c]" style={{ left, top }} aria-hidden="true" />;
                  })}
                  <span className="absolute inset-6 rounded-full border border-dashed border-[#91a798]" aria-hidden="true" />
                  <Network className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[#1c3327]" size={34} aria-hidden="true" />
                </div>
              </div>
              <div className="p-7 sm:p-9">
                <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#8a7a6a]">
                  <span>{LYMPHATIC_SYSTEM.catalogCode}</span><span aria-hidden="true">·</span><span>{LYMPHATIC_SYSTEM.level}</span>
                </div>
                <h3 className="mt-3 font-playfair text-3xl font-bold text-[#1C3327]">{LYMPHATIC_SYSTEM.title}</h3>
                <p className="font-playfair text-lg italic text-[#8a6b30]">{LYMPHATIC_SYSTEM.subtitle}</p>
                <p className="mt-4 max-w-2xl text-[14px] leading-7 text-[#5d554b]">{LYMPHATIC_SYSTEM.orient}</p>
                <div className="mt-6 flex flex-wrap gap-3 text-[11px] text-[#6b6459]">
                  <span className="rounded-full bg-[#f4f0e8] px-3 py-1.5">Anatomy + physiology</span>
                  <span className="rounded-full bg-[#f4f0e8] px-3 py-1.5">Claim-level evidence</span>
                  <span className="rounded-full bg-[#f4f0e8] px-3 py-1.5">Tier 0 practical lab</span>
                </div>
                <span className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-xl px-5 py-3 text-[13px] font-bold text-white" style={{ backgroundColor: FOREST }}>
                  Enter the system <ArrowRight size={15} aria-hidden="true" />
                </span>
              </div>
            </div>
          </article>
        </Link>
      </section>

      <section aria-labelledby="spine-title" className="rounded-[24px] border border-[#ded7cb] bg-[#f5f0e8] p-6 sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1C3327] text-[#D4A94A]"><Compass size={19} aria-hidden="true" /></div>
            <h2 id="spine-title" className="mt-4 font-playfair text-2xl font-bold text-[#1a1a1a]">The shared Human Body spine</h2>
            <p className="mt-3 text-[13px] leading-6 text-[#6b6459]">Not a seventh school. This common foundation sits beneath every school so anatomy, evidence, and safety remain coherent as students move between traditions.</p>
          </div>
          <ol className="grid gap-2 sm:grid-cols-2">
            {HUMAN_BODY_SPINE.map((unit) => (
              <li key={unit.code} className="rounded-xl border border-[#ded7cb] bg-white px-4 py-3">
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#9b7a38]">{unit.code}</p>
                <p className="mt-1 text-[13px] font-bold text-[#1C3327]">{unit.title}</p>
                <p className="mt-1 text-[11px] leading-5 text-[#776d61]">{unit.focus}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="atlas-principles-title">
        <h2 id="atlas-principles-title" className="font-playfair text-2xl font-bold text-[#1a1a1a]">How to read the Atlas</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {[
            { icon: BookOpenCheck, title: "Progressive depth", body: "Orient quickly, study mechanism, connect systems, compare frameworks, practice safely, then demonstrate understanding." },
            { icon: ShieldCheck, title: "Claims—not concepts—carry evidence", body: "A body system can contain established physiology, emerging questions, historical interpretations, and speculative claims at once." },
            { icon: Network, title: "Curated relationships", body: "Every connection should help you explain something, find the next lesson, or recognize a safety boundary—not decorate a graph." },
          ].map(({ icon: Icon, title, body }) => (
            <article key={title} className="rounded-2xl border border-[#e2ddd5] bg-white p-5">
              <Icon size={19} className="text-[#4a7c59]" aria-hidden="true" />
              <h3 className="mt-3 font-playfair text-lg font-bold text-[#1a1a1a]">{title}</h3>
              <p className="mt-2 text-[12px] leading-6 text-[#6b6459]">{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="evidence-key-title" className="border-t border-[#e2ddd5] pt-8">
        <h2 id="evidence-key-title" className="font-playfair text-xl font-bold text-[#1a1a1a]">ANW Evidence Standard</h2>
        <p className="mt-2 text-[12px] text-[#6b6459]">Each claim in an Atlas plate is labeled by the kind and strength of support behind that specific statement.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {EVIDENCE_LEVELS.map((level) => (
            <span key={level.id} className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-[10px] font-bold" style={{ color: level.color, borderColor: `${level.color}55`, backgroundColor: `${level.color}0d` }} title={level.description}>
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: level.color }} aria-hidden="true" />{level.label}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
