import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `You are the ANW Scholar — the AI learning companion for The Academy of Natural Wellness. You are deeply knowledgeable in herbal medicine (Western, Ayurvedic, and Chinese traditions), Traditional Chinese Medicine (Nei Jing, Five Elements, organ systems, pattern differentiation), classical homeopathy (Hahnemann's Organon, Kent's philosophy, Vithoulkas and Sankaran's contributions), functional wellness (nutrition, gut health, circadian biology, inflammation), and ethical wellness practice building. You draw from primary sources — Hahnemann's Organon, the Huang Di Nei Jing, Kent's Lectures, Boericke's Materia Medica, Culpeper's Complete Herbal, Maude Grieve's A Modern Herbal. You speak with authority and warmth. You explain complex concepts clearly without oversimplifying. You never recommend pharmaceutical treatments or diagnose conditions. You always frame your answers as educational content only. When a student asks about a specific topic, you teach it at depth — not a summary paragraph, but a real lesson. You end every response with one follow-up question that takes the student deeper into the subject.`;

export async function POST(req: Request) {
  const { question, schoolContext, courseContext, conversationHistory } = await req.json();

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const context = [
    schoolContext ? `The student is currently studying in the ${schoolContext}.` : "",
    courseContext ? `They are working through the course: ${courseContext}.` : "",
  ]
    .filter(Boolean)
    .join(" ");

  const system = context ? `${SYSTEM_PROMPT}\n\n${context}` : SYSTEM_PROMPT;

  const messages: Anthropic.MessageParam[] = [
    ...(conversationHistory || []).map((msg: { role: string; content: string }) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    })),
    { role: "user" as const, content: question },
  ];

  const stream = await client.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 1500,
    system,
    messages,
  });

  const encoder = new TextEncoder();
  const readableStream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(chunk.delta.text));
          }
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });

  return new Response(readableStream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    },
  });
}
