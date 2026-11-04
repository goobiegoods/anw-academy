export type AcademicAccessContext = {
  courseIds: ReadonlySet<string>;
  schoolIds: ReadonlySet<string>;
};

export type AssessmentPlacement = {
  courseId: string | null;
  schoolId: string | null;
};

export function canAccessCourse(context: AcademicAccessContext, courseId: string): boolean {
  return context.courseIds.has(courseId);
}

/**
 * Course assessments require enrollment in that course. School assessments
 * require enrollment in at least one course in that school. Completion rules
 * intentionally remain outside this access boundary until academic policy is
 * approved.
 */
export function canAccessAssessment(
  context: AcademicAccessContext,
  assessment: AssessmentPlacement
): boolean {
  if (assessment.courseId) return context.courseIds.has(assessment.courseId);
  if (assessment.schoolId) return context.schoolIds.has(assessment.schoolId);
  return false;
}

export function hasExactAnswerIds(
  expectedIds: readonly string[],
  answers: Record<string, string>
): boolean {
  const answerIds = Object.keys(answers);
  return (
    answerIds.length === expectedIds.length &&
    expectedIds.every((id) => Object.prototype.hasOwnProperty.call(answers, id))
  );
}

export function isAttemptActive(
  startedAt: Date,
  submittedAt: Date | null,
  timeLimitMinutes: number | null,
  now: Date
): boolean {
  if (submittedAt) return false;
  if (!timeLimitMinutes) return true;
  return now.getTime() <= startedAt.getTime() + (timeLimitMinutes * 60 + 30) * 1_000;
}
