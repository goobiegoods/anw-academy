export type EvidenceStatus =
  | "established"
  | "evidence-informed"
  | "emerging"
  | "traditional-historical"
  | "theoretical-speculative";

export type EvidenceLevel = {
  id: EvidenceStatus;
  label: string;
  shortLabel: string;
  color: string;
  description: string;
  example: string;
};

export const EVIDENCE_LEVELS: readonly EvidenceLevel[] = [
  {
    id: "established",
    label: "Established science",
    shortLabel: "Established",
    color: "#2D6A4F",
    description: "Supported by strong scientific consensus or replicated, high-quality evidence.",
    example: "Core anatomy, physiology, and well-established safety guidance.",
  },
  {
    id: "evidence-informed",
    label: "Evidence-informed practice",
    shortLabel: "Evidence-informed",
    color: "#3B6F8F",
    description: "Supported by meaningful evidence, with limits that depend on context, population, or method.",
    example: "Promising practices that require calibrated claims and individual judgment.",
  },
  {
    id: "emerging",
    label: "Emerging research",
    shortLabel: "Emerging",
    color: "#8A6B30",
    description: "Actively studied and potentially useful, but not yet settled enough for confident conclusions.",
    example: "Early findings, plausible mechanisms, and questions still under investigation.",
  },
  {
    id: "traditional-historical",
    label: "Traditional / historical",
    shortLabel: "Traditional / historical",
    color: "#76568A",
    description: "Taught to understand a tradition on its own terms; longevity and cultural importance are not proof of efficacy.",
    example: "Classical texts, lineage concepts, and historical systems of interpretation.",
  },
  {
    id: "theoretical-speculative",
    label: "Theoretical / speculative",
    shortLabel: "Theoretical",
    color: "#8B4A3C",
    description: "A model or claim with limited direct evidence, presented as a possibility rather than an established fact.",
    example: "Contested explanations and hypotheses that require explicit uncertainty.",
  },
] as const;

export const EVIDENCE_LEVEL_BY_ID = Object.fromEntries(
  EVIDENCE_LEVELS.map((level) => [level.id, level])
) as Record<EvidenceStatus, EvidenceLevel>;
