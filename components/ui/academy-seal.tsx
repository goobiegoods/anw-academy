import { cn } from "@/lib/utils";

export type SealSize = "sm" | "md" | "lg" | "xl";
export type SealVariant = "dark" | "gold" | "light";

const SIZE_PX: Record<SealSize, number> = { sm: 40, md: 80, lg: 120, xl: 200 };

const VARIANT_COLORS: Record<SealVariant, { fill: string; ink: string }> = {
  dark: { fill: "#1C3327", ink: "#D4A94A" },
  gold: { fill: "transparent", ink: "#D4A94A" },
  light: { fill: "transparent", ink: "#FFFFFF" },
};

/**
 * The official seal of the Academy of Natural Wellness.
 * Pure SVG — sharp at every size, no external assets.
 */
export default function AcademySeal({
  size = "md",
  variant = "gold",
  className,
}: {
  size?: SealSize;
  variant?: SealVariant;
  className?: string;
}) {
  const px = SIZE_PX[size];
  const { fill, ink } = VARIANT_COLORS[variant];
  const uid = `anw-seal-${variant}`;

  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("flex-shrink-0 select-none", className)}
      role="img"
      aria-label="Seal of the Academy of Natural Wellness — Established 2026"
    >
      <defs>
        {/* Full circle, starting at top, clockwise — for the outer ring text */}
        <path
          id={`${uid}-ring`}
          d="M 100,16 a 84,84 0 1,1 -0.02,0"
        />
        {/* Bottom arc, left → right through the bottom — for the motto */}
        <path id={`${uid}-motto`} d="M 56,126 A 56,56 0 0 0 144,126" />
      </defs>

      {/* Ground disc */}
      <circle cx="100" cy="100" r="98" fill={fill} />

      {/* Outer double ring */}
      <circle cx="100" cy="100" r="97" stroke={ink} strokeWidth="2.5" />
      <circle cx="100" cy="100" r="92" stroke={ink} strokeWidth="0.75" />

      {/* Ring text */}
      <text
        fill={ink}
        fontSize="11"
        fontFamily="'Playfair Display', Georgia, serif"
        fontWeight="600"
        letterSpacing="3.2"
      >
        <textPath href={`#${uid}-ring`} startOffset="0">
          ACADEMY OF NATURAL WELLNESS · ESTABLISHED 2026 ·
        </textPath>
      </text>

      {/* Inner decorative ring */}
      <circle cx="100" cy="100" r="70" stroke={ink} strokeWidth="1.25" />
      <circle
        cx="100"
        cy="100"
        r="66"
        stroke={ink}
        strokeWidth="0.6"
        strokeDasharray="2.5 3.5"
      />

      {/* ── Botanical leaf motif ─────────────────────────────────────── */}
      <g stroke={ink} strokeWidth="1.6" strokeLinecap="round" fill="none">
        {/* Stem */}
        <path d="M 100,116 C 100,102 100,84 100,60" />
        {/* Top bud */}
        <path
          d="M 100,60 C 95,54 95,46 100,40 C 105,46 105,54 100,60 Z"
          fill={ink}
          fillOpacity="0.9"
          strokeWidth="1"
        />
        {/* Upper leaf pair */}
        <path d="M 100,74 C 91,72 84,66 82,56 C 92,58 99,65 100,74 Z" />
        <path d="M 100,74 C 109,72 116,66 118,56 C 108,58 101,65 100,74 Z" />
        {/* Middle leaf pair */}
        <path d="M 100,92 C 89,90 80,83 77,71 C 89,74 98,82 100,92 Z" />
        <path d="M 100,92 C 111,90 120,83 123,71 C 111,74 102,82 100,92 Z" />
        {/* Lower leaf pair */}
        <path d="M 100,110 C 88,108 78,100 75,87 C 88,90 98,99 100,110 Z" />
        <path d="M 100,110 C 112,108 122,100 125,87 C 112,90 102,99 100,110 Z" />
      </g>

      {/* ANW monogram */}
      <text
        x="100"
        y="138"
        textAnchor="middle"
        fill={ink}
        fontSize="21"
        fontFamily="'Playfair Display', Georgia, serif"
        fontWeight="700"
        letterSpacing="5"
      >
        ANW
      </text>

      {/* Motto arc */}
      <text
        fill={ink}
        fontSize="6.5"
        fontFamily="'Playfair Display', Georgia, serif"
        fontWeight="600"
        letterSpacing="0.8"
      >
        <textPath href={`#${uid}-motto`} startOffset="50%" textAnchor="middle">
          NATURA SANAT · SAPIENTIA DOCET
        </textPath>
      </text>

      {/* Flanking stars beside the monogram */}
      <text
        x="70"
        y="137"
        textAnchor="middle"
        fill={ink}
        fontSize="9"
        fontFamily="Georgia, serif"
      >
        ✦
      </text>
      <text
        x="130"
        y="137"
        textAnchor="middle"
        fill={ink}
        fontSize="9"
        fontFamily="Georgia, serif"
      >
        ✦
      </text>
    </svg>
  );
}

/** The academy motto with its translation, for use beneath wordmarks. */
export function AcademyMotto({
  className,
  color = "#8a7a6a",
}: {
  className?: string;
  color?: string;
}) {
  return (
    <span
      className={cn("font-playfair italic tracking-[0.14em]", className)}
      style={{ color }}
    >
      Natura Sanat, Sapientia Docet
    </span>
  );
}
