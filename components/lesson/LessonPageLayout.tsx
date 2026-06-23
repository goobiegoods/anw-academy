"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { ChevronLeft, ChevronRight, Check, X } from "lucide-react";
import LessonCourseSidebar from "./LessonCourseSidebar";
import LessonJumpNav from "./LessonJumpNav";
import type { LessonContent, LessonCard, QuizQuestion, ObjectivesCard, HookCard, TeachingCard, QuizCard, QuoteCard, DeeperCard, VocabularyCard, ClinicalCard, ReflectionCard } from "@/lib/lesson-types";
import { correctIndex } from "@/lib/lesson-types";

// ─── Types ─────────────────────────────────────────────────────────────────

type LessonModule = {
  id: string;
  title: string;
  order: number;
  lessons: {
    id: string;
    title: string;
    order: number;
    isCompleted: boolean;
    isCurrent: boolean;
    isLocked: boolean;
  }[];
};

type Props = {
  course: {
    id: string;
    title: string;
    slug: string;
    level: number;
    estimatedHours: number;
    wuValue: number;
    school: { name: string; slug: string; color: string; icon: string };
    modules: LessonModule[];
  };
  lesson: {
    id: string;
    title: string;
    wuValue: number;
    content: LessonContent;
  };
  userId: string | null;
};

// ─── Section definitions ────────────────────────────────────────────────────

const SECTION_DEFS = [
  { id: "overview", label: "Lesson Overview", types: [] as string[] },
  { id: "objectives", label: "Learning Objectives", types: ["objectives"] },
  { id: "key-terms", label: "Key Terms", types: ["vocabulary"] },
  { id: "core-concepts", label: "Core Concepts", types: ["hook", "teaching"] },
  { id: "historical", label: "Historical Perspective", types: ["deeper"] },
  { id: "insight", label: "Practitioner Insight", types: ["quote"] },
  { id: "application", label: "Real-World Application", types: ["clinical"] },
  { id: "takeaways", label: "Key Takeaways", types: ["quiz"] },
  { id: "reflection", label: "Reflection & Integration", types: ["reflection"] },
];

// ─── Botanical hero placeholder ─────────────────────────────────────────────

