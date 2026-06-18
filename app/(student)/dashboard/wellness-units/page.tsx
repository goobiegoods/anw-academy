import WUBadge from "@/components/shared/WUBadge";
import ProgressBar from "@/components/shared/ProgressBar";
import { getLevelTitle, getWUForLevel } from "@/lib/utils";

const transactions = [
  { id: 1, description: "Lesson completed: The Origins of Herbal Medicine", sourceType: "lesson", amount: 1, date: "Jun 9, 2026" },
  { id: 2, description: "Quiz passed: Herbal Foundations Quiz (90%)", sourceType: "quiz", amount: 2, date: "Jun 8, 2026" },
  { id: 3, description: "Assignment submitted: Herb Journal Entry", sourceType: "assignment", amount: 5, date: "Jun 6, 2026" },
  { id: 4, description: "Lesson completed: How Herbalism Differs from Pharmaceutical Medicine", sourceType: "lesson", amount: 1, date: "Jun 5, 2026" },
  { id: 5, description: "Discussion post: Your Entry into the Plant World", sourceType: "discussion", amount: 2, date: "Jun 4, 2026" },
  { id: 6, description: "Case study approved: Supporting Seasonal Allergies", sourceType: "case_study", amount: 15, date: "May 28, 2026" },
  { id: 7, description: "Lesson completed: Introduction to Herbal Energetics", sourceType: "lesson", amount: 1, date: "May 25, 2026" },
  { id: 8, description: "Assignment submitted: Yin/Yang Reflection Essay", sourceType: "assignment", amount: 5, date: "May 20, 2026" },
];

const sourceColors: Record<string, string> = {
  lesson: "#4a7c59",
  quiz: "#5b4fcf",
  assignment: "#d4882a",
  discussion: "#2c6e8a",
  case_study: "#c9923a",
  capstone: "#c0392b",
};

const currentWU = 342;
const currentLevel = 3;
const levelData = getWUForLevel(currentLevel);

export default function WellnessUnitsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-playfair text-3xl font-bold text-[#1a1a1a]">Wellness Units</h1>
        <p className="text-[#6b6459] mt-1">Your learning currency and progress tracker</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white border border-[#e2ddd5] rounded-[16px] shadow-card p-6 sm:col-span-2">
          <p className="text-sm text-[#6b6459] mb-1">Current Balance</p>
          <div className="flex items-end gap-3 mb-4">
            <span className="text-5xl font-bold font-playfair text-[#1a1a1a]">{currentWU}</span>
            <span className="text-lg text-[#c9923a] font-semibold mb-1">WU</span>
          </div>
          <ProgressBar value={currentWU - levelData.min} max={levelData.max - levelData.min} color="#c9923a" showLabel />
          <p className="text-xs text-[#6b6459] mt-1">
            {levelData.max - currentWU} WU until Level {currentLevel + 1} — {getLevelTitle(currentLevel + 1)}
          </p>
        </div>

        <div className="bg-white border border-[#e2ddd5] rounded-[16px] shadow-card p-6">
          <p className="text-sm text-[#6b6459] mb-2">Current Level</p>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#4a7c59] text-white flex items-center justify-center text-xl font-bold font-playfair">
              {currentLevel}
            </div>
            <div>
              <p className="font-bold text-[#1a1a1a]">{getLevelTitle(currentLevel)}</p>
              <p className="text-xs text-[#6b6459]">{levelData.min}–{levelData.max} WU</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#e2ddd5] rounded-[16px] shadow-card p-6">
        <h2 className="font-playfair text-xl font-bold text-[#1a1a1a] mb-5">How to Earn WU</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { type: "Lesson", wu: "1 WU", color: "#4a7c59" },
            { type: "Quiz", wu: "2 WU", color: "#5b4fcf" },
            { type: "Discussion", wu: "2 WU", color: "#2c6e8a" },
            { type: "Assignment", wu: "5 WU", color: "#d4882a" },
            { type: "Case Study", wu: "10–25 WU", color: "#c9923a" },
            { type: "Capstone", wu: "50 WU", color: "#c0392b" },
          ].map((s) => (
            <div key={s.type} className="text-center bg-[#f5f1ea] rounded-xl p-4">
              <div className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: `${s.color}20` }}>
                <span className="text-lg font-bold" style={{ color: s.color }}>✦</span>
              </div>
              <p className="text-xs font-medium text-[#1a1a1a]">{s.type}</p>
              <p className="text-xs font-bold mt-1" style={{ color: s.color }}>{s.wu}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-[#e2ddd5] rounded-[16px] shadow-card p-6">
        <h2 className="font-playfair text-xl font-bold text-[#1a1a1a] mb-5">Transaction History</h2>
        <div className="space-y-3">
          {transactions.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between gap-4 py-3 border-b border-[#f5f1ea] last:border-0">
              <div className="flex items-center gap-3">
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: sourceColors[tx.sourceType] || "#4a7c59" }}
                />
                <div>
                  <p className="text-sm text-[#1a1a1a]">{tx.description}</p>
                  <p className="text-xs text-[#6b6459]">{tx.date}</p>
                </div>
              </div>
              <WUBadge value={tx.amount} size="sm" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
