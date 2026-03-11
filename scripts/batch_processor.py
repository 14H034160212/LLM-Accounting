print("DEBUG START", flush=True)
import os
import requests
import json
import sqlite3
import time
import uuid
import re
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
OLLAMA_API = "http://localhost:11437/api/generate"
MODEL = "qwen3-vl:latest"
DB_PATH = Path('/data/qbao775/llm-accounting/data/data.db')
FATURA_DIR = Path('/data/qbao775/llm-accounting/data/fatura_raw/FATURA_EXTRACT/invoices_dataset_final/images')
LOG_FILE = "/tmp/batch_ocr_detailed.log"
EXTRACTION_TASKS = {
    "seller": "What is the legal name of the company issuing this invoice? (Look for company name/logo)",
    "date": "What is the invoice date? (Return ONLY in YYYY-MM-DD format)",
    "amount": "What is the total gross amount including tax? (Numeric only)",
    "tax": "What is the tax or GST amount? (Numeric only)",
    "invoiceNumber": "What is the invoice number or reference number?"
}

try:
    from transformers import AutoImageProcessor, TableTransformerForObjectDetection
    import torch
    from PIL import Image
    import io
    print("Loading TATR models...", flush=True)
    tatr_processor = AutoImageProcessor.from_pretrained("microsoft/table-transformer-detection")
    tatr_model = TableTransformerForObjectDetection.from_pretrained("microsoft/table-transformer-detection")
except Exception as e:
    print(f"TATR failed to load: {e}")
    tatr_processor = None
    tatr_model = None



def log(msg):
    import time
    timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
    full_msg = f"[{timestamp}] {msg}"
    print(full_msg, flush=True)
    with open(LOG_FILE, "a") as f:
        f.write(full_msg + "\n")

