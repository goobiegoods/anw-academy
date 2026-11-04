import { buildStudentSnapshot } from "@/lib/academics/student-snapshot";

export async function buildScholarContext(
  userId: string,
  requested?: { school?: string; course?: string }
) {
  const snapshot = await buildStudentSnapshot(userId);
  const studies = snapshot.studies.slice(0, 6).map((study) =>
    `${study.title} (${study.school.name}): ${study.progress.completed}/${study.progress.total} lessons completed`
  );
  const recentResults = snapshot.recentAttempts.slice(0, 5).map((attempt) =>
    `${attempt.passed ? "passed" : "attempted"} assessment at ${attempt.score}%`
  );

  const selectedStudy = snapshot.studies.find(
    (study) =>
      (!requested?.course || study.title === requested.course) &&
      (!requested?.school || study.school.name === requested.school)
  );

  return [
    "Authoritative Academy student context (use only to personalize instruction; never infer a diagnosis or claim mastery):",
    studies.length ? `Current studies: ${studies.join("; ")}.` : "Current studies: no active enrollment recorded.",
    `Verified completed lessons: ${snapshot.completedLessonCount}.`,
    recentResults.length ? `Recent verified assessment evidence: ${recentResults.join("; ")}.` : "Recent verified assessment evidence: none recorded.",
    selectedStudy ? `Student-selected enrolled study lens: ${selectedStudy.title} in ${selectedStudy.school.name}.` : "No enrolled study lens was selected.",
    `Faculty-reviewed work: ${snapshot.cases.filter((item) => item.status === "approved").length} approved case study/studies; ${snapshot.capstones.filter((item) => item.status === "approved").length} approved capstone(s).`,
    "Wellness Units indicate recorded participation, not competency mastery.",
  ].join("\n").slice(0, 3_000);
}
