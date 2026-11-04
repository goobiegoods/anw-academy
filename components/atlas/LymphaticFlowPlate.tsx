"use client";

import { useState } from "react";
import type { AtlasStructure } from "@/lib/academy-2.0/knowledge-atlas";

export default function LymphaticFlowPlate({ structures }: { structures: AtlasStructure[] }) {
  const [selectedId, setSelectedId] = useState(structures[0]?.id ?? "");
  const selected = structures.find((structure) => structure.id === selectedId) ?? structures[0];

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <figure className="rounded-[24px] border border-[#d9d1c3] bg-[#f7f2e8] p-4 sm:p-7">
        <svg
          viewBox="0 0 760 390"
          role="img"
          aria-labelledby="lymph-flow-title lymph-flow-description"
          className="h-auto w-full"
        >
          <title id="lymph-flow-title">The lymphatic return pathway</title>
          <desc id="lymph-flow-description">
            A flow diagram from tissue fluid through lymphatic capillaries, vessels, nodes, trunks, and ducts into venous circulation, with an intestinal lacteal branch joining the thoracic duct.
          </desc>
          <defs>
            <marker id="atlas-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#68806f" />
            </marker>
          </defs>

          <rect x="18" y="118" width="112" height="74" rx="18" fill="#e7d9bf" stroke="#b99b66" />
          <text x="74" y="147" textAnchor="middle" className="fill-[#554936] text-[13px] font-semibold">Tissue</text>
          <text x="74" y="166" textAnchor="middle" className="fill-[#6b6459] text-[11px]">fluid space</text>

          <rect x="166" y="118" width="122" height="74" rx="18" fill="#dcebe1" stroke="#699176" />
          <text x="227" y="145" textAnchor="middle" className="fill-[#254c35] text-[12px] font-semibold">Initial</text>
          <text x="227" y="164" textAnchor="middle" className="fill-[#3d6650] text-[11px]">capillary</text>

          <rect x="324" y="118" width="112" height="74" rx="18" fill="#dcebe1" stroke="#699176" />
          <text x="380" y="145" textAnchor="middle" className="fill-[#254c35] text-[12px] font-semibold">Collecting</text>
          <text x="380" y="164" textAnchor="middle" className="fill-[#3d6650] text-[11px]">vessel + valves</text>

          <circle cx="508" cy="155" r="43" fill="#e6e0ef" stroke="#856d9b" />
          <text x="508" y="151" textAnchor="middle" className="fill-[#523d67] text-[12px] font-semibold">Lymph</text>
          <text x="508" y="168" textAnchor="middle" className="fill-[#6f5a83] text-[11px]">node</text>

          <rect x="587" y="118" width="84" height="74" rx="18" fill="#dcebe1" stroke="#699176" />
          <text x="629" y="145" textAnchor="middle" className="fill-[#254c35] text-[12px] font-semibold">Trunk</text>
          <text x="629" y="164" textAnchor="middle" className="fill-[#3d6650] text-[11px]">+ duct</text>

          <circle cx="720" cy="155" r="30" fill="#eadbd7" stroke="#a76b5b" />
          <text x="720" y="151" textAnchor="middle" className="fill-[#71392d] text-[10px] font-semibold">Venous</text>
          <text x="720" y="165" textAnchor="middle" className="fill-[#82473a] text-[9px]">blood</text>

          {[[130, 155, 166, 155], [288, 155, 324, 155], [436, 155, 464, 155], [551, 155, 587, 155], [671, 155, 688, 155]].map(([x1, y1, x2, y2], index) => (
            <line key={index} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#68806f" strokeWidth="3" markerEnd="url(#atlas-arrow)" />
          ))}

          <rect x="213" y="280" width="148" height="68" rx="18" fill="#f4ead1" stroke="#b99345" />
          <text x="287" y="307" textAnchor="middle" className="fill-[#6e5117] text-[12px] font-semibold">Intestinal lacteal</text>
          <text x="287" y="326" textAnchor="middle" className="fill-[#866a32] text-[10px]">dietary lipid route</text>
          <path d="M 361 314 C 470 314, 544 270, 610 194" fill="none" stroke="#a4813d" strokeWidth="3" strokeDasharray="7 6" markerEnd="url(#atlas-arrow)" />

          <text x="20" y="35" className="fill-[#1c3327] text-[15px] font-semibold">COLLECTION → TRANSPORT → CHECKPOINT → RETURN</text>
          <text x="20" y="58" className="fill-[#776d5e] text-[11px]">A systems map—not a diagnostic image or a to-scale anatomical plate.</text>
        </svg>
        <figcaption className="mt-3 border-t border-[#ded5c6] pt-4 text-[12px] leading-relaxed text-[#776d5e]">
          The network is distributed throughout the body. This simplified route is designed to make direction and relationship legible before regional anatomy is added.
        </figcaption>
      </figure>

      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8a6b30]">Select a structure</p>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1">
          {structures.map((structure) => {
            const active = structure.id === selected?.id;
            return (
              <button
                key={structure.id}
                type="button"
                onClick={() => setSelectedId(structure.id)}
                aria-pressed={active}
                className="min-h-11 rounded-xl border px-4 py-3 text-left text-[13px] font-semibold transition-colors"
                style={{
                  borderColor: active ? "#1C3327" : "#ded8cd",
                  backgroundColor: active ? "#1C3327" : "#ffffff",
                  color: active ? "#F3ECDA" : "#3d3a34",
                }}
              >
                {structure.title}
              </button>
            );
          })}
        </div>
        {selected ? (
          <div className="mt-4 rounded-2xl border border-[#d9d1c3] bg-white p-5" aria-live="polite">
            <p className="font-playfair text-lg font-bold text-[#1C3327]">{selected.title}</p>
            <p className="mt-2 text-[13px] leading-relaxed text-[#4a4238]">{selected.plainRole}</p>
            <div className="mt-4 border-t border-[#eee8de] pt-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#8a6b30]">Study deeper</p>
              <p className="mt-2 text-[12px] leading-relaxed text-[#6b6459]">{selected.deeperRole}</p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
