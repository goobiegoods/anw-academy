import { FileText, BookOpen } from "lucide-react";

const resources = [
  { title: "Client Intake Form Template", type: "pdf", description: "A professional health intake form template for wellness practice use.", tags: ["forms", "intake"] },
  { title: "Scope of Practice Quick Reference", type: "reference", description: "A handy reference card for what you can and cannot say as a wellness educator.", tags: ["scope", "ethics"] },
  { title: "ANW Practitioner Communication Guide", type: "article", description: "Best practices for communicating with clients about natural wellness.", tags: ["communication", "ethics"] },
  { title: "Session Note Template (SOAP)", type: "pdf", description: "A structured session note template following SOAP documentation format.", tags: ["documentation", "sessions"] },
];

export default function PractitionerResourcesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-playfair text-3xl font-bold text-[#1a1a1a]">Resources</h1>
        <p className="text-[#6b6459] mt-1">Practice management resources and references</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {resources.map((r) => (
          <div key={r.title} className="bg-white border border-[#e2ddd5] rounded-[16px] shadow-card p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#4a7c59]/10 flex items-center justify-center flex-shrink-0">
              <FileText size={18} className="text-[#4a7c59]" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-[#1a1a1a] mb-1">{r.title}</h3>
              <p className="text-xs text-[#6b6459] leading-relaxed mb-2">{r.description}</p>
              <div className="flex flex-wrap gap-1.5">
                {r.tags.map((t) => (
                  <span key={t} className="text-xs bg-[#f5f1ea] text-[#6b6459] px-2 py-0.5 rounded-full">{t}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
