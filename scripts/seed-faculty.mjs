/**
 * Seeds the founding faculty. Additive + idempotent (upsert by slug) —
 * never touches existing curriculum content.
 * Also ensures the "faculty-photos" storage bucket exists.
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { createClient } from "@supabase/supabase-js";

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const FOUNDER = {
  name: "Orel Fitch",
  slug: "orel-fitch",
  title: "Founder & Academic Director",
  bio: "Orel Fitch founded the Academy of Natural Wellness with a vision to make traditional healing wisdom accessible, credentialed, and respected. With over a decade of personal study in homeopathy, Traditional Chinese Medicine, herbalism, and functional wellness, he built ANW as the institution he wished had existed when he began his own journey. His curriculum draws from primary sources — Hahnemann's Organon, the Huang Di Nei Jing, Culpeper's Complete Herbal — and is designed to produce practitioners, not just students.",
  credentials: ["Founder", "Natural Wellness Practitioner"],
  specializations: [
    "Homeopathy",
    "Traditional Chinese Medicine",
    "Herbalism",
    "Functional Wellness",
  ],
  schools: [
    "School of Homeopathic Studies",
    "School of Traditional Chinese Medicine",
    "School of Herbal Medicine",
    "School of Functional Wellness",
  ],
  isFounding: true,
  isActive: true,
};

async function main() {
  const faculty = await prisma.faculty.upsert({
    where: { slug: FOUNDER.slug },
    update: {},
    create: FOUNDER,
  });
  console.log(`Faculty seeded: ${faculty.name} (${faculty.slug})`);

  // Ensure the photo bucket exists (public read)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  const { data: buckets } = await supabase.storage.listBuckets();
  if (!buckets?.some((b) => b.name === "faculty-photos")) {
    const { error } = await supabase.storage.createBucket("faculty-photos", { public: true });
    if (error) console.warn("Could not create faculty-photos bucket:", error.message);
    else console.log("Created storage bucket: faculty-photos (public)");
  } else {
    console.log("Storage bucket faculty-photos already exists.");
  }
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
