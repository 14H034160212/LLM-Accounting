import requests, json, base64, sqlite3, uuid, time, re
from pathlib import Path

# High-precision fix for CPU-based OCR
OLLAMA_API = "http://localhost:11437/api/generate"
MODEL = "qwen3-vl"
DB_PATH = Path('/data/qbao775/llm-accounting/data/data.db')
IMG_DIR = Path('/data/qbao775/llm-accounting/data/fatura_raw/images')

# Target only the images we have
IMAGES = sorted(list(IMG_DIR.glob("*.jpg")))[:10]

TASKS = {
    "seller": "What is the exact company name at the top left of this invoice?",
    "date": "What is the invoice date? (YYYY-MM-DD)",
    "amount": "What is the total Grand Total amount? (Numeric only)",
    "tax": "What is the tax amount?",
    "invoiceNumber": "What is the invoice number?"
}

def extract_field(img_b64, task_name, prompt):
    print(f"  Requesting {task_name}...")
    payload = {
        "model": MODEL,
        "prompt": f"{prompt} Answer in a short phrase ONLY.",
        "images": [img_b64],
        "stream": False,
        "options": {"num_thread": 32, "num_predict": 100}
    }
    try:
        res = requests.post(OLLAMA_API, json=payload, timeout=600).json()
        val = res.get("response", "").strip()
        print(f"    Raw: {val}")
        return val
    except Exception as e:
        print(f"    Error: {e}")
        return ""

def main():
    # Clear existing pilot records to avoid duplicates
    conn = sqlite3.connect(str(DB_PATH))
    cursor = conn.cursor()
    cursor.execute("DELETE FROM invoices WHERE id LIKE 'fatura-%';")
    conn.commit()
    conn.close()

    for img_path in IMAGES:
        print(f"--- Processing {img_path.name} ---")
        with open(img_path, "rb") as f:
            img_b64 = base64.b64encode(f.read()).decode('utf-8')
        
        data = {}
        for key, prompt in TASKS.items():
            data[key] = extract_field(img_b64, key, prompt)
            # Cleanup numeric
            if key in ["amount", "tax"]:
                match = re.search(r"(\d+[\.,]\d+)", data[key])
                if not match: match = re.search(r"(\d+)", data[key])
                data[key] = match.group(1).replace(",", "") if match else "0.00"
        
        # Save
        conn = sqlite3.connect(str(DB_PATH))
        cursor = conn.cursor()
        inv_id = f"fatura-{uuid.uuid4().hex[:12]}"
        cursor.execute(
            "INSERT INTO invoices (id, seller, amount, tax, date, status, raw_json, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            (inv_id, data['seller'], float(data['amount']), float(data['tax']), data['date'], 'Pending', json.dumps(data), f"/fatura_images/{img_path.name}")
        )
        conn.commit()
        conn.close()
        print(f"  Saved {img_path.name} as {inv_id}")

if __name__ == "__main__":
    main()
