import { redirect } from "next/navigation";
import PractitionerLayout from "@/components/practitioner/PractitionerLayout";
import { getCurrentUser } from "@/lib/auth";
import { isAdminEmail } from "@/lib/admin-emails";

export default async function PractitionerRootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user) redirect("/login");
  if (isAdminEmail(user.email)) redirect("/admin");
  if (user.role !== "PRACTITIONER" && user.role !== "MENTOR") redirect("/dashboard");

  return <PractitionerLayout>{children}</PractitionerLayout>;
}
