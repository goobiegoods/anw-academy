/**
 * Generates botanical hero illustrations for lessons using DALL-E 3,
 * uploads them to Supabase Storage, and saves the URL to lessons.heroImageUrl.
 *
 * Usage:
 *   node scripts/generate-lesson-heroes.mjs [lessonId1 lessonId2 ...]
 *
 * If no IDs are passed, the script uses the LESSON_IDS constant below.
 */

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const BUCKET = "lesson-heroes";

// ── Build prompt from lesson title ────────────────────────────────────────────
// Extracts the subject (before the em-dash) and generates a brand-consistent prompt.
function buildPrompt(lessonTitle) {
  // Take the first clause before " — " as the botanical subject
  const subject = lessonTitle.split(" — ")[0].trim();

  return (
    `Fine-line botanical illustration of ${subject}. ` +
    "Single plant specimen, centered composition, rendered in archival botanical print style. " +
    "Warm parchment background (#fdf6e8), sage green stems and leaves, " +
    "muted gold accents on flowers, cream and ivory tones throughout. " +
    "Thin precise ink lines, no shading fills — line art only. " +
    "No text, no labels, no borders, no background scenery. " +
    "Style: 19th-century botanical encyclopedia plate, Kew Gardens archive quality."
  );
}

async function ensureBucket(supabase) {
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some((b) => b.name === BUCKET);
  if (!exists) {
    const { error } = await supabase.storage.createBucket(BUCKET, { public: true });
    if (error) throw new Error(`Failed to create bucket: ${error.message}`);
    console.log(`✓ Created storage bucket "${BUCKET}"`);
  } else {
    console.log(`✓ Bucket "${BUCKET}" ready`);
  }
}

async function generateAndStore(openai, supabase, lesson) {
  const prompt = buildPrompt(lesson.title);
  console.log(`\n  Prompt: "${prompt.slice(0, 80)}..."`);

  const t0 = Date.now();

  // Generate with gpt-image-1 (returns base64 directly)
  const response = await openai.images.generate({
    model: "gpt-image-1",
    prompt,
    n: 1,
    size: "1024x1024",
    quality: "medium",
  });

  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`  Generated in ${elapsed}s`);

  // gpt-image-1 returns base64 JSON (no expiring URL)
  const b64 = response.data[0].b64_json;
  if (!b64) throw new Error("No b64_json in response");
  const buffer = Buffer.from(b64, "base64");

  // Upload to Supabase Storage
  const path = `${lesson.id}.png`;
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, {
      contentType: "image/png",
      upsert: true,
    });
  if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

  // Get the public URL
  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
  const publicUrl = urlData.publicUrl;
  console.log(`  Uploaded → ${publicUrl}`);

  return { publicUrl, elapsed };
}

async function main() {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  await ensureBucket(supabase);

  // Accept lesson IDs from CLI args, or fall back to the constant list
  const cliIds = process.argv.slice(2);
  let lessons;

  if (cliIds.length > 0) {
    lessons = await prisma.lesson.findMany({
      where: { id: { in: cliIds } },
      select: { id: true, title: true, heroImageUrl: true },
    });
  } else {
    // Default: all lessons that don't have a hero image yet
    lessons = await prisma.lesson.findMany({
      where: { heroImageUrl: null },
      orderBy: { order: "asc" },
      select: { id: true, title: true, heroImageUrl: true },
    });
  }

  console.log(`\nGenerating heroes for ${lessons.length} lessons:`);
  lessons.forEach((l, i) => console.log(`  ${i + 1}. ${l.title}`));

  const results = [];
  const COST_PER_IMAGE = 0.042; // gpt-image-1 medium 1024×1024

  for (const lesson of lessons) {
    console.log(`\n[${results.length + 1}/${lessons.length}] "${lesson.title}"`);

    if (lesson.heroImageUrl) {
      console.log(`  Already has image, skipping`);
      results.push({ lesson, skipped: true });
      continue;
    }

    try {
      const { publicUrl, elapsed } = await generateAndStore(openai, supabase, lesson);

      await prisma.lesson.update({
        where: { id: lesson.id },
        data: { heroImageUrl: publicUrl },
      });

      results.push({ lesson, publicUrl, elapsed, error: null });
      console.log(`  ✓ Saved to DB`);
    } catch (err) {
      console.error(`  ✗ Error: ${err.message}`);
      results.push({ lesson, error: err.message });
    }
  }

  // Summary
  const succeeded = results.filter((r) => r.publicUrl);
  const failed = results.filter((r) => r.error);
  const skipped = results.filter((r) => r.skipped);
  const totalCost = (succeeded.length * COST_PER_IMAGE).toFixed(2);
  const totalTime = succeeded.reduce((s, r) => s + parseFloat(r.elapsed || 0), 0).toFixed(1);

  console.log(`\n${"─".repeat(50)}`);
  console.log(`Done: ${succeeded.length} generated, ${skipped.length} skipped, ${failed.length} failed`);
  console.log(`Cost: $${totalCost} (${succeeded.length} × $${COST_PER_IMAGE})`);
  console.log(`Total generation time: ${totalTime}s`);
  if (succeeded.length > 0) {
    console.log(`\nGenerated URLs:`);
    succeeded.forEach((r) => console.log(`  ${r.lesson.title.slice(0, 45).padEnd(45)} → ${r.publicUrl}`));
  }

  await prisma.$disconnect();
  pool.end();
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
