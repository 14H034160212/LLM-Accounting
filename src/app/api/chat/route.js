import { ChiefIntelligence } from "@/lib/agents/dispatcher";

const intelligence = new ChiefIntelligence();

export async function POST(req) {
  try {
    const { messages, role } = await req.json();
    const content = await intelligence.dispatch(role, messages);
    return Response.json({ content });
  } catch (err) {
    console.error("Agent Dispatch Error:", err);
    if (err.cause?.code === "ECONNREFUSED") {
      return Response.json(
        { error: "Ollama 未启动，请先运行 `ollama serve`" },
        { status: 503 }
      );
    }
    return Response.json({ error: err.message }, { status: 500 });
  }
}
