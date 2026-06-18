"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import LessonViewer from "@/components/lesson/LessonViewer";

type LessonSummary = {
  id: string;
  title: string;
  content: string;
  order: number;
  wuValue: number;
};

type CourseContentProps = {
  course: {
    id: string;
    title: string;
    description: string;
    level: number;
    estimatedHours: number;
    wuValue: number;
    school: { name: string; color: string; slug: string };
    modules: {
      id: string;
      title: string;
      order: number;
      lessons: LessonSummary[];
    }[];
    discussions: { id: string; title: string; moduleId: string | null }[];
    exams: { id: string; title: string; type: string; wuValue: number }[];
  };
  completedLessonIds: string[];
};

export default function CourseContent({
  course,
  completedLessonIds,
}: CourseContentProps) {
  const router = useRouter();
  const [openLesson, setOpenLesson] = useState<LessonSummary | null>(null);
  const [completed, setCompleted] = useState(new Set(completedLessonIds));

  const color = course.school.color;

  // Flat ordered lesson list — a lesson unlocks when every earlier lesson is complete
  const orderedLessons = useMemo(
    () => course.modules.flatMap((m) => m.lessons),
    [course.modules]
  );

  const isUnlocked = (lessonId: string) => {
    const idx = orderedLessons.findIndex((l) => l.id === lessonId);
    return orderedLessons.slice(0, idx).every((l) => completed.has(l.id));
  };

  const completedCount = orderedLessons.filter((l) => completed.has(l.id)).length;
  const pct = orderedLessons.length
    ? Math.round((completedCount / orderedLessons.length) * 100)
    : 0;

  return (
    <div className="space-y-8">
      {/* Course header */}
      <div
        className="rounded-2xl px-8 py-10 text-white"
        style={{
          background: `linear-gradient(130deg, ${color} 0%, ${color}cc 100%)`,
        }}
      >
        <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-white/60 mb-2">
          {course.school.name} · Level {course.level}
        </p>
        <h1 className="font-playfair text-3xl md:text-4xl font-bold leading-tight">
          {course.title}
        </h1>
        <p className="text-[13px] text-white/75 max-w-2xl mt-3" style={{ lineHeight: 1.8 }}>
          {course.description}
        </p>
        <div className="flex flex-wrap items-center gap-6 mt-6">
          <div>
            <p className="font-playfair text-2xl font-bold">{pct}%</p>
            <p className="text-[9px] uppercase tracking-[0.18em] text-white/60">Complete</p>
          </div>
          <div>
            <p className="font-playfair text-2xl font-bold">
              {completedCount}/{orderedLessons.length}
            </p>
            <p className="text-[9px] uppercase tracking-[0.18em] text-white/60">Lessons</p>
          </div>
          <div>
            <p className="font-playfair text-2xl font-bold">{course.wuValue}</p>
            <p className="text-[9px] uppercase tracking-[0.18em] text-white/60">WU Available</p>
          </div>
          <div>
            <p className="font-playfair text-2xl font-bold">{course.estimatedHours}h</p>
            <p className="text-[9px] uppercase tracking-[0.18em] text-white/60">Est. Hours</p>
          </div>
        </div>
        <div className="mt-5 h-1.5 rounded-full bg-white/20 overflow-hidden max-w-md">
          <div
            className="h-full bg-[#e8b45a] rounded-full transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Modules */}
      {course.modules.map((module, mi) => {
        const moduleDiscussion = course.discussions.find(
          (d) => d.moduleId === module.id
        );
        return (
          <div
            key={module.id}
            className="bg-white border border-[#e2ddd5] rounded-2xl overflow-hidden"
          >
            <div className="px-7 py-5 border-b border-[#f0ece4] bg-[#faf8f4]">
              <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#c9923a] mb-1">
                Module {mi + 1}
              </p>
              <h2 className="font-playfair text-lg font-bold text-[#1a1a1a]">
                {module.title}
              </h2>
            </div>
            <ul>
              {module.lessons.map((lesson, li) => {
                const done = completed.has(lesson.id);
                const unlocked = isUnlocked(lesson.id);
                return (
                  <li
                    key={lesson.id}
                    className="border-b border-[#f0ece4] last:border-b-0"
                  >
                    <button
                      disabled={!unlocked}
                      onClick={() => setOpenLesson(lesson)}
                      className="w-full flex items-center gap-4 px-7 py-4 min-h-[56px] text-left hover:bg-[#faf8f4] transition-colors disabled:hover:bg-transparent disabled:cursor-not-allowed"
                    >
                      <span
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-[12px] font-bold"
                        style={{
                          backgroundColor: done ? color : unlocked ? `${color}18` : "#f0ece4",
                          color: done ? "#fff" : unlocked ? color : "#b3aca0",
                        }}
                      >
                        {done ? "✓" : li + 1}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span
                          className={`block text-[14px] font-medium leading-snug ${
                            unlocked ? "text-[#1a1a1a]" : "text-[#b3aca0]"
                          }`}
                        >
                          {lesson.title}
                        </span>
                        <span className="block text-[11px] text-[#9a9088] mt-0.5">
                          {done
                            ? "Completed — review anytime"
                            : unlocked
                              ? `10 cards · ${lesson.wuValue} WU on completion`
                              : "Locked — complete the previous lesson"}
                        </span>
                      </span>
                      {!unlocked && <span className="text-[#b3aca0] text-sm">🔒</span>}
                      {unlocked && !done && (
                        <span
                          className="text-[11px] font-bold uppercase tracking-[0.1em] whitespace-nowrap"
                          style={{ color }}
                        >
                          {orderedLessons.find((l) => !completed.has(l.id))?.id ===
                          lesson.id
                            ? "Continue →"
                            : "Open →"}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
              {moduleDiscussion && (
                <li className="border-t border-[#f0ece4]">
                  <Link
                    href={`/dashboard/discussions/${moduleDiscussion.id}`}
                    className="flex items-center gap-4 px-7 py-4 min-h-[56px] hover:bg-[#faf8f4] transition-colors"
                  >
                    <span className="w-8 h-8 rounded-full bg-[#c9923a]/15 text-[#c9923a] flex items-center justify-center flex-shrink-0 text-sm">
                      💬
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-[14px] font-medium text-[#1a1a1a] leading-snug">
                        Module Discussion
                      </span>
                      <span className="block text-[11px] text-[#9a9088] mt-0.5">
                        Original post (2 WU) + peer reply (1 WU) — required before the next module
                      </span>
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#c9923a]">
                      Join →
                    </span>
                  </Link>
                </li>
              )}
            </ul>
          </div>
        );
      })}

      {/* Exams */}
      {course.exams.length > 0 && (
        <div className="bg-white border border-[#e2ddd5] rounded-2xl overflow-hidden">
          <div className="px-7 py-5 border-b border-[#f0ece4] bg-[#faf8f4]">
            <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#c9923a] mb-1">
              Assessments
            </p>
            <h2 className="font-playfair text-lg font-bold text-[#1a1a1a]">
              Course Examinations
            </h2>
          </div>
          <ul>
            {course.exams.map((exam) => (
              <li key={exam.id} className="border-b border-[#f0ece4] last:border-b-0">
                <Link
                  href={`/dashboard/exams/${exam.id}`}
                  className="flex items-center gap-4 px-7 py-4 min-h-[56px] hover:bg-[#faf8f4] transition-colors"
                >
                  <span
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm"
                    style={{ backgroundColor: `${color}18` }}
                  >
                    📝
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-[14px] font-medium text-[#1a1a1a] leading-snug">
                      {exam.title}
                    </span>
                    <span className="block text-[11px] text-[#9a9088] mt-0.5">
                      {exam.type === "midterm"
                        ? "20 questions · 60 minutes · 75% to pass"
                        : "40 questions · 90 minutes · 80% to pass"}{" "}
                      · {exam.wuValue} WU
                    </span>
                  </span>
                  <span
                    className="text-[11px] font-bold uppercase tracking-[0.1em]"
                    style={{ color }}
                  >
                    Begin →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Lesson viewer overlay */}
      {openLesson && (
        <LessonViewer
          lessonId={openLesson.id}
          lessonTitle={openLesson.title}
          content={openLesson.content}
          schoolColor={color}
          schoolName={course.school.name}
          wuValue={openLesson.wuValue}
          alreadyCompleted={completed.has(openLesson.id)}
          onClose={() => {
            setOpenLesson(null);
            router.refresh();
          }}
          onCompleted={() => {
            setCompleted((prev) => new Set(prev).add(openLesson.id));
          }}
        />
      )}
    </div>
  );
}
