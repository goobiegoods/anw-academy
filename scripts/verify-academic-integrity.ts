import assert from "node:assert/strict";
import { levelForWU } from "../lib/academy-2.0/academic-progress";
import { gradeLessonFinal, selectFinalQuizQuestions, type QuizQuestion } from "../lib/lesson-types";

const pool: QuizQuestion[] = [
  { q: "Q1", opts: ["A", "B", "C", "D"], correct: "a", explanation: "E1" },
  { q: "Q2", opts: ["A", "B", "C", "D"], correct: "b", explanation: "E2" },
  { q: "Q3", opts: ["A", "B", "C", "D"], correct: "c", explanation: "E3" },
  { q: "Q4", opts: ["A", "B", "C", "D"], correct: "d", explanation: "E4" },
];

const content = JSON.stringify({ cards: [{ type: "reflection", prompt: "Explain it.", quizQuestions: pool }] });

assert.deepEqual(selectFinalQuizQuestions(pool, 0).map((question) => question.q), ["Q1", "Q2", "Q3"]);
assert.deepEqual(selectFinalQuizQuestions(pool, 1).map((question) => question.q), ["Q4", "Q1", "Q2"]);

assert.deepEqual(gradeLessonFinal(content, 0, { "0": 0, "1": 1, "2": 2 }), {
  score: 100,
  passed: true,
  correct: 3,
  total: 3,
});
assert.equal(gradeLessonFinal(content, 0, { "0": 0, "1": 1, "2": 0 })?.passed, false);
assert.equal(gradeLessonFinal(content, 0, { "0": 0 })?.passed, false);
assert.equal(gradeLessonFinal("not-json", 0, {}) , null);

assert.deepEqual([0, 149, 150, 499, 500, 749, 750, 999, 1000, 1249, 1250].map(levelForWU), [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6]);

console.log("Academic integrity verification passed.");
