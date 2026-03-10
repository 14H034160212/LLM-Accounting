# AcctAI Pro

> AI-powered accounting & tax platform for Australian and New Zealand SMEs.
> Built with Next.js 16, React 19, Tailwind CSS v4, and Ollama (local open-source LLMs).

---

## Features

| Module | Description |
|---|---|
| **Business Dashboard** | Real-time overview — revenue, expenses, tax payable, task list |
| **AI Bookkeeping** | Auto journal generation, GST/BAS entries, human review workflow |
| **Invoice Management** | Upload invoices, AI-powered OCR extraction (Qwen3-VL), status tracking |
| **Tax Filing** | GST/BAS, PAYG, income tax instalment — ATO-aligned lodgement workflow |
| **Financial Reports** | P&L, balance sheet, cash flow, trend charts |
| **AI Support Agent** | 24/7 FinBot chatbot — tax & accounting Q&A, knowledge base |
| **Enterprise Advisory** | Tax planning, equity design, CFO-level advisory via AI chat |
| **Business Lending** | Credit scoring, product matching (CBA/NAB/Judo/ANZ), AI lending advisor |

---

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS v4, Framer Motion, lucide-react
- **AI / LLM**: [Ollama](https://ollama.com) running locally — no API costs
  - `qwen3:8b` — chat agent for all 4 AI roles
  - `qwen3vl:8b` — vision-language model for invoice OCR
- **API Routes**: `/api/chat` (4 role-based agents), `/api/invoice-ocr` (multimodal OCR)
- **Language**: English-first, bilingual EN/ZH

---

## Prerequisites

| Tool | Version | Install |
|---|---|---|
| Node.js | ≥ 18 | https://nodejs.org |
| npm | ≥ 9 | bundled with Node |
| Ollama | latest | https://ollama.com/download |
| Git | any | https://git-scm.com |

> **GPU recommended**: A100 / RTX 3090+ for qwen3:8b. CPU-only is supported but slow.

---

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/14H034160212/LLM-Accounting.git
cd LLM-Accounting
```

### 2. Install dependencies

```bash
npm install
```

### 3. Install and start Ollama

```bash
# macOS
brew install ollama

# Linux
curl -fsSL https://ollama.com/install.sh | sh

# Windows — download installer from https://ollama.com/download
```

### 4. Pull the required AI models

```bash
# Chat model (used by all 4 AI agents)
ollama pull llama3:8b

# Vision model (used for invoice OCR) — use llava:13b for better accuracy
ollama pull llava:13b
```

> Downloads ~13GB total (llama3:8b ~4.7GB + llava:13b ~8GB). Run once, cached forever.
>
> **Vision model options**:
> - `llava:13b` (recommended) — better accuracy, requires more VRAM
> - `llava:7b` — faster, lower accuracy (smaller 4.7GB model)
>
> **⚠️ About `qwen3vl:8b`**: This model requires Ollama ≥ 0.6.x and may not be available. Use `llava:13b` instead for production-ready accuracy.
>
> Configure in `.env.local`:
> ```bash
> OLLAMA_MODEL=llama3:8b
> OLLAMA_VISION_MODEL=llava:13b
> ```

### 5. Start Ollama server

```bash
ollama serve
```

> Ollama will start on `http://localhost:11434` by default.
> If Ollama is already running (e.g. as a system service), skip this step.

### 6. Start the development server

```bash
npm run dev
```

Open **http://localhost:3000** in your browser.

---

## Environment Variables (Optional)

Create a `.env.local` file in the project root to override defaults:

```env
# Ollama server URL (default: http://localhost:11434)
OLLAMA_BASE_URL=http://localhost:11434

# Chat model (default: qwen3:8b)
OLLAMA_MODEL=qwen3:8b

# Vision/OCR model (default: qwen3vl:8b)
OLLAMA_VISION_MODEL=qwen3vl:8b
```

### Using a different model

If you don't have `qwen3:8b`, you can use any other Ollama model:

```bash
ollama pull llama3:8b          # Meta Llama 3
ollama pull mistral:7b         # Mistral 7B
ollama pull gemma3:9b          # Google Gemma 3
```

Then set `OLLAMA_MODEL=llama3:8b` in `.env.local`.

---

## Project Structure

```
src/
├── app/
│   ├── page.js                     # Landing page
│   ├── layout.js                   # Root layout
│   ├── globals.css                 # Global styles & custom CSS classes
│   ├── api/
│   │   ├── chat/route.js           # Ollama chat API (4 AI agent roles)
│   │   └── invoice-ocr/route.js    # Invoice OCR API (Qwen3-VL)
│   └── dashboard/
│       ├── layout.js               # Sidebar navigation layout
│       ├── page.js                 # Business Dashboard (overview)
│       ├── accounting/page.js      # AI Bookkeeping agent
│       ├── invoices/page.js        # Invoice management + OCR upload
│       ├── tax/page.js             # Tax filing (GST/BAS/PAYG)
│       ├── reports/page.js         # Financial reports
│       ├── customer-service/page.js # AI Support agent (FinBot)
│       ├── enterprise/page.js      # Enterprise Advisory agent
│       └── lending/page.js         # Business Lending agent
```

---

## AI Agent Roles

The `/api/chat` route accepts a `role` parameter to switch system prompts:

| Role | Description |
|---|---|
| `accounting` | GST bookkeeping, journal entries, BAS preparation, AU/NZ tax law |
| `customer-service` | Tax Q&A, FinBot persona, SME advice, ATO/IRD knowledge |
| `enterprise` | CFO-level advisory — tax planning, equity design, financial strategy |
| `lending` | Credit assessment, AU/NZ lender matching, loan application support |

**Request format:**
```json
POST /api/chat
{
  "messages": [{ "role": "user", "content": "What is my GST payable?" }],
  "role": "accounting"
}
```

---

## Invoice OCR

Upload a tax invoice image via the Invoices page. The system:
1. Sends the image to `qwen3vl:8b` via `/api/invoice-ocr`
2. Extracts: seller, invoice number, date, line items, GST, total
3. Shows a confirmation modal — review and add to your invoice list

**Supported formats**: JPG, PNG, PDF (image-based)

---

## Production Build

```bash
npm run build
npm start
```

---

## Deployment

### Vercel (recommended for frontend)
```bash
npm install -g vercel
vercel deploy
```
> Note: Set `OLLAMA_BASE_URL` to your Ollama server's public URL in Vercel environment variables.

## Docker Deployment

The project is fully containerized for easy deployment on servers with GPU support.

### Prerequisites
- Docker & Docker Compose
- NVIDIA Container Toolkit (for GPU acceleration)

### Quick Start with Docker
```bash
# 1. Clone and enter directory
git clone https://github.com/14H034160212/LLM-Accounting.git
cd LLM-Accounting

# 2. Build and start containers
# This automatically handles Ollama setup and model pulling (qwen3 & qwen3-vl)
docker-compose up --build -d
```

The application will be available at `http://localhost:54297` (or your server's IP).
Ollama is exposed internally and externally on port `55379`.

---

## Troubleshooting

| Problem | Solution |
|---|---|
| `⚠️ Unable to connect to AI` | Make sure `ollama serve` is running |
| `model not found` | Run `ollama pull qwen3:8b` |
| Slow AI responses | Normal on CPU; use GPU for faster inference |
| Port 3000 in use | Run `npm run dev -- --port 3001` |
| Ollama on remote server | Set `OLLAMA_BASE_URL=http://<server-ip>:11434` in `.env.local` |

---

## Screenshots

| Page | Description |
|---|---|
| `/` | Landing page — AU/NZ market features overview |
| `/dashboard` | Business Dashboard — revenue, tax, tasks |
| `/dashboard/accounting` | AI Bookkeeping + Journal List |
| `/dashboard/invoices` | Invoice table + OCR upload |
| `/dashboard/tax` | GST/BAS filing tasks + detail panel |
| `/dashboard/reports` | P&L, balance sheet, cash flow |
| `/dashboard/customer-service` | FinBot chat + knowledge base |
| `/dashboard/enterprise` | Tax advisory + success stories |
| `/dashboard/lending` | Credit score + lending products |

---

## License

MIT

---

## Contributing

Pull requests welcome. For major changes, please open an issue first.

---

*Built for AU & NZ SMEs · Powered by Ollama + Qwen3 · Next.js 16*
