import Avatar from "@/components/shared/Avatar";
import StatusBadge from "@/components/shared/StatusBadge";
import WUBadge from "@/components/shared/WUBadge";
import ProgressBar from "@/components/shared/ProgressBar";
import { getLevelTitle } from "@/lib/utils";

const students = [
  { id: 1, name: "Emma Clarke", email: "emma@example.com", level: 3, wu: 342, status: "active", enrollments: 3, lastActivity: "Today", location: "Burlington, VT" },
  { id: 2, name: "David Okafor", email: "david@example.com", level: 4, wu: 614, status: "active", enrollments: 5, lastActivity: "Yesterday", location: "Atlanta, GA" },
  { id: 3, name: "Sofia Reyes", email: "sofia@example.com", level: 2, wu: 290, status: "active", enrollments: 2, lastActivity: "3 days ago", location: "Santa Fe, NM" },
  { id: 4, name: "Aiden Moss", email: "aiden@example.com", level: 1, wu: 187, status: "active", enrollments: 2, lastActivity: "1 week ago", location: "Nashville, TN" },
  { id: 5, name: "Nadia Volkov", email: "nadia@example.com", level: 5, wu: 1040, status: "active", enrollments: 8, lastActivity: "2 weeks ago", location: "Seattle, WA" },
];

export default function StudentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-playfair text-3xl font-bold text-[#1a1a1a]">Students</h1>
          <p className="text-[#6b6459] mt-1">{students.length} enrolled students</p>
        </div>
      </div>

      <div className="bg-white border border-[#e2ddd5] rounded-[16px] shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#e2ddd5] bg-[#faf8f4]">
                <th className="text-left text-xs font-semibold text-[#6b6459] uppercase tracking-wider px-5 py-3">Student</th>
                <th className="text-left text-xs font-semibold text-[#6b6459] uppercase tracking-wider px-4 py-3">Level</th>
                <th className="text-left text-xs font-semibold text-[#6b6459] uppercase tracking-wider px-4 py-3">WU</th>
                <th className="text-left text-xs font-semibold text-[#6b6459] uppercase tracking-wider px-4 py-3">Courses</th>
                <th className="text-left text-xs font-semibold text-[#6b6459] uppercase tracking-wider px-4 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-[#6b6459] uppercase tracking-wider px-4 py-3">Last Active</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id} className="border-b border-[#f5f1ea] hover:bg-[#faf8f4] transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={student.name} size="sm" />
                      <div>
                        <p className="font-medium text-sm text-[#1a1a1a]">{student.name}</p>
                        <p className="text-xs text-[#6b6459]">{student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#4a7c59] text-white text-xs font-bold flex items-center justify-center">
                        {student.level}
                      </div>
                      <span className="text-xs text-[#6b6459] hidden sm:block">{getLevelTitle(student.level)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <WUBadge value={student.wu} size="sm" />
                  </td>
                  <td className="px-4 py-4 text-sm text-[#1a1a1a]">{student.enrollments}</td>
                  <td className="px-4 py-4">
                    <StatusBadge status={student.status} />
                  </td>
                  <td className="px-4 py-4 text-xs text-[#6b6459]">{student.lastActivity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
