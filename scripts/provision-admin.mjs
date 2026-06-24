/**
 * Creates orel.shemen@gmail.com as an admin in both Supabase Auth and Prisma.
 * Run: node scripts/provision-admin.mjs
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { createClient } from "@supabase/supabase-js";

const { Pool } = pg;

const ADMIN_EMAIL = "orel.shemen@gmail.com";
const ADMIN_NAME  = "Orel Shemen";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  console.log(`\nProvisioning admin: ${ADMIN_EMAIL}\n`);

  // ── 1. Supabase auth user ──────────────────────────────────────────────
  const { data: { users }, error: listErr } = await supabase.auth.admin.listUsers();
  if (listErr) throw listErr;

  const existing = users.find((u) => u.email === ADMIN_EMAIL);

  if (existing) {
    console.log(`✓ Supabase auth user already exists (id: ${existing.id})`);
  } else {
    const tempPassword = `AdminANW${Date.now()}!`;
    const { data, error } = await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: tempPassword,
      email_confirm: true,
    });
    if (error) throw error;
    console.log(`✓ Supabase auth user created (id: ${data.user.id})`);
    console.log(`  Temporary password: ${tempPassword}`);
    console.log(`  → Visit /login and use "Forgot password" to set a new one, or use this password directly.\n`);
  }

  // ── 2. Prisma DB user ──────────────────────────────────────────────────
  const dbUser = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });

  if (!dbUser) {
    const created = await prisma.user.create({
      data: { email: ADMIN_EMAIL, name: ADMIN_NAME, role: "ADMIN" },
    });
    console.log(`✓ Prisma user created with ADMIN role (id: ${created.id})`);
  } else if (dbUser.role !== "ADMIN") {
    await prisma.user.update({ where: { email: ADMIN_EMAIL }, data: { role: "ADMIN" } });
    console.log(`✓ Prisma user updated to ADMIN role (was: ${dbUser.role})`);
  } else {
    console.log(`✓ Prisma user already exists with ADMIN role (id: ${dbUser.id})`);
  }

  console.log(`\n✅ Done. ${ADMIN_EMAIL} can now log in at /login and access /admin.\n`);
}

main()
  .catch((e) => { console.error("Error:", e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
