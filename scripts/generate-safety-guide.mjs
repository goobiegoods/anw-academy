/**
 * Generates the "ANW Herbal Safety Reference Guide" PDF and uploads it
 * to Supabase Storage (bucket: resources).
 *
 * Usage: node scripts/generate-safety-guide.mjs
 */

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import PDFDocument from "pdfkit";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import os from "os";
import path from "path";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET       = "resources";
const FILE_NAME    = "anw-herbal-safety-guide.pdf";

// ── Brand palette (pdfkit uses CSS color strings) ─────────────────────────────
const C = {
  green:       "#1C3327",
  gold:        "#c9923a",
  goldLight:   "#D4A94A",
  text:        "#1a1a1a",
  muted:       "#6b6459",
  mutedLight:  "#8a7a6a",
  parchment:   "#FAF7F0",
  rowAlt:      "#F3EDE2",
  border:      "#DDD5C5",
  white:       "#FFFFFF",
  coral:       "#c0392b",
  amber:       "#d4882a",
  blue:        "#2c6e8a",
  purple:      "#5b4fcf",
};

const ML = 50; // left margin
const MR = 50; // right margin

// ── Font helpers ──────────────────────────────────────────────────────────────
async function tryDownloadFont(url, tmpName) {
  const dest = path.join(os.tmpdir(), tmpName);
  if (fs.existsSync(dest)) return dest;
  try {
    const res = await fetch(url, { redirect: "follow" });
    if (!res.ok) return null;
    fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
    return dest;
  } catch {
    return null;
  }
}

// ── Mini page header for continuation pages ───────────────────────────────────
function drawMiniHeader(doc) {
  const W = doc.page.width;
  doc.rect(0, 0, W, 36).fill(C.green);
  doc.rect(0, 36, W, 1.5).fill(C.gold);
  doc.font("Helvetica").fontSize(7).fillColor(C.goldLight)
    .text("ANW ACADEMY", ML, 9, { characterSpacing: 1.5, lineBreak: false });
  doc.font(doc._fontFamilies?.["Playfair-Bold"] ? "Playfair-Bold" : "Times-Bold")
    .fontSize(11).fillColor(C.white)
    .text("Herbal Safety Reference Guide", ML, 19, { lineBreak: false });
  doc.y = 52;
}

// ── Section header with gold left bar ────────────────────────────────────────
function sectionHeader(doc, title, boldFont) {
  if (doc.y > doc.page.height - 120) {
    doc.addPage();
    drawMiniHeader(doc);
  }
  const y = doc.y;
  doc.rect(ML, y, 3, 20).fill(C.gold);
  doc.font(boldFont).fontSize(13).fillColor(C.text)
    .text(title, ML + 10, y + 3, { lineBreak: false });
  doc.y = y + 28;
}

// ── Table drawing ─────────────────────────────────────────────────────────────
function drawTable(doc, headers, rows, colRatios, boldFont) {
  const totalW = doc.page.width - ML - MR;
  const colW   = colRatios.map(r => r * totalW);
  const PAD    = 5;
  const HEADER_H = 22;
  const MIN_ROW = 18;

  const renderHeaderRow = (y) => {
    doc.rect(ML, y, totalW, HEADER_H).fill(C.green);
    let x = ML;
    headers.forEach((h, i) => {
      doc.font("Helvetica-Bold").fontSize(8).fillColor(C.white)
        .text(h, x + PAD, y + 7, { width: colW[i] - PAD * 2, lineBreak: false });
      x += colW[i];
    });
    return HEADER_H;
  };

  // Draw initial header
  let y = doc.y;
  y += renderHeaderRow(y);

  rows.forEach((row, ri) => {
    // Measure row height
    const cellHeights = row.map((cell, ci) =>
      doc.font("Helvetica").fontSize(8.5)
        .heightOfString(cell, { width: colW[ci] - PAD * 2 }) + PAD * 2
    );
    const rowH = Math.max(...cellHeights, MIN_ROW);

    // Page break if needed
    if (y + rowH > doc.page.height - MR - 20) {
      doc.addPage();
      drawMiniHeader(doc);
      y = doc.y;
      y += renderHeaderRow(y);
    }

    // Alternating row background
    doc.rect(ML, y, totalW, rowH).fill(ri % 2 === 0 ? C.white : C.rowAlt);
    // Row border
    doc.rect(ML, y, totalW, rowH).stroke(C.border).lineWidth(0.5);

    // Cell content
    let x = ML;
    row.forEach((cell, ci) => {
      // Vertical cell divider
      if (ci > 0) doc.moveTo(x, y).lineTo(x, y + rowH).stroke(C.border).lineWidth(0.5);
      doc.font("Helvetica").fontSize(8.5).fillColor(C.text)
        .text(cell, x + PAD, y + PAD, {
          width: colW[ci] - PAD * 2,
          height: rowH - PAD,
        });
      x += colW[ci];
    });

    y += rowH;
  });

  doc.y = y + 14;
}

