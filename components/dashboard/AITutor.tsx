"use client";

import { useEffect, useRef, useState } from "react";

type SchoolOption = { name: string; color: string; courses: string[] };

type Message = { role: "user" | "assistant"; content: string };

const STARTERS: Record<string, string[]> = {
  "School of Herbal Medicine": [
    "Explain the doctrine of signatures and why it mattered historically.",
    "What does it mean for an herb to be warming or cooling?",
    "Why is 'natural does not mean safe' so central to herbalism?",
  ],
  "School of Traditional Chinese Medicine": [
    "Teach me what Qi actually means in clinical terms.",
    "How do the Five Elements describe relationships between organs?",
    "What is pattern differentiation and why does it matter?",
  ],
  "School of Homeopathic Studies": [
    "Walk me through Hahnemann's law of similars.",
    "What is the vital force in the Organon?",
    "Explain the potency controversy honestly.",
  ],
  "School of Functional Wellness": [
    "Why is blood-sugar regulation the foundation of energy and mood?",
    "Teach me the gut-brain axis at depth.",
    "What does circadian biology say about meal timing?",
  ],
  "School of Practice Building": [
    "What makes the therapeutic relationship heal?",
    "Teach me the core skills of reflective listening.",
    "Where exactly does scope of practice end?",
  ],
  "School of Wellness Entrepreneurship": [
    "Why is the niche the strategy?",
    "Explain why the customer, not the brand, is the hero.",
    "How do I price from value rather than fear?",
  ],
};

const GENERIC_STARTERS = [
  "What should every natural wellness practitioner understand about safety?",
  "Teach me one foundational concept I can apply this week.",
  "How do traditional and modern approaches to wellness fit together?",
];

export default function AITutor({ schools }: { schools: SchoolOption[] }) {
  const [schoolContext, setSchoolContext] = useState("");
  const [courseContext, setCourseContext] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeSchool = schools.find((s) => s.name === schoolContext);
  const accent = activeSchool?.color ?? "#4a7c59";
  const starters = (schoolContext && STARTERS[schoolContext]) || GENERIC_STARTERS;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async (text: string) => {
    const question = text.trim();
    if (!question || streaming) return;

    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    setMessages((m) => [...m, { role: "user", content: question }, { role: "assistant", content: "" }]);
    setInput("");
    setStreaming(true);

    try {
      const res = await fetch("/api/ai-tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          schoolContext,
          courseContext,
          conversationHistory: history,
        }),
      });

      if (!res.ok || !res.body) throw new Error("The Scholar is unavailable right now.");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: "assistant", content: acc };
          return copy;
        });
      }
    } catch (err) {
      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = {
          role: "assistant",
          content: err instanceof Error ? err.message : "Something went wrong. Please try again.",
        };
        return copy;
      });
    } finally {
      setStreaming(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-7rem)]">
      {/* Header */}
      <div className="flex-shrink-0">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-full bg-[#2d5240] flex items-center justify-center flex-shrink-0">
            <span className="text-[#e8b45a] font-playfair font-bold text-sm">A</span>
          </div>
          <div>
            <h1 className="font-playfair text-2xl font-bold text-[#1a1a1a]">The ANW Scholar</h1>
            <p className="text-[12px] text-[#6b6459]">
              Your intelligent wellness learning companion — drawing from the full depth of the ANW
              curriculum.
            </p>
          </div>
        </div>

        {/* Context selectors */}
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <select
            value={schoolContext}
            onChange={(e) => {
              setSchoolContext(e.target.value);
              setCourseContext("");
            }}
            className="flex-1 border border-[#e2ddd5] rounded-lg px-3 py-2.5 text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-[#4a7c59] min-h-[44px]"
          >
            <option value="">All schools</option>
            {schools.map((s) => (
              <option key={s.name} value={s.name}>{s.name}</option>
            ))}
          </select>
          <select
            value={courseContext}
            onChange={(e) => setCourseContext(e.target.value)}
            disabled={!activeSchool}
            className="flex-1 border border-[#e2ddd5] rounded-lg px-3 py-2.5 text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-[#4a7c59] min-h-[44px] disabled:opacity-50"
          >
            <option value="">{activeSchool ? "All courses" : "Select a school first"}</option>
            {activeSchool?.courses.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          {messages.length > 0 && (
            <button
              onClick={() => setMessages([])}
              className="text-[13px] font-medium text-[#6b6459] border border-[#e2ddd5] rounded-lg px-4 py-2.5 min-h-[44px] hover:bg-[#f5f1ea]"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Conversation */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto py-5 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <p className="font-playfair italic text-[#6b6459] mb-6" style={{ color: accent }}>
              Ask the Scholar anything — it will teach, not merely summarize.
            </p>
            <div className="space-y-2 w-full max-w-md">
              {starters.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="w-full text-left text-[13px] text-[#1a1a1a] bg-white border border-[#e2ddd5] rounded-xl px-4 py-3 min-h-[44px] hover:border-[#4a7c59] transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className="max-w-[85%] rounded-2xl px-4 py-3 text-[13.5px] whitespace-pre-wrap"
                style={{
                  lineHeight: 1.8,
                  backgroundColor: m.role === "user" ? accent : "#ffffff",
                  color: m.role === "user" ? "#ffffff" : "#1a1a1a",
                  border: m.role === "user" ? "none" : "1px solid #e2ddd5",
                }}
              >
                {m.content || (
                  <span className="inline-flex gap-1 items-center text-[#9a9088]">
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                    The Scholar is thinking…
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Composer */}
      <div className="flex-shrink-0 pt-3 border-t border-[#e2ddd5]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask the Scholar a question…"
            disabled={streaming}
            className="flex-1 border border-[#e2ddd5] rounded-full px-5 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#4a7c59] min-h-[44px] disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={streaming || !input.trim()}
            className="text-white font-semibold px-6 rounded-full min-h-[44px] disabled:opacity-40"
            style={{ backgroundColor: accent }}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
