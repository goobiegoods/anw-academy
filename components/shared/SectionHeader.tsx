import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  label?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
}

export default function SectionHeader({
  label,
  title,
  subtitle,
  align = "center",
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn(align === "center" ? "text-center" : "text-left", className)}>
      {label && (
        <span className="inline-block text-xs font-semibold uppercase tracking-widest text-[#c9923a] mb-3">
          {label}
        </span>
      )}
      <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-[#1a1a1a] leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-[#6b6459] text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}
