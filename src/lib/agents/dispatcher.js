import { execSync } from "child_process";
import path from "path";
import db from "@/lib/db";
import { getInternalBusinessContext } from "@/lib/context_builder";

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "qwen3:8b";

class BaseAgent {
    constructor(name, prompt) {
        this.name = name;
        this.prompt = prompt;
    }

    async getResponse(messages, additionalContext = "") {
        const fullPrompt = this.prompt + additionalContext;
        const ollamaMessages = messages.map((m) => ({
            role: m.role === "ai" ? "assistant" : "user",
            content: m.content,
        }));

        const response = await fetch(`${OLLAMA_BASE_URL}/v1/chat/completions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: OLLAMA_MODEL,
                messages: [{ role: "system", content: fullPrompt }, ...ollamaMessages],
                stream: false,
                options: { temperature: 0.7, num_predict: 1024 }
            }),
        });

        if (!response.ok) throw new Error(await response.text());
        const data = await response.json();
        return data.choices?.[0]?.message?.content || "No response.";
    }
}

export class MarketResearchAgent extends BaseAgent {
    constructor() {
        super("Market Research Agent", `You are a expert Market Analyst for ASX/NZX. Analyze provided report excerpts and compare with internal benchmarks.`);
    }

    async run(messages, lastMessage) {
        try {
            const queryScript = path.join(process.cwd(), "scripts", "query_vector.py");
            const output = execSync(`python3 "${queryScript}" "${lastMessage.replace(/"/g, '\\"')}"`, { encoding: 'utf8' });
            const contextData = JSON.parse(output);
            let contextString = "\n\nRELEVANT EXTERNAL DATA:\n";
            if (Array.isArray(contextData) && contextData.length > 0) {
                contextString += contextData.map(c => `--- SOURCE: ${c.metadata.source} ---\n${c.content}`).join('\n\n');
            } else {
                contextString += "No specific market documents found for this query.";
            }
            return await this.getResponse(messages, contextString + getInternalBusinessContext());
        } catch (err) {
            console.error("Market Agent Error:", err);
            return "I encountered an error accessing market data.";
        }
    }
}

export class AccountingAgent extends BaseAgent {
    constructor() {
        super("Accounting Specialist", `You are a senior Accountant for AU/NZ SMEs. Focus on internal records, compliance, and benchmarking.`);
    }

    async run(messages) {
        return await this.getResponse(messages, getInternalBusinessContext());
    }
}

export class ChiefIntelligence {
    constructor() {
        this.agents = {
            'market-analyst': new MarketResearchAgent(),
            'accounting': new AccountingAgent(),
        };
    }

    async dispatch(role, messages) {
        const agent = this.agents[role] || this.agents['accounting'];
        const lastUserMessage = messages.filter(m => m.role === "user").pop()?.content || "";
        return await agent.run(messages, lastUserMessage);
    }
}
