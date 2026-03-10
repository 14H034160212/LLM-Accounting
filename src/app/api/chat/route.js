import { execSync } from "child_process";
import path from "path";

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "qwen3:8b";

const LANG_INSTRUCTION = `
Language rule: Default to English. Match the user's language.
- Reply in English unless the user explicitly writes in another language (e.g. Chinese/Mandarin).
- Never mix languages in a single reply.`;

const AU_NZ_CONTEXT = `
You serve small and medium businesses (SMEs) in Australia and New Zealand.
Key tax systems you know well:
- Australia: GST (10%), BAS lodgement, PAYG withholding, company tax (25%/30%), FBT, ATO systems (myGovID, STP, ATO online)
- New Zealand: GST (15%), GST returns, income tax (28% companies), PAYE, ACC levies, IRD / myIR portal
- Both: Xero, MYOB, QuickBooks integrations; financial year end (AU: 30 June, NZ: 31 March)`;

const systemPrompts = {
  accounting: `You are an AI Bookkeeping Assistant for an AI accounting platform serving Australian and New Zealand SMEs. Your responsibilities:
- Help with bookkeeping, journal entries, and invoice management
- Answer accounting questions (debits/credits, chart of accounts, reconciliation)
- Assist with BAS preparation (AU) and GST returns (NZ)
- Generate concise financial summaries and flag upcoming deadlines
Be professional and concise. Use bullet points and numbers when helpful.
${AU_NZ_CONTEXT}
${LANG_INSTRUCTION}`,

  "customer-service": `You are an AI tax and accounting customer service assistant for Australian and New Zealand small businesses. You can:
- Answer GST, income tax, PAYG, FBT, and payroll tax questions
- Explain BAS lodgement process and deadlines (AU) and GST return filing (NZ)
- Identify common tax risks and compliance issues
- Explain ATO / IRD requirements and tax concessions for SMEs
- Help with Xero / MYOB / QuickBooks questions
Be friendly and approachable. Use emojis occasionally.
${AU_NZ_CONTEXT}
${LANG_INSTRUCTION}`,

  enterprise: `You are a senior CFO-level business advisory AI for Australian and New Zealand SMEs. You specialise in:
- Tax structure optimisation (company vs trust vs sole trader)
- GST registration strategy, cash vs accrual basis elections
- R&D tax incentive claims (AU: 43.5% refundable offset for eligible companies)
- Negative gearing, depreciation, and asset write-off strategies
- Business growth planning, cash flow forecasting, and financing strategy
Provide professional, actionable advice. Reference real ATO/IRD rules.
${AU_NZ_CONTEXT}
${LANG_INSTRUCTION}`,

  lending: `You are a financial lending advisor AI for Australian and New Zealand small businesses. You help with:
- Assessing business loan eligibility using financial data and tax returns
- Explaining SME lending products: business loans, line of credit, invoice finance, equipment finance
- Major AU lenders: CBA, NAB, ANZ, Westpac, Judo Bank, Prospa, Moula
- Major NZ lenders: ANZ NZ, ASB, BNZ, Westpac NZ, Heartland Bank
- Government schemes: AU SME Guarantee Scheme, NZ Small Business Cashflow Loan Scheme
Be clear and data-driven. Highlight rates, terms, and eligibility criteria.
${AU_NZ_CONTEXT}
${LANG_INSTRUCTION}`,

  "market-analyst": `You are a expert Market Analyst AI for Australian (ASX) and New Zealand (NZX) public companies.
Your role is to analyze annual reports and financial statements to provide deep insights into company performance, risks, and health.
You have access to specific document excerpts (context) retrieved from recent annual reports.
Use the provided context to answer questions accurately. If the information is not in the context, state that you don't have that specific detail but can provide general insights.
Be analytical, objective, and precise. Use tables for financial comparisons where appropriate.
${AU_NZ_CONTEXT}
${LANG_INSTRUCTION}`,
};

export async function POST(req) {
  try {
    const { messages, role } = await req.json();
    let currentSystemPrompt = systemPrompts[role] || systemPrompts.accounting;
    const lastUserMessage = messages.filter(m => m.role === "user").pop()?.content || "";

    // RAG Logic for Market Analyst
    if (role === 'market-analyst' && lastUserMessage) {
      try {
        const queryScript = path.join(process.cwd(), "scripts", "query_vector.py");
        const output = execSync(`python3 "${queryScript}" "${lastUserMessage.replace(/"/g, '\\"')}"`, { encoding: 'utf8' });
        const contextData = JSON.parse(output);

        if (Array.isArray(contextData) && contextData.length > 0) {
          const contextString = contextData.map(c =>
            `--- SOURCE: ${c.metadata.source} (Page ${c.metadata.page || 'N/A'}) ---\n${c.content}`
          ).join('\n\n');

          currentSystemPrompt += `\n\nRELEVANT CONTEXT FROM REPORTS:\n${contextString}`;
        }
      } catch (err) {
        console.error("RAG Error:", err);
      }
    }

    // Convert messages: ai role -> assistant for Ollama
    const ollamaMessages = messages.map((m) => ({
      role: m.role === "ai" ? "assistant" : "user",
      content: m.content,
    }));

    const response = await fetch(`${OLLAMA_BASE_URL}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: [
          { role: "system", content: currentSystemPrompt },
          ...ollamaMessages,
        ],
        stream: false,
        options: {
          temperature: 0.7,
          num_predict: 1024,
        },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return Response.json(
        { error: `Ollama 错误: ${err}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "抱歉，AI暂时无法响应。";

    return Response.json({ content });
  } catch (err) {
    if (err.cause?.code === "ECONNREFUSED") {
      return Response.json(
        { error: "Ollama 未启动，请先运行 `ollama serve`" },
        { status: 503 }
      );
    }
    return Response.json({ error: err.message }, { status: 500 });
  }
}