// ── Bulleted list helper ──────────────────────────────────────────────────────
function bulletList(doc, items, indent = 14) {
  const totalW = doc.page.width - ML - MR;
  items.forEach(item => {
    doc.font("Helvetica").fontSize(9.5).fillColor(C.text)
      .text(`• ${item}`, ML + indent, doc.y, { width: totalW - indent });
    doc.y += 3;
  });
}

// ── PDF builder ───────────────────────────────────────────────────────────────
async function buildPDF(playfairReg, playfairBold) {
  const hasPlayfair = !!(playfairReg && playfairBold);
  const SERIF_REG  = hasPlayfair ? "Playfair"      : "Times-Roman";
  const SERIF_BOLD = hasPlayfair ? "Playfair-Bold" : "Times-Bold";

  const doc = new PDFDocument({
    size: "LETTER",
    margins: { top: ML, bottom: MR, left: ML, right: MR },
    autoFirstPage: true,
    info: {
      Title:   "ANW Herbal Safety Reference Guide",
      Author:  "Academy of Natural Wellness",
      Subject: "Herb–drug interactions, contraindications, and safety protocols",
    },
  });

  if (hasPlayfair) {
    doc.registerFont("Playfair",      playfairReg);
    doc.registerFont("Playfair-Bold", playfairBold);
  }

  const chunks = [];
  doc.on("data", c => chunks.push(c));

  const W        = doc.page.width;  // 612
  const contentW = W - ML - MR;     // 512

  // ════════════════════════════════════════════════════════════════════════════
  // PAGE 1
  // ════════════════════════════════════════════════════════════════════════════

  // Hero header band
  doc.rect(0, 0, W, 90).fill(C.green);
  doc.rect(0, 90, W, 2.5).fill(C.gold);

  doc.font("Helvetica").fontSize(8).fillColor(C.goldLight)
    .text("ANW ACADEMY", ML, 22, { characterSpacing: 2, lineBreak: false });
  doc.font(SERIF_BOLD).fontSize(24).fillColor(C.white)
    .text("Herbal Safety", ML, 40, { lineBreak: false });
  doc.font(SERIF_REG).fontSize(14).fillColor(C.goldLight)
    .text("Reference Guide", ML + 167, 46, { lineBreak: false });

  doc.y = 108;

  // ── 1. Core Safety Principle ────────────────────────────────────────────────
  sectionHeader(doc, "1. Core Safety Principle", SERIF_BOLD);

  doc.font(SERIF_BOLD).fontSize(11).fillColor(C.text)
    .text("Primum Non Nocere — First, Do No Harm");
  doc.y += 6;

  doc.font("Helvetica").fontSize(9.5).fillColor(C.muted)
    .text(
      "The foundational ethical obligation of every natural wellness practitioner. Before recommending any herb, systematically assess:",
      { width: contentW }
    );
  doc.y += 8;

  bulletList(doc, [
    "Known allergies, sensitivities, and prior adverse reactions",
    "All current medications: prescription, OTC, other supplements, and recreational substances",
    "Organ function: hepatic clearance, renal clearance, cardiovascular status",
    "Life-stage: pregnancy, breastfeeding, pediatric, and geriatric populations",
    "Immune status: immunocompromised individuals require elevated caution with immune-modulating herbs",
  ]);

  doc.y += 14;

  // ── 2. Herb–Drug Interactions ───────────────────────────────────────────────
  sectionHeader(doc, "2. Herb–Drug Interaction Table", SERIF_BOLD);

  drawTable(
    doc,
    ["Herb", "Interacting Drug(s)", "Mechanism / Clinical Effect"],
    [
      [
        "St. John's Wort\n(Hypericum perforatum)",
        "SSRIs, SNRIs, Warfarin, Oral contraceptives, Antiretrovirals, Cyclosporine, Digoxin",
        "CYP3A4 and P-glycoprotein inducer — reduces plasma levels of co-administered drugs. Serotonin syndrome risk with SSRIs. Reduces OCP efficacy (contraception failure reported).",
      ],
      [
        "Ginkgo biloba",
        "Warfarin, Aspirin, NSAIDs, Clopidogrel, Anticoagulants",
        "Inhibits platelet-activating factor (PAF). Additive anticoagulant/antiplatelet effect. Increases bleeding risk. Discontinue ≥2 weeks before surgery.",
      ],
      [
        "Garlic\n(Allium sativum)",
        "Warfarin, Saquinavir, Antiplatelet agents",
        "Antiplatelet activity via allicin and ajoene. Reduces saquinavir bioavailability by up to 50%. Additive bleeding risk with anticoagulants.",
      ],
      [
        "Valerian\n(Valeriana officinalis)",
        "CNS depressants, Benzodiazepines, Barbiturates, Alcohol, Anesthesia",
        "Enhances GABAergic transmission → additive sedation. May potentiate anesthesia. Discontinue ≥2 weeks before surgery. Mild CYP3A4 inhibitor.",
      ],
      [
        "Licorice Root\n(Glycyrrhiza glabra)",
        "Antihypertensives, Corticosteroids, Diuretics (K+-sparing and wasting), Digoxin",
        "Glycyrrhizin inhibits 11β-HSD2 → pseudohyperaldosteronism → Na⁺ retention, hypokalemia, hypertension. Potassium loss amplifies digoxin toxicity. Additive effect with corticosteroids.",
      ],
    ],
    [0.23, 0.33, 0.44],
    SERIF_BOLD
  );

  // ════════════════════════════════════════════════════════════════════════════
  // PAGE 2
  // ════════════════════════════════════════════════════════════════════════════
  doc.addPage();
  drawMiniHeader(doc);

  // ── 3. Contraindications by Population ─────────────────────────────────────
  sectionHeader(doc, "3. Contraindications by Population", SERIF_BOLD);

  const populations = [
    {
      label:  "Pregnancy",
      color:  C.coral,
      intro:  "Avoid during pregnancy — uterotonic, abortifacient, teratogenic, or hepatotoxic effects:",
      items:  [
        "Blue cohosh (Caulophyllum thalictroides) — uterotonic; may stimulate premature contractions",
        "Pennyroyal (Mentha pulegium) — pulegone metabolite is hepatotoxic; historically used as abortifacient",
        "Tansy (Tanacetum vulgare) — thujone content; emmenagogue and neurotoxic",
        "Dong quai (Angelica sinensis) — estrogenic and uterotonic; contraindicated in first trimester",
        "Wormwood (Artemisia absinthium) — thujone; emmenagogue",
        "Barberry / Oregon Grape (Berberis spp.) — berberine is uterine stimulant; potentially mutagenic",
        "Feverfew (Tanacetum parthenium) — antiplatelet; uterine stimulant potential",
      ],
    },
    {
      label:  "Infants & Children",
      color:  C.amber,
      intro:  "Always consult pediatric dosing references. Specific concerns:",
      items:  [
        "Peppermint oil (undiluted) — menthol can cause respiratory depression in infants under 2 years",
        "Echinacea — avoid in autoimmune conditions; insufficient data in children under 1 year",
        "Valerian — insufficient safety data for children under 3 years",
        "Comfrey (topical) — pyrrolizidine alkaloid absorption through broken skin",
      ],
    },
    {
      label:  "Elderly",
      color:  C.blue,
      intro:  "Reduced hepatic and renal clearance increases drug/herb accumulation:",
      items:  [
        "Herbs with anticoagulant effects (garlic, ginkgo, ginger) — fall and bleeding risk additive",
        "Sedating herbs (valerian, kava, passionflower) — elevated fall risk; higher CNS sensitivity",
        "Licorice root — blood pressure and electrolyte disruption especially with diuretics or digoxin",
        "Stimulant laxatives (senna, cascara) — electrolyte disturbance with chronic use; arrhythmia risk",
      ],
    },
    {
      label:  "Immunocompromised",
      color:  C.purple,
      intro:  "Patients on immunosuppressants, post-transplant, or with autoimmune disease:",
      items:  [
        "Echinacea — contraindicated in autoimmune disease, organ transplant, and with immunosuppressant therapy",
        "Astragalus — immune stimulant; may antagonize immunosuppressant medications",
        "Cat's Claw (Uncaria tomentosa) — immune modulator; contraindicated with immunosuppressants",
      ],
    },
  ];

  populations.forEach(pop => {
    if (doc.y > doc.page.height - MR - 90) {
      doc.addPage();
      drawMiniHeader(doc);
    }

    doc.font("Helvetica-Bold").fontSize(9.5).fillColor(pop.color)
      .text(pop.label.toUpperCase(), ML, doc.y, { characterSpacing: 0.5 });
    doc.y += 4;

    doc.font("Helvetica-Oblique").fontSize(9).fillColor(C.muted)
      .text(pop.intro, ML, doc.y, { width: contentW });
    doc.y += 6;

    bulletList(doc, pop.items, 14);
    doc.y += 10;
  });

  // ════════════════════════════════════════════════════════════════════════════
  // PAGE 3
  // ════════════════════════════════════════════════════════════════════════════
  doc.addPage();
  drawMiniHeader(doc);

  // ── 4. Toxic Compounds ──────────────────────────────────────────────────────
  sectionHeader(doc, "4. Known Toxic Compounds", SERIF_BOLD);

  doc.font("Helvetica").fontSize(9.5).fillColor(C.muted)
    .text(
      "The following compound classes carry serious, potentially irreversible risks. No safe therapeutic window exists for general wellness use. Practitioners must recognize these plants and avoid recommending them.",
      { width: contentW }
    );
  doc.y += 12;

  const toxics = [
    {
      name:    "Pyrrolizidine Alkaloids (PAs)",
      plants:  "Comfrey (Symphytum officinale), Borage (Borago officinalis), Coltsfoot (Tussilago farfara), Gravel Root (Eupatorium purpureum)",
      detail:  "Cause hepatic veno-occlusive disease (VOD / sinusoidal obstruction syndrome) — cumulative, irreversible hepatotoxicity with no established safe threshold. Carcinogenic in animal models. Internal use of PA-containing herbs is contraindicated. Topical comfrey on intact skin may be tolerated short-term; never apply to broken skin.",
    },
    {
      name:    "Aristolochic Acid",
      plants:  "Birthwort (Aristolochia spp.); TCM products mislabeled 'Mu Tong' or 'Fang Ji' if adulterated with Aristolochia species",
      detail:  "IARC Group 1 carcinogen and nephrotoxin. Causes aristolochic acid nephropathy (AAN): rapid-onset renal fibrosis progressing to end-stage kidney failure. Associated with urothelial carcinoma. Banned in many jurisdictions. Practitioners must be aware of supply-chain adulteration risk in herbal formulas.",
    },
    {
      name:    "Aconitine (Aconite Alkaloids)",
      plants:  "Monkshood (Aconitum spp.); used in TCM as 'Fu Zi' / 'Chuan Wu' — traditionally processed to reduce toxicity",
      detail:  "Activates voltage-gated sodium channels → cardiac arrhythmias, ventricular fibrillation, and respiratory paralysis. Lethal dose in adults: as little as 1–2 mg aconitine. Classical TCM processing (prolonged decoction / pao zhi) hydrolyzes aconitine to less-toxic benzoyl-aconine — but improperly processed aconite remains acutely dangerous. Never recommend unprocessed aconite.",
    },
  ];

  toxics.forEach((t, i) => {
    if (doc.y > doc.page.height - MR - 80) {
      doc.addPage();
      drawMiniHeader(doc);
    }

    doc.rect(ML, doc.y, contentW, 0.75).fill(C.green);
    doc.y += 8;

    doc.font("Helvetica-Bold").fontSize(10).fillColor(C.text)
      .text(t.name, ML, doc.y);
    doc.y += 4;

    doc.font("Helvetica-Oblique").fontSize(8.5).fillColor(C.muted)
      .text("Plants: " + t.plants, ML + 14, doc.y, { width: contentW - 14 });
    doc.y += 5;

    doc.font("Helvetica").fontSize(9).fillColor(C.text)
      .text(t.detail, ML + 14, doc.y, { width: contentW - 14 });
    doc.y += 14;
  });

  doc.y += 6;

  // ── 5. When to Refer ────────────────────────────────────────────────────────
  if (doc.y > doc.page.height - MR - 180) {
    doc.addPage();
    drawMiniHeader(doc);
  }

  sectionHeader(doc, "5. When to Refer to a Medical Provider", SERIF_BOLD);

  drawTable(
    doc,
    ["Red Flag / Presentation", "Urgency", "Recommended Action"],
    [
      ["Unexplained weight loss (>10% body weight in 6 months)",       "Urgent",    "Refer to primary care / oncology screening"],
      ["Chest pain, shortness of breath, or palpitations",             "Emergency", "Call emergency services (911) immediately"],
      ["Sudden severe headache, vision loss, facial droop, slurred speech", "Emergency", "Stroke protocol — call 911 immediately"],
      ["Blood in stool, urine, or vomit",                              "Urgent",    "Refer for GI / urological evaluation"],
      ["Jaundice — yellowing of skin or sclera",                       "Urgent",    "Liver function evaluation; rule out hepatotoxicity"],
      ["Persistent fever >38.5°C (101.3°F) for 3+ days",              "Urgent",    "Refer to primary care; rule out serious infection"],
      ["Suicidal ideation or acute psychiatric crisis",                 "Emergency", "Crisis services — do not manage alone"],
      ["High-risk drug-herb interaction (warfarin, chemo, transplant)", "Urgent",    "Consult prescribing physician before herbal protocol"],
    ],
    [0.47, 0.18, 0.35],
    SERIF_BOLD
  );

  // ── Footer on final page ───────────────────────────────────────────────────
  doc.y += 6;
  doc.rect(ML, doc.y, contentW, 0.75).fill(C.gold);
  doc.y += 8;
  doc.font("Helvetica").fontSize(7.5).fillColor(C.muted)
    .text(
      "Academy of Natural Wellness  ·  This guide is for educational purposes only and does not constitute medical advice.  ·  © 2026 ANW",
      ML, doc.y, { width: contentW, align: "center" }
    );

  return new Promise((resolve, reject) => {
    doc.on("end",   () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
    doc.end();
  });
}

// ── Supabase upload ───────────────────────────────────────────────────────────
async function uploadPDF(buffer) {
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

  const { data: buckets } = await supabase.storage.listBuckets();
  if (!buckets?.some(b => b.name === BUCKET)) {
    const { error } = await supabase.storage.createBucket(BUCKET, { public: true });
    if (error) throw new Error(`Bucket creation failed: ${error.message}`);
    console.log(`  ✓ Created bucket "${BUCKET}"`);
  } else {
    console.log(`  ✓ Bucket "${BUCKET}" ready`);
  }

  const { error } = await supabase.storage.from(BUCKET).upload(FILE_NAME, buffer, {
    contentType: "application/pdf",
    upsert: true,
  });
  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(FILE_NAME);
  return publicUrl;
}

// ── Entry point ───────────────────────────────────────────────────────────────
async function main() {
  console.log("\nANW Herbal Safety Reference Guide — PDF Generator\n");

  // Try to get Playfair Display from Google Fonts GitHub mirror
  // fontsource CDN provides WOFF2; fontkit 2.x (used by pdfkit 0.19) can parse it
  const FONTSOURCE = "https://cdn.jsdelivr.net/npm/@fontsource/playfair-display@5/files";
  console.log("Fetching Playfair Display fonts...");
  const [playfairReg, playfairBold] = await Promise.all([
    tryDownloadFont(`${FONTSOURCE}/playfair-display-latin-400-normal.woff2`, "PlayfairDisplay-Regular.woff2"),
    tryDownloadFont(`${FONTSOURCE}/playfair-display-latin-700-normal.woff2`, "PlayfairDisplay-Bold.woff2"),
  ]);

  if (playfairReg && playfairBold) {
    console.log("  ✓ Playfair Display loaded");
  } else {
    console.log("  ⚠ Playfair Display unavailable — using Times-Roman");
  }

  console.log("Building PDF...");
  const buffer = await buildPDF(playfairReg, playfairBold);
  console.log(`  ✓ Generated (${(buffer.length / 1024).toFixed(1)} KB)`);

  console.log("Uploading to Supabase Storage...");
  const url = await uploadPDF(buffer);
  console.log(`  ✓ Uploaded`);

  console.log(`\n✅ PDF public URL:\n   ${url}\n`);
}

main().catch(err => {
  console.error("\n❌ FAILED:", err.message);
  process.exit(1);
});
