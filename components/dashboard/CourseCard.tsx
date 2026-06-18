import Link from "next/link";
import ProgressBar from "@/components/shared/ProgressBar";
import WUBadge from "@/components/shared/WUBadge";

interface CourseCardProps {
  course: {
    title: string;
    slug: string;
    school: { name: string; color: string; icon: string };
    estimatedHours: number;
    wuValue: number;
    level: number;
  };
  progress?: number;
}

export default function CourseCard({ course, progress = 0 }: CourseCardProps) {
  return (
    <Link href={`/dashboard/courses/${course.slug}`}>
      <div className="bg-white border border-[#e2ddd5] rounded-[16px] shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
        <div
          className="h-2"
          style={{ backgroundColor: course.school.color }}
        />
        <div className="p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <p className="text-xs font-medium text-[#6b6459] mb-1 flex items-center gap-1">
                <span>{course.school.icon}</span>
                {course.school.name}
              </p>
              <h3 className="font-semibold text-[#1a1a1a] leading-snug">{course.title}</h3>
            </div>
            <WUBadge value={course.wuValue} size="sm" />
          </div>

          <div className="flex items-center gap-3 text-xs text-[#6b6459] mb-4">
            <span>{course.estimatedHours}h estimated</span>
            <span>·</span>
            <span>Level {course.level}</span>
          </div>

          <ProgressBar value={progress} showLabel />
          <p className="text-xs text-[#6b6459] mt-1">{progress}% complete</p>
        </div>
      </div>
    </Link>
  );
}
