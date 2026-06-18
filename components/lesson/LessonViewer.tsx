"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CARD_TYPE_LABELS,
  correctIndex,
  parseLessonContent,
  type LessonCard,
  type QuizQuestion,
} from "@/lib/lesson-types";

type LessonViewerProps = {
  lessonId: string;
  lessonTitle: string;
  content: string; // JSON string from Lesson.content
  schoolColor: string;
  schoolName: string;
  wuValue: number;
  alreadyCompleted: boolean;
  onClose: () => void;
  onCompleted?: () => void;
};

const LETTERS = ["A", "B", "C", "D"];

function Paragraphs({ body, className }: { body: string; className?: string }) {
  return (
    <div className={className}>
      {body.split("\n\n").map((para, i) => (
        <p key={i} className="text-[14px] text-[#3d3a34] mb-4 last:mb-0" style={{ lineHeight: 1.9 }}>
          {para}
        </p>
      ))}
    </div>
  );
}

// ── Inline quiz question with instant feedback ────────────────────────────────

function InlineQuestion({
  question,
  schoolColor,
}: {
  question: QuizQuestion;
  schoolColor: string;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const answer = correctIndex(question);

  return (
    <div className="mb-6 last:mb-0">
      <p className="text-[14px] font-semibold text-[#1a1a1a] mb-3" style={{ lineHeight: 1.7 }}>
        {question.q}
      </p>
      <div className="space-y-2">
        {question.opts.map((opt, i) => {
          const isSelected = selected === i;
          const isCorrect = i === answer;
          const revealed = selected !== null;
          let border = "#e2ddd5";
          let bg = "#ffffff";
          if (revealed && isCorrect) {
            border = "#4a7c59";
            bg = "#eef5ee";
          } else if (revealed && isSelected && !isCorrect) {
            border = "#b3403f";
            bg = "#fbeeee";
          }
          return (
            <button
              key={i}
              disabled={revealed}
              onClick={() => setSelected(i)}
              className="w-full text-left rounded-xl border px-4 py-3 min-h-[44px] transition-colors disabled:cursor-default"
              style={{ borderColor: border, backgroundColor: bg }}
            >
              <span className="flex items-start gap-3">
                <span
                  className="flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center text-[11px] font-bold"
                  style={{
                    borderColor: revealed && isCorrect ? "#4a7c59" : "#cfc8bc",
                    color: revealed && isCorrect ? "#4a7c59" : "#6b6459",
                  }}
                >
                  {LETTERS[i]}
                </span>
                <span className="text-[13px] text-[#1a1a1a] pt-0.5" style={{ lineHeight: 1.6 }}>
                  {opt.replace(/^[A-D][.):]\s*/, "")}
                </span>
              </span>
            </button>
          );
        })}
      </div>
      {selected !== null && (
        <div
          className="mt-3 rounded-xl px-4 py-3 text-[12.5px]"
          style={{
            lineHeight: 1.7,
            backgroundColor: selected === answer ? "#eef5ee" : "#fbeeee",
            color: selected === answer ? "#2d5240" : "#7c2a2a",
          }}
        >
          <span className="font-bold">
            {selected === answer ? "Correct. " : `Not quite — the answer is ${LETTERS[answer]}. `}
          </span>
          {question.explanation}
        </div>
      )}
      {selected === null && (
        <p className="mt-2 text-[11px] text-[#9a9088]" style={{ color: schoolColor, opacity: 0.7 }}>
          Choose an answer to see the explanation.
        </p>
      )}
    </div>
  );
}

// ── Final quiz (gated, rotating questions) ────────────────────────────────────

