import type { EvidenceStatus } from "@/lib/academy-2.0/evidence-standard";

export type AtlasSource = {
  id: string;
  title: string;
  organization: string;
  url: string;
  sourceType: "open-textbook" | "government-reference" | "regulatory-monograph" | "academy-curriculum";
};

export type AtlasClaim = {
  id: string;
  statement: string;
  evidenceStatus: EvidenceStatus;
  explanation: string;
  limitations?: string;
  sourceIds: string[];
};

export type AtlasConnection = {
  id: string;
  title: string;
  relation: "returns-to" | "supports" | "transports" | "studied-in" | "traditional-use";
  summary: string;
  claimId: string;
};

export type AtlasStructure = {
  id: string;
  title: string;
  plainRole: string;
  deeperRole: string;
};

export type AtlasLab = {
  slug: string;
  title: string;
  safetyTier: 0 | 1 | 2 | 3;
  duration: string;
  purpose: string;
  materials: string[];
  steps: string[];
  artifact: string;
  boundaries: string[];
};

export type AtlasWhiteboardBrief = {
  title: string;
  duration: string;
  purpose: string;
  boardSequence: string[];
  productionState: "brief-approved" | "recorded" | "published";
};

export type AtlasConcept = {
  slug: string;
  catalogCode: string;
  title: string;
  subtitle: string;
  level: string;
  orient: string;
  essentialQuestion: string;
  coreFlow: string[];
  structures: AtlasStructure[];
  connections: AtlasConnection[];
  claims: AtlasClaim[];
  sources: AtlasSource[];
  lab: AtlasLab;
  whiteboard: AtlasWhiteboardBrief;
  curriculumLinks: { title: string; school: string; href: string; note: string }[];
  scholarPrompts: string[];
  safety: {
    scope: string;
    seekCare: string[];
    emergency: string;
    sourceIds: string[];
  };
};

export const HUMAN_BODY_SPINE = [
  { code: "HB-01", title: "How We Know", focus: "Evidence literacy, terminology, scale, safety, and homeostasis" },
  { code: "HB-02", title: "Cells, Tissues & Compartments", focus: "Cells, connective tissue, membranes, extracellular space, and body fluids" },
  { code: "HB-03", title: "Support & Movement", focus: "Skeleton, joints, muscle, fascia, and skin" },
  { code: "HB-04", title: "Transport & Defense", focus: "Cardiovascular, lymphatic, and immune systems" },
  { code: "HB-05", title: "Control & Communication", focus: "Nervous, endocrine, stress physiology, and mind-body signaling" },
  { code: "HB-06", title: "Intake, Transformation & Energy", focus: "Respiration, digestion, liver, metabolism, and microbiome" },
  { code: "HB-07", title: "Balance, Elimination & Life Course", focus: "Renal function, fluids, reproduction, development, and aging" },
  { code: "HB-08", title: "Whole-Person Integration", focus: "Sleep, movement, nutrition, psychology, environment, and school bridges" },
] as const;

