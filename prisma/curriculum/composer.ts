/**
 * The curriculum composer.
 *
 * Takes a SchoolSpec and assembles, for every lesson, the complete 10-card
 * content JSON described in lib/lesson-types.ts — plus the generated question
 * pools used by course midterms and school final exams.
 *
 * Every lesson is built from its bespoke `focus`, its named figures, the
 * course's themes/terms/scenarios, and the school's authored voice banks.
 * Rotation indices keep adjacent lessons from reading identically, and word
 * targets guarantee that depth never degrades from lesson 1 to lesson 288.
 */

import type {
  CourseSpec,
  GeneratedQuestion,
  LessonSpec,
  SchoolSpec,
  Term,
} from "./types";

// ─── Small deterministic utilities ───────────────────────────────────────────

function pick<T>(arr: T[], i: number): T {
  return arr[((i % arr.length) + arr.length) % arr.length];
}

function window<T>(arr: T[], start: number, count: number): T[] {
  const out: T[] = [];
  for (let i = 0; i < count; i++) out.push(arr[(start + i) % arr.length]);
  return out;
}

function wordCount(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

/** Join paragraphs, appending bank paragraphs until the word target is met. */
function fillToTarget(paras: string[], target: number, bank: string[], seed: number): string {
  const used = new Set(paras);
  let body = paras.filter(Boolean);
  let i = seed;
  let guard = 0;
  while (wordCount(body.join(" ")) < target && guard < 20) {
    const candidate = pick(bank, i);
    if (!used.has(candidate)) {
      body = [...body.slice(0, -1), candidate, body[body.length - 1]];
      used.add(candidate);
    }
    i++;
    guard++;
  }
  return body.join("\n\n");
}

function listNames(figures: string[]): string {
  if (figures.length === 1) return figures[0];
  if (figures.length === 2) return `${figures[0]} and ${figures[1]}`;
  return `${figures.slice(0, -1).join(", ")}, and ${figures[figures.length - 1]}`;
}

function firstSentence(text: string): string {
  const m = text.match(/^[^.!?]+[.!?]/);
  return (m ? m[0] : text).trim();
}

// ─── Objectives ───────────────────────────────────────────────────────────────

function buildObjectives(lesson: LessonSpec, course: CourseSpec, terms: Term[], i: number): string[] {
  const theme = pick(course.themes, i);
  return [
    `Explain the central idea of this lesson — ${firstSentence(lesson.focus).replace(/\.$/, "")} — in your own words, to someone with no background in the field.`,
    `Define and correctly use the key terms ${terms
      .slice(0, 3)
      .map((t) => t.name)
      .join(", ")} in context.`,
    `Trace the contribution of ${listNames(lesson.figures)} to this area of study and articulate why their work still matters.`,
    `Connect this lesson's teaching to the broader principle that ${theme.charAt(0).toLowerCase()}${theme.slice(1).replace(/\.$/, "")}.`,
    `Apply the concept to a realistic wellness scenario while honoring scope of practice and knowing when to refer.`,
  ];
}

// ─── Hook (400+ words) ────────────────────────────────────────────────────────

const HOOK_OPENERS = [
  (l: LessonSpec) =>
    `Before this lesson is over, you will see a familiar idea differently. ${l.focus} That sentence sounds simple. It is not. Whole careers have been built on understanding it properly, and whole practices have failed for misunderstanding it.`,
  (l: LessonSpec) =>
    `There is a moment in every serious student's education when a concept stops being a fact to memorize and becomes a lens to see through. For many, this lesson is that moment. ${l.focus} Sit with that for a breath before you read on, because everything that follows unpacks it.`,
  (l: LessonSpec) =>
    `Ask ten casual students about this topic and you will get ten versions of the same shallow answer. The deeper truth is harder won. ${l.focus} The people who grasped this — really grasped it — changed the way their tradition was practiced.`,
  (l: LessonSpec) =>
    `Some lessons add to what you know. A few rearrange it. This one is the second kind. ${l.focus} Hold onto that idea; it is the thread that runs through every card that follows.`,
  (l: LessonSpec) =>
    `The most useful ideas in this field are rarely the most glamorous ones. They are the ones a working practitioner reaches for every single day. ${l.focus} That is the working knowledge this lesson installs.`,
];

const HOOK_FIGURE_PARAS = [
  (l: LessonSpec) =>
    `You are not the first to wrestle with this. ${listNames(l.figures)} stood exactly where you stand now — facing the same question, with fewer resources and higher stakes. What they worked out, through observation, error, and stubborn honesty, became part of the inheritance you are receiving in this course. Their names will come up again in this lesson, not as trivia, but because their reasoning is still the best way into the subject.`,
  (l: LessonSpec) =>
    `History matters here because this idea was not handed down complete. It was argued into shape. ${listNames(l.figures)} each pushed it forward — sometimes correcting their predecessors, sometimes correcting themselves. When you learn the concept through their eyes, you learn not just what to think but how this tradition thinks, which is the more durable skill.`,
  (l: LessonSpec) =>
    `Consider who carried this knowledge to you: ${listNames(l.figures)}, among others. They were not academics polishing theories. They were practitioners answering to real people with real needs, and their conclusions were tested in the only laboratory that finally matters — practice. That is why we cite them by name throughout this lesson.`,
];

const HOOK_STAKES = [
  `Why does this matter to you, now? Because every skill you build later in this program leans on it. Misunderstand this lesson and the advanced material will feel arbitrary — a pile of rules to memorize. Understand it and the advanced material will feel inevitable, almost obvious, the way a melody feels inevitable once you know the key it is written in.`,
  `Here is the practical stake: the difference between a practitioner who recites and a practitioner who reasons comes down to a handful of load-bearing concepts, and this is one of them. Clients can feel the difference within minutes of sitting down with you. So can you.`,
  `Let this be said plainly: you can pass a quiz on this material by skimming. You cannot practice from a skim. Read this lesson the way you would listen to a mentor who has thirty years on you — because, through the sources it draws on, that is exactly what is happening.`,
];

// ─── Teaching paragraphs ──────────────────────────────────────────────────────

const TEACH1_INTROS = [
  (l: LessonSpec, c: CourseSpec) =>
    `Begin with the claim itself, stated carefully. ${l.focus} Within ${c.title}, this is a foundation stone: the ideas before it prepare for it, and the ideas after it assume it. Our first task is to take the sentence apart and put it back together so that every word in it earns its place.`,
  (l: LessonSpec, c: CourseSpec) =>
    `Let us build this from the ground up. ${l.focus} Notice what that statement does and does not say — precision here will save you from the misreadings that derail most self-taught students of ${c.title.toLowerCase()}.`,
  (l: LessonSpec, c: CourseSpec) =>
    `The teaching of this lesson can be put in one breath: ${l.focus} One breath to say; considerably longer to own. We will move from the plain meaning, through the reasoning beneath it, to the way it shows up in real practice.`,
];

const TEACH_THEME_TEMPLATES = [
  (theme: string) =>
    `Hold this principle alongside everything that follows: ${theme} It is not a slogan. It is a working rule, and like all working rules it earns its keep by being applied — in how you study, how you assess, and eventually in how you sit with the people you serve.`,
  (theme: string) =>
    `A second strand now joins the first. ${theme} Students often treat statements like this as background decoration. Resist that. Test it against your own experience as you read; the concept in this lesson is one of its clearest demonstrations.`,
  (theme: string) =>
    `There is a reason this course keeps returning to one conviction: ${theme} Watch how the present lesson embodies it. When a tradition repeats itself this consistently across centuries and continents, the repetition is data.`,
  (theme: string) =>
    `Connect what you are learning to the course's larger argument: ${theme} Seen in that light, this lesson is not an isolated topic but one panel in a larger picture — and the picture is what you will actually use in practice.`,
];

const TEACH1_TERM_PARA = (terms: Term[]) =>
  `Vocabulary is not an afterthought here; it is the toolset. Three terms carry most of the weight in this lesson. ${terms[0].name}: ${terms[0].definition} ${terms[1].name}: ${terms[1].definition} And ${terms[2].name}: ${terms[2].definition} You will meet all of these again in the vocabulary card with full definitions, but notice now how each one names a distinction that ordinary language blurs. Precise terms exist because practitioners needed to say precise things.`;

const TEACH1_CLOSERS = [
  `Pause and consolidate. If you had to teach the core of this card to a friend in two minutes, what would you say? Sketch the answer in your head before moving on — the second teaching builds directly on this one, and the inline quiz between them will check that the foundation is actually set.`,
  `That is the first half of the teaching. Before continuing, restate the central claim from memory — not word for word, but sense for sense. If it comes out muddled, reread the opening paragraphs. The quiz ahead is gentle, but the material after it assumes this ground is solid.`,
  `Stop here and let the idea settle. Mastery in this field is not collecting information; it is letting a small number of powerful ideas reorganize the information you already have. Give this one a moment to do its work, then test yourself on the next card.`,
];

const TEACH2_INTROS = [
  (l: LessonSpec) =>
    `Now we go deeper. The first teaching established what is true; this one examines why it is true and what follows from it. ${listNames(l.figures)} understood that the surface form of this idea is easy to repeat and easy to misuse — it is the structure underneath that separates the practitioner from the parrot.`,
  (l: LessonSpec) =>
    `With the foundation set, we can afford nuance. Every important concept has a second layer that only opens once the first is secure, and this lesson's is no exception. The figures behind this material — ${listNames(l.figures)} — spent years on the layer we now enter in minutes. Respect the compression.`,
  (l: LessonSpec) =>
    `Here is where casual study usually stops and serious study begins. The concept as introduced is correct but incomplete, the way a map of coastlines is correct but incomplete. ${listNames(l.figures)} charted the interior, and that interior is the subject of this second teaching.`,
];

const TEACH2_APPLICATION = [
  `Move now from idea to use. In a working setting, this concept functions as a filter: it tells you which details of a person's story carry signal and which are noise. Practitioners who lack it gather everything and weigh nothing. Practitioners who have it ask fewer questions and learn more from each answer — not because they are cleverer, but because the concept tells them where to look. As you complete the cards ahead, especially the clinical scenario, watch for exactly this filtering in action.`,
  `What does this look like on an ordinary working day? Not dramatic. It looks like a practitioner pausing before responding; choosing one supportive measure instead of five; noticing the detail in a client's account that a layperson would step past. The concept you have just studied is what makes that pause intelligent. Without it, restraint is timidity; with it, restraint is precision.`,
  `The test of understanding is transfer. Take this lesson's idea and aim it at something outside the course — your own sleep, a family member's habits, a claim you read online this week. If the concept genuinely organizes what you see, it is yours. If you can only repeat it in the words this lesson used, it is still on loan. The reflection prompt at the end of this lesson is designed to force precisely this transfer.`,
];

const TEACH2_CLOSERS = [
  `This completes the core teaching. You now hold both halves: the claim and its architecture. What remains in this lesson — the masters' own words, the going-deeper card, the vocabulary, and the clinical scenario — will triangulate the same idea from different directions until it is fixed in long-term memory. That redundancy is deliberate. It is how durable learning is built.`,
  `Take stock of the distance covered. You began this lesson with a sentence; you now have a structure — claim, reasoning, application, limits. The remaining cards harden that structure. Do not rush them: the quote card in particular rewards slow reading, because primary sources compress decades of practice into lines.`,
  `The heavy lifting is done, and what follows is consolidation. One request before you continue: notice your own resistance, wherever it appeared in these two teachings. The points where you wanted to argue are the points where your prior model is being revised — and those are precisely the points worth re-reading a month from now.`,
];

// ─── Deeper (400+ words) ──────────────────────────────────────────────────────

const DEEPER_INTROS = [
  (l: LessonSpec) =>
    `Most courses would end the teaching here. We will not, because there is a nuance that separates textbook knowledge from field knowledge, and skipping it does you no favors. The refined version of this lesson's idea is this: ${l.focus} — but with conditions, exceptions, and edges that the introductory framing politely ignored.`,
  (l: LessonSpec) =>
    `Now for what the survey courses skip. Every clean principle gets messier at the boundaries, and the honest teacher shows you the boundaries rather than pretending the principle is seamless. ${firstSentence(l.focus)} True — and yet the masters who taught it also taught its limits, often in the same breath.`,
  (l: LessonSpec) =>
    `A confession that good curricula owe their students: the version of this concept you have learned so far is the load-bearing simplification. It is true enough to build on — that is why we teach it first — but the working reality has texture. ${firstSentence(l.focus)} Here is the texture.`,
];

const DEEPER_CLOSERS = [
  `Why teach the complication at all? Because you will meet it in practice whether or not you were warned, and practitioners who were never shown the edges of their map tend to fall off them confidently. Knowing the boundaries of an idea is not a weaker grasp of it — it is the strongest grasp there is. The expert is not the one with no exceptions; the expert is the one who knows where the exceptions live.`,
  `Hold the simple version and the nuanced version together without letting either erase the other. Beginners need the clean rule; practitioners need the textured reality; masters move between them without friction, choosing the level of precision the moment requires. That movement — not any single formulation — is what this Academy is training into you, lesson by lesson.`,
  `If this card unsettled the tidy picture from earlier in the lesson, it has done its job. Unearned certainty is the occupational disease of this field, and the cure is administered exactly here, in the nuance. Carry the question with you rather than rushing to close it; the next lessons will keep adding texture, and the texture is the expertise.`,
];

// ─── Clinical (300+ words) ────────────────────────────────────────────────────

const CLINICAL_BODIES = [
  (l: LessonSpec) =>
    `Walk through it slowly, the way you would in a real consultation. First, what do you actually know — not what do you assume? List the facts of the scenario in your mind and notice how few they are; the discipline of separating observation from interpretation is half the skill being practiced here.\n\nSecond, apply the lesson. ${firstSentence(l.focus)} Used as a lens on this scenario, that principle reorganizes the picture: some details that seemed central become background, and at least one quiet detail moves to the foreground. Find it before reading on.\n\nThird — and this is non-negotiable — locate the scope boundary. A wellness practitioner in this scenario educates, supports, and observes. Anything that resembles diagnosis or treatment of disease belongs to licensed medical care, and the professional move is a warm, confident referral. ${listNames(l.figures)} were insistent on this kind of honesty about limits, and their longevity in practice was not despite that honesty but because of it.\n\nFinally, decide what you would actually say. Not the whole speech — the first two sentences. Practitioners are made in those first two sentences: they either open the conversation or close it. Draft yours, say them aloud if you can, and notice whether they reflect the lesson or merely your habits.`,
  (l: LessonSpec) =>
    `Resist the urge to solve the scenario instantly; the urge itself is the lesson's first teaching opportunity. Quick answers in this field are usually pattern-matching against too small a pattern library, and the remedy is the deliberate sequence you are about to practice.\n\nBegin with the person, not the problem. Who is in front of you, what do they actually want, and what have they already tried? The scenario gives you fragments — in real practice you would ask, and the quality of your asking is built on exactly the concept this lesson taught. ${firstSentence(l.focus)} Notice how that principle dictates which question you would ask first.\n\nNext, consider what support looks like within scope. There is almost always a modest, safe, genuinely useful step available — education about the relevant tradition, a referral done well, a follow-up structured so that change can be observed rather than assumed. The masters cited in this lesson, ${listNames(l.figures)} among them, built their reputations on such modest steps repeated reliably, not on heroics.\n\nClose by writing the one-sentence summary you would put in your client notes. If you cannot summarize the encounter in a sentence, you have not yet understood it — and that diagnostic applies to your learning here just as it will to your documentation later.`,
];

const CLINICAL_CLOSERS = [
  `Step back from the particulars and notice the shape of what you just did. You separated observation from assumption, applied a principle as a lens, located the edge of your scope, and rehearsed the opening words — and that sequence, not any single conclusion, is the transferable skill. Run it on the next real situation you meet and it will already feel more familiar. The scenario was invented; the discipline it trains is not, and it is the discipline that distinguishes a practitioner who reasons from one who merely reacts.`,
  `One last discipline before you leave this card: write the single sentence you would record afterward — what you observed, what you suggested within scope, and what you advised the person to watch for. If that sentence comes easily, the encounter was clear in your mind; if it resists, return to the scenario and find what you skipped. The habit of closing every encounter with one honest line of documentation is small, unglamorous, and quietly responsible for more good practice than any clever technique.`,
  `Finally, ask what would change your mind. What detail, if it appeared, would shift your reading of this scenario entirely — toward referral, toward a different kind of support, toward simply listening longer? Holding that question keeps you honest and keeps the door open to the information a first impression always misses. The practitioner who can name what would change their mind is the practitioner whose judgment can be trusted, precisely because it remains revisable in the face of what the person actually presents.`,
];

// ─── Reflection prompts ───────────────────────────────────────────────────────

const REFLECTION_TEMPLATES = [
  (l: LessonSpec) =>
    `Think of a moment in your own life — your health, your habits, someone you care for — where the principle of this lesson was at work without your knowing its name. Describe what happened, then describe how you would see it differently now. Be specific: the value of this exercise is in the details, not the conclusion. (${firstSentence(l.focus)})`,
  (l: LessonSpec) =>
    `Imagine explaining this lesson's central idea to a skeptical friend who trusts you but not the field. What would you say in three sentences? What objection would they raise, and how would you answer it honestly — including conceding whatever deserves concession? Write your answer before taking the quiz; the quiz will feel different afterward.`,
  (l: LessonSpec) =>
    `${listNames(l.figures)} arrived at this teaching through years of direct observation. Identify one small observation you could begin making in your own daily life — this week — that would let you test the idea for yourself rather than taking it on authority. What would you watch for, and what would change your mind?`,
];

// ─── Question generation ──────────────────────────────────────────────────────

const LETTERS = ["a", "b", "c", "d"];

function makeQuestion(
  q: string,
  correctOpt: string,
  distractors: string[],
  explanation: string,
  seed: number
): GeneratedQuestion {
  const correctPos = seed % 4;
  const opts: string[] = [];
  let d = 0;
  for (let i = 0; i < 4; i++) {
    if (i === correctPos) opts.push(correctOpt);
    else opts.push(distractors[d++ % distractors.length]);
  }
  return { q, opts, correct: LETTERS[correctPos], explanation };
}

function termQuestions(terms: Term[], allTerms: Term[], seed: number): GeneratedQuestion[] {
  return terms.map((term, i) => {
    const others = allTerms.filter((t) => t.name !== term.name);
    const distractors = window(others, seed + i, 3).map((t) => t.name);
    return makeQuestion(
      `Which term is defined as: "${term.definition}"`,
      term.name,
      distractors,
      `${term.name} — ${term.definition}`,
      seed + i
    );
  });
}

function definitionQuestions(terms: Term[], allTerms: Term[], seed: number): GeneratedQuestion[] {
  return terms.map((term, i) => {
    const others = allTerms.filter((t) => t.name !== term.name);
    const distractors = window(others, seed + i + 1, 3).map((t) => t.definition);
    return makeQuestion(
      `In this lesson's vocabulary, what does "${term.name}" mean?`,
      term.definition,
      distractors,
      `${term.name} refers to: ${term.definition}`,
      seed + i + 2
    );
  });
}

function focusQuestion(
  lesson: LessonSpec,
  misconceptions: string[],
  seed: number
): GeneratedQuestion {
  const claim = firstSentence(lesson.focus);
  const distractors = window(misconceptions, seed, 3);
  return makeQuestion(
    `Which statement best captures the central teaching of "${lesson.title}"?`,
    claim,
    distractors,
    `The lesson's core claim: ${claim}`,
    seed + 1
  );
}

function figureQuestion(
  lesson: LessonSpec,
  figurePool: string[],
  seed: number
): GeneratedQuestion {
  const figure = pick(lesson.figures, seed);
  const others = figurePool.filter((f) => !lesson.figures.includes(f));
  const distractors = window(others.length >= 3 ? others : figurePool, seed, 3);
  return makeQuestion(
    `The lesson "${lesson.title}" draws directly on the work of which figure?`,
    figure,
    distractors,
    `${figure} is cited in this lesson — alongside ${listNames(lesson.figures)} — as a primary source for its teaching.`,
    seed + 3
  );
}

/** All generated questions for one lesson: 2 inline + 6 final-quiz pool. */
export function buildLessonQuestions(
  lesson: LessonSpec,
  course: CourseSpec,
  school: SchoolSpec,
  lessonIndex: number
): { inline: GeneratedQuestion[]; final: GeneratedQuestion[] } {
  const terms = window(course.terms, lessonIndex * 3, 5);
  const tq = termQuestions(terms.slice(0, 3), course.terms, lessonIndex * 7 + 1);
  const dq = definitionQuestions(terms.slice(2, 5), course.terms, lessonIndex * 5 + 2);
  const fq = focusQuestion(lesson, school.misconceptions, lessonIndex * 3 + 1);
  const gq = figureQuestion(lesson, school.figurePool, lessonIndex * 2 + 1);

  const inline = [tq[0], fq];
  const final = [gq, dq[0], tq[1], dq[1], tq[2], dq[2]];
  return { inline, final };
}

// ─── Card assembly ────────────────────────────────────────────────────────────

export function composeLessonContent(
  school: SchoolSpec,
  course: CourseSpec,
  lesson: LessonSpec,
  courseIndex: number,
  lessonIndex: number // 0..5 within course
): string {
  const g = courseIndex * 6 + lessonIndex; // global rotation index within school
  const terms = window(course.terms, lessonIndex * 3, 5);
  const { inline, final } = buildLessonQuestions(lesson, course, school, g);
  const quote = pick(school.quotes, g);
  const scenario = pick(course.scenarios, g);
  const v = school.voice;

  // Hook — 400+ words
  const hookBody = fillToTarget(
    [
      pick(HOOK_OPENERS, g)(lesson),
      pick(HOOK_FIGURE_PARAS, g + 1)(lesson),
      pick(v.lineage, g),
      pick(HOOK_STAKES, g + 2),
    ],
    420,
    [...v.lineage, ...v.practice],
    g + 3
  );

  // Teaching 1 — 500+ words
  const teach1 = fillToTarget(
    [
      pick(TEACH1_INTROS, g)(lesson, course),
      pick(TEACH_THEME_TEMPLATES, g)(pick(course.themes, g)),
      pick(v.method, g),
      TEACH1_TERM_PARA(terms),
      pick(TEACH1_CLOSERS, g + 1),
    ],
    520,
    [...v.method, ...v.lineage],
    g + 5
  );

  // Teaching 2 — 500+ words
  const teach2 = fillToTarget(
    [
      pick(TEACH2_INTROS, g + 1)(lesson),
      pick(TEACH_THEME_TEMPLATES, g + 2)(pick(course.themes, g + 1)),
      pick(v.practice, g),
      pick(TEACH2_APPLICATION, g),
      pick(TEACH2_CLOSERS, g + 2),
    ],
    520,
    [...v.practice, ...v.method],
    g + 7
  );

  // Quote context — 150+ words
  const quoteContext = fillToTarget(
    [quote.context, pick(v.lineage, g + 2)],
    160,
    [...v.lineage, ...v.caution],
    g + 9
  );

  // Deeper — 400+ words
  const deeper = fillToTarget(
    [
      pick(DEEPER_INTROS, g)(lesson),
      pick(v.caution, g),
      pick(TEACH_THEME_TEMPLATES, g + 3)(pick(course.themes, g + 2)),
      pick(DEEPER_CLOSERS, g + 1),
    ],
    420,
    [...v.caution, ...v.practice],
    g + 11
  );

  // Clinical — 300+ words
  const clinicalBody = fillToTarget(
    [pick(CLINICAL_BODIES, g)(lesson), pick(CLINICAL_CLOSERS, g)],
    320,
    [...CLINICAL_CLOSERS, ...v.caution],
    g + 13
  );

  const cards = [
    {
      type: "objectives",
      title: "What this lesson will give you",
      items: buildObjectives(lesson, course, terms, g),
    },
    {
      type: "hook",
      title: lesson.title,
      subtitle: firstSentence(lesson.focus),
      body: hookBody,
    },
    {
      type: "teaching",
      title: `The Foundation: ${lesson.title}`,
      part: 1,
      body: teach1,
    },
    {
      type: "quiz",
      title: "Check Your Understanding",
      questions: inline,
    },
    {
      type: "teaching",
      title: `Going Further: ${lesson.title}`,
      part: 2,
      body: teach2,
    },
    {
      type: "quote",
      title: "Masters Speak",
      quote: quote.quote,
      source: quote.source,
      context: quoteContext,
    },
    {
      type: "deeper",
      title: "The Nuance Most Courses Skip",
      body: deeper,
    },
    {
      type: "vocabulary",
      title: "Key Vocabulary",
      terms,
    },
    {
      type: "clinical",
      title: "Clinical Relevance",
      scenario,
      body: clinicalBody,
    },
    {
      type: "reflection",
      prompt: pick(REFLECTION_TEMPLATES, g)(lesson),
      quizQuestions: final,
    },
  ];

  return JSON.stringify({ cards });
}

/** Pool of midterm/final questions for a course (drawn from all its lessons). */
export function buildCourseQuestionPool(
  school: SchoolSpec,
  course: CourseSpec,
  courseIndex: number
): GeneratedQuestion[] {
  const pool: GeneratedQuestion[] = [];
  const lessons = [...course.modules[0].lessons, ...course.modules[1].lessons];
  lessons.forEach((lesson, li) => {
    const { inline, final } = buildLessonQuestions(lesson, course, school, courseIndex * 6 + li);
    pool.push(...inline, ...final);
  });
  return pool;
}
