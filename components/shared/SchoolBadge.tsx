import { cn } from "@/lib/utils";

interface SchoolBadgeProps {
  name: string;
  icon: string;
  color: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function SchoolBadge({ name, icon, color, size = "md", className }: SchoolBadgeProps) {
  const sizeClasses = {
    sm: "text-xs px-2 py-1 gap-1",
    md: "text-sm px-3 py-1.5 gap-1.5",
    lg: "text-base px-4 py-2 gap-2",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        sizeClasses[size],
        className
      )}
      style={{
        backgroundColor: `${color}18`,
        color: color,
        border: `1px solid ${color}30`,
      }}
    >
      <span>{icon}</span>
      <span>{name}</span>
    </span>
  );
}
