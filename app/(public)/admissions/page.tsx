"use client";

import Link from "next/link";
import { useState } from "react";

const SCHOOLS = [
  "School of Herbal Medicine",
  "School of Traditional Chinese Medicine",
  "School of Homeopathic Studies",
  "School of Functional Wellness",
  "School of Practice Building",
  "School of Wellness Entrepreneurship",
  "Multiple Schools / Undecided",
];

const EXPERIENCE_LEVELS = [
  { value: "beginner", label: "Beginner — new to natural wellness" },
  { value: "intermediate", label: "Intermediate — self-taught or some study" },
  { value: "advanced", label: "Advanced — practicing or formally trained" },
];

const PATHWAYS = [
  { value: "personal", label: "Personal enrichment" },
  { value: "practitioner", label: "Practitioner certification" },
  { value: "entrepreneur", label: "Wellness business" },
];

const inputClass =
  "w-full border border-[#e2ddd5] rounded-lg px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#4a7c59] min-h-[44px]";

export default function AdmissionsPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    motivation: "",
    experienceLevel: "",
    schoolInterest: "",
    pathway: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const set = (key: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Something went wrong. Please try again.");
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="w-full bg-[#faf8f4] min-h-[70vh] flex items-center">
        <div className="max-w-xl mx-auto px-6 py-24 text-center">
          <div className="w-16 h-16 rounded-full bg-[#4a7c59] flex items-center justify-center mx-auto mb-6">
            <span className="text-white text-2xl">✓</span>
          </div>
          <h1 className="font-playfair text-4xl font-bold text-[#1a1a1a]">
            Application received.
          </h1>
          <p className="text-sm text-[#6b6459] mt-4" style={{ lineHeight: 1.9 }}>
            Thank you, {form.name.split(" ")[0] || "applicant"}. Your
            application to the Academy has been submitted and will be reviewed
            personally by our admissions team. You&apos;ll hear from us at{" "}
            <span className="font-semibold text-[#1a1a1a]">{form.email}</span>{" "}
            within five business days.
          </p>
          <Link
            href="/"
            className="inline-block mt-8 text-sm font-semibold text-[#4a7c59] border border-[#4a7c59]/40 px-7 py-3 rounded-full hover:bg-[#4a7c59]/5 transition-colors"
          >
            Return to the Academy
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#faf8f4]">
      {/* Header */}
      <div className="w-full bg-[#f5f1ea] border-b border-[#e2ddd5] py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="block w-10 h-px bg-[#c9923a]" />
            <span className="uppercase tracking-[0.25em] text-[10px] font-semibold text-[#9a9088]">
              Admissions
            </span>
          </div>
          <h1 className="font-playfair text-5xl md:text-6xl font-bold text-[#1a1a1a] leading-tight">
            Apply to{" "}
            <span className="italic font-normal text-[#4a7c59]">the Academy.</span>
          </h1>
          <p className="text-sm text-[#6b6459] max-w-xl mt-5" style={{ lineHeight: 1.9 }}>
            We admit students, not metrics. Tell us where you are, what draws
            you, and where you want to go. Every application is read personally
            — expect a reply within five business days.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-3xl mx-auto px-6 py-16">
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-[#e2ddd5] rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-8 md:p-10 space-y-6"
        >
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-[#1a1a1a] mb-1.5">
                Full name *
              </label>
              <input required value={form.name} onChange={set("name")} className={inputClass} placeholder="Your full name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1a1a1a] mb-1.5">
                Email address *
              </label>
              <input required type="email" value={form.email} onChange={set("email")} className={inputClass} placeholder="your@email.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1a1a1a] mb-1.5">
                Phone
              </label>
              <input value={form.phone} onChange={set("phone")} className={inputClass} placeholder="Optional" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1a1a1a] mb-1.5">
                Location
              </label>
              <input value={form.location} onChange={set("location")} className={inputClass} placeholder="City, Country" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1a1a1a] mb-1.5">
              School of interest *
            </label>
            <select required value={form.schoolInterest} onChange={set("schoolInterest")} className={inputClass}>
              <option value="">Select a school…</option>
              {SCHOOLS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-[#1a1a1a] mb-1.5">
                Experience level *
              </label>
              <select required value={form.experienceLevel} onChange={set("experienceLevel")} className={inputClass}>
                <option value="">Select…</option>
                {EXPERIENCE_LEVELS.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1a1a1a] mb-1.5">
                Your pathway *
              </label>
              <select required value={form.pathway} onChange={set("pathway")} className={inputClass}>
                <option value="">Select…</option>
                {PATHWAYS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1a1a1a] mb-1.5">
              What draws you to natural wellness? *
            </label>
            <textarea
              required
              rows={5}
              value={form.motivation}
              onChange={set("motivation")}
              className={inputClass}
              placeholder="Tell us your story — what you've studied, what you hope to learn, and what you want to do with it."
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#4a7c59] text-white font-semibold py-3.5 rounded-full hover:bg-[#2d5240] transition-colors disabled:opacity-60 min-h-[44px]"
          >
            {submitting ? "Submitting…" : "Submit Application"}
          </button>

          <p className="text-[11px] text-[#9a9088]" style={{ lineHeight: 1.8 }}>
            <strong>Educational disclaimer:</strong> The Academy of Natural
            Wellness provides educational programs only. Our courses and
            certifications do not confer medical licensure and are not a
            substitute for professional medical advice, diagnosis, or
            treatment.
          </p>
        </form>
      </div>
    </div>
  );
}
