import assert from "node:assert/strict";
import { deriveCourseProgress, evaluateCredentialRequirements, reconcileWellnessUnits } from "../lib/academics/policies";
import { canAccessAssessment, hasExactAnswerIds, isAttemptActive } from "../lib/academic-access-policy";

const completed = new Set(["l1", "l2"]);
assert.deepEqual(deriveCourseProgress({ lessonIds: ["l1", "l2", "l3"], completedLessonIds: completed }), { completed: 2, total: 3, percent: 67, isComplete: false });
assert.equal(deriveCourseProgress({ lessonIds: ["l1", "l2"], completedLessonIds: completed }).isComplete, true);

const credential = evaluateCredentialRequirements({ requiredWU: 100, recordedWU: 80, requiredCourseSlugs: ["a", "b"], completedCourseSlugs: new Set(["a"]), requiredCaseStudies: 2, approvedCaseStudies: 1, requiredCapstone: true, approvedCapstones: 0 });
assert.equal(credential.eligible, false);
assert.deepEqual(credential.unmet.map((item) => item.kind), ["wu", "course", "case-study", "capstone"]);
assert.deepEqual(reconcileWellnessUnits(20, [5, 10]), { profileBalance: 20, ledgerBalance: 15, drift: 5, authority: "unreconciled" });

const access = { courseIds: new Set(["course-a"]), schoolIds: new Set(["school-a"]) };
assert.equal(canAccessAssessment(access, { courseId: "course-a", schoolId: null }), true);
assert.equal(canAccessAssessment(access, { courseId: "course-b", schoolId: null }), false);
assert.equal(canAccessAssessment(access, { courseId: null, schoolId: "school-a" }), true);
assert.equal(hasExactAnswerIds(["q1", "q2"], { q1: "a", q2: "b" }), true);
assert.equal(hasExactAnswerIds(["q1"], { q1: "a", q2: "b" }), false);
assert.equal(isAttemptActive(new Date("2026-01-01T00:00:00Z"), null, 30, new Date("2026-01-01T00:10:00Z")), true);
assert.equal(isAttemptActive(new Date("2026-01-01T00:00:00Z"), new Date("2026-01-01T00:05:00Z"), 30, new Date("2026-01-01T00:10:00Z")), false);

console.log("Academic domain verification passed.");
