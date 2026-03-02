const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const VISION_MODEL = process.env.OLLAMA_VISION_MODEL || "qwen3vl:8b";

const EXTRACT_PROMPT = `You are an invoice data extraction assistant. Analyze this invoice image and extract the following information in JSON format only (no markdown, no explanation):

{
  "seller": "seller/supplier company name",
  "buyer": "buyer/customer company name or 'N/A'",
  "invoiceNumber": "invoice number or reference",
  "date": "invoice date in YYYY-MM-DD format",
  "dueDate": "payment due date in YYYY-MM-DD format or null",
  "subtotal": numeric value without currency symbol,
  "gst": numeric GST/tax amount without currency symbol,
  "total": numeric total amount without currency symbol,
  "currency": "AUD or NZD or other",
  "type": "Tax Invoice / Receipt / Credit Note / other",
  "lineItems": [
    { "description": "item description", "quantity": number, "unitPrice": number, "amount": number }
  ],
  "notes": "any payment terms or important notes"
}

If a field cannot be determined from the image, use null. Return ONLY valid JSON.`;

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("image");

    if (!file) {
      return Response.json({ error: "No image provided" }, { status: 400 });
    }

    // Convert file to base64
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const mimeType = file.type || "image/jpeg";
    const dataUrl = `data:${mimeType};base64,${base64}`;

    // Call Ollama vision model (OpenAI-compatible endpoint)
    const response = await fetch(`${OLLAMA_BASE_URL}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: VISION_MODEL,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: EXTRACT_PROMPT },
              { type: "image_url", image_url: { url: dataUrl } },
            ],
          },
        ],
        stream: false,
        options: { temperature: 0.1 }, // Low temp for accurate extraction
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return Response.json({ error: `Ollama error: ${err}` }, { status: 500 });
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || "";

    // Parse JSON from model response
    let invoiceData;
    try {
      // Strip markdown code blocks if present
      const cleaned = rawContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      invoiceData = JSON.parse(cleaned);
    } catch {
      // Return raw text if JSON parse fails
      return Response.json({ error: "Could not parse invoice data", raw: rawContent }, { status: 422 });
    }

    return Response.json({ success: true, invoice: invoiceData });
  } catch (err) {
    if (err.cause?.code === "ECONNREFUSED") {
      return Response.json(
        { error: "Ollama is not running. Please run `ollama serve` and ensure qwen3vl:8b is installed." },
        { status: 503 }
      );
    }
    return Response.json({ error: err.message }, { status: 500 });
  }
}
