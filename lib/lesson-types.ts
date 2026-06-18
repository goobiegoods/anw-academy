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

export function parseLessonContent(content: string): LessonContent | null {
  try {
    const parsed = JSON.parse(content);
    if (parsed && Array.isArray(parsed.cards)) return parsed as LessonContent;
    return null;
  } catch {
    return null;
  }
}
