import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { formatCertificateNumber } from "@/lib/student-id";
import AcademySeal from "@/components/ui/academy-seal";
import DiplomaQR from "@/components/dashboard/DiplomaQR";
import DocumentActions from "@/components/dashboard/DocumentActions";

export const dynamic = "force-dynamic";

const FOREST = "#1C3327";
const GOLD = "#D4A94A";

/** Botanical corner ornament for the diploma border. */
function CornerOrnament({ flip }: { flip?: "x" | "y" | "xy" }) {
  const transform =
    flip === "x" ? "scale(-1,1)" : flip === "y" ? "scale(1,-1)" : flip === "xy" ? "scale(-1,-1)" : undefined;
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none" style={{ transform }}>
      <g stroke={GOLD} strokeWidth="1.4" strokeLinecap="round" fill="none">
        <path d="M 4,52 C 4,28 12,12 40,6" />
        <path d="M 12,40 C 8,34 8,28 12,22 C 17,27 17,35 12,40 Z" />
        <path d="M 22,26 C 18,21 18,15 22,10 C 27,14 27,22 22,26 Z" />
        <path d="M 34,16 C 32,11 33,6 38,3 C 41,8 39,13 34,16 Z" />
        <circle cx="46" cy="5" r="1.6" fill={GOLD} stroke="none" />
      </g>
    </svg>
  );
}

