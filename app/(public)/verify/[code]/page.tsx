import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import AcademySeal from "@/components/ui/academy-seal";

export const dynamic = "force-dynamic";

const FOREST = "#1C3327";
const GOLD = "#D4A94A";

export const metadata = {
  title: "Certificate Verification — Academy of Natural Wellness",
};

function VerifiedBadge() {
  return (
    <div
      className="inline-flex items-center gap-2.5 px-7 py-3 rounded-full"
      style={{
        backgroundColor: "rgba(45,82,64,0.1)",
        border: "1.5px solid #2d5240",
      }}
    >
      <span
        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[13px] font-bold"
        style={{ backgroundColor: "#2d5240" }}
      >
        ✓
      </span>
      <span
        className="font-playfair font-bold text-xl"
        style={{ color: "#2d5240" }}
      >
        VERIFIED
      </span>
    </div>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-6 py-3 border-b border-[#e8e0d0] last:border-0">
      <span className="text-[11px] uppercase tracking-[0.15em] font-semibold text-[#8a7a6a] flex-shrink-0">
        {label}
      </span>
      <span
        className={`text-[14px] text-right ${mono ? "font-mono font-semibold" : "font-medium"}`}
        style={{ color: FOREST }}
      >
        {value}
      </span>
    </div>
  );
}

export default async function VerifyPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  if (!process.env.DATABASE_URL)
    return (
      <div className="max-w-xl mx-auto px-6 py-20 text-center">
        <AcademySeal size="md" variant="dark" />
        <h1 className="font-playfair text-3xl mt-6">
          Certificate Verification
        </h1>
        <p className="mt-5">
          The registrar connection is unavailable on this preview. No
          certificate validity determination has been made.
        </p>
      </div>
    );
  const decoded = code;

  // 1. Try as a certificate number
  const cert = await prisma.studentCertification.findUnique({
    where: { certificateNumber: decoded },
    include: {
      certification: { select: { title: true } },
      user: { select: { name: true, studentId: true } },
    },
  });

  // 2. Fall back to a student ID (graduate verification)
  const student = cert
    ? null
    : await prisma.user.findUnique({
        where: { studentId: decoded },
        select: {
          name: true,
          studentId: true,
          certifications: {
            where: { status: "awarded" },
            include: { certification: { select: { title: true } } },
            orderBy: { awardedAt: "asc" },
          },
        },
      });

  const found =
    (cert && cert.status === "awarded") ||
    (student && student.certifications.length > 0);

  return (
    <div className="w-full bg-[#faf8f4] min-h-[70vh] py-20">
      <div className="max-w-xl mx-auto px-6 flex flex-col items-center text-center">
        <AcademySeal size="lg" variant="gold" />
        <h1 className="font-playfair text-3xl md:text-4xl font-bold text-[#1a1a1a] mt-6">
          Certificate Verification
        </h1>

        {found ? (
          <>
            <div className="mt-8">
              <VerifiedBadge />
            </div>

            <div
              className="w-full mt-8 rounded-2xl px-7 py-5 text-left"
              style={{
                backgroundColor: "#F5F0E8",
                border: `1px solid rgba(212,169,74,0.4)`,
              }}
            >
              {cert ? (
                <>
                  <Row label="Student" value={cert.user.name} />
                  <Row label="Diploma" value={cert.certification.title} />
                  <Row
                    label="Date Awarded"
                    value={cert.awardedAt ? formatDate(cert.awardedAt) : "—"}
                  />
                  <Row
                    label="Certificate No."
                    value={cert.certificateNumber ?? decoded}
                    mono
                  />
                </>
              ) : student ? (
                <>
                  <Row label="Student" value={student.name} />
                  <Row
                    label="Student No."
                    value={student.studentId ?? decoded}
                    mono
                  />
                  {student.certifications.map((sc) => (
                    <Row
                      key={sc.id}
                      label="Diploma"
                      value={`${sc.certification.title}${
                        sc.awardedAt ? ` (${formatDate(sc.awardedAt)})` : ""
                      }`}
                    />
                  ))}
                </>
              ) : null}
            </div>

            <div className="mt-8 flex flex-col items-center">
              <AcademySeal size="sm" variant="gold" />
              <p
                className="font-playfair italic text-[13px] tracking-[0.08em] mt-3"
                style={{ color: "#8a6b30" }}
              >
                Natura Sanat, Sapientia Docet
              </p>
              <p className="text-[13px] text-[#6b6459] mt-4 max-w-sm leading-relaxed">
                This certification has been verified as authentic by the Academy
                of Natural Wellness.
              </p>
              <p className="text-[10px] uppercase tracking-[0.25em] text-[#9a9088] mt-5">
                Est. 2026
              </p>
            </div>
          </>
        ) : (
          <>
            <div
              className="mt-8 inline-flex items-center gap-2.5 px-7 py-3 rounded-full"
              style={{
                backgroundColor: "#f0ece4",
                border: "1.5px solid #c8c0b0",
              }}
            >
              <span className="font-playfair font-bold text-lg text-[#6b6459]">
                Certificate Not Found
              </span>
            </div>
            <p className="text-[14px] text-[#6b6459] mt-6 max-w-sm leading-relaxed">
              This certificate number does not match our records.
            </p>
            <p className="text-[13px] text-[#9a9088] mt-3 max-w-sm leading-relaxed">
              If you believe this is an error, contact{" "}
              <a
                href="mailto:registrar@anw-academy.vercel.app"
                className="underline hover:text-[#6b6459]"
              >
                registrar@anw-academy.vercel.app
              </a>
            </p>
            <p className="text-[10px] uppercase tracking-[0.25em] text-[#9a9088] mt-10">
              Est. 2026
            </p>
          </>
        )}
      </div>
    </div>
  );
}
