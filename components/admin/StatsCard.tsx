import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  color?: string;
  trend?: { value: number; label: string };
  className?: string;
}

export default function StatsCard({ title, value, subtitle, icon: Icon, color = "#4a7c59", trend, className }: StatsCardProps) {
  return (
    <div className={cn("bg-white border border-[#e2ddd5] rounded-[16px] shadow-card p-5", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[#6b6459] font-medium">{title}</p>
          <p className="text-3xl font-bold text-[#1a1a1a] mt-1 font-playfair">{value}</p>
          {subtitle && <p className="text-xs text-[#6b6459] mt-1">{subtitle}</p>}
        </div>
        {Icon && (
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${color}18` }}
          >
            <Icon size={20} style={{ color }} />
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1">
          <span className={cn("text-xs font-medium", trend.value >= 0 ? "text-green-600" : "text-red-500")}>
            {trend.value >= 0 ? "+" : ""}{trend.value}%
          </span>
          <span className="text-xs text-[#6b6459]">{trend.label}</span>
        </div>
      )}
    </div>
  );
}