function BotanicalHero({ color, icon }: { color: string; icon: string }) {
  return (
    <div className="relative w-full h-[200px] rounded-2xl overflow-hidden">
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(135deg, #fdf6e8 0%, #eedcb8 100%)" }}
      />
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 900 200"
        preserveAspectRatio="xMidYMid slice"
      >
        <ellipse cx="90" cy="75" rx="130" ry="52" fill={color} fillOpacity="0.07" transform="rotate(-25 90 75)" />
        <ellipse cx="75" cy="165" rx="95" ry="38" fill={color} fillOpacity="0.055" transform="rotate(15 75 165)" />
        <ellipse cx="810" cy="55" rx="145" ry="58" fill={color} fillOpacity="0.08" transform="rotate(30 810 55)" />
        <ellipse cx="830" cy="175" rx="105" ry="42" fill={color} fillOpacity="0.06" transform="rotate(-15 830 175)" />
        <ellipse cx="450" cy="100" rx="155" ry="80" fill="none" stroke={color} strokeWidth="1" strokeOpacity="0.18" />
        <ellipse cx="450" cy="100" rx="144" ry="72" fill="none" stroke={color} strokeWidth="0.5" strokeOpacity="0.1" />
        <circle cx="265" cy="50" r="4" fill={color} fillOpacity="0.14" />
        <circle cx="278" cy="64" r="3" fill={color} fillOpacity="0.11" />
        <circle cx="258" cy="68" r="2.5" fill={color} fillOpacity="0.09" />
        <circle cx="635" cy="152" r="4" fill={color} fillOpacity="0.14" />
        <circle cx="622" cy="138" r="3" fill={color} fillOpacity="0.11" />
        <circle cx="645" cy="142" r="2.5" fill={color} fillOpacity="0.09" />
        <path d="M320 185 Q390 130 450 100" stroke={color} strokeWidth="1" fill="none" strokeOpacity="0.1" />
        <path d="M580 185 Q510 130 450 100" stroke={color} strokeWidth="1" fill="none" strokeOpacity="0.1" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl block mb-2" style={{ filter: "saturate(0.75) brightness(0.82)" }}>
          {icon}
        </span>
        <p className="text-[10px] uppercase tracking-[0.22em] font-bold" style={{ color: `${color}99` }}>
          Botanical Illustration
        </p>
      </div>
    </div>
  );
}

// ─── Section eyebrow ────────────────────────────────────────────────────────

function SectionEyebrow({ number, label }: { number: number; label: string }) {
  return (
    <p className="text-[10px] uppercase tracking-[0.26em] font-bold text-[#c9923a] mb-1.5">
      Section {number} · {label}
    </p>
  );
}

// ─── Inline quiz question ───────────────────────────────────────────────────

function InlineQuestion({
  q,
  qIdx,
  answers,
  onAnswer,
}: {
  q: QuizQuestion;
  qIdx: number;
  answers: Map<number, number>;
  onAnswer: (qIdx: number, optIdx: number) => void;
}) {
  const selected = answers.get(qIdx);
  const revealed = selected !== undefined;
  const correct = correctIndex(q);

  return (
    <div className="bg-white border border-[#e2ddd5] rounded-xl p-5 mb-4">
      <p className="text-[11px] uppercase tracking-[0.15em] font-bold text-[#6b6459] mb-2">
        Check Your Understanding
      </p>
      <p className="font-semibold text-[#1a1a1a] mb-4 leading-snug">{q.q}</p>
      <div className="space-y-2">
        {q.opts.map((opt, i) => {
          let style =
            "w-full flex items-start gap-3 p-3 rounded-lg border text-sm text-left transition-colors ";
          if (!revealed) {
            style += "border-[#e2ddd5] hover:border-[#4a7c59] hover:bg-[#f0f7f3] cursor-pointer";
          } else if (i === correct) {
            style += "border-[#4a7c59] bg-[#f0f7f3]";
          } else if (i === selected) {
            style += "border-red-300 bg-red-50";
          } else {
            style += "border-[#e2ddd5] opacity-50";
          }
          return (
            <button
              key={i}
              className={style}
              disabled={revealed}
              onClick={() => onAnswer(qIdx, i)}
            >
              <span className="flex-shrink-0 w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px] font-bold">
                {String.fromCharCode(65 + i)}
              </span>
              <span className="flex-1 leading-snug">{opt}</span>
              {revealed && i === correct && (
                <Check size={14} className="flex-shrink-0 text-[#4a7c59] mt-0.5" />
              )}
              {revealed && i === selected && i !== correct && (
                <X size={14} className="flex-shrink-0 text-red-500 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
      {revealed && (
        <div className="mt-3 p-3 bg-[#f5f1ea] rounded-lg">
          <p className="text-[12px] text-[#3a3530] leading-relaxed">
            <span className="font-semibold">
              {selected === correct ? "Correct! " : "Not quite. "}
            </span>
            {q.explanation}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Final quiz (reflection section) ───────────────────────────────────────

function FinalQuiz({
  questions,
  answers,
  onAnswer,
  onRetry,
  onComplete,
  passedNow,
}: {
  questions: QuizQuestion[];
  answers: Map<number, number>;
  onAnswer: (qIdx: number, optIdx: number) => void;
  onRetry: () => void;
  onComplete: () => void;
  passedNow: boolean;
}) {
  const allAnswered = questions.every((_, i) => answers.has(i));
  const allCorrect = questions.every((q, i) => answers.get(i) === correctIndex(q));

  return (
    <div>
      {questions.map((q, i) => (
        <InlineQuestion key={i} q={q} qIdx={i} answers={answers} onAnswer={onAnswer} />
      ))}

      {allAnswered && !passedNow && (
        <div
          className={`rounded-xl p-5 text-center ${
            allCorrect ? "bg-[#f0f7f3] border border-[#4a7c59]/30" : "bg-[#fdf3ec] border border-[#c9923a]/30"
          }`}
        >
          {allCorrect ? (
            <>
              <p className="font-playfair text-xl font-bold text-[#2d5240] mb-1">
                Excellent work!
              </p>
              <p className="text-sm text-[#4a7c59] mb-4">
                You answered all questions correctly.
              </p>
              <button
                onClick={onComplete}
                className="bg-[#2d5240] text-white font-medium px-6 py-2.5 rounded-lg hover:bg-[#1d3a2c] transition-colors"
              >
                Complete Lesson
              </button>
            </>
          ) : (
            <>
              <p className="font-semibold text-[#3a3530] mb-1">Keep studying!</p>
              <p className="text-sm text-[#6b6459] mb-4">
                Review the material above and try again with a new set of questions.
              </p>
              <button
                onClick={onRetry}
                className="bg-[#c9923a] text-white font-medium px-6 py-2.5 rounded-lg hover:bg-[#a97832] transition-colors"
              >
                Try Again
              </button>
            </>
          )}
        </div>
      )}

      {passedNow && (
        <div className="rounded-xl p-6 bg-[#2d5240] text-center">
          <p className="text-3xl mb-2">🌿</p>
          <p className="font-playfair text-2xl font-bold text-white mb-1">Lesson Complete!</p>
          <p className="text-white/70 text-sm">
            You&apos;ve earned Wellness Units for completing this lesson.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Section renderers ──────────────────────────────────────────────────────

function renderObjectives(card: ObjectivesCard) {
  return (
    <ul className="space-y-3">
      {card.items.map((item, i) => (
        <li key={i} className="flex items-start gap-3">
          <span className="flex-shrink-0 w-5 h-5 mt-0.5 rounded-full bg-[#4a7c59] flex items-center justify-center">
            <Check size={10} className="text-white" strokeWidth={3} />
          </span>
          <span className="text-[15px] text-[#3a3530] leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  );
}

function renderVocabulary(card: VocabularyCard) {
  return (
    <div className="space-y-4">
      {card.terms.map((term, i) => (
        <div key={i} className="flex gap-4 p-4 rounded-xl bg-white border border-[#e2ddd5]">
          <div className="w-1 flex-shrink-0 rounded-full bg-[#4a7c59] self-stretch" />
          <div>
            <p className="font-playfair font-bold text-[#1a1a1a] mb-0.5">{term.name}</p>
            <p className="text-sm text-[#6b6459] leading-relaxed">{term.definition}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function renderCoreConcepts(cards: (HookCard | TeachingCard)[]) {
  return (
    <div className="space-y-8">
      {cards.map((card, i) => {
        if (card.type === "hook") {
          return (
            <div key={i}>
              <h3 className="font-playfair text-xl font-bold text-[#1a1a1a] mb-1">{card.title}</h3>
              {card.subtitle && (
                <p className="text-[13px] uppercase tracking-[0.1em] text-[#c9923a] mb-4">{card.subtitle}</p>
              )}
              <div className="prose prose-stone max-w-none">
                {card.body.split("\n\n").map((para, j) => (
                  <p key={j} className="text-[15px] text-[#3a3530] leading-[1.85] mb-4">
                    {para}
                  </p>
                ))}
              </div>
            </div>
          );
        }
        if (card.type === "teaching") {
          return (
            <div key={i}>
              <h3 className="font-playfair text-xl font-bold text-[#1a1a1a] mb-4">{card.title}</h3>
              <div>
                {card.body.split("\n\n").map((para, j) => (
                  <p key={j} className="text-[15px] text-[#3a3530] leading-[1.85] mb-4">
                    {para}
                  </p>
                ))}
              </div>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}

function renderDeeper(card: DeeperCard) {
  return (
    <div className="bg-[#f9f6f0] rounded-2xl p-6 border border-[#e8e0d0]">
      <h3 className="font-playfair text-xl font-bold text-[#1a1a1a] mb-4">{card.title}</h3>
      <div>
        {card.body.split("\n\n").map((para, i) => (
          <p key={i} className="text-[15px] text-[#3a3530] leading-[1.85] mb-4 last:mb-0">
            {para}
          </p>
        ))}
      </div>
    </div>
  );
}

function renderQuote(card: QuoteCard) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#2d5240" }}>
      <div className="p-7">
        <p className="text-5xl leading-none text-[#c9923a] mb-4 font-serif">&ldquo;</p>
        <blockquote className="font-playfair text-lg text-white leading-relaxed italic mb-5">
          {card.quote}
        </blockquote>
        <p className="text-[#c9923a] font-semibold text-sm mb-4">{card.source}</p>
        <div className="border-t border-white/15 pt-4">
          <p className="text-white/65 text-sm leading-relaxed">{card.context}</p>
        </div>
      </div>
    </div>
  );
}

function renderClinical(card: ClinicalCard) {
  return (
    <div className="space-y-5">
      <div className="bg-[#fdf6e8] border border-[#e8d9b8] rounded-xl p-5">
        <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-[#c9923a] mb-2">
          Clinical Scenario
        </p>
        <p className="text-[15px] text-[#3a3530] leading-relaxed italic">{card.scenario}</p>
      </div>
      <div>
        {card.body.split("\n\n").map((para, i) => (
          <p key={i} className="text-[15px] text-[#3a3530] leading-[1.85] mb-4 last:mb-0">
            {para}
          </p>
        ))}
      </div>
    </div>
  );
}

// ─── Main layout component ──────────────────────────────────────────────────

export default function LessonPageLayout({ course, lesson, userId }: Props) {
  const [mode, setMode] = useState<"read" | "swipe">("read");
  const [swipeIdx, setSwipeIdx] = useState(0);
  const [inlineAnswers, setInlineAnswers] = useState<Map<number, number>>(new Map());
  const [finalPool, setFinalPool] = useState<QuizQuestion[]>([]);
  const [finalAnswers, setFinalAnswers] = useState<Map<number, number>>(new Map());
  const [passedNow, setPassedNow] = useState(false);

  // Default to swipe on mobile
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setMode("swipe");
    }
  }, []);

  const cards = lesson.content.cards;

  // Group cards into sections, filtering empty ones
  const sections = useMemo(() => {
    return SECTION_DEFS.filter((def) => {
      if (def.id === "overview") return true;
      return cards.some((c) => def.types.includes(c.type));
    });
  }, [cards]);

  // Pick 3 random final quiz questions from reflection card's pool
  useEffect(() => {
    const reflection = cards.find((c) => c.type === "reflection") as ReflectionCard | undefined;
    if (reflection?.quizQuestions?.length) {
      const shuffled = [...reflection.quizQuestions].sort(() => Math.random() - 0.5);
      setFinalPool(shuffled.slice(0, 3));
    }
  }, [lesson.id, cards]);

  const retryFinal = useCallback(() => {
    const reflection = cards.find((c) => c.type === "reflection") as ReflectionCard | undefined;
    if (reflection?.quizQuestions?.length) {
      const shuffled = [...reflection.quizQuestions].sort(() => Math.random() - 0.5);
      setFinalPool(shuffled.slice(0, 3));
      setFinalAnswers(new Map());
    }
  }, [cards]);

  const handleComplete = useCallback(async () => {
    if (!userId) return;
    try {
      await fetch("/api/lessons/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId: lesson.id }),
      });
    } catch {
      // non-blocking
    }
    setPassedNow(true);
  }, [lesson.id, userId]);

  const handleInlineAnswer = useCallback((qIdx: number, optIdx: number) => {
    setInlineAnswers((prev) => {
      const next = new Map(prev);
      next.set(qIdx, optIdx);
      return next;
    });
  }, []);

  const handleFinalAnswer = useCallback((qIdx: number, optIdx: number) => {
    setFinalAnswers((prev) => {
      const next = new Map(prev);
      next.set(qIdx, optIdx);
      return next;
    });
  }, []);

  // Flatten all lessons across modules for counts
  const allLessons = course.modules.flatMap((m) => m.lessons);
  const completedCount = allLessons.filter((l) => l.isCompleted).length;

  // Section content renderer
  function renderSectionContent(section: (typeof SECTION_DEFS)[number], sectionNum: number) {
    if (section.id === "overview") {
      const objCard = cards.find((c) => c.type === "objectives") as ObjectivesCard | undefined;
      return (
        <div>
          {/* Breadcrumb */}
          <p className="text-[11px] text-[#6b6459] mb-4">
            {course.school.icon} {course.school.name} &rsaquo; {course.title}
          </p>

          {/* Lesson title */}
          <h1 className="font-playfair text-3xl md:text-4xl font-bold text-[#1a1a1a] leading-tight mb-4">
            {lesson.title}
          </h1>

          {/* Meta pills */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="flex items-center gap-1 bg-white border border-[#e2ddd5] rounded-full px-3 py-1 text-[12px] text-[#6b6459]">
              🌿 {lesson.wuValue} WU
            </span>
            <span className="flex items-center gap-1 bg-white border border-[#e2ddd5] rounded-full px-3 py-1 text-[12px] text-[#6b6459]">
              ⏱ {course.estimatedHours * 60} min
            </span>
            <span className="flex items-center gap-1 bg-white border border-[#e2ddd5] rounded-full px-3 py-1 text-[12px] text-[#6b6459]">
              Level {course.level}
            </span>
            <span className="flex items-center gap-1 rounded-full px-3 py-1 text-[12px] font-semibold text-white" style={{ backgroundColor: course.school.color }}>
              Reading
            </span>
          </div>

          {/* Botanical hero */}
          <BotanicalHero color={course.school.color} icon={course.school.icon} />

          {/* What you will learn */}
          {objCard && (
            <div className="mt-6 p-5 bg-white border border-[#e2ddd5] rounded-xl">
              <p className="text-[11px] uppercase tracking-[0.2em] font-bold text-[#6b6459] mb-3">
                What You Will Learn
              </p>
              <ul className="space-y-2">
                {objCard.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="flex-shrink-0 w-4 h-4 mt-0.5 rounded-full bg-[#4a7c59]/15 flex items-center justify-center">
                      <Check size={8} className="text-[#4a7c59]" strokeWidth={3} />
                    </span>
                    <span className="text-sm text-[#3a3530] leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );
    }

    const sectionCards = cards.filter((c) => section.types.includes(c.type));

    return (
      <div>
        <SectionEyebrow number={sectionNum} label={section.label} />
        <h2 className="font-playfair text-2xl font-bold text-[#1a1a1a] mb-6">{section.label}</h2>

        {section.id === "objectives" && renderObjectives(sectionCards[0] as ObjectivesCard)}
        {section.id === "key-terms" && renderVocabulary(sectionCards[0] as VocabularyCard)}
        {section.id === "core-concepts" && renderCoreConcepts(sectionCards as (HookCard | TeachingCard)[])}
        {section.id === "historical" && renderDeeper(sectionCards[0] as DeeperCard)}
        {section.id === "insight" && renderQuote(sectionCards[0] as QuoteCard)}
        {section.id === "application" && renderClinical(sectionCards[0] as ClinicalCard)}
        {section.id === "takeaways" && (
          <div>
            {(sectionCards[0] as QuizCard).questions.map((q, i) => (
              <InlineQuestion
                key={i}
                q={q}
                qIdx={i}
                answers={inlineAnswers}
                onAnswer={handleInlineAnswer}
              />
            ))}
          </div>
        )}
        {section.id === "reflection" && (
          <div className="space-y-6">
            <div className="bg-[#f9f6f0] border border-[#e8e0d0] rounded-xl p-5">
              <p className="text-[13px] text-[#6b6459] italic leading-relaxed">
                {(sectionCards[0] as ReflectionCard).prompt}
              </p>
            </div>
            {finalPool.length > 0 && (
              <FinalQuiz
                questions={finalPool}
                answers={finalAnswers}
                onAnswer={handleFinalAnswer}
                onRetry={retryFinal}
                onComplete={handleComplete}
                passedNow={passedNow}
              />
            )}
          </div>
        )}
      </div>
    );
  }

  // Numbered section count (overview = "1", first real section = "2"...)
  // But design shows section numbers starting at 1 for the first content section
  // (not the overview). Let sectionNum = position in sections array (1-indexed).

  // ── READ MODE ──────────────────────────────────────────────────────────────
  const readContent = (
    <div className="max-w-[680px] mx-auto px-8 py-10 space-y-16">
      {sections.map((section, i) => (
        <section key={section.id} id={section.id}>
          {renderSectionContent(section, i + 1)}
        </section>
      ))}
    </div>
  );

  // ── SWIPE MODE ─────────────────────────────────────────────────────────────
  const swipeContent = (
    <div className="max-w-[680px] mx-auto px-8 py-8">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-[11px] text-[#6b6459] mb-1.5">
          <span>{sections[swipeIdx]?.label}</span>
          <span>{swipeIdx + 1} / {sections.length}</span>
        </div>
        <div className="h-1 bg-[#e2ddd5] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#4a7c59] rounded-full transition-all duration-300"
            style={{ width: `${((swipeIdx + 1) / sections.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Current section */}
      <div className="min-h-[400px]">
        {sections[swipeIdx] && renderSectionContent(sections[swipeIdx], swipeIdx + 1)}
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#e2ddd5]">
        <button
          onClick={() => setSwipeIdx((i) => Math.max(0, i - 1))}
          disabled={swipeIdx === 0}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#e2ddd5] text-sm text-[#6b6459] hover:bg-white hover:text-[#3a3530] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={16} /> Previous
        </button>
        {swipeIdx < sections.length - 1 ? (
          <button
            onClick={() => setSwipeIdx((i) => Math.min(sections.length - 1, i + 1))}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-colors"
            style={{ backgroundColor: course.school.color }}
          >
            Next <ChevronRight size={16} />
          </button>
        ) : (
          <button
            disabled={passedNow}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-[#2d5240] opacity-60 cursor-not-allowed"
          >
            {passedNow ? "Completed ✓" : "Finish Lesson"}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div
      className="-mx-6 -my-8 flex"
      style={{ backgroundColor: "#faf8f4" }}
    >
      {/* Left: course nav sidebar (hidden on mobile) */}
      <aside className="hidden lg:flex w-64 flex-shrink-0 sticky top-0 h-screen overflow-y-auto flex-col border-r border-[#e2ddd5]">
        <LessonCourseSidebar
          courseSlug={course.slug}
          courseTitle={course.title}
          color={course.school.color}
          modules={course.modules}
          totalLessons={allLessons.length}
          completedCount={completedCount}
        />
      </aside>

      {/* Center: lesson content */}
      <main className="flex-1 min-w-0">
        {mode === "read" ? readContent : swipeContent}
      </main>

      {/* Right: jump nav (hidden on mobile) */}
      <aside className="hidden lg:block w-56 flex-shrink-0 sticky top-0 h-screen overflow-y-auto border-l border-[#e2ddd5] bg-white">
        <LessonJumpNav
          sections={sections.map((s) => ({ id: s.id, label: s.label }))}
          mode={mode}
          swipeSectionIdx={swipeIdx}
          onModeChange={(m) => {
            setMode(m);
            if (m === "swipe") setSwipeIdx(0);
          }}
          onSectionClick={(idx) => {
            if (mode === "swipe") setSwipeIdx(idx);
          }}
        />
      </aside>
    </div>
  );
}
