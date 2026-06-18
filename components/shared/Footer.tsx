import Link from "next/link";

const schools = [
  { href: "/schools/herbal-medicine", label: "Herbal Medicine" },
  { href: "/schools/traditional-chinese-medicine", label: "Traditional Chinese Medicine" },
  { href: "/schools/homeopathic-studies", label: "Homeopathic Studies" },
  { href: "/schools/functional-wellness", label: "Functional Wellness" },
  { href: "/schools/practice-building", label: "Practice Building" },
  { href: "/schools/wellness-entrepreneurship", label: "Wellness Entrepreneurship" },
];

const platform = [
  { href: "/programs", label: "Programs" },
  { href: "/admissions", label: "Admissions" },
  { href: "/practitioner-network", label: "Practitioner Network" },
  { href: "/dashboard", label: "Student Portal" },
];

const about = [
  { href: "/about", label: "Our Mission" },
  { href: "/about#faculty", label: "Faculty" },
  { href: "/about#approach", label: "Our Approach" },
];

export default function Footer() {
  return (
    <footer className="bg-[#2d5240] py-12 px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div
                className="w-8 h-8 rounded-full bg-[#6aab7e] flex items-center justify-center text-white font-bold font-playfair flex-shrink-0"
                style={{ fontSize: "9px", letterSpacing: "0.05em" }}
              >
                ANW
              </div>
              <span className="font-playfair font-semibold text-white text-sm leading-tight">
                The Academy of Natural Wellness
              </span>
            </div>
            <p className="font-playfair italic text-xs text-white/70 leading-relaxed mb-2">
              Where ancient wisdom meets modern mastery.
            </p>
            <p className="text-[11.5px] text-white/55 leading-relaxed">
              A comprehensive institution for natural wellness education.
            </p>
          </div>

          {/* Schools */}
          <div>
            <h4 className="text-[9px] font-bold uppercase tracking-widest text-[#c9923a] mb-4">
              Schools
            </h4>
            <ul className="space-y-2">
              {schools.map((s) => (
                <li key={s.href}>
                  <Link href={s.href} className="text-[11.5px] text-white/55 hover:text-white transition-colors">
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-[9px] font-bold uppercase tracking-widest text-[#c9923a] mb-4">
              Platform
            </h4>
            <ul className="space-y-2">
              {platform.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-[11.5px] text-white/55 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="text-[9px] font-bold uppercase tracking-widest text-[#c9923a] mb-4">
              About
            </h4>
            <ul className="space-y-2">
              {about.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-[11.5px] text-white/55 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <p className="text-[10px] text-white/28 leading-relaxed max-w-2xl">
            <strong>Educational Disclaimer:</strong> The Academy of Natural Wellness provides
            educational content for wellness learning only. Our programs are not a substitute for
            professional medical advice, diagnosis, or treatment. Graduates of ANW are wellness
            educators, not licensed medical practitioners.
          </p>
          <p className="text-[10px] text-white/28 md:text-right shrink-0">
            © {new Date().getFullYear()} The Academy of Natural Wellness. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