export const LYMPHATIC_SYSTEM: AtlasConcept = {
  slug: "lymphatic-system",
  catalogCode: "HB-04.02",
  title: "The Lymphatic System",
  subtitle: "Return, defense, and connection",
  level: "Foundation → Practitioner lens",
  orient:
    "The lymphatic system is a one-way return network. It collects excess fluid from tissue spaces, moves that fluid through vessels and nodes, and returns it to venous circulation. It also connects fluid balance with immune activity and intestinal fat transport.",
  essentialQuestion: "How does fluid leave the spaces around cells, pass through a distributed defense network, and return to the blood?",
  coreFlow: [
    "Interstitial fluid",
    "Initial lymphatic capillary",
    "Collecting vessel",
    "Lymph node",
    "Lymphatic trunk",
    "Thoracic or right lymphatic duct",
    "Venous circulation",
  ],
  structures: [
    {
      id: "capillaries",
      title: "Initial lymphatic capillaries",
      plainRole: "Microscopic, blind-ended vessels that collect fluid from tissue spaces.",
      deeperRole: "Overlapping endothelial cells open as interstitial pressure rises, allowing fluid and larger molecules to enter.",
    },
    {
      id: "collectors",
      title: "Collecting vessels & valves",
      plainRole: "Thin-walled routes that carry lymph in one direction.",
      deeperRole: "Valves limit backflow while vessel-wall contraction, skeletal movement, and pressure changes assist transport.",
    },
    {
      id: "nodes",
      title: "Lymph nodes",
      plainRole: "Organized immune checkpoints positioned along lymphatic routes.",
      deeperRole: "Afferent vessels bring lymph into nodal sinuses; immune cells encounter material before efferent vessels carry lymph onward.",
    },
    {
      id: "ducts",
      title: "Lymphatic ducts",
      plainRole: "The final large channels returning lymph to veins near the neck.",
      deeperRole: "Most of the body drains through the thoracic duct; the right upper quadrant drains through the right lymphatic duct.",
    },
    {
      id: "lacteals",
      title: "Intestinal lacteals",
      plainRole: "Specialized lymphatic capillaries that absorb transported dietary lipids.",
      deeperRole: "Chylomicrons enter lacteals, travel in chyle, and reach venous blood through the thoracic duct.",
    },
    {
      id: "lymphoid-organs",
      title: "Spleen, thymus & tonsils",
      plainRole: "Related immune organs—not interchangeable with the vessel network.",
      deeperRole: "They contribute distinct immune functions; their inclusion in the broader lymphatic system should not erase those differences.",
    },
  ],
  claims: [
    {
      id: "fluid-return",
      statement: "Lymphatic vessels collect excess interstitial fluid and return it to venous circulation.",
      evidenceStatus: "established",
      explanation: "This is a core function of normal lymphatic anatomy and fluid balance.",
      sourceIds: ["openstax-21-1", "openstax-20-3"],
    },
    {
      id: "immune-connection",
      statement: "Lymphatic vessels and nodes connect tissue drainage with immune surveillance and response.",
      evidenceStatus: "established",
      explanation: "Immune cells travel through the network, and lymph nodes organize encounters with material arriving from tissues.",
      sourceIds: ["openstax-21-1", "nci-nodes"],
    },
    {
      id: "lipid-transport",
      statement: "Intestinal lacteals transport chylomicrons through lymph before they enter venous blood.",
      evidenceStatus: "established",
      explanation: "This is a normal part of dietary lipid absorption and transport.",
      sourceIds: ["openstax-23-7"],
    },
    {
      id: "movement-connection",
      statement: "Body movement and pressure changes can assist lymph transport through a valved, low-pressure network.",
      evidenceStatus: "established",
      explanation: "The system has no single central pump comparable to the heart; several mechanical forces contribute to flow.",
      limitations: "This does not mean any movement routine can diagnose or treat lymphedema.",
      sourceIds: ["openstax-21-1"],
    },
    {
      id: "calendula-tradition",
      statement: "Western herbal traditions have described calendula as a ‘lymphatic’ herb.",
      evidenceStatus: "traditional-historical",
      explanation: "ANW studies this as a historical practitioner category, not as proof that calendula changes lymphatic physiology.",
      limitations: "The EMA monograph addresses traditional topical uses for minor skin and mouth/throat conditions; it does not validate a general ‘lymph-moving’ claim.",
      sourceIds: ["anw-calendula", "ema-calendula"],
    },
    {
      id: "detox-language",
      statement: "Broad claims that a product or routine ‘detoxifies the lymph’ are too vague to count as an established physiological claim.",
      evidenceStatus: "theoretical-speculative",
      explanation: "A useful claim must name a measurable mechanism, outcome, population, and limitation.",
      limitations: "Do not infer disease, obstruction, or treatment need from wellness language or self-observation.",
      sourceIds: ["openstax-21-1", "medlineplus-lymphedema"],
    },
  ],
  connections: [
    { id: "circulation", title: "Cardiovascular system", relation: "returns-to", summary: "Lymph ultimately returns collected tissue fluid to venous blood.", claimId: "fluid-return" },
    { id: "immunity", title: "Immune system", relation: "supports", summary: "Nodes and lymphoid tissues help organize immune surveillance and response.", claimId: "immune-connection" },
    { id: "digestion", title: "Digestion & nutrition", relation: "transports", summary: "Lacteals carry absorbed dietary lipids toward circulation.", claimId: "lipid-transport" },
    { id: "movement", title: "Movement & respiration", relation: "supports", summary: "Muscle activity and pressure changes are among the forces assisting lymph flow.", claimId: "movement-connection" },
    { id: "calendula", title: "Calendula", relation: "traditional-use", summary: "A historical herbal connection taught with explicit limits on physiological inference.", claimId: "calendula-tradition" },
  ],
  sources: [
    { id: "openstax-21-1", title: "Anatomy of the Lymphatic and Immune Systems", organization: "OpenStax Anatomy & Physiology", url: "https://openstax.org/books/anatomy-and-physiology/pages/21-1-anatomy-of-the-lymphatic-and-immune-systems", sourceType: "open-textbook" },
    { id: "openstax-20-3", title: "Capillary Exchange", organization: "OpenStax Anatomy & Physiology 2e", url: "https://openstax.org/books/anatomy-and-physiology-2e/pages/20-3-capillary-exchange", sourceType: "open-textbook" },
    { id: "openstax-23-7", title: "Chemical Digestion and Absorption", organization: "OpenStax Anatomy & Physiology 2e", url: "https://openstax.org/books/anatomy-and-physiology-2e/pages/23-7-chemical-digestion-and-absorption-a-closer-look", sourceType: "open-textbook" },
    { id: "nci-nodes", title: "Lymph Nodes", organization: "U.S. National Cancer Institute · SEER", url: "https://training.seer.cancer.gov/anatomy/lymphatic/components/nodes.html", sourceType: "government-reference" },
    { id: "medlineplus-lymphedema", title: "Lymphedema", organization: "U.S. National Library of Medicine", url: "https://www.medlineplus.gov/lymphedema.html", sourceType: "government-reference" },
    { id: "nci-edema", title: "Edema and When to Seek Care", organization: "U.S. National Cancer Institute", url: "https://www.cancer.gov/about-cancer/treatment/side-effects/edema", sourceType: "government-reference" },
    { id: "ema-calendula", title: "Calendulae flos", organization: "European Medicines Agency", url: "https://www.ema.europa.eu/en/medicines/herbal/calendulae-flos", sourceType: "regulatory-monograph" },
    { id: "anw-calendula", title: "Calendula · Materia Medica I", organization: "Academy of Natural Wellness", url: "/dashboard/courses/materia-medica-i-the-foundational-herbs", sourceType: "academy-curriculum" },
  ],
  lab: {
    slug: "one-way-flow-model",
    title: "Build & Explain a One-Way Flow Model",
    safetyTier: 0,
    duration: "25–35 minutes",
    purpose: "Use a paper model to explain collection, one-way movement, checkpoints, and return—then name where the model stops matching living physiology.",
    materials: ["One sheet of paper", "Pencil or pen", "Two differently colored markers", "The Atlas flow sequence"],
    steps: [
      "Draw a tissue space beside a blood capillary and show fluid entering the interstitial space.",
      "Add a blind-ended lymphatic capillary, then a collecting vessel with one-way valves.",
      "Place a lymph node on the route and label what the model can—and cannot—say about immune activity.",
      "Complete the path through a trunk and duct into venous circulation.",
      "Add the intestinal-lacteal branch and explain why dietary lipids take this route.",
      "Classify three public ‘lymph’ claims using the ANW Evidence Standard.",
    ],
    artifact: "An annotated flow map plus a 150-word teach-back explaining one strength and two limits of the model.",
    boundaries: [
      "This is a model-building exercise, not self-examination or treatment.",
      "Do not palpate lymph nodes, massage swelling, change compression, or test an intervention for this lab.",
      "Use the red-flag guidance on this page for symptoms; do not diagnose their cause yourself.",
    ],
  },
  whiteboard: {
    title: "Why Lymph Changes How You See the Body",
    duration: "8–12 minute recording brief",
    purpose: "Connect tissue space, fluid return, immune checkpoints, intestinal fat transport, and three common misconceptions on one board.",
    boardSequence: ["The tissue space", "The return network", "The immune checkpoint", "The intestinal-fat route", "What ‘detox’ does—and does not—mean"],
    productionState: "brief-approved",
  },
  curriculumLinks: [
    { title: "Materia Medica I: The Foundational Herbs", school: "School of Herbal Medicine", href: "/dashboard/courses/materia-medica-i-the-foundational-herbs", note: "Compare calendula’s historical herbal category with established lymphatic physiology." },
    { title: "Functional Foundations", school: "School of Functional Wellness", href: "/dashboard/courses", note: "Place fluid balance, movement, immune function, and nutrition in a shared systems map." },
  ],
  scholarPrompts: [
    "Teach me the lymphatic flow route, then ask me to explain it back.",
    "Compare a lymph node with a lymphatic vessel without oversimplifying either.",
    "Help me separate established lymph physiology from traditional ‘lymph-moving’ claims.",
  ],
  safety: {
    scope: "This Atlas page teaches anatomy, evidence reasoning, and referral awareness. It does not diagnose swelling or teach treatment for lymphedema.",
    seekCare: ["New or persistent unexplained swelling", "One-sided swelling", "Warmth, redness, increasing pain, skin changes, or fever", "Swelling after cancer treatment, lymph-node surgery, radiation, infection, or injury"],
    emergency: "Seek emergency care for shortness of breath, chest pain, sudden painful swelling, faintness, or rapidly worsening symptoms.",
    sourceIds: ["medlineplus-lymphedema", "nci-edema"],
  },
};

export const ATLAS_CONCEPTS = [LYMPHATIC_SYSTEM] as const;

export function getAtlasConcept(slug: string): AtlasConcept | undefined {
  return ATLAS_CONCEPTS.find((concept) => concept.slug === slug);
}

export function getClaim(concept: AtlasConcept, claimId: string): AtlasClaim {
  const claim = concept.claims.find((item) => item.id === claimId);
  if (!claim) throw new Error(`Unknown Atlas claim: ${claimId}`);
  return claim;
}
