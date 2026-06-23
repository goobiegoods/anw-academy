"use client";

import { BookOpen, LayoutGrid } from "lucide-react";

type Section = {
  id: string;
  label: string;
};

type Props = {
  sections: Section[];
  activeSection?: string;
  mode: "read" | "swipe";
  swipeSectionIdx: number;
  onModeChange: (m: "read" | "swipe") => void;
  onSectionClick: (idx: number, id: string) => void;
};

export default function LessonJumpNav({
  sections,
  activeSection,
  mode,
  swipeSectionIdx,
  onModeChange,
  onSectionClick,
}: Props) {
  return (
    <div className="flex flex-col gap-6 py-8 px-5">
      {/* Mode toggle */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-[#6b6459] mb-2">
          View Mode
        </p>
        <div className="flex rounded-lg overflow-hidden border border-[#e2ddd5]">
          <button
            onClick={() => onModeChange("read")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[11px] font-medium transition-colors ${
              mode === "read"
                ? "bg-[#2d5240] text-white"
                : "bg-white text-[#6b6459] hover:bg-[#f5f1ea]"
            }`}
          >
            <BookOpen size={12} />
            Read
          </button>
          <button
            onClick={() => onModeChange("swipe")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[11px] font-medium transition-colors ${
              mode === "swipe"
                ? "bg-[#2d5240] text-white"
                : "bg-white text-[#6b6459] hover:bg-[#f5f1ea]"
            }`}
          >
            <LayoutGrid size={12} />
            Swipe
          </button>
        </div>
      </div>

      {/* Section links */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-[#6b6459] mb-2">
          Lesson Content
        </p>
        <ol className="space-y-0.5">
          {sections.map((section, i) => {
            const isActive =
              mode === "swipe"
                ? swipeSectionIdx === i
                : activeSection === section.id;
            return (
              <li key={section.id}>
                {mode === "read" ? (
                  <a
                    href={`#${section.id}`}
                    onClick={() => onSectionClick(i, section.id)}
                    className={`flex items-center gap-2 py-1.5 px-2 rounded-md text-[12px] transition-colors ${
                      isActive
                        ? "bg-[#f0f7f3] text-[#2d5240] font-medium"
                        : "text-[#6b6459] hover:text-[#3a3530] hover:bg-[#f9f7f4]"
                    }`}
                  >
                    <span
                      className={`flex-shrink-0 w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                        isActive
                          ? "bg-[#2d5240] text-white"
                          : "bg-[#e2ddd5] text-[#6b6459]"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <span className="leading-tight">{section.label}</span>
                  </a>
                ) : (
                  <button
                    onClick={() => onSectionClick(i, section.id)}
                    className={`w-full flex items-center gap-2 py-1.5 px-2 rounded-md text-[12px] transition-colors text-left ${
                      isActive
                        ? "bg-[#f0f7f3] text-[#2d5240] font-medium"
                        : "text-[#6b6459] hover:text-[#3a3530] hover:bg-[#f9f7f4]"
                    }`}
                  >
                    <span
                      className={`flex-shrink-0 w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                        isActive
                          ? "bg-[#2d5240] text-white"
                          : "bg-[#e2ddd5] text-[#6b6459]"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <span className="leading-tight">{section.label}</span>
                  </button>
                )}
              </li>
            );
          })}
        </ol>
      </div>

      {/* Resources */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-[#6b6459] mb-2">
          Resources
        </p>
        <div className="space-y-1">
          {[
            { label: "Download Study Guide", icon: "⬇" },
            { label: "View References", icon: "📚" },
            { label: "Related Cases", icon: "🔗" },
          ].map(({ label, icon }) => (
            <button
              key={label}
              className="w-full flex items-center gap-2 py-1.5 px-2 rounded-md text-[12px] text-[#6b6459] hover:bg-[#f9f7f4] hover:text-[#3a3530] transition-colors text-left"
            >
              <span className="text-[11px]">{icon}</span>
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
