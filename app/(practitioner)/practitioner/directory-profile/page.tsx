import { requirePractitioner } from "@/lib/practitioner";
import DirectoryProfileForm from "@/components/practitioner/DirectoryProfileForm";
export const dynamic = "force-dynamic";
export default async function DirectoryProfilePage() {
  const { profile: p } = await requirePractitioner();
  return (
    <DirectoryProfileForm
      directoryStatus={p.directoryStatus}
      verifiedGraduate={p.verifiedGraduate}
      initial={{
        displayName: p.displayName,
        bio: p.bio || "",
        location: p.location || "",
        specialties: p.specialties.join(", "),
        languages: p.languages.join(", "),
        bookingUrl: p.bookingUrl || "",
        virtualAvailable: p.virtualAvailable,
        inPersonAvailable: p.inPersonAvailable,
      }}
    />
  );
}
