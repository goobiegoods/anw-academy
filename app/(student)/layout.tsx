import { redirect } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { getCurrentUser } from "@/lib/auth";
import { isAdminEmail } from "@/lib/admin-emails";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) redirect("/login");
  if (isAdminEmail(user.email) || user.role === "ADMIN") redirect("/admin");
  if (!["STUDENT", "PRACTITIONER", "MENTOR"].includes(user.role)) redirect("/");

  return <DashboardLayout>{children}</DashboardLayout>;
}
