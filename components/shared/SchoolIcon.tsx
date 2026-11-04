import {
  Leaf,
  Flame,
  Droplets,
  Activity,
  Briefcase,
  TrendingUp,
  BookOpen,
} from "lucide-react";
const icons: Record<string, typeof Leaf> = {
  Leaf,
  Flame,
  Droplets,
  Activity,
  Briefcase,
  TrendingUp,
};
export default function SchoolIcon({ name }: { name: string }) {
  const Icon = icons[name] || BookOpen;
  return <Icon size={27} aria-hidden="true" />;
}
