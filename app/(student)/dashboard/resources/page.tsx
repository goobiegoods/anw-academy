import { FileText, Link as LinkIcon, Video, BookOpen } from "lucide-react";

const resources = [
  { title: "ANW Herbal Safety Reference Guide", type: "pdf", school: "Herbal Medicine", tags: ["safety", "reference"], description: "A comprehensive quick-reference guide to herb-drug interactions, contraindications, and safety protocols." },
  { title: "The Five Elements Overview Chart", type: "reference", school: "Traditional Chinese Medicine", tags: ["five-elements", "chart"], description: "A visual reference chart of the Five Element correspondences including organs, seasons, emotions, and tastes." },
  { title: "Homeopathic Remedy Families Overview", type: "article", school: "Homeopathic Studies", tags: ["remedies", "families"], description: "An introduction to the mineral, plant, and animal kingdoms in homeopathic materia medica." },
  { title: "Gut Health Action Guide", type: "pdf", school: "Functional Wellness", tags: ["gut-health", "practical"], description: "A practical guide for supporting gut health through diet, lifestyle, and natural approaches." },
  { title: "Client Intake Form Template", type: "pdf", school: "Practice Building", tags: ["forms", "intake"], description: "A professional health intake form template adaptable for wellness practice use." },
  { title: "ANW Brand Voice Guidelines", type: "reference", school: "Wellness Entrepreneurship", tags: ["branding", "marketing"], description: "Guidelines for communicating about natural wellness with clarity, ethics, and authority." },
  { title: "Understanding Herbal Energetics (Video)", type: "video-placeholder", school: "Herbal Medicine", tags: ["energetics", "video"], description: "A recorded lecture on the four primary energetic qualities and how to apply them in practice." },
  { title: "Scope of Practice: What You Can and Cannot Say", type: "article", school: "Practice Building", tags: ["scope", "ethics"], description: "A clear, practical article on the legal and ethical boundaries of wellness education language." },
  { title: "Introduction to TCM Tongue Observation", type: "article", school: "Traditional Chinese Medicine", tags: ["assessment", "tongue"], description: "An educational overview of tongue observation as a traditional Chinese assessment tool." },
  { title: "Seasonal Wellness Protocols", type: "reference", school: "Traditional Chinese Medicine", tags: ["seasonal", "practical"], description: "Seasonal wellness recommendations for Spring, Summer, Late Summer, Autumn, and Winter according to TCM." },
];

const typeIcons: Record<string, React.ElementType> = {
  pdf: FileText,
  article: BookOpen,
  reference: LinkIcon,
  "video-placeholder": Video,
};

const typeColors: Record<string, string> = {
  pdf: "#c0392b",
  article: "#4a7c59",
  reference: "#2c6e8a",
  "video-placeholder": "#5b4fcf",
};

export default function ResourcesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-playfair text-3xl font-bold text-[#1a1a1a]">Resources</h1>
        <p className="text-[#6b6459] mt-1">Reference materials, guides, and supplementary learning</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {resources.map((r) => {
          const Icon = typeIcons[r.type] || FileText;
          const color = typeColors[r.type] || "#4a7c59";
          return (
            <div key={r.title} className="bg-white border border-[#e2ddd5] rounded-[16px] shadow-card p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}15` }}>
                <Icon size={18} style={{ color }} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-[#1a1a1a] text-sm leading-snug mb-1">{r.title}</h3>
                <p className="text-xs text-[#6b6459] mb-2">{r.school}</p>
                <p className="text-xs text-[#6b6459] leading-relaxed mb-3">{r.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {r.tags.map((tag) => (
                    <span key={tag} className="text-xs bg-[#f5f1ea] text-[#6b6459] px-2 py-0.5 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
