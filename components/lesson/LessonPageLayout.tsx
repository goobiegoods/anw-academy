"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { ChevronLeft, ChevronRight, Check, X, Home, BookOpen, Bookmark, User, ArrowLeft } from "lucide-react";
import Link from "next/link";
import LessonCourseSidebar from "./LessonCourseSidebar";
import LessonJumpNav from "./LessonJumpNav";
import type {
  QuizQuestion,
  ObjectivesCard,
  HookCard,
  TeachingCard,
  QuizCard,
  QuoteCard,
  DeeperCard,
  VocabularyCard,
  ClinicalCard,
  ReflectionCard,
} from "@/lib/lesson-types";
import { correctIndex } from "@/lib/lesson-types";

// ─── Types ───────────────────────────────────────────────────────────────────

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
    content: import("@/lib/lesson-types").LessonContent;
  };
  userId: string | null;
  lessonIndex: number;
  totalLessons: number;
};

// ─── Section definitions ──────────────────────────────────────────────────────

const SECTION_DEFS = [
  { id: "overview",     label: "Lesson Overview",         types: [] as string[], inNav: false },
  { id: "objectives",   label: "Learning Objectives",     types: ["objectives"],              inNav: true },
  { id: "key-terms",    label: "Key Terms",               types: ["vocabulary"],              inNav: true },
  { id: "core-concepts",label: "Core Concepts",           types: ["hook", "teaching"],        inNav: true },
  { id: "historical",   label: "Historical Perspective",  types: ["deeper"],                  inNav: true },
  { id: "insight",      label: "Practitioner Insight",    types: ["quote"],                   inNav: true },
  { id: "application",  label: "Real-World Application",  types: ["clinical"],                inNav: true },
  { id: "takeaways",    label: "Key Takeaways",           types: ["quiz"],                    inNav: true },
  { id: "reflection",   label: "Reflection & Integration",types: ["reflection"],              inNav: true },
];

// ─── Botanical hero ───────────────────────────────────────────────────────────

function BotanicalHero({ color, icon }: { color: string; icon: string }) {
  return (
    <div className="relative w-full h-[180px] rounded-2xl overflow-hidden mb-6">
      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #fdf6e8 0%, #eedcb8 100%)" }} />
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 900 180" preserveAspectRatio="xMidYMid slice">
        <ellipse cx="90" cy="65" rx="130" ry="52" fill={color} fillOpacity="0.07" transform="rotate(-25 90 65)" />
        <ellipse cx="75" cy="155" rx="95" ry="38" fill={color} fillOpacity="0.055" transform="rotate(15 75 155)" />
        <ellipse cx="810" cy="45" rx="145" ry="58" fill={color} fillOpacity="0.08" transform="rotate(30 810 45)" />
        <ellipse cx="830" cy="160" rx="105" ry="42" fill={color} fillOpacity="0.06" transform="rotate(-15 830 160)" />
        <ellipse cx="450" cy="90" rx="155" ry="72" fill="none" stroke={color} strokeWidth="1" strokeOpacity="0.18" />
        <ellipse cx="450" cy="90" rx="144" ry="64" fill="none" stroke={color} strokeWidth="0.5" strokeOpacity="0.1" />
        <path d="M320 170 Q390 120 450 90" stroke={color} strokeWidth="1" fill="none" strokeOpacity="0.1" />
        <path d="M580 170 Q510 120 450 90" stroke={color} strokeWidth="1" fill="none" strokeOpacity="0.1" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl block mb-1.5" style={{ filter: "saturate(0.75) brightness(0.82)" }}>{icon}</span>
        <p className="text-[10px] uppercase tracking-[0.22em] font-bold" style={{ color: `${color}99` }}>
          Botanical Illustration
        </p>
      </div>
    </div>
  );
}

// ─── Section eyebrow ─────────────────────────────────────────────────────────

function SectionEyebrow({ number, label }: { number: number; label: string }) {
  return (
    <p className="text-[10px] uppercase tracking-[0.26em] font-bold text-[#c9923a] mb-1.5">
      Section {number} · {label}
    </p>
  );
}

// ─── Inline quiz question ─────────────────────────────────────────────────────

