import { getCurrentUser } from "@/lib/auth";
import { HttpError } from "@/lib/http";
export async function requirePractitioner() {
  const user = await getCurrentUser();
  if (!user) throw new HttpError(401, "Not authenticated.");
  if (
    !["PRACTITIONER", "MENTOR"].includes(user.role) ||
    !user.practitionerProfile
  )
    throw new HttpError(403, "Practitioner access required.");
  return { user, profile: user.practitionerProfile };
}
