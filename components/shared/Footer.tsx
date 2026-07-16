import Link from "next/link";
import AcademySeal from "@/components/ui/academy-seal";

const footerLinks = [
  { href: "/schools", label: "Schools" },
  { href: "/faculty", label: "Faculty & Practitioners" },
  { href: "/about", label: "The Institution" },
  { href: "/admissions", label: "Apply for Admission" },
  { href: "/login", label: "Student Login" },
];

export default function Footer() {
  return (
    <footer className="bg-[#1C3327] py-14 px-8">
      <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
        <AcademySeal size="sm" variant="light" className="opacity-90" />

        <p className="font-playfair font-semibold text-white text-base mt-4">
          Academy of Natural Wellness{" "}
          <span className="text-white/40 font-normal">·</span>{" "}
          <span className="text-[#D4A94A] text-sm tracking-[0.08em]">Est. 2026</span>
        </p>

        <p className="font-playfair italic text-[13px] text-white/60 mt-1.5 tracking-[0.1em]">
          Natura Sanat, Sapientia Docet
        </p>
        <p className="text-[10px] text-white/35 mt-0.5 tracking-[0.06em]">
          Nature Heals, Wisdom Teaches
        </p>

        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-7">
          {footerLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-[12px] text-white/60 hover:text-white transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="w-full mt-10 pt-6 border-t border-white/10">
          <p className="text-[10px] text-white/30 leading-relaxed max-w-2xl mx-auto">
            <strong>Educational Disclaimer:</strong> The Academy of Natural Wellness provides
            educational content for wellness learning only. Our programs are not a substitute for
            professional medical advice, diagnosis, or treatment. Graduates of ANW are wellness
            educators, not licensed medical practitioners.
          </p>
          <p className="text-[10px] text-white/30 mt-4">
            © 2026 Academy of Natural Wellness. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