function InlineQuestion({
  q, qIdx, answers, onAnswer,
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
      <p className="text-[11px] uppercase tracking-[0.15em] font-bold text-[#6b6459] mb-2">Check Your Understanding</p>
      <p className="font-semibold text-[#1a1a1a] mb-4 leading-snug">{q.q}</p>
      <div className="space-y-2">
        {q.opts.map((opt, i) => {
          let cls = "w-full flex items-start gap-3 p-3 rounded-lg border text-sm text-left transition-colors ";
          if (!revealed) cls += "border-[#e2ddd5] hover:border-[#4a7c59] hover:bg-[#f0f7f3] cursor-pointer";
          else if (i === correct) cls += "border-[#4a7c59] bg-[#f0f7f3]";
          else if (i === selected) cls += "border-red-300 bg-red-50";
          else cls += "border-[#e2ddd5] opacity-50";
          return (
            <button key={i} className={cls} disabled={revealed} onClick={() => onAnswer(qIdx, i)}>
              <span className="flex-shrink-0 w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px] font-bold">
                {String.fromCharCode(65 + i)}
              </span>
              <span className="flex-1 leading-snug">{opt}</span>
              {revealed && i === correct && <Check size={14} className="flex-shrink-0 text-[#4a7c59] mt-0.5" />}
              {revealed && i === selected && i !== correct && <X size={14} className="flex-shrink-0 text-red-500 mt-0.5" />}
            </button>
          );
        })}
      </div>
      {revealed && (
        <div className="mt-3 p-3 bg-[#f5f1ea] rounded-lg">
          <p className="text-[12px] text-[#3a3530] leading-relaxed">
            <span className="font-semibold">{selected === correct ? "Correct! " : "Not quite. "}</span>
            {q.explanation}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Final quiz ───────────────────────────────────────────────────────────────

function FinalQuiz({
  questions, answers, onAnswer, onRetry, onComplete, passedNow,
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
        <div className={`rounded-xl p-5 text-center ${allCorrect ? "bg-[#f0f7f3] border border-[#4a7c59]/30" : "bg-[#fdf3ec] border border-[#c9923a]/30"}`}>
          {allCorrect ? (
            <>
              <p className="font-playfair text-xl font-bold text-[#2d5240] mb-1">Excellent work!</p>
              <p className="text-sm text-[#4a7c59] mb-4">You answered all questions correctly.</p>
              <button onClick={onComplete} className="bg-[#2d5240] text-white font-medium px-6 py-2.5 rounded-lg hover:bg-[#1d3a2c] transition-colors">
                Complete Lesson
              </button>
            </>
          ) : (
            <>
              <p className="font-semibold text-[#3a3530] mb-1">Keep studying!</p>
              <p className="text-sm text-[#6b6459] mb-4">Review the material above and try again.</p>
              <button onClick={onRetry} className="bg-[#c9923a] text-white font-medium px-6 py-2.5 rounded-lg hover:bg-[#a97832] transition-colors">
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
          <p className="text-white/70 text-sm">You&apos;ve earned Wellness Units for completing this lesson.</p>
        </div>
      )}
    </div>
  );
}

// ─── Section renderers ────────────────────────────────────────────────────────

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
              <div>
                {card.body.split("\n\n").map((para, j) => (
                  <p key={j} className="text-[15px] text-[#3a3530] leading-[1.85] mb-4">{para}</p>
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
                  <p key={j} className="text-[15px] text-[#3a3530] leading-[1.85] mb-4">{para}</p>
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
          <p key={i} className="text-[15px] text-[#3a3530] leading-[1.85] mb-4 last:mb-0">{para}</p>
        ))}
      </div>
    </div>
  );
}

// Practitioner Insight: blue-left-border callout + context text below
function renderPractitionerInsight(card: QuoteCard) {
  return (
    <div className="space-y-5">
      <div className="border-l-4 border-[#4a7c9e] bg-[#f5f9fc] rounded-r-xl pl-5 pr-4 py-4">
        <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-[#4a7c9e] mb-2">Practitioner Insight</p>
        <blockquote className="font-playfair text-lg italic text-[#1a1a1a] leading-relaxed mb-2">
          &ldquo;{card.quote}&rdquo;
        </blockquote>
        <p className="text-sm font-semibold text-[#6b6459]">— {card.source}</p>
      </div>
      {card.context && (
        <div>
          {card.context.split("\n\n").map((para, i) => (
            <p key={i} className="text-[15px] text-[#3a3530] leading-[1.85] mb-4 last:mb-0">{para}</p>
          ))}
        </div>
      )}
    </div>
  );
}

function renderClinical(card: ClinicalCard) {
  return (
    <div className="space-y-5">
      <div className="bg-[#fdf6e8] border border-[#e8d9b8] rounded-xl p-5">
        <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-[#c9923a] mb-2">Clinical Scenario</p>
        <p className="text-[15px] text-[#3a3530] leading-relaxed italic">{card.scenario}</p>
      </div>
      <div>
        {card.body.split("\n\n").map((para, i) => (
          <p key={i} className="text-[15px] text-[#3a3530] leading-[1.85] mb-4 last:mb-0">{para}</p>
        ))}
      </div>
    </div>
  );
}

// Key Takeaways: green-left-border callout (from card title) + quiz questions below
function renderTakeaways(
  card: QuizCard,
  inlineAnswers: Map<number, number>,
  handleInlineAnswer: (qIdx: number, optIdx: number) => void
) {
  return (
    <div className="space-y-5">
      {card.title && (
        <div className="border-l-4 border-[#4a7c59] bg-[#f0f7f3] rounded-r-xl pl-5 pr-4 py-4">
          <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-[#4a7c59] mb-1.5">Key Takeaway</p>
          <p className="text-[15px] text-[#1a1a1a] leading-relaxed">{card.title}</p>
        </div>
      )}
      {card.questions.map((q, i) => (
        <InlineQuestion key={i} q={q} qIdx={i} answers={inlineAnswers} onAnswer={handleInlineAnswer} />
      ))}
    </div>
  );
}

// ─── Mobile bottom tab bar ────────────────────────────────────────────────────

function MobileTabBar() {
  const tabs: { href: string; Icon: React.ComponentType<{ size: number; className: string }>; label: string; active?: boolean }[] = [
    { href: "/dashboard",         Icon: Home,     label: "Home"    },
    { href: "/dashboard/courses", Icon: BookOpen, label: "Courses", active: true },
    { href: "/dashboard",         Icon: Bookmark, label: "Library" },
    { href: "/dashboard",         Icon: User,     label: "Profile" },
  ];

  return (
    <div className="flex-shrink-0 bg-white border-t border-[#e2ddd5] flex" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      {tabs.map(({ href, Icon, label, active }) => (
        <Link key={label} href={href} className="flex-1 flex flex-col items-center py-2.5 gap-0.5">
          <Icon size={20} className={active ? "text-[#2d5240]" : "text-[#6b6459]"} />
          <span className={`text-[10px] ${active ? "text-[#2d5240] font-medium" : "text-[#6b6459]"}`}>{label}</span>
        </Link>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function LessonPageLayout({ course, lesson, userId, lessonIndex, totalLessons }: Props) {
  const [mode, setMode] = useState<"read" | "swipe">("read");
  const [swipeIdx, setSwipeIdx] = useState(0);
  const [mobileScreen, setMobileScreen] = useState<"entry" | "content">("entry");
  const [inlineAnswers, setInlineAnswers] = useState<Map<number, number>>(new Map());
  const [finalPool, setFinalPool] = useState<QuizQuestion[]>([]);
  const [finalAnswers, setFinalAnswers] = useState<Map<number, number>>(new Map());
  const [passedNow, setPassedNow] = useState(false);

  const cards = lesson.content.cards;

  const sections = useMemo(() => {
    return SECTION_DEFS.filter((def) => {
      if (def.id === "overview") return true;
      return cards.some((c) => def.types.includes(c.type));
    });
  }, [cards]);

  // Nav sections exclude overview
  const navSections = useMemo(() => sections.filter((s) => s.inNav), [sections]);

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
    } catch { /* non-blocking */ }
    setPassedNow(true);
  }, [lesson.id, userId]);

  const handleInlineAnswer = useCallback((qIdx: number, optIdx: number) => {
    setInlineAnswers((prev) => { const m = new Map(prev); m.set(qIdx, optIdx); return m; });
  }, []);

  const handleFinalAnswer = useCallback((qIdx: number, optIdx: number) => {
    setFinalAnswers((prev) => { const m = new Map(prev); m.set(qIdx, optIdx); return m; });
  }, []);

  const allLessons = course.modules.flatMap((m) => m.lessons);
  const completedCount = allLessons.filter((l) => l.isCompleted).length;
  const pct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  const objCard = cards.find((c) => c.type === "objectives") as ObjectivesCard | undefined;

  // Section number: 1-indexed among nav sections (overview has no number)
  function getSectionNum(section: (typeof SECTION_DEFS)[number]) {
    return navSections.findIndex((s) => s.id === section.id) + 1;
  }

  // ── Section content renderer ───────────────────────────────────────────────

  function renderSectionContent(section: (typeof SECTION_DEFS)[number]) {
    if (section.id === "overview") {
      return (
        <div>
          <p className="text-[11px] uppercase tracking-[0.15em] text-[#6b6459] mb-1">
            Lesson {lessonIndex + 1} of {totalLessons}
          </p>
          <h1 className="font-playfair text-3xl lg:text-4xl font-bold text-[#1a1a1a] leading-tight mb-4">
            {lesson.title}
          </h1>
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="bg-white border border-[#e2ddd5] rounded-full px-3 py-1 text-[12px] text-[#6b6459]">
              ⏱ {course.estimatedHours * 60} min
            </span>
            <span className="bg-white border border-[#e2ddd5] rounded-full px-3 py-1 text-[12px] text-[#6b6459]">
              Level {course.level}
            </span>
            <span className="bg-white border border-[#e2ddd5] rounded-full px-3 py-1 text-[12px] text-[#6b6459]">
              🌿 {lesson.wuValue} WU
            </span>
            <span
              className="rounded-full px-3 py-1 text-[12px] font-semibold text-white"
              style={{ backgroundColor: course.school.color }}
            >
              Foundation
            </span>
          </div>
          <BotanicalHero color={course.school.color} icon={course.school.icon} />
          {objCard && (
            <div className="mt-6 p-5 bg-white border border-[#e2ddd5] rounded-xl">
              <p className="text-[11px] uppercase tracking-[0.2em] font-bold text-[#6b6459] mb-3">What You Will Learn</p>
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
    const num = getSectionNum(section);

    return (
      <div>
        <SectionEyebrow number={num} label={section.label} />
        <h2 className="font-playfair text-2xl font-bold text-[#1a1a1a] mb-6">{section.label}</h2>
        {section.id === "objectives"    && renderObjectives(sectionCards[0] as ObjectivesCard)}
        {section.id === "key-terms"     && renderVocabulary(sectionCards[0] as VocabularyCard)}
        {section.id === "core-concepts" && renderCoreConcepts(sectionCards as (HookCard | TeachingCard)[])}
        {section.id === "historical"    && renderDeeper(sectionCards[0] as DeeperCard)}
        {section.id === "insight"       && renderPractitionerInsight(sectionCards[0] as QuoteCard)}
        {section.id === "application"   && renderClinical(sectionCards[0] as ClinicalCard)}
        {section.id === "takeaways"     && renderTakeaways(sectionCards[0] as QuizCard, inlineAnswers, handleInlineAnswer)}
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

  // ── Desktop read mode ──────────────────────────────────────────────────────

  const readContent = (
    <div className="max-w-[720px] mx-auto px-8 py-10 space-y-16">
      {sections.map((section) => (
        <section key={section.id} id={section.id}>
          {renderSectionContent(section)}
        </section>
      ))}
    </div>
  );

  // ── Desktop swipe mode ─────────────────────────────────────────────────────

  const swipeContent = (
    <div className="max-w-[720px] mx-auto px-8 py-8">
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
      <div className="min-h-[400px]">
        {sections[swipeIdx] && renderSectionContent(sections[swipeIdx])}
      </div>
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
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-[#2d5240] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {passedNow ? "Completed ✓" : "Finish Lesson"}
          </button>
        )}
      </div>
    </div>
  );

  // ── Mobile entry screen ────────────────────────────────────────────────────

  const mobileEntry = (
    <div className="flex-1 overflow-y-auto">
      <div className="px-5 pt-6 pb-4 border-b border-[#e2ddd5]">
        <p className="text-[12px] text-[#6b6459] mb-2">
          {course.school.name} · Level {course.level}
        </p>
        <div className="h-1.5 bg-[#e2ddd5] rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: "#4a7c59" }} />
        </div>
      </div>
      <div className="px-5 pt-5 pb-4">
        <h1 className="font-playfair text-2xl font-bold text-[#1a1a1a] mb-1">{lesson.title}</h1>
        <p className="text-sm text-[#6b6459]">{course.estimatedHours * 60} min</p>
      </div>
      {objCard && (
        <div className="mx-5 mb-6 p-4 bg-[#f5f1ea] rounded-xl">
          <p className="text-[12px] font-bold text-[#3a3530] mb-3">What you&apos;ll learn</p>
          <ul className="space-y-2">
            {objCard.items.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <Check size={14} className="flex-shrink-0 mt-0.5 text-[#4a7c59]" />
                <span className="text-[13px] text-[#3a3530] leading-snug">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="px-5 pb-6">
        <button
          onClick={() => { setSwipeIdx(0); setMobileScreen("content"); }}
          className="w-full py-4 rounded-xl text-white font-semibold text-base"
          style={{ backgroundColor: "#2d5240" }}
        >
          Continue Lesson
        </button>
      </div>
    </div>
  );

  // ── Mobile content screen ──────────────────────────────────────────────────

  const mobileContent = (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-5 py-3 border-b border-[#e2ddd5] flex items-center gap-3 flex-shrink-0">
        <button onClick={() => setMobileScreen("entry")} className="text-[#6b6459] flex-shrink-0">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] text-[#6b6459] truncate">{sections[swipeIdx]?.label}</p>
          <div className="h-1 bg-[#e2ddd5] rounded-full mt-1 overflow-hidden">
            <div
              className="h-full bg-[#4a7c59] rounded-full transition-all"
              style={{ width: `${((swipeIdx + 1) / sections.length) * 100}%` }}
            />
          </div>
        </div>
        <span className="text-[11px] text-[#6b6459] flex-shrink-0">{swipeIdx + 1}/{sections.length}</span>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-6">
        {sections[swipeIdx] && renderSectionContent(sections[swipeIdx])}
      </div>
      <div className="flex items-center justify-between px-5 py-4 border-t border-[#e2ddd5] flex-shrink-0">
        <button
          onClick={() => setSwipeIdx((i) => Math.max(0, i - 1))}
          disabled={swipeIdx === 0}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#e2ddd5] text-sm text-[#6b6459] disabled:opacity-30"
        >
          <ChevronLeft size={16} /> Back
        </button>
        {swipeIdx < sections.length - 1 ? (
          <button
            onClick={() => setSwipeIdx((i) => i + 1)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white"
            style={{ backgroundColor: "#2d5240" }}
          >
            Next <ChevronRight size={16} />
          </button>
        ) : (
          <button
            disabled={passedNow}
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-[#2d5240] disabled:opacity-60"
          >
            {passedNow ? "Completed ✓" : "Finish Lesson"}
          </button>
        )}
      </div>
    </div>
  );

  // ── swipeSectionIdx for jump nav: offset by 1 because sections[0] = overview ──

  const navSwipeIdx = swipeIdx > 0 ? swipeIdx - 1 : -1;

  return (
    <>
      {/* ── MOBILE: fixed full-screen overlay (covers DashboardNav) ── */}
      <div className="fixed inset-0 z-40 lg:hidden flex flex-col bg-[#faf8f4]">
        {mobileScreen === "entry" ? mobileEntry : mobileContent}
        <MobileTabBar />
      </div>

      {/* ── DESKTOP: 3-column layout ── */}
      <div className="-mx-6 -my-8 hidden lg:flex" style={{ backgroundColor: "#faf8f4" }}>
        {/* Left: course nav sidebar */}
        <aside
          className="w-64 flex-shrink-0 flex flex-col border-r border-[#e2ddd5] sticky top-0 overflow-y-auto"
          style={{ height: "100vh" }}
        >
          <LessonCourseSidebar
            courseSlug={course.slug}
            courseTitle={course.title}
            color={course.school.color}
            modules={course.modules}
            totalLessons={allLessons.length}
            completedCount={completedCount}
          />
        </aside>

        {/* Center: scrollable lesson content */}
        <main className="flex-1 min-w-0">
          {mode === "read" ? readContent : swipeContent}
        </main>

        {/* Right: jump nav */}
        <aside
          className="w-56 flex-shrink-0 border-l border-[#e2ddd5] bg-white sticky top-0 overflow-y-auto"
          style={{ height: "100vh" }}
        >
          <LessonJumpNav
            sections={navSections.map((s) => ({ id: s.id, label: s.label }))}
            mode={mode}
            swipeSectionIdx={navSwipeIdx}
            onModeChange={(m) => {
              setMode(m);
              if (m === "swipe") setSwipeIdx(0);
            }}
            onSectionClick={(idx) => {
              // idx is 0-based within navSections; add 1 for overview offset in swipe
              if (mode === "swipe") setSwipeIdx(idx + 1);
            }}
          />
        </aside>
      </div>
    </>
  );
}
