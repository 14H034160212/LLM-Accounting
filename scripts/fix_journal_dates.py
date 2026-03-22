"""
fix_journal_dates.py
Re-extracts dates for journals/invoices that have YYYY-MM-DD placeholder dates.
Phase 1: Extract all dates via VLM (no DB writes).
Phase 2: Batch-update DB with retry to handle concurrent lock from batch_processor.
"""
import sqlite3
import json
import requests
import base64
import re
import time
from pathlib import Path
from datetime import date
from typing import Optional

DB_PATH = '/data/qbao775/llm-accounting/data/data.db'
IMAGE_BASE = Path('/data/qbao775/llm-accounting/data/fatura_raw/FATURA_EXTRACT/invoices_dataset_final/images')
OLLAMA_BASE_URL = "http://localhost:11437"
VISION_MODEL = "qwen3-vl:latest"
FALLBACK_DATE = date.today().isoformat()
PLACEHOLDER = 'YYYY-MM-DD'
DATE_RE = re.compile(r'\b(\d{4}-\d{2}-\d{2})\b')


def extract_date_from_image(image_path: Path) -> Optional[str]:
    try:
        with open(image_path, 'rb') as f:
            b64 = base64.b64encode(f.read()).decode()
        payload = {
            "model": VISION_MODEL,
            "prompt": (
                "Look at this invoice image. Find the invoice date (issue date / date of invoice). "
                "Reply with ONLY the date in YYYY-MM-DD format. "
                "If you cannot find a date, reply with the word: unknown"
            ),
            "images": [b64],
            "stream": False,
            "options": {"temperature": 0.0}
        }
        resp = requests.post(f"{OLLAMA_BASE_URL}/api/generate", json=payload, timeout=60)
        resp.raise_for_status()
        text = resp.json().get('response', '').strip()
        m = DATE_RE.search(text)
        return m.group(1) if m else None
    except Exception as e:
        print(f"  VLM error: {e}")
        return None


def db_update_with_retry(updates, max_retries=20, wait=10):
    """Update invoices and journals one-by-one with retry on lock."""
    done = 0
    for inv_id, new_date in updates:
        for attempt in range(max_retries):
            try:
                conn = sqlite3.connect(DB_PATH, timeout=60)
                cur = conn.cursor()
                cur.execute("PRAGMA journal_mode=WAL")
                cur.execute("UPDATE invoices SET date=? WHERE id=? AND date=?",
                            (new_date, inv_id, PLACEHOLDER))
                cur.execute("UPDATE journals SET date=? WHERE invoice_id=? AND date=?",
                            (new_date, inv_id, PLACEHOLDER))
                conn.commit()
                conn.close()
                done += 1
                print(f"  Updated [{inv_id}] → {new_date}")
                break
            except sqlite3.OperationalError as e:
                if 'locked' in str(e):
                    print(f"  DB locked for {inv_id}, retry {attempt+1}/{max_retries} in {wait}s...")
                    time.sleep(wait)
                else:
                    raise
        else:
            print(f"  SKIPPED {inv_id}: could not acquire lock after {max_retries} retries")
    return done


def main():
    conn = sqlite3.connect(DB_PATH, timeout=30)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    cur.execute("""
        SELECT DISTINCT i.id, i.image_url, i.seller
        FROM invoices i
        INNER JOIN journals j ON j.invoice_id = i.id
        WHERE j.date = ?
    """, (PLACEHOLDER,))
    invoices = cur.fetchall()
    conn.close()

    print(f"Found {len(invoices)} invoices with placeholder dates.\n")

    # Phase 1: Extract all dates (no DB writes)
    updates = []
    used_fallback = 0
    for inv in invoices:
        inv_id = inv['id']
        seller = inv['seller']
        image_url = inv['image_url']
        filename = Path(image_url).name if image_url else None
        img_path = IMAGE_BASE / filename if filename else None

        new_date = None
        if img_path and img_path.exists():
            print(f"[{inv_id}] {seller} — extracting from {img_path.name} ...")
            new_date = extract_date_from_image(img_path)
            if new_date:
                print(f"  → VLM: {new_date}")
            else:
                print(f"  → VLM failed, fallback: {FALLBACK_DATE}")
                new_date = FALLBACK_DATE
                used_fallback += 1
        else:
            print(f"[{inv_id}] {seller} — image not found, fallback: {FALLBACK_DATE}")
            new_date = FALLBACK_DATE
            used_fallback += 1

        updates.append((inv_id, new_date))

    # Phase 2: Write one by one
    print(f"\nAll dates collected. Writing {len(updates)} updates to DB (one at a time)...")
    done = db_update_with_retry(updates)
    vlm_count = len(updates) - used_fallback
    print(f"\nDone. {done}/{len(updates)} updated. ({vlm_count} from VLM, {used_fallback} fallback to today)")


if __name__ == "__main__":
    main()
