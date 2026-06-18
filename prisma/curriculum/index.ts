import type { SchoolSpec } from "./types";
import { HERBAL } from "./herbal";
import { TCM } from "./tcm";
import { HOMEOPATHY } from "./homeopathy";
import { FUNCTIONAL } from "./functional";
import { PRACTICE } from "./practice";
import { ENTREPRENEURSHIP } from "./entrepreneurship";

export const SCHOOLS: SchoolSpec[] = [
  HERBAL,
  TCM,
  HOMEOPATHY,
  FUNCTIONAL,
  PRACTICE,
  ENTREPRENEURSHIP,
];

export { composeLessonContent, buildCourseQuestionPool } from "./composer";
export * from "./types";