export default async function DiplomaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) notFound();

  const studentCert = await prisma.studentCertification.findUnique({
    where: { id },
    include: { certification: true, user: { select: { id: true, name: true, studentId: true } } },
  });

  // Only the owner may view, and only once awarded
  if (!studentCert || studentCert.userId !== user.id || studentCert.status !== "awarded") {
    notFound();
  }

  // Lazily assign a certificate number the first time the diploma is viewed
  let certificateNumber = studentCert.certificateNumber;
  if (!certificateNumber && studentCert.user.studentId) {
    const existing = await prisma.studentCertification.count({
      where: { userId: user.id, certificateNumber: { not: null } },
    });
    certificateNumber = formatCertificateNumber(studentCert.user.studentId, existing + 1);
    await prisma.studentCertification.update({
      where: { id: studentCert.id },
      data: { certificateNumber },
    });
  }

  const awardedDate = (studentCert.awardedAt ?? new Date()).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const verifyPath = `/verify/${certificateNumber ?? ""}`;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Actions — hidden in print */}
      <div className="print:hidden flex items-center justify-between gap-4 flex-wrap">
        <div>
          <Link
            href="/dashboard/certifications"
            className="text-[12px] text-[#8a7a6a] hover:text-[#1a1a1a] transition-colors"
          >
            ← Certifications
          </Link>
          <h1 className="font-playfair text-2xl font-bold text-[#1a1a1a] mt-1">Your Diploma</h1>
        </div>
        <DocumentActions
          printLabel="Download Diploma"
          shareUrl={verifyPath}
          shareLabel="Share"
        />
      </div>

      {/* ── The diploma ──────────────────────────────────────────────── */}
      <div
        className="print-document relative overflow-hidden rounded-sm shadow-[0_6px_32px_rgba(0,0,0,0.14)]"
        style={{
          background: "linear-gradient(160deg, #F5F0E8 0%, #EDE5D0 100%)",
          padding: "10px",
        }}
      >
        {/* Double-line gold border */}
        <div
          className="relative"
          style={{ border: `2.5px solid ${GOLD}`, padding: "3px" }}
        >
          <div
            className="relative px-8 md:px-14 py-12"
            style={{ border: `1px solid ${GOLD}` }}
          >
            {/* Corner ornaments */}
            <div className="absolute top-2 left-2"><CornerOrnament /></div>
            <div className="absolute top-2 right-2"><CornerOrnament flip="x" /></div>
            <div className="absolute bottom-2 left-2"><CornerOrnament flip="y" /></div>
            <div className="absolute bottom-2 right-2"><CornerOrnament flip="xy" /></div>

            {/* Watermark seal behind content */}
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{ opacity: 0.06 }}
            >
              <AcademySeal size="xl" variant="dark" className="w-[420px] h-[420px]" />
            </div>

            {/* Content */}
            <div className="relative flex flex-col items-center text-center">
              <AcademySeal size="xl" variant="gold" />

              <h1
                className="font-playfair font-bold text-[26px] md:text-[30px] uppercase tracking-[0.22em] mt-7 leading-snug"
                style={{ color: FOREST }}
              >
                Academy of Natural Wellness
              </h1>
              <p
                className="font-playfair italic text-[13px] tracking-[0.12em] mt-1.5"
                style={{ color: "#8a6b30" }}
              >
                Natura Sanat, Sapientia Docet
              </p>

              <div className="w-36 h-px my-7" style={{ backgroundColor: GOLD }} />

              <p className="font-playfair italic text-[15px]" style={{ color: "#7a7266" }}>
                This is to certify that
              </p>

              <p
                className="font-playfair font-bold mt-4 leading-tight"
                style={{ color: FOREST, fontSize: "38px" }}
              >
                {user.name}
              </p>

              <p className="font-playfair italic text-[14px] mt-4" style={{ color: "#7a7266" }}>
                has successfully completed all requirements for the
              </p>

              <p
                className="font-playfair font-bold text-[24px] md:text-[27px] mt-3 leading-snug"
                style={{ color: "#B8860B" }}
              >
                {studentCert.certification.title}
              </p>

              <p className="font-playfair italic text-[14px] mt-4" style={{ color: "#7a7266" }}>
                and is hereby awarded the designation of
              </p>

              <p
                className="font-playfair italic text-[19px] mt-2"
                style={{ color: FOREST }}
              >
                {studentCert.certification.title}
              </p>

              <div className="w-36 h-px my-7" style={{ backgroundColor: GOLD }} />

              <p className="text-[13px]" style={{ color: "#5a5348" }}>
                {awardedDate}
              </p>
              <p className="text-[11px] font-mono mt-1.5" style={{ color: "#8a7a6a" }}>
                Certificate No: {certificateNumber ?? "Pending"}
              </p>

              {/* Signatures */}
              <div className="w-full grid grid-cols-2 gap-10 md:gap-16 mt-12 max-w-lg">
                <div className="flex flex-col items-center">
                  <p
                    className="font-caveat text-[30px] leading-none"
                    style={{ color: FOREST }}
                  >
                    Orel Fitch
                  </p>
                  <div
                    className="w-full h-px mt-1"
                    style={{ backgroundColor: "#8a7a6a" }}
                  />
                  <p
                    className="text-[9px] uppercase tracking-[0.2em] mt-2"
                    style={{ color: "#7a7266" }}
                  >
                    Founder &amp; Academic Director
                  </p>
                </div>
                <div className="flex flex-col items-center justify-end">
                  <div className="h-[30px]" />
                  <div className="w-full h-px mt-1" style={{ backgroundColor: "#8a7a6a" }} />
                  <p
                    className="text-[9px] uppercase tracking-[0.2em] mt-2"
                    style={{ color: "#7a7266" }}
                  >
                    Registrar
                  </p>
                </div>
              </div>

              <p
                className="text-[10px] uppercase tracking-[0.25em] mt-10"
                style={{ color: "#8a7a6a" }}
              >
                Est. 2026
              </p>
            </div>

            {/* QR code — bottom right */}
            <div className="absolute bottom-4 right-5 flex flex-col items-center">
              <DiplomaQR verifyPath={verifyPath} size={72} />
              <p
                className="text-[6.5px] mt-1 max-w-[90px] text-center leading-tight"
                style={{ color: "#8a7a6a" }}
              >
                Verify authenticity at anw-academy.vercel.app/verify
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
