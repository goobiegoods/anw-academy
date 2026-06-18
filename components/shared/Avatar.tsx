import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/utils";

interface AvatarProps {
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  color?: string;
  className?: string;
}

const gradients = [
  "from-[#4a7c59] to-[#2d5240]",
  "from-[#c9923a] to-[#a07020]",
  "from-[#5b4fcf] to-[#3b2faf]",
  "from-[#c0392b] to-[#a02010]",
  "from-[#2c6e8a] to-[#1c4e6a]",
];

export default function Avatar({ name, size = "md", color, className }: AvatarProps) {
  const sizeMap = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-xl",
  };

  const gradientIndex = name.charCodeAt(0) % gradients.length;
  const gradient = gradients[gradientIndex];

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0",
        !color && `bg-gradient-to-br ${gradient}`,
        sizeMap[size],
        className
      )}
      style={color ? { background: `linear-gradient(135deg, ${color}, ${color}aa)` } : undefined}
    >
      {getInitials(name)}
    </div>
  );
}
