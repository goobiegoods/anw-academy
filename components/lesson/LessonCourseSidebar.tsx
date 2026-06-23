"use client";

import Link from "next/link";
import { Check, Lock } from "lucide-react";

type LessonItem = {
  id: string;
  title: string;
  order: number;
  isCompleted: boolean;
  isCurrent: boolean;
  isLocked: boolean;
};

type ModuleGroup = {
  id: string;
  title: string;
  order: number;
  lessons: LessonItem[];
};

type Props = {
  courseSlug: string;
  courseTitle: string;
  color: string;
  modules: ModuleGroup[];
  totalLessons: number;
  completedCount: number;
};

export default function LessonCourseSidebar({
  courseSlug,
  courseTitle,
  color,
  modules,
  totalLessons,
  completedCount,
}: Props) {
  const pct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  return (
    <div className="flex flex-col h-full bg-white border-r border-[#e2ddd5]">
      {/* Header */}
      <div className="p-5 border-b border-[#e2ddd5]" style={{ backgroundColor: "#2d5240" }}>
        <Link
          href={`/dashboard/courses/${courseSlug}`}
          className="text-[10px] uppercase tracking-[0.18em] text-white/60 hover:text-white/90 transition-colors block mb-2"
        >
          ← Back to Course
        </Link>
        <p className="text-white font-semibold text-sm leading-snug line-clamp-3">{courseTitle}</p>
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase tracking-[0.15em] text-white/50">
              Course Progress
            </span>
            <span className="text-[11px] text-white/70 font-medium">{pct}%</span>
          </div>
          <div className="h-1 rounded-full bg-white/20 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${pct}%`, backgroundColor: "#c9923a" }}
            />
          </div>
          <p className="text-[10px] text-white/50 mt-1">
            {completedCount} of {totalLessons} lessons
          </p>
        </div>
      </div>

      {/* Module list */}
      <nav className="flex-1 overflow-y-auto py-3">
        {modules.map((mod) => (
          <div key={mod.id} className="mb-1">
            <p className="px-5 py-2 text-[10px] uppercase tracking-[0.18em] font-bold text-[#6b6459]">
              {mod.title}
            </p>
            <ul>
              {mod.lessons.map((lesson) => (
                <li key={lesson.id}>
                  {lesson.isLocked ? (
                    <div className="flex items-start gap-2.5 px-5 py-2.5 opacity-40 cursor-not-allowed">
                      <Lock size={12} className="mt-0.5 flex-shrink-0 text-[#6b6459]" />
                      <span className="text-[12px] text-[#6b6459] leading-snug line-clamp-2">
                        {lesson.title}
                      </span>
                    </div>
                  ) : (
                    <Link
                      href={`/dashboard/courses/${courseSlug}/lessons/${lesson.id}`}
                      className={`flex items-start gap-2.5 px-5 py-2.5 transition-colors ${
                        lesson.isCurrent
                          ? "bg-[#f0f7f3] border-l-2 border-[#4a7c59]"
                          : "hover:bg-[#f9f7f4]"
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex-shrink-0 w-3.5 h-3.5 rounded-full flex items-center justify-center ${
                          lesson.isCompleted
                            ? "bg-[#4a7c59]"
                            : lesson.isCurrent
                            ? "border-2 border-[#4a7c59]"
                            : "border border-[#c8c0b4]"
                        }`}
                      >
                        {lesson.isCompleted && <Check size={8} className="text-white" strokeWidth={3} />}
                      </span>
                      <span
                        className={`text-[12px] leading-snug line-clamp-2 ${
                          lesson.isCurrent
                            ? "font-semibold text-[#2d5240]"
                            : lesson.isCompleted
                            ? "text-[#4a7c59]"
                            : "text-[#3a3530]"
                        }`}
                      >
                        {lesson.title}
                      </span>
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </div>
  );
}
