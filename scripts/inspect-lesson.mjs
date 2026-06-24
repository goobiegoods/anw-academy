import * as dotenv from "dotenv";
import { readFileSync } from "fs";

dotenv.config({ path: ".env.local" });

const BASE = process.env.NEXT_PUBLIC_SUPABASE_URL + "/rest/v1";
const SK = process.env.SUPABASE_SERVICE_ROLE_KEY;
const H = { apikey: SK, Authorization: `Bearer ${SK}` };

async function get(path) {
  const r = await fetch(`${BASE}${path}`, { headers: H });
  return r.json();
}

const [lesson] = await get("/Lesson?id=eq.8bcd9fc0-7ca5-4928-b5af-6940b176ea10&select=id,title,content,wuValue");
const parsed = JSON.parse(lesson.content);

console.log(`Lesson: ${lesson.title}`);
console.log(`WU: ${lesson.wuValue}`);
console.log(`Cards: ${parsed.cards.length}\n`);

for (const c of parsed.cards) {
  console.log(`=== [${c.type}] ===`);
  if (c.title) console.log(`  title:    ${c.title}`);
  if (c.subtitle) console.log(`  subtitle: ${c.subtitle}`);
  if (c.part) console.log(`  part:     ${c.part}`);
  if (c.items) c.items.forEach((it, i) => console.log(`  item${i+1}:   ${it}`));
  if (c.terms) c.terms.forEach(t => console.log(`  term:     ${t.name} — ${t.definition.slice(0,80)}…`));
  if (c.quote) console.log(`  quote:    ${c.quote.slice(0,120)}…`);
  if (c.source) console.log(`  source:   ${c.source}`);
  if (c.context) console.log(`  context:  ${c.context.slice(0,100)}…`);
  if (c.scenario) console.log(`  scenario: ${c.scenario.slice(0,100)}…`);
  if (c.prompt) console.log(`  prompt:   ${c.prompt}`);
  if (c.questions) console.log(`  inline q: ${c.questions.length}`);
  if (c.quizQuestions) console.log(`  quiz pool:${c.quizQuestions.length}  first: ${c.quizQuestions[0]?.q?.slice(0,60)}…`);
  if (c.body) console.log(`  body:     ${c.body.slice(0,160)}…`);
  console.log();
}
