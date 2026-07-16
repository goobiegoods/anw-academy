import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import FacultyManager from "@/components/admin/FacultyManager";

export const dynamic = "force-dynamic";

export default async function AdminFacultyPage() {
  await requireAdmin();

  const [faculty, schools] = await Promise.all([
    prisma.faculty.findMany({ orderBy: [{ isFounding: "desc" }, { joinedAt: "asc" }] }),
    prisma.school.findMany({ orderBy: { order: "asc" }, select: { name: true } }),
  ]);

  return (
    <FacultyManager
      faculty={faculty.map((f) => ({
        id: f.id,
        slug: f.slug,
        name: f.name,
        title: f.title,
        bio: f.bio,
        credentials: f.credentials,
        specializations: f.specializations,
        schools: f.schools,
        coursesTaught: f.coursesTaught,
        photoUrl: f.photoUrl,
        email: f.email,
        linkedinUrl: f.linkedinUrl,
        personalWebsite: f.personalWebsite,
        isActive: f.isActive,
        isFounding: f.isFounding,
      }))}
      schoolNames={schools.map((s) => s.name)}
    />
  );
}
