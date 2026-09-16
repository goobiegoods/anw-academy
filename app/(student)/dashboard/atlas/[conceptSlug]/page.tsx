import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Beaker, BookOpen, Bot, ExternalLink, ShieldAlert } from "lucide-react";
import EvidenceMark from "@/components/academy-2.0/EvidenceMark";
import LymphaticFlowPlate from "@/components/atlas/LymphaticFlowPlate";
import { ATLAS_CONCEPTS, getAtlasConcept, getClaim } from "@/lib/academy-2.0/knowledge-atlas";

const FOREST = "#1C3327";
const GOLD = "#D4A94A";

export function generateStaticParams() {
  return ATLAS_CONCEPTS.map((concept) => ({ conceptSlug: concept.slug }));
}

export default async function AtlasConceptPage({
  params,
}: {
  params: Promise<{ conceptSlug: string }>;
}) {
  const { conceptSlug } = await params;
  const concept = getAtlasConcept(conceptSlug);
  if (!concept) notFound();

  const sourceById = new Map(concept.sources.map((source) => [source.id, source]));

  return (
    <article className="pb-16">
      <Link href="/dashboard/atlas" className="inline-flex min-h-11 items-center gap-2 text-[12px] font-semibold text-[#55705f] hover:text-[#1C3327]">
        <ArrowLeft size={14} aria-hidden="true" /> Human Body Atlas
      </Link>

      <header className="mt-3 border-y border-[#cfc6b7] py-8 sm:py-10">
        <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#8a7a6a]">
          <span>{concept.catalogCode}</span><span aria-hidden="true">·</span><span>Transport &amp; Defense</span><span aria-hidden="true">·</span><span>{concept.level}</span>
        </div>
        <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_280px] lg:items-end">
          <div>
            <h1 className="font-playfair text-4xl font-bold leading-tight text-[#1C3327] sm:text-6xl">{concept.title}</h1>
            <p className="mt-1 font-playfair text-xl italic text-[#8a6b30] sm:text-2xl">{concept.subtitle}</p>
            <p className="mt-5 max-w-3xl text-[15px] leading-8 text-[#4a4238]">{concept.orient}</p>
          </div>
          <aside className="border-l-2 pl-5" style={{ borderColor: GOLD }}>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#8a6b30]">Essential question</p>
            <p className="mt-2 font-playfair text-[16px] italic leading-7 text-[#1C3327]">{concept.essentialQuestion}</p>
          </aside>
        </div>
      </header>

      <nav aria-label="On this Atlas plate" className="sticky top-0 z-10 -mx-6 overflow-x-auto border-b border-[#ded7ca] bg-[#faf8f4]/95 px-6 py-3 backdrop-blur-sm">
        <div className="flex min-w-max gap-5 text-[11px] font-bold text-[#6b6459]">
          {[["#flow", "Trace the flow"], ["#connections", "Make connections"], ["#evidence", "Weigh the claims"], ["#lab", "Practice safely"], ["#sources", "Review sources"]].map(([href, label]) => (
            <a key={href} href={href} className="min-h-9 py-2 hover:text-[#1C3327]">{label}</a>
          ))}
        </div>
      </nav>

      <section id="flow" className="scroll-mt-16 py-12" aria-labelledby="flow-title">
        <div className="mb-7 max-w-3xl">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#8a6b30]">Foundation · Locate and trace</p>
          <h2 id="flow-title" className="mt-2 font-playfair text-3xl font-bold text-[#1a1a1a]">Follow the return pathway</h2>
          <p className="mt-3 text-[14px] leading-7 text-[#6b6459]">Begin with direction. Once you can explain where lymph comes from and where it goes, the structures become a connected mechanism rather than a vocabulary list.</p>
        </div>
        <LymphaticFlowPlate structures={concept.structures} />

        <ol className="mt-7 grid gap-2 sm:grid-cols-2 lg:grid-cols-4" aria-label="Lymphatic flow sequence">
          {concept.coreFlow.map((step, index) => (
            <li key={step} className="flex min-h-16 items-center gap-3 rounded-xl border border-[#e0d9ce] bg-white px-4 py-3">
              <span className="font-mono text-[11px] font-bold text-[#9b7a38]">{String(index + 1).padStart(2, "0")}</span>
              <span className="text-[12px] font-semibold text-[#38463d]">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <section id="connections" className="scroll-mt-16 border-t border-[#e2ddd5] py-12" aria-labelledby="connections-title">
        <div className="grid gap-8 lg:grid-cols-[0.65fr_1.35fr]">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#8a6b30]">Connect · Think in systems</p>
            <h2 id="connections-title" className="mt-2 font-playfair text-3xl font-bold text-[#1a1a1a]">Why lymph does not live in one folder</h2>
            <p className="mt-3 text-[13px] leading-7 text-[#6b6459]">Each line resolves to a specific, reviewable claim. The relationship is instructional—not decorative.</p>
          </div>
          <div className="divide-y divide-[#ece6dc] border-y border-[#d8d0c3]">
            {concept.connections.map((connection) => {
              const claim = getClaim(concept, connection.claimId);
              return (
                <div key={connection.id} className="grid gap-3 py-5 sm:grid-cols-[170px_1fr] sm:items-start">
                  <div>
                    <p className="font-playfair text-[17px] font-bold text-[#1C3327]">{connection.title}</p>
                    <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.14em] text-[#a17d38]">{connection.relation.replace("-", " ")}</p>
                  </div>
                  <div>
                    <p className="text-[13px] leading-6 text-[#4a4238]">{connection.summary}</p>
                    <div className="mt-3"><EvidenceMark status={claim.evidenceStatus} /></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="evidence" className="scroll-mt-16 rounded-[26px] px-6 py-9 sm:px-9" style={{ backgroundColor: "#F3ECDA" }} aria-labelledby="evidence-title">
        <div className="max-w-3xl">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#8a6b30]">Interpret · Evidence ledger</p>
          <h2 id="evidence-title" className="mt-2 font-playfair text-3xl font-bold text-[#1a1a1a]">Different claims require different confidence</h2>
          <p className="mt-3 text-[13px] leading-7 text-[#6b6459]">The evidence label belongs to the statement below—not to “lymph,” an herb, or an entire tradition.</p>
        </div>
        <div className="mt-7 grid gap-4 lg:grid-cols-2">
          {concept.claims.map((claim) => (
            <article key={claim.id} className="rounded-2xl border border-[#d9d1c3] bg-white p-5 sm:p-6">
              <EvidenceMark status={claim.evidenceStatus} />
              <h3 className="mt-4 font-playfair text-[18px] font-bold leading-7 text-[#1C3327]">{claim.statement}</h3>
              <p className="mt-3 text-[12px] leading-6 text-[#5f574e]">{claim.explanation}</p>
              {claim.limitations ? <p className="mt-3 border-l-2 border-[#c9a65b] pl-3 text-[11px] italic leading-5 text-[#766a5b]">Limit: {claim.limitations}</p> : null}
              <p className="mt-4 text-[9px] font-bold uppercase tracking-[0.13em] text-[#9b7a38]">Sources: {claim.sourceIds.map((id) => sourceById.get(id)?.organization).filter(Boolean).join(" · ")}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="lab" className="scroll-mt-16 py-12" aria-labelledby="lab-title">
        <div className="grid overflow-hidden rounded-[26px] border border-[#cfd9d1] bg-white lg:grid-cols-[0.7fr_1.3fr]">
          <div className="p-7 text-white sm:p-9" style={{ backgroundColor: FOREST }}>
            <Beaker size={24} style={{ color: GOLD }} aria-hidden="true" />
            <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color: GOLD }}>Practical learning · Safety tier {concept.lab.safetyTier}</p>
            <h2 id="lab-title" className="mt-2 font-playfair text-3xl font-bold">{concept.lab.title}</h2>
            <p className="mt-4 text-[13px] leading-7 text-white/70">{concept.lab.purpose}</p>
            <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-white/15 pt-5 text-[11px]">
              <div><dt className="uppercase tracking-[0.12em] text-white/45">Duration</dt><dd className="mt-1 font-semibold text-white">{concept.lab.duration}</dd></div>
              <div><dt className="uppercase tracking-[0.12em] text-white/45">Mode</dt><dd className="mt-1 font-semibold text-white">Non-intervention model</dd></div>
            </dl>
          </div>
          <div className="p-7 sm:p-9">
            <h3 className="font-playfair text-xl font-bold text-[#1a1a1a]">Protocol</h3>
            <ol className="mt-4 space-y-3">
              {concept.lab.steps.map((step, index) => (
                <li key={step} className="flex gap-3 text-[12px] leading-6 text-[#534c44]"><span className="font-mono font-bold text-[#8a6b30]">{index + 1}</span><span>{step}</span></li>
              ))}
            </ol>
            <div className="mt-6 rounded-xl bg-[#f5f1ea] p-4">
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#8a6b30]">Evidence artifact</p>
              <p className="mt-2 text-[12px] leading-6 text-[#4f473f]">{concept.lab.artifact}</p>
            </div>
            <div className="mt-5">
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#8b4a3c]">Non-negotiable boundaries</p>
              <ul className="mt-2 space-y-2">
                {concept.lab.boundaries.map((boundary) => <li key={boundary} className="flex gap-2 text-[11px] leading-5 text-[#6b6459]"><span aria-hidden="true">—</span><span>{boundary}</span></li>)}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="safety-title" className="rounded-[22px] border border-[#d7b7af] bg-[#fbf3f1] p-6 sm:p-8">
        <div className="flex gap-4">
          <ShieldAlert className="mt-1 shrink-0 text-[#8B4A3C]" size={22} aria-hidden="true" />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8B4A3C]">Practitioner lens · Referral before interpretation</p>
            <h2 id="safety-title" className="mt-2 font-playfair text-2xl font-bold text-[#512f28]">Swelling is a sign—not a self-diagnosis</h2>
            <p className="mt-3 text-[13px] leading-6 text-[#6f4d45]">{concept.safety.scope}</p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {concept.safety.seekCare.map((item) => <li key={item} className="rounded-lg border border-[#ead1cb] bg-white/60 px-3 py-2 text-[11px] leading-5 text-[#6b4942]">Seek licensed care: {item}</li>)}
            </ul>
            <p className="mt-4 font-semibold text-[12px] leading-6 text-[#7c3026]">{concept.safety.emergency}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 py-12 lg:grid-cols-2">
        <div className="rounded-[22px] border border-[#e2ddd5] bg-white p-6 sm:p-7">
          <BookOpen size={20} className="text-[#4a7c59]" aria-hidden="true" />
          <h2 className="mt-3 font-playfair text-2xl font-bold text-[#1a1a1a]">Continue through the curriculum</h2>
          <div className="mt-5 divide-y divide-[#eee8de]">
            {concept.curriculumLinks.map((item) => (
              <Link key={item.title} href={item.href} className="group block py-4 first:pt-0 last:pb-0">
                <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#9b7a38]">{item.school}</p>
                <p className="mt-1 flex items-center justify-between gap-3 text-[13px] font-bold text-[#1C3327]">{item.title}<ArrowRight size={14} className="transition-transform group-hover:translate-x-1" aria-hidden="true" /></p>
                <p className="mt-1 text-[11px] leading-5 text-[#6b6459]">{item.note}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-[22px] p-6 text-white sm:p-7" style={{ background: `linear-gradient(145deg, ${FOREST}, #2d5240)` }}>
          <Bot size={20} style={{ color: GOLD }} aria-hidden="true" />
          <h2 className="mt-3 font-playfair text-2xl font-bold">Study with the Academy Scholar</h2>
          <p className="mt-2 text-[12px] leading-6 text-white/65">Open a focused conversation with the system and evidence context already framed.</p>
          <div className="mt-5 space-y-2">
            {concept.scholarPrompts.map((prompt) => (
              <Link key={prompt} href={`/dashboard/ai-tutor?question=${encodeURIComponent(prompt)}`} className="flex min-h-11 items-center justify-between gap-3 rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 text-[11px] leading-5 text-white/85 hover:bg-white/[0.1]">
                <span>{prompt}</span><ArrowRight size={13} className="shrink-0" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="sources" className="scroll-mt-16 border-t border-[#d8d0c3] pt-9" aria-labelledby="sources-title">
        <h2 id="sources-title" className="font-playfair text-2xl font-bold text-[#1a1a1a]">Source register</h2>
        <p className="mt-2 max-w-2xl text-[12px] leading-6 text-[#6b6459]">Sources support particular claims; their presence does not turn every statement about the topic into established science. Medical and safety content requires qualified academic review before production publication.</p>
        <ol className="mt-5 grid gap-3 md:grid-cols-2">
          {concept.sources.map((source, index) => (
            <li key={source.id} className="rounded-xl border border-[#e2ddd5] bg-white p-4">
              <p className="font-mono text-[9px] font-bold text-[#9b7a38]">{String(index + 1).padStart(2, "0")} · {source.sourceType.replaceAll("-", " ").toUpperCase()}</p>
              <p className="mt-2 text-[12px] font-bold text-[#1C3327]">{source.title}</p>
              <p className="mt-1 text-[10px] text-[#8a7a6a]">{source.organization}</p>
              {source.url.startsWith("/") ? (
                <Link href={source.url} className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold text-[#4a7c59]">Open Academy source <ArrowRight size={11} aria-hidden="true" /></Link>
              ) : (
                <a href={source.url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold text-[#4a7c59]">Open source <ExternalLink size={10} aria-hidden="true" /></a>
              )}
            </li>
          ))}
        </ol>
      </section>
    </article>
  );
}
