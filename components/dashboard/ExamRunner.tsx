"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

type ExamMeta = {
  id: string;
  title: string;
  type: string;
  passingScore: number;
  wuValue: number;
  questionCount: number;
  timeLimitMinutes: number | null;
  cooldownHours: number;
  contextName: string;
  schoolColor: string;
};

type ExamQuestion = { id: string; prompt: string; type: string; options: string[] };

type ExamResult = {
  score: number;
  passed: boolean;
  timedOut: boolean;
  passingScore: number;
  correct: number;
  total: number;
  wuValue: number;
  breakdown: {
    id: string;
    prompt: string;
    correctAnswer: string;
    given: string;
    isCorrect: boolean;
    explanation: string | null;
  }[];
};

const LETTERS = ["A", "B", "C", "D"];

export default function ExamRunner({ exam }: { exam: ExamMeta }) {
  const color = exam.schoolColor;

  const [phase, setPhase] = useState<"intro" | "active" | "result">("intro");
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [result, setResult] = useState<ExamResult | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submittedRef = useRef(false);

  const start = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/exams/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quizId: exam.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not start exam.");
      setAttemptId(data.attemptId);
      setQuestions(data.questions);
      if (data.timeLimitMinutes) setSecondsLeft(data.timeLimitMinutes * 60);
      setPhase("active");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start exam.");
    } finally {
      setBusy(false);
    }
  };

  const submit = useCallback(async () => {
    if (submittedRef.current || !attemptId) return;
    submittedRef.current = true;
    setBusy(true);
    try {
      const res = await fetch("/api/exams/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId, answers }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not submit.");
      setResult(data);
      setPhase("result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit.");
      submittedRef.current = false;
    } finally {
      setBusy(false);
    }
  }, [attemptId, answers]);

  // Countdown timer with auto-submit
  useEffect(() => {
    if (phase !== "active" || secondsLeft === null) return;
    if (secondsLeft <= 0) {
      submit();
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => (s === null ? null : s - 1)), 1000);
    return () => clearTimeout(t);
  }, [phase, secondsLeft, submit]);

  const answeredCount = Object.keys(answers).length;

  // ── Intro ──────────────────────────────────────────────────────────────
  if (phase === "intro") {
    return (
      <div className="max-w-2xl space-y-6">
        <Link href="/dashboard/courses" className="text-[13px] text-[#6b6459] hover:text-[#1a1a1a]">
          ← Back to courses
        </Link>
        <div className="rounded-2xl px-8 py-10 text-white" style={{ backgroundColor: color }}>
          <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-white/60 mb-2">
            {exam.type === "final" ? "School Final Exam" : "Course Midterm Exam"} · {exam.contextName}
          </p>
          <h1 className="font-playfair text-3xl font-bold">{exam.title}</h1>
        </div>
        <div className="bg-white border border-[#e2ddd5] rounded-2xl p-7">
          <div className="grid grid-cols-2 gap-5 mb-6">
            {[
              { label: "Questions", value: exam.questionCount },
              { label: "Time Limit", value: exam.timeLimitMinutes ? `${exam.timeLimitMinutes} min` : "Untimed" },
              { label: "To Pass", value: `${exam.passingScore}%` },
              { label: "Reward", value: `${exam.wuValue} WU` },
            ].map((s) => (
              <div key={s.label}>
                <p className="font-playfair text-2xl font-bold" style={{ color }}>{s.value}</p>
                <p className="text-[10px] uppercase tracking-[0.15em] text-[#9a9088]">{s.label}</p>
              </div>
            ))}
          </div>
          <ul className="text-[13px] text-[#6b6459] space-y-2 mb-6" style={{ lineHeight: 1.6 }}>
            <li>• The timer starts when you begin and is enforced on submission.</li>
            <li>• Questions rotate on each retake.</li>
            <li>• A failed attempt has a {exam.cooldownHours}-hour cooldown before retaking.</li>
            <li>• You earn {exam.wuValue} WU the first time you pass.</li>
          </ul>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">
              {error}
            </div>
          )}
          <button
            onClick={start}
            disabled={busy}
            className="w-full text-white font-semibold py-3.5 rounded-full min-h-[44px] disabled:opacity-50"
            style={{ backgroundColor: color }}
          >
            {busy ? "Starting…" : "Begin Exam"}
          </button>
        </div>
      </div>
    );
  }

  // ── Result ─────────────────────────────────────────────────────────────
  if (phase === "result" && result) {
    return (
      <div className="max-w-2xl space-y-6">
        <div
          className="rounded-2xl px-8 py-10 text-center text-white"
          style={{ backgroundColor: result.passed ? color : "#7c2a2a" }}
        >
          <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-white/60 mb-3">
            {result.timedOut ? "Time Expired" : result.passed ? "Passed" : "Not Passed"}
          </p>
          <p className="font-playfair text-6xl font-bold">{result.score}%</p>
          <p className="text-white/80 text-sm mt-2">
            {result.correct} of {result.total} correct · {result.passingScore}% required
          </p>
          {result.passed && (
            <p className="mt-4 inline-block bg-white/15 rounded-full px-5 py-2 text-sm font-semibold">
              +{result.wuValue} WU earned
            </p>
          )}
        </div>

        <div className="bg-white border border-[#e2ddd5] rounded-2xl p-6">
          <h2 className="font-playfair text-lg font-bold text-[#1a1a1a] mb-4">Score Breakdown</h2>
          <div className="space-y-4">
            {result.breakdown.map((b, i) => (
              <div key={b.id} className="border-b border-[#f0ece4] pb-4 last:border-b-0">
                <p className="text-[13px] font-medium text-[#1a1a1a] mb-1">
                  <span style={{ color: b.isCorrect ? "#4a7c59" : "#b3403f" }}>
                    {b.isCorrect ? "✓" : "✗"}
                  </span>{" "}
                  {i + 1}. {b.prompt}
                </p>
                {!b.isCorrect && (
                  <p className="text-[12px] text-[#6b6459] ml-4">
                    Correct answer: <strong>{b.correctAnswer.toUpperCase()}</strong>
                    {b.explanation ? ` — ${b.explanation}` : ""}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <Link
            href="/dashboard/courses"
            className="flex-1 text-center border font-semibold py-3 rounded-full min-h-[44px]"
            style={{ borderColor: color, color }}
          >
            Back to Courses
          </Link>
          {!result.passed && (
            <button
              onClick={() => {
                submittedRef.current = false;
                setResult(null);
                setAnswers({});
                setPhase("intro");
              }}
              className="flex-1 text-white font-semibold py-3 rounded-full min-h-[44px]"
              style={{ backgroundColor: color }}
            >
              Retake (after cooldown)
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── Active ─────────────────────────────────────────────────────────────
  const mm = secondsLeft !== null ? Math.floor(secondsLeft / 60) : 0;
  const ss = secondsLeft !== null ? secondsLeft % 60 : 0;
  const lowTime = secondsLeft !== null && secondsLeft < 120;

  return (
    <div className="max-w-2xl space-y-5 pb-24">
      {/* Sticky timer */}
      <div className="sticky top-0 z-10 bg-[#faf8f4] py-3 flex items-center justify-between border-b border-[#e2ddd5]">
        <p className="text-[13px] font-semibold text-[#1a1a1a]">
          {answeredCount} / {questions.length} answered
        </p>
        {secondsLeft !== null && (
          <p
            className="font-mono text-sm font-bold px-3 py-1.5 rounded-full"
            style={{
              color: lowTime ? "#b3403f" : color,
              backgroundColor: lowTime ? "#fbeeee" : `${color}12`,
            }}
          >
            {mm}:{ss.toString().padStart(2, "0")}
          </p>
        )}
      </div>

      {questions.map((q, qi) => (
        <div key={q.id} className="bg-white border border-[#e2ddd5] rounded-xl p-5">
          <p className="text-[14px] font-medium text-[#1a1a1a] mb-3" style={{ lineHeight: 1.6 }}>
            {qi + 1}. {q.prompt}
          </p>
          <div className="space-y-2">
            {q.options.map((opt, oi) => {
              const letter = LETTERS[oi]?.toLowerCase() ?? String(oi);
              const selected = answers[q.id] === letter;
              return (
                <button
                  key={oi}
                  onClick={() => setAnswers((a) => ({ ...a, [q.id]: letter }))}
                  className="w-full text-left rounded-lg border px-4 py-3 min-h-[44px] transition-colors"
                  style={{
                    borderColor: selected ? color : "#e2ddd5",
                    backgroundColor: selected ? `${color}12` : "#fff",
                  }}
                >
                  <span className="flex items-start gap-3">
                    <span
                      className="flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center text-[11px] font-bold"
                      style={{ borderColor: selected ? color : "#cfc8bc", color: selected ? color : "#6b6459" }}
                    >
                      {LETTERS[oi]}
                    </span>
                    <span className="text-[13px] text-[#1a1a1a] pt-0.5" style={{ lineHeight: 1.5 }}>
                      {opt.replace(/^[A-D][.):]\s*/, "")}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e2ddd5] px-4 py-3">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={submit}
            disabled={busy}
            className="w-full text-white font-semibold py-3.5 rounded-full min-h-[48px] disabled:opacity-50"
            style={{ backgroundColor: color }}
          >
            {busy ? "Submitting…" : `Submit Exam (${answeredCount}/${questions.length})`}
          </button>
        </div>
      </div>
    </div>
  );
}