function FinalQuiz({
  pool,
  schoolColor,
  wuValue,
  alreadyCompleted,
  passedNow,
  onPassed,
}: {
  pool: QuizQuestion[];
  schoolColor: string;
  wuValue: number;
  alreadyCompleted: boolean;
  passedNow: boolean;
  onPassed: (score: number, answers: Record<number, number>) => void;
}) {
  const [attempt, setAttempt] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<{ score: number; passed: boolean } | null>(null);

  // Rotate which 3 questions are shown on each retake
  const questions = useMemo(() => {
    if (pool.length <= 3) return pool;
    const out: QuizQuestion[] = [];
    for (let i = 0; i < 3; i++) {
      out.push(pool[(attempt * 3 + i) % pool.length]);
    }
    return out;
  }, [pool, attempt]);

  const allAnswered = questions.every((_, i) => answers[i] !== undefined);
  const done = passedNow || alreadyCompleted;

  const submit = () => {
    const correct = questions.filter((q, i) => answers[i] === correctIndex(q)).length;
    const score = Math.round((correct / questions.length) * 100);
    const passed = score >= 70;
    setResult({ score, passed });
    if (passed) onPassed(score, answers);
  };

  const retake = () => {
    setAttempt((a) => a + 1);
    setAnswers({});
    setResult(null);
  };

  if (done) {
    return (
      <div className="text-center py-6">
        <div
          className="inline-flex items-center gap-2.5 rounded-full px-6 py-3 border"
          style={{
            backgroundColor: `${schoolColor}14`,
            borderColor: `${schoolColor}40`,
          }}
        >
          <span className="font-playfair font-bold text-2xl" style={{ color: schoolColor }}>
            +{wuValue}
          </span>
          <span className="text-[11px] uppercase tracking-[0.15em] font-bold" style={{ color: schoolColor }}>
            Wellness Unit{wuValue === 1 ? "" : "s"} Earned
          </span>
        </div>
        <p className="text-[13px] text-[#6b6459] mt-4">
          {passedNow
            ? "Quiz passed — the next lesson is unlocked."
            : "You have already completed this lesson."}
        </p>
      </div>
    );
  }

  return (
    <div>
      {questions.map((q, qi) => {
        const revealed = result !== null;
        const answer = correctIndex(q);
        return (
          <div key={`${attempt}-${qi}`} className="mb-6">
            <p className="text-[14px] font-semibold text-[#1a1a1a] mb-3" style={{ lineHeight: 1.7 }}>
              {qi + 1}. {q.q}
            </p>
            <div className="space-y-2">
              {q.opts.map((opt, oi) => {
                const isSelected = answers[qi] === oi;
                let border = isSelected ? schoolColor : "#e2ddd5";
                let bg = isSelected ? `${schoolColor}10` : "#ffffff";
                if (revealed && oi === answer) {
                  border = "#4a7c59";
                  bg = "#eef5ee";
                } else if (revealed && isSelected && oi !== answer) {
                  border = "#b3403f";
                  bg = "#fbeeee";
                }
                return (
                  <button
                    key={oi}
                    disabled={revealed}
                    onClick={() => setAnswers((a) => ({ ...a, [qi]: oi }))}
                    className="w-full text-left rounded-xl border px-4 py-3 min-h-[44px] transition-colors disabled:cursor-default"
                    style={{ borderColor: border, backgroundColor: bg }}
                  >
                    <span className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full border border-[#cfc8bc] flex items-center justify-center text-[11px] font-bold text-[#6b6459]">
                        {LETTERS[oi]}
                      </span>
                      <span className="text-[13px] text-[#1a1a1a] pt-0.5" style={{ lineHeight: 1.6 }}>
                        {opt.replace(/^[A-D][.):]\s*/, "")}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
            {revealed && (
              <p
                className="mt-2 text-[12px] rounded-lg px-3 py-2"
                style={{
                  lineHeight: 1.7,
                  backgroundColor: answers[qi] === answer ? "#eef5ee" : "#fbeeee",
                  color: answers[qi] === answer ? "#2d5240" : "#7c2a2a",
                }}
              >
                {q.explanation}
              </p>
            )}
          </div>
        );
      })}

      {result === null ? (
        <button
          onClick={submit}
          disabled={!allAnswered}
          className="w-full text-white font-semibold py-3.5 rounded-full min-h-[44px] disabled:opacity-40 transition-opacity"
          style={{ backgroundColor: schoolColor }}
        >
          Submit Final Quiz
        </button>
      ) : result.passed ? null : (
        <div className="text-center">
          <p className="text-[14px] font-semibold text-[#7c2a2a] mb-1">
            {result.score}% — you need 70% to pass.
          </p>
          <p className="text-[12px] text-[#6b6459] mb-4">
            Review the cards and try again. The questions will rotate.
          </p>
          <button
            onClick={retake}
            className="w-full text-white font-semibold py-3.5 rounded-full min-h-[44px]"
            style={{ backgroundColor: schoolColor }}
          >
            Retake Quiz
          </button>
        </div>
      )}
    </div>
  );
}

// ── Card renderer ─────────────────────────────────────────────────────────────

function CardBody({
  card,
  schoolColor,
  wuValue,
  alreadyCompleted,
  passedNow,
  onPassed,
}: {
  card: LessonCard;
  schoolColor: string;
  wuValue: number;
  alreadyCompleted: boolean;
  passedNow: boolean;
  onPassed: (score: number, answers: Record<number, number>) => void;
}) {
  switch (card.type) {
    case "objectives":
      return (
        <div>
          <h3 className="font-playfair text-2xl font-bold text-[#1a1a1a] mb-6">{card.title}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {card.items.map((item, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-[#e2ddd5] p-5"
                style={{ borderTop: `3px solid ${schoolColor}` }}
              >
                <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-[#c9923a] mb-2">
                  Goal {i + 1}
                </p>
                <p className="text-[13px] text-[#1a1a1a]" style={{ lineHeight: 1.7 }}>
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>
      );

    case "hook":
      return (
        <div>
          <h3 className="font-playfair text-2xl font-bold text-[#1a1a1a] mb-1">{card.title}</h3>
          {card.subtitle && (
            <p className="font-playfair italic text-[15px] mb-6" style={{ color: schoolColor }}>
              {card.subtitle}
            </p>
          )}
          <Paragraphs body={card.body} />
        </div>
      );

    case "teaching":
      return (
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#c9923a] mb-2">
            Part {card.part} of 2
          </p>
          <h3 className="font-playfair text-2xl font-bold text-[#1a1a1a] mb-6">{card.title}</h3>
          <Paragraphs body={card.body} />
        </div>
      );

    case "quiz":
      return (
        <div>
          <h3 className="font-playfair text-2xl font-bold text-[#1a1a1a] mb-6">
            {card.title ?? "Check Your Understanding"}
          </h3>
          {card.questions.map((q, i) => (
            <InlineQuestion key={i} question={q} schoolColor={schoolColor} />
          ))}
        </div>
      );

    case "quote":
      return (
        <div className="rounded-2xl p-8 md:p-10" style={{ backgroundColor: schoolColor }}>
          <span className="font-playfair text-[#e8b45a] leading-none select-none block" style={{ fontSize: "64px" }}>
            &ldquo;
          </span>
          <p
            className="font-playfair italic text-white text-[18px] md:text-[21px] -mt-5"
            style={{ lineHeight: 1.7 }}
          >
            {card.quote}
          </p>
          <p className="text-[#e8b45a] text-[12px] uppercase tracking-[0.18em] font-bold mt-6">
            — {card.source}
          </p>
          <div className="border-t border-white/15 mt-6 pt-6">
            {card.context.split("\n\n").map((para, i) => (
              <p key={i} className="text-[13px] text-white/75 mb-3 last:mb-0" style={{ lineHeight: 1.85 }}>
                {para}
              </p>
            ))}
          </div>
        </div>
      );

    case "deeper":
      return (
        <div>
          <h3 className="font-playfair text-2xl font-bold text-[#1a1a1a] mb-1">{card.title}</h3>
          <p className="font-playfair italic text-[14px] text-[#9a9088] mb-6">
            The nuance most courses skip.
          </p>
          <Paragraphs body={card.body} />
        </div>
      );

    case "vocabulary":
      return (
        <div>
          <h3 className="font-playfair text-2xl font-bold text-[#1a1a1a] mb-6">{card.title}</h3>
          <div className="space-y-3">
            {card.terms.map((term) => (
              <div
                key={term.name}
                className="bg-white border border-[#e2ddd5] rounded-xl p-5"
                style={{ borderLeft: `4px solid ${schoolColor}` }}
              >
                <p className="font-playfair font-bold text-[16px] text-[#1a1a1a]">{term.name}</p>
                <p className="text-[12.5px] text-[#6b6459] mt-1.5" style={{ lineHeight: 1.75 }}>
                  {term.definition}
                </p>
              </div>
            ))}
          </div>
        </div>
      );

    case "clinical":
      return (
        <div>
          <h3 className="font-playfair text-2xl font-bold text-[#1a1a1a] mb-5">{card.title}</h3>
          <div
            className="rounded-xl px-6 py-5 mb-6 border"
            style={{
              backgroundColor: `${schoolColor}0d`,
              borderColor: `${schoolColor}35`,
            }}
          >
            <p className="text-[10px] uppercase tracking-[0.18em] font-bold mb-2" style={{ color: schoolColor }}>
              The Scenario
            </p>
            <p className="text-[13.5px] text-[#1a1a1a] font-medium" style={{ lineHeight: 1.8 }}>
              {card.scenario}
            </p>
          </div>
          <Paragraphs body={card.body} />
          <p className="text-[11px] text-[#9a9088] mt-6 italic" style={{ lineHeight: 1.7 }}>
            Educational scenario only. ANW practitioners support wellness within a defined scope and
            refer to licensed medical professionals whenever indicated.
          </p>
        </div>
      );

    case "reflection":
      return (
        <div>
          <h3 className="font-playfair text-2xl font-bold text-[#1a1a1a] mb-5">Reflect, then prove it.</h3>
          <div className="bg-[#f5f1ea] border border-[#e2ddd5] rounded-xl px-6 py-5 mb-8">
            <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-[#c9923a] mb-2">
              Reflection Prompt
            </p>
            <p className="font-playfair italic text-[15px] text-[#1a1a1a]" style={{ lineHeight: 1.8 }}>
              {card.prompt}
            </p>
          </div>
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#c9923a] mb-4">
            Final Quiz — 70% to pass · earns {wuValue} WU · unlocks the next lesson
          </p>
          <FinalQuiz
            pool={card.quizQuestions}
            schoolColor={schoolColor}
            wuValue={wuValue}
            alreadyCompleted={alreadyCompleted}
            passedNow={passedNow}
            onPassed={onPassed}
          />
        </div>
      );
  }
}

// ── Main viewer ───────────────────────────────────────────────────────────────

export default function LessonViewer({
  lessonId,
  lessonTitle,
  content,
  schoolColor,
  schoolName,
  wuValue,
  alreadyCompleted,
  onClose,
  onCompleted,
}: LessonViewerProps) {
  const parsed = useMemo(() => parseLessonContent(content), [content]);
  const cards = useMemo(() => parsed?.cards ?? [], [parsed]);

  const [mode, setMode] = useState<"swipe" | "read">("read");
  const [index, setIndex] = useState(0);
  const [passedNow, setPassedNow] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Default to swipe mode on mobile (< 768px)
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setMode("swipe");
    }
  }, []);

  // Lock body scroll while the viewer is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const goTo = useCallback(
    (next: number) => {
      setIndex(Math.max(0, Math.min(cards.length - 1, next)));
      scrollRef.current?.scrollTo({ top: 0 });
    },
    [cards.length]
  );

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current !== null) {
      touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
    }
  };
  const handleTouchEnd = () => {
    if (Math.abs(touchDeltaX.current) > 60) {
      goTo(index + (touchDeltaX.current < 0 ? 1 : -1));
    }
    touchStartX.current = null;
    touchDeltaX.current = 0;
  };

  const handlePassed = useCallback(
    async (score: number, answers: Record<number, number>) => {
      setPassedNow(true);
      try {
        await fetch("/api/lessons/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lessonId, score, answers }),
        });
        onCompleted?.();
      } catch {
        // Completion is retried next time the lesson quiz is passed
      }
    },
    [lessonId, onCompleted]
  );

  if (!parsed || cards.length === 0) {
    return (
      <div className="fixed inset-0 z-[100] bg-[#faf8f4] flex flex-col items-center justify-center px-6">
        <p className="text-sm text-[#6b6459] text-center">
          This lesson&apos;s content is being prepared. Check back soon.
        </p>
        <button
          onClick={onClose}
          className="mt-6 text-sm font-semibold text-white px-7 py-3 rounded-full min-h-[44px]"
          style={{ backgroundColor: schoolColor }}
        >
          Back to Course
        </button>
      </div>
    );
  }

  const card = cards[index];

  return (
    <div className="fixed inset-0 z-[100] bg-[#faf8f4] flex flex-col overflow-x-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-[#e2ddd5]">
        <div className="max-w-3xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="text-[13px] font-semibold text-[#6b6459] hover:text-[#1a1a1a] min-h-[44px] min-w-[44px] flex items-center"
          >
            ← Exit
          </button>
          <p className="text-[11px] text-[#9a9088] uppercase tracking-[0.12em] truncate hidden sm:block">
            {schoolName}
          </p>
          {/* Swipe | Read toggle */}
          <div className="flex items-center rounded-full border border-[#e2ddd5] p-0.5 bg-[#f5f1ea]">
            {(["swipe", "read"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className="text-[11px] font-bold uppercase tracking-[0.1em] rounded-full px-4 py-2 min-h-[36px] transition-colors"
                style={{
                  backgroundColor: mode === m ? schoolColor : "transparent",
                  color: mode === m ? "#ffffff" : "#6b6459",
                }}
              >
                {m === "swipe" ? "Swipe" : "Read"}
              </button>
            ))}
          </div>
        </div>

        {/* Progress dots */}
        <div className="max-w-3xl mx-auto px-4 md:px-6 pb-3 flex items-center justify-center gap-1.5">
          {cards.map((c, i) => (
            <button
              key={i}
              onClick={() => {
                if (mode === "swipe") goTo(i);
              }}
              aria-label={`Card ${i + 1}: ${CARD_TYPE_LABELS[c.type]}`}
              className="rounded-full transition-all"
              style={{
                width: mode === "swipe" && i === index ? 18 : 7,
                height: 7,
                backgroundColor:
                  mode === "read" || i <= index ? schoolColor : "#d8d2c6",
                opacity: mode === "read" ? 0.9 : i === index ? 1 : 0.45,
              }}
            />
          ))}
        </div>
      </div>

      {/* Body */}
      {mode === "swipe" ? (
        <>
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 pb-10">
              <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#c9923a] mb-1.5">
                {CARD_TYPE_LABELS[card.type]} · Card {index + 1} of {cards.length}
              </p>
              <p className="font-playfair italic text-[13px] text-[#9a9088] mb-5">{lessonTitle}</p>
              <CardBody
                card={card}
                schoolColor={schoolColor}
                wuValue={wuValue}
                alreadyCompleted={alreadyCompleted}
                passedNow={passedNow}
                onPassed={handlePassed}
              />
            </div>
          </div>

          {/* Fixed Back/Next */}
          <div className="flex-shrink-0 bg-white border-t border-[#e2ddd5] px-4 py-3 flex gap-3 max-w-full">
            <button
              onClick={() => goTo(index - 1)}
              disabled={index === 0}
              className="flex-1 min-h-[48px] rounded-full border font-semibold text-[14px] disabled:opacity-35 transition-opacity"
              style={{ borderColor: schoolColor, color: schoolColor }}
            >
              Back
            </button>
            <button
              onClick={() => goTo(index + 1)}
              disabled={index === cards.length - 1}
              className="flex-1 min-h-[48px] rounded-full font-semibold text-[14px] text-white disabled:opacity-35 transition-opacity"
              style={{ backgroundColor: schoolColor }}
            >
              Next
            </button>
          </div>
        </>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 md:px-6 py-10">
            <h2 className="font-playfair text-3xl md:text-4xl font-bold text-[#1a1a1a] mb-10">
              {lessonTitle}
            </h2>
            {cards.map((c, i) => (
              <div key={i} className="mb-12 last:mb-0">
                <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#c9923a] mb-4">
                  {String(i + 1).padStart(2, "0")} · {CARD_TYPE_LABELS[c.type]}
                </p>
                <CardBody
                  card={c}
                  schoolColor={schoolColor}
                  wuValue={wuValue}
                  alreadyCompleted={alreadyCompleted}
                  passedNow={passedNow}
                  onPassed={handlePassed}
                />
                {i < cards.length - 1 && (
                  <div className="border-t border-[#e2ddd5] mt-12" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
