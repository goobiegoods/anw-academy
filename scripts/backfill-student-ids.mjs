/**
 * Backfills sequential student IDs (ANW-2026-XXXXX) for every user that
 * lacks one, ordered by createdAt, and assigns certificate numbers
 * (ANW-2026-XXXXX-NN) to awarded certifications that lack one.
 * Idempotent — safe to re-run.
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const PREFIX = "ANW-2026";

async function main() {
  // ── 1. Student IDs ────────────────────────────────────────────────────
  const last = await prisma.user.findFirst({
    where: { studentId: { not: null } },
    orderBy: { studentId: "desc" },
    select: { studentId: true },
  });
  let seq = last?.studentId ? parseInt(last.studentId.slice(PREFIX.length + 1), 10) : 0;

  const missing = await prisma.user.findMany({
    where: { studentId: null },
    orderBy: { createdAt: "asc" },
    select: { id: true, email: true, createdAt: true },
  });

  console.log(`Users without a student ID: ${missing.length} (starting after seq ${seq})`);
  for (const u of missing) {
    seq += 1;
    const studentId = `${PREFIX}-${String(seq).padStart(5, "0")}`;
    await prisma.user.update({ where: { id: u.id }, data: { studentId } });
    console.log(`  ${studentId}  ${u.email}`);
  }

  // ── 2. Certificate numbers for awarded certifications ────────────────
  const awarded = await prisma.studentCertification.findMany({
    where: { status: "awarded", certificateNumber: null },
    orderBy: { awardedAt: "asc" },
    include: { user: { select: { studentId: true, email: true } } },
  });
  console.log(`\nAwarded certifications without a certificate number: ${awarded.length}`);

  // Count existing numbered certs per user so indices continue correctly
  const perUser = new Map();
  for (const sc of awarded) {
    if (!sc.user.studentId) {
      console.warn(`  SKIP (no student ID): cert ${sc.id} for ${sc.user.email}`);
      continue;
    }
    if (!perUser.has(sc.userId)) {
      const existing = await prisma.studentCertification.count({
        where: { userId: sc.userId, certificateNumber: { not: null } },
      });
      perUser.set(sc.userId, existing);
    }
    const idx = perUser.get(sc.userId) + 1;
    perUser.set(sc.userId, idx);
    const certificateNumber = `${sc.user.studentId}-${String(idx).padStart(2, "0")}`;
    await prisma.studentCertification.update({
      where: { id: sc.id },
      data: { certificateNumber },
    });
    console.log(`  ${certificateNumber}  ${sc.user.email}`);
  }

  console.log("\nBackfill complete.");
}

main()
  .catch((e) => {
    console.error("Backfill failed:", e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
