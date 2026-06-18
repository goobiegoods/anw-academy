import { cn } from "@/lib/utils";

interface WUBadgeProps {
  value: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function WUBadge({ value, size = "md", className }: WUBadgeProps) {
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-semibold bg-[#c9923a]/10 text-[#c9923a] border border-[#c9923a]/20",
        sizeClasses[size],
        className
      )}
    >
      <span className="text-[#c9923a]">✦</span>
      {value} WU
    </span>
  );
}
