export default function Resources() {
  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="font-playfair text-3xl">Practice Library</h1>
      <p className="text-sm text-[#6b6459]">
        Working templates for thoughtful wellness education.
      </p>
      {[
        [
          "Client intake",
          [
            "Client name and contact details; consent to store the record.",
            "What brings you here? Record goals in the client's own words.",
            "Relevant history, allergies, current medicines and supplements, and existing care team.",
            "Discuss scope, confidentiality, and when to seek licensed medical care.",
            "Agree on educational priorities and record the next follow-up.",
          ],
        ],
        [
          "Session notes",
          [
            "Subjective: the client's reported experience and goals.",
            "Objective: observations only; distinguish reported information from what you observed.",
            "Assessment of educational needs: no diagnosis or unsupported inference.",
            "Plan: education shared, sources, agreed actions, referrals, and follow-up date.",
          ],
        ],
        [
          "Scope and communication",
          [
            "Explain your training and qualifications accurately; an Academy certificate is not a professional license.",
            "Distinguish traditional frameworks from established scientific evidence.",
            "Never tell a client to discontinue prescribed care. Refer medication, pregnancy, and disease questions to a qualified licensed professional.",
            "Urgent or worsening symptoms require prompt appropriate care.",
          ],
        ],
      ].map(([title, lines]) => (
        <section
          key={String(title)}
          className="bg-[#FAF7F0] border border-[#DDD5C5] rounded-2xl p-6"
        >
          <h2 className="font-playfair text-xl mb-4">{title}</h2>
          <ul className="list-disc pl-5 space-y-3 text-sm leading-relaxed">
            {(lines as string[]).map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