def process_invoice(image_path):
    """Process a single invoice image using real AI vision model (qwen3-vl) on port 11437."""
    import base64
    import re
    import io
    from PIL import Image
    
    try:
        with open(image_path, "rb") as f:
            img_b64 = base64.b64encode(f.read()).decode('utf-8')

        # Create downscaled image for fast serial basic field extraction
        pil_img = Image.open(image_path).convert("RGB")
        max_dim = 1000
        if max(pil_img.width, pil_img.height) > max_dim:
            scale = max_dim / max(pil_img.width, pil_img.height)
            new_w, new_h = int(pil_img.width * scale), int(pil_img.height * scale)
            small_img = pil_img.resize((new_w, new_h), Image.Resampling.LANCZOS)
        else:
            small_img = pil_img
            
        buffered_small = io.BytesIO()
        small_img.save(buffered_small, format="JPEG", quality=75)
        small_b64 = base64.b64encode(buffered_small.getvalue()).decode('utf-8')

        extracted_data = {
            "seller": "Unknown",
            "date": "2026-01-01",
            "amount": 0.0,
            "tax": 0.0,
            "invoiceNumber": "N/A",
            "lineItems": [],
            "currency": "AUD",
            "due_date": "",
            "customer_name": "Unknown",
            "customer_address": "",
            "seller_address": "",
            "discount": 0.0
        }
        img_size = os.path.getsize(image_path)
        log(f"--- Starting: {image_path.name} ({img_size} bytes) ---")
        
        # 1. Basic Fields via single-shot prompting (MUCH FASTER)
        prompt = """Extract ONLY these fields from the invoice image and return as a raw JSON object. NO markdown, NO preamble. 
Fields: 
- "seller": string (company name)
- "seller_address": string 
- "customer_name": string (Bill To name)
- "customer_address": string (Bill To address)
- "date": string (YYYY-MM-DD)
- "due_date": string (YYYY-MM-DD)
- "invoiceNumber": string (invoice number)
- "amount": number (total amount)
- "tax": number (total tax)
- "discount": number (discount amount if any, else 0)
- "currency": string (ISO code e.g. USD, EUR, AUD)
Example: {"seller": "Apple", "date": "2024-01-01", "amount": 100.50, "tax": 10.05, "invoiceNumber": "INV-001"}"""
        
        payload = {"model": MODEL, "prompt": prompt, "images": [small_b64], "stream": False, "options": {"temperature": 0.0}}
        log(f"  Requesting all basic fields (Single Shot)...")
        
        try:
            # Increase timeout specifically for vision tasks on CPU
            response = requests.post(OLLAMA_API, json=payload, timeout=300)
            if response.status_code == 200:
                raw_json = response.json().get("response", "").strip()
                cleaned = raw_json
                if "```" in cleaned:
                    match = re.search(r"\{.*\}", cleaned, re.DOTALL)
                    cleaned = match.group(0) if match else raw_json
                
                try:
                    basic_data = json.loads(cleaned)
                    extracted_data["seller"] = str(basic_data.get("seller", "Unknown"))
                    extracted_data["seller_address"] = str(basic_data.get("seller_address", ""))
                    extracted_data["customer_name"] = str(basic_data.get("customer_name", "Unknown"))
                    extracted_data["customer_address"] = str(basic_data.get("customer_address", ""))
                    extracted_data["date"] = str(basic_data.get("date", "2026-01-01"))
                    extracted_data["due_date"] = str(basic_data.get("due_date", ""))
                    extracted_data["amount"] = float(basic_data.get("amount", 0.0))
                    extracted_data["tax"] = float(basic_data.get("tax", 0.0))
                    extracted_data["invoiceNumber"] = str(basic_data.get("invoiceNumber", "N/A"))
                    extracted_data["discount"] = float(basic_data.get("discount", 0.0))
                    extracted_data["currency"] = str(basic_data.get("currency", "AUD"))
                    log(f"  SUCCESS: Extracted basic fields for {image_path.name}")
                except Exception as e:
                    log(f"  WARNING: JSON parse error: {e}. Raw: {raw_json[:50]}")
            else:
                log(f"  OLLAMA ERROR: Status {response.status_code}")
        except Exception as e:
            log(f"  FAILED extraction: {e}")

        # 2. Extract Line Items (Robust AI pass)
        extracted_data["lineItems"] = []
        # If basics for some reason yielded "Unknown", we try one more targeted pass for seller
        if extracted_data["seller"] == "Unknown":
            log("  Retrying targeted seller extraction...")
            sel_prompt = "Extract ONLY the name of the company that issued this invoice. Reply with the name only."
            try:
                res = requests.post(OLLAMA_API, json={"model": MODEL, "prompt": sel_prompt, "images": [small_b64], "stream": False}, timeout=300)
                if res.status_code == 200:
                    extracted_data["seller"] = res.json().get("response", "").strip()
            except: pass
        if tatr_processor and tatr_model:
            log(f"  Detecting table with TATR...")
            # pil_img already loaded
            inputs = tatr_processor(images=pil_img, return_tensors="pt")
            outputs = tatr_model(**inputs)
            target_sizes = torch.tensor([pil_img.size[::-1]])
            results = tatr_processor.post_process_object_detection(outputs, threshold=0.2, target_sizes=target_sizes)[0]
            
            best_score, best_box = 0, None
            for score, label, box in zip(results["scores"], results["labels"], results["boxes"]):
                label_name = tatr_model.config.id2label[label.item()]
                if 'table' in label_name and score > best_score:
                    best_score = score
                    best_box = box.tolist()
            
            if best_box:
                pad = 20
                crop_box = (max(0, best_box[0]-pad), max(0, best_box[1]-pad), min(pil_img.width, best_box[2]+pad), min(pil_img.height, best_box[3]+pad))
                cropped_img = pil_img.crop(crop_box)
                buffered = io.BytesIO()
                cropped_img.save(buffered, format="JPEG")
                crop_b64 = base64.b64encode(buffered.getvalue()).decode('utf-8')
                
                # Send ONLY the cropped table to Qwen3-VL
                prompt = '''You are a meticulous data entry clerk. Extract all tabular line items from this cleanly cropped invoice table. Return ONLY a valid JSON array of objects. Format: [{"description": "item name", "quantity": 1.0, "unitPrice": 10.0, "amount": 10.0}]'''
                payload = {"model": MODEL, "prompt": prompt, "images": [crop_b64], "stream": False, "options": {"temperature": 0.0, "num_predict": 1000}}
                try:
                    res = requests.post(OLLAMA_API, json=payload, timeout=300)
                    if res.status_code == 200:
                        raw_lines = res.json().get("response", "").strip()
                        cleaned = raw_lines
                        if "```" in cleaned:
                            match = re.search(r"\[.*\]", cleaned, re.DOTALL)
                            cleaned = match.group(0) if match else raw_lines
                        extracted_data["lineItems"] = json.loads(cleaned)
                        log(f"  SUCCESS: Extracted {len(extracted_data['lineItems'])} line items.")
                except Exception as e:
                    log(f"  FAILED line items extraction: {e}")
                    extracted_data["lineItems"] = []
            else:
                log("  No table detected. Trying line item extraction from FULL image...")
                # Fallback: Request line items from full image if table detector failed
                full_prompt = '''Extract all tabular line items from this invoice image. Return ONLY a valid JSON array of objects. Format: [{"description": "item", "quantity": 1, "unitPrice": 10.0, "amount": 10.0}]'''
                try:
                    res = requests.post(OLLAMA_API, json={"model": MODEL, "prompt": full_prompt, "images": [small_b64], "stream": False}, timeout=300)
                    if res.status_code == 200:
                        raw_lines = res.json().get("response", "").strip()
                        cleaned = raw_lines
                        if "```" in cleaned:
                            match = re.search(r"\[.*\]", cleaned, re.DOTALL)
                            cleaned = match.group(0) if match else raw_lines
                        extracted_data["lineItems"] = json.loads(cleaned)
                        log(f"  SUCCESS (Fallback): Extracted {len(extracted_data['lineItems'])} line items.")
                except:
                    extracted_data["lineItems"] = []
                    log("  WARNING: Could not extract line items from full image.")
        else:
             extracted_data["lineItems"] = []

        return extracted_data, image_path.name

    except Exception as e:
        log(f"  CRITICAL ERROR processing {image_path.name}: {e}")
        import traceback
        log(traceback.format_exc())
        return None, None

