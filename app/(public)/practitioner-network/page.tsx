import { prisma } from "@/lib/prisma";
import PractitionerDirectory from "@/components/practitioner/PractitionerDirectory";

export const dynamic = "force-dynamic";

export default async function PractitionerNetworkPage() {
  const practitioners = await prisma.practitionerProfile.findMany({
    where: { verifiedGraduate: true },
    orderBy: { displayName: "asc" },
  });

  const directory = practitioners.map((p) => ({
    id: p.id,
    displayName: p.displayName,
    bio: p.bio ?? "",
    location: p.location ?? "Location undisclosed",
    virtualAvailable: p.virtualAvailable,
    inPersonAvailable: p.inPersonAvailable,
    specialties: p.specialties,
    languages: p.languages,
    certifications: p.certifications,
    bookingUrl: p.bookingUrl,
  }));

  return (
    <div className="w-full bg-[#faf8f4]">
      <div className="w-full bg-[#1a2e22] py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="block w-10 h-px bg-[#e8b45a]" />
            <span className="uppercase tracking-[0.25em] text-[10px] font-semibold text-white/50">
              The Practitioner Network
            </span>
          </div>
          <h1 className="font-playfair text-5xl md:text-6xl font-bold text-white leading-tight">
            Verified graduates.{" "}
            <span className="italic font-normal text-[#e8b45a]">
              Real practitioners.
            </span>
          </h1>
          <p className="text-sm text-white/70 max-w-xl mt-6" style={{ lineHeight: 1.9 }}>
            Every practitioner in this directory completed an ANW certification
            and was verified by faculty. Filter by specialty, location, or
            virtual availability to find the right fit.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        <PractitionerDirectory practitioners={directory} />
      </div>
    </div>
  );
}
