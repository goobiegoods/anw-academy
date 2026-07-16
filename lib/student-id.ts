import { prisma } from "@/lib/prisma";

export const STUDENT_ID_PREFIX = "ANW-2026";

export function formatStudentId(sequence: number): string {
  return `${STUDENT_ID_PREFIX}-${String(sequence).padStart(5, "0")}`;
}

/**
 * Allocate the next sequential student number (ANW-2026-XXXXX).
 * Zero-padded IDs sort lexicographically, so the max studentId string
 * is also the max sequence. The unique constraint on User.studentId
 * guards against the rare concurrent-signup race; callers retry once.
 */
export async function nextStudentId(): Promise<string> {
  const last = await prisma.user.findFirst({
    where: { studentId: { not: null } },
    orderBy: { studentId: "desc" },
    select: { studentId: true },
  });
  const lastSeq = last?.studentId
    ? parseInt(last.studentId.slice(STUDENT_ID_PREFIX.length + 1), 10)
    : 0;
  return formatStudentId(lastSeq + 1);
}

/** Assign a student ID to a user that doesn't have one yet. */
export async function ensureStudentId(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { studentId: true },
  });
  if (user?.studentId) return user.studentId;

  for (let attempt = 0; attempt < 3; attempt++) {
    const candidate = await nextStudentId();
    try {
      const updated = await prisma.user.update({
        where: { id: userId },
        data: { studentId: candidate },
      });
      return updated.studentId!;
    } catch {
      // Unique collision from a concurrent signup — retry with a fresh number
    }
  }
  throw new Error("Could not allocate a student ID");
}

/**
 * Certificate numbers are built on the student ID:
 * ANW-2026-XXXXX-NN where NN is the 1-based index of the certification
 * among the student's earned certifications.
 */
export function formatCertificateNumber(studentId: string, certIndex: number): string {
  return `${studentId}-${String(certIndex).padStart(2, "0")}`;
}