def save_to_db(invoice_data, filename):
    """Save extracted data to SQLite."""
    if not invoice_data:
        return
    
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Robust numeric parsing
        def clean_num(s):
            if not s: return 0.0
            res = re.sub(r'[^\d\.,]', '', str(s))
            if not res: return 0.0
            if ',' in res and '.' in res: res = res.replace(',', '')
            elif ',' in res: res = res.replace(',', '.')
            try: return float(res)
            except: return 0.0

        inv_id = f"fatura-{uuid.uuid4().hex[:12]}"
        cursor.execute(
            """INSERT INTO invoices (
                id, seller, amount, tax, date, status, raw_json, image_url, 
                invoice_number, due_date, customer_name, customer_address, 
                seller_address, discount, currency
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                inv_id,
                invoice_data.get("seller", "Unknown"),
                clean_num(invoice_data.get("amount")),
                clean_num(invoice_data.get("tax")),
                invoice_data.get("date", "2026-01-01")[:10],
                "Verified",
                json.dumps(invoice_data),
                f"/fatura_images/{filename}",
                invoice_data.get("invoiceNumber", "N/A"),
                invoice_data.get("due_date", ""),
                invoice_data.get("customer_name", "Unknown"),
                invoice_data.get("customer_address", ""),
                invoice_data.get("seller_address", ""),
                clean_num(invoice_data.get("discount")),
                invoice_data.get("currency", "AUD")
            )
        )
        conn.commit()
        conn.close()
        log(f"  SUCCESS: Saved {filename} as {inv_id}")
    except Exception as e:
        log(f"  DB ERROR for {filename}: {e}")

def main():
    if not FATURA_DIR.exists():
        log(f"ERROR: Image directory {FATURA_DIR} not found.")
        return

    # Process the full dataset (e.g. 10,000+ invoices) for comprehensive ingestion
    image_files = sorted(list(FATURA_DIR.glob("*.jpg")))
    total = len(image_files)
    log(f"Found {total} images. Starting full ingestion batch...")
    
    for i, img in enumerate(image_files):
        log(f"Progress: [{i+1}/{total}] processing {img.name}")
        data, fname = process_invoice(img)
        if data:
            save_to_db(data, fname)
        # Let CPU/GPU breathe between 10k real vision model requests
        time.sleep(2)

if __name__ == "__main__":
    main()
