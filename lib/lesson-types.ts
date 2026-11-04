// Shared structure for the 10-card lesson content stored as JSON
// in Lesson.content. Used by the seed composer and the LessonViewer.

export type QuizQuestion = {
  q: string;
  opts: string[]; // exactly 4 options
  correct: string; // letter: "a" | "b" | "c" | "d"
  explanation: string;
};

export type ObjectivesCard = {
  type: "objectives";
  title: string;
  items: string[]; // 5 learning goals
};

export type HookCard = {
  type: "hook";
  title: string;
  subtitle: string;
  body: string; // 400+ words, paragraphs separated by \n\n
};

export type TeachingCard = {
  type: "teaching";
  title: string;
  part: number; // 1 or 2
  body: string; // 500+ words
};

export type QuizCard = {
  type: "quiz";
  title?: string;
  questions: QuizQuestion[]; // 2 inline questions
};

export type QuoteCard = {
  type: "quote";
  title: string;
  quote: string;
  source: string;
  context: string; // 150+ words about the source
};

export type DeeperCard = {
  type: "deeper";
  title: string;
  body: string; // 400+ words
};

export type VocabularyCard = {
  type: "vocabulary";
  title: string;
  terms: { name: string; definition: string }[]; // 5 terms
};

export type ClinicalCard = {
  type: "clinical";
  title: string;
  scenario: string;
  body: string; // 300+ words
};

export type ReflectionCard = {
  type: "reflection";
  prompt: string;
  quizQuestions: QuizQuestion[]; // pool of final-quiz questions; viewer rotates 3 per attempt
};

export type LessonCard =
  | ObjectivesCard
  | HookCard
  | TeachingCard
  | QuizCard
  | QuoteCard
  | DeeperCard
  | VocabularyCard
  | ClinicalCard
  | ReflectionCard;

export type LessonContent = {
  cards: LessonCard[];
};

export const CARD_TYPE_LABELS: Record<LessonCard["type"], string> = {
  objectives: "Objectives",
  hook: "The Hook",
  teaching: "Core Teaching",
  quiz: "Check Your Understanding",
  quote: "Masters Speak",
  deeper: "Going Deeper",
  vocabulary: "Key Vocabulary",
  clinical: "Clinical Relevance",
  reflection: "Reflection & Final Quiz",
};

export function correctIndex(q: QuizQuestion): number {
  return q.correct.toLowerCase().charCodeAt(0) - 97;
}

export function selectFinalQuizQuestions(pool: QuizQuestion[], attempt: number): QuizQuestion[] {
  if (pool.length <= 3) return pool;

  const safeAttempt = Number.isInteger(attempt) && attempt >= 0 ? attempt : 0;
  return Array.from({ length: 3 }, (_, index) => pool[(safeAttempt * 3 + index) % pool.length]);
}

export function gradeLessonFinal(
  content: string,
  attempt: number,
  answers: Record<string, number>
): { score: number; passed: boolean; correct: number; total: number } | null {
  const parsed = parseLessonContent(content);
  const reflection = parsed?.cards.find((card): card is ReflectionCard => card.type === "reflection");
  if (!reflection || reflection.quizQuestions.length === 0) return null;

  const questions = selectFinalQuizQuestions(reflection.quizQuestions, attempt);
  const complete = questions.every((_, index) => Number.isInteger(answers[String(index)]));
  const correct = complete
    ? questions.filter((question, index) => answers[String(index)] === correctIndex(question)).length
    : 0;
  const score = questions.length ? Math.round((correct / questions.length) * 100) : 0;

  return { score, passed: complete && score >= 70, correct, total: questions.length };
}

export function parseLessonContent(content: string): LessonContent | null {
  try {
    const parsed = JSON.parse(content);
    if (parsed && Array.isArray(parsed.cards)) return parsed as LessonContent;
    return null;
  } catch {
    return null;
  }
}
