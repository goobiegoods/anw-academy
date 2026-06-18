// Curriculum specification types consumed by the composer (composer.ts)
// and the seed (../seed.ts).

export type Term = { name: string; definition: string };

export type SchoolQuote = {
  quote: string;
  source: string;
  context: string; // 2–4 sentences about the source; composer extends to 150+ words
};

export type LessonSpec = {
  title: string;
  // The core concept of the lesson, in 1–3 authored sentences. This is the
  // bespoke seed from which the composer builds the hook, teachings, and quiz.
  focus: string;
  figures: string[]; // real historical/contemporary figures referenced
};

export type ModuleSpec = {
  title: string;
  lessons: LessonSpec[]; // 3 lessons
};

export type CourseSpec = {
  title: string;
  description: string;
  level: number;
  estimatedHours: number;
  wuValue: number;
  department: number; // index into SchoolSpec.departments
  // Conceptual claims of the course — woven into teaching prose.
  themes: string[];
  // Term bank (10+); each lesson draws a rotating window of 5.
  terms: Term[];
  // Clinical scenario premises (3+); lessons rotate through them.
  scenarios: string[];
  modules: [ModuleSpec, ModuleSpec];
};

export type VoiceBank = {
  // Paragraphs (~80–120 words each) in the school's teaching voice.
  lineage: string[]; // the tradition's history and inheritance
  method: string[]; // how this school thinks and works
  caution: string[]; // humility, safety, the limits of the art
  practice: string[]; // what mastery looks like in the field
};

export type SchoolSpec = {
  name: string;
  slug: string;
  description: string;
  color: string;
  accent: string;
  icon: string;
  order: number;
  departments: string[];
  voice: VoiceBank;
  quotes: SchoolQuote[]; // 8+
  // Plausible-sounding but wrong claims, used as quiz distractors.
  misconceptions: string[]; // 8+
  figurePool: string[]; // all figures across the school, for quiz distractors
  courses: CourseSpec[]; // 8
};

export type GeneratedQuestion = {
  q: string;
  opts: string[];
  correct: string; // "a" | "b" | "c" | "d"
  explanation: string;
};
