import type { User as SupabaseUser } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";
import { ensureStudentId } from "@/lib/student-id";

function academyName(authUser: SupabaseUser, submittedName?: string): string {
  const candidate =
    submittedName?.trim() ||
    (typeof authUser.user_metadata?.name === "string"
      ? authUser.user_metadata.name.trim()
      : "");

  return candidate.slice(0, 120) || "Academy Student";
}

/** Create the Academy record only for the verified Supabase identity. */
export async function ensureAcademyUser(
  authUser: SupabaseUser,
  submittedName?: string,
) {
  if (!authUser.email)
    throw new Error("The authenticated account has no email address.");

  const email = authUser.email.toLowerCase();
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: academyName(authUser, submittedName),
      role: "STUDENT",
      studentProfile: { create: {} },
    },
  });

  await ensureStudentId(user.id);
  return user;
}
