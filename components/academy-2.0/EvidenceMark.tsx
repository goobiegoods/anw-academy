import { EVIDENCE_LEVEL_BY_ID, type EvidenceStatus } from "@/lib/academy-2.0/evidence-standard";

export default function EvidenceMark({ status }: { status: EvidenceStatus }) {
  const level = EVIDENCE_LEVEL_BY_ID[status];

  return (
    <span
      className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em]"
      style={{ color: level.color, borderColor: `${level.color}55`, backgroundColor: `${level.color}0d` }}
      title={level.description}
    >
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: level.color }} aria-hidden="true" />
      {level.shortLabel}
    </span>
  );
}
