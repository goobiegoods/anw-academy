import Link from "next/link";
import StatusBadge from "@/components/shared/StatusBadge";
import WUBadge from "@/components/shared/WUBadge";

const quizzes = [
  { title: "Introduction to Herbal Medicine — Final Quiz", course: "Introduction to Herbal Medicine", school: { name: "Herbal Medicine", icon: "🌿", color: "#4a7c59" }, wu: 2, status: "completed", score: 90, passingScore: 70, slug: "intro-herbal-medicine" },
  { title: "Yin/Yang Foundations Quiz", course: "Yin and Yang Foundations", school: { name: "TCM", icon: "☯️", color: "#c0392b" }, wu: 2, status: "pending", score: null, passingScore: 70, slug: "yin-yang-foundations" },
  { title: "Foundations of Nutrition Quiz", course: "Foundations of Nutrition", school: { name: "Functional Wellness", icon: "⚡", color: "#d4882a" }, wu: 2, status: "pending", score: null, passingScore: 70, slug: "foundations-nutrition" },
];

export default function ExamsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-playfair text-3xl font-bold text-[#1a1a1a]">Exams & Quizzes</h1>
        <p className="text-[#6b6459] mt-1">Test your knowledge and earn Wellness Units</p>
      </div>

      <div className="space-y-4">
        {quizzes.map((quiz) => (
          <div key={quiz.title} className="bg-white border border-[#e2ddd5] rounded-[16px] shadow-card p-5">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <p className="text-xs text-[#6b6459] mb-1 flex items-center gap-1">
                  {quiz.school.icon} {quiz.course}
                </p>
                <h2 className="font-semibold text-[#1a1a1a]">{quiz.title}</h2>
                <div className="flex items-center gap-3 mt-2">
                  <StatusBadge status={quiz.status} />
                  <span className="text-xs text-[#6b6459]">Passing score: {quiz.passingScore}%</span>
                  {quiz.score !== null && (
                    <span className="text-xs font-semibold text-[#4a7c59]">Your score: {quiz.score}%</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <WUBadge value={quiz.wu} />
                {quiz.status === "pending" ? (
                  <Link
                    href={`/dashboard/courses/${quiz.slug}`}
                    className="bg-[#4a7c59] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#2d5240] transition-colors"
                  >
                    Take Quiz
                  </Link>
                ) : (
                  <Link
                    href={`/dashboard/courses/${quiz.slug}`}
                    className="border border-[#e2ddd5] text-sm text-[#6b6459] px-4 py-2 rounded-lg hover:bg-[#f5f1ea] transition-colors"
                  >
                    Review
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
