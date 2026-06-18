"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const inputClass =
  "w-full border border-[#e2ddd5] rounded-lg px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#4a7c59]";

const SECTIONS: { key: keyof FormState; label: string; placeholder: string; hint: string }[] = [
  { key: "title", label: "Case title", placeholder: "A short descriptive title", hint: "" },
  { key: "scenario", label: "Client scenario", placeholder: "Describe the (hypothetical) client situation and presenting concerns…", hint: "Set the scene: who, what they came for, relevant background." },
  { key: "observations", label: "Observations", placeholder: "What did you observe and gather?", hint: "Patterns, history, lifestyle, and context — within scope." },
  { key: "wellnessSupport", label: "Wellness support approach", placeholder: "What educational and lifestyle support would you offer?", hint: "Your reasoning, the modalities, and why they fit." },
  { key: "safetyConsiderations", label: "Safety considerations", placeholder: "Contraindications, interactions, red flags, and referral triggers…", hint: "What would make you refer, and what cautions apply." },
  { key: "reflection", label: "Reflection", placeholder: "What did you learn? What would you do differently?", hint: "Honest reflection on your reasoning and growth." },
];

type FormState = {
  title: string;
  scenario: string;
  observations: string;
  wellnessSupport: string;
  safetyConsiderations: string;
  reflection: string;
};

export default function CaseStudyForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    title: "",
    scenario: "",
    observations: "",
    wellnessSupport: "",
    safetyConsiderations: "",
    reflection: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const set = (k: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/case-studies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not submit.");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit.");
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="max-w-2xl text-center py-20">
        <div className="w-16 h-16 rounded-full bg-[#4a7c59] flex items-center justify-center mx-auto mb-6">
          <span className="text-white text-2xl">✓</span>
        </div>
        <h1 className="font-playfair text-3xl font-bold text-[#1a1a1a]">Case study submitted.</h1>
        <p className="text-sm text-[#6b6459] mt-3" style={{ lineHeight: 1.8 }}>
          A faculty mentor will review your case study and award 10–25 WU based on its depth and
          quality. You can track its status from your dashboard.
        </p>
        <Link
          href="/dashboard/case-studies"
          className="inline-block mt-8 bg-[#4a7c59] text-white text-sm font-semibold px-7 py-3 rounded-full"
        >
          Back to Case Studies
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-playfair text-3xl font-bold text-[#1a1a1a]">New Case Study</h1>
        <p className="text-[#6b6459] mt-1 text-sm">
          Mentor-reviewed; earns 10–25 WU based on assessment.
        </p>
      </div>

      <div className="bg-[#fef6e7] border border-[#e8d4a8] rounded-xl px-6 py-4">
        <p className="text-[12.5px] text-[#7a5c1e]" style={{ lineHeight: 1.7 }}>
          <strong>Educational exercise.</strong> This is a learning exercise. Do not use any real
          client data or identifying information. Construct a hypothetical or fully anonymized
          scenario.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white border border-[#e2ddd5] rounded-2xl p-7 space-y-5">
        {SECTIONS.map((s) => (
          <div key={s.key}>
            <label className="block text-sm font-medium text-[#1a1a1a] mb-1">{s.label}</label>
            {s.hint && <p className="text-[11px] text-[#9a9088] mb-1.5">{s.hint}</p>}
            {s.key === "title" ? (
              <input value={form[s.key]} onChange={set(s.key)} className={`${inputClass} min-h-[44px]`} placeholder={s.placeholder} />
            ) : (
              <textarea rows={4} value={form[s.key]} onChange={set(s.key)} className={inputClass} placeholder={s.placeholder} />
            )}
          </div>
        ))}
        <button
          onClick={submit}
          disabled={busy || Object.values(form).some((v) => !v.trim())}
          className="w-full bg-[#4a7c59] text-white font-semibold py-3.5 rounded-full min-h-[44px] disabled:opacity-40"
        >
          {busy ? "Submitting…" : "Submit for Mentor Review"}
        </button>
      </div>
    </div>
  );
}
