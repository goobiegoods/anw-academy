export type CourseProgressInput = {
  lessonIds: string[];
  completedLessonIds: ReadonlySet<string>;
};

export function deriveCourseProgress({ lessonIds, completedLessonIds }: CourseProgressInput) {
  const completed = lessonIds.filter((id) => completedLessonIds.has(id)).length;
  const total = lessonIds.length;
  return {
    completed,
    total,
    percent: total === 0 ? 0 : Math.round((completed / total) * 100),
    isComplete: total > 0 && completed === total,
  };
}

export type CredentialRequirementInput = {
  requiredWU: number;
  recordedWU: number;
  requiredCourseSlugs: string[];
  completedCourseSlugs: ReadonlySet<string>;
  requiredCaseStudies: number;
  approvedCaseStudies: number;
  requiredCapstone: boolean;
  approvedCapstones: number;
};

export function evaluateCredentialRequirements(input: CredentialRequirementInput) {
  const missingCourses = input.requiredCourseSlugs.filter(
    (slug) => !input.completedCourseSlugs.has(slug)
  );
  const unmet = [
    input.recordedWU < input.requiredWU
      ? { kind: "wu" as const, remaining: input.requiredWU - input.recordedWU }
      : null,
    ...missingCourses.map((slug) => ({ kind: "course" as const, slug })),
    input.approvedCaseStudies < input.requiredCaseStudies
      ? {
          kind: "case-study" as const,
          remaining: input.requiredCaseStudies - input.approvedCaseStudies,
        }
      : null,
    input.requiredCapstone && input.approvedCapstones === 0
      ? { kind: "capstone" as const }
      : null,
  ].filter((item): item is NonNullable<typeof item> => item !== null);

  return { eligible: unmet.length === 0, unmet };
}

export function reconcileWellnessUnits(profileBalance: number, ledgerAmounts: number[]) {
  const ledgerBalance = ledgerAmounts.reduce((sum, amount) => sum + amount, 0);
  return {
    profileBalance,
    ledgerBalance,
    drift: profileBalance - ledgerBalance,
    authority: "unreconciled" as const,
  };
}
