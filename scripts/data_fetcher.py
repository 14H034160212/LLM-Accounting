import requests
import json
import os
import time
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor

# Paths
BASE_DIR = Path("/data/qbao775/llm-accounting")
DATA_DIR = BASE_DIR / "data"
REPORTS_DIR = DATA_DIR / "reports"

# Ensure directories exist
REPORTS_DIR.mkdir(parents=True, exist_ok=True)

def download_file(session, url, prefix, ticker, title):
    # Construct filename
    if prefix == "ASX":
        doc_key = url.split('/')[-1].split('&')[0]
    else:
        doc_key = url.split('/')[-1].replace('.pdf', '')
        
    filename = f"{prefix}_{ticker}_{doc_key}.pdf"
    filepath = REPORTS_DIR / filename
    
    if filepath.exists():
        return f"Skipping (exists): {filename}"
        
    try:
        resp = session.get(url, stream=True, timeout=30)
        if resp.status_code == 200:
            with open(filepath, 'wb') as f_out:
                for chunk in resp.iter_content(chunk_size=8192):
                    f_out.write(chunk)
            return f"Saved: {filename}"
        else:
            return f"Failed {ticker}: {resp.status_code}"
    except Exception as e:
        return f"Error {ticker}: {e}"

def download_reports():
    exchanges = [
        ("ASX", DATA_DIR / "announcements_asx.json"),
        ("NZX", DATA_DIR / "announcements_nzx.json")
    ]
    
    session = requests.Session()
    session.headers.update({
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    })
    
    all_tasks = []
    for prefix, json_path in exchanges:
        if not json_path.exists():
            continue
            
        with open(json_path, 'r') as f:
            announcements = json.load(f)
            
        for ann in announcements:
            all_tasks.append((prefix, ann['ticker'], ann['pdf_link'], ann['headline']))

    print(f"Starting bulk download of {len(all_tasks)} reports...")
    
    # Use ThreadPoolExecutor for concurrent downloads
    with ThreadPoolExecutor(max_workers=5) as executor:
        futures = [executor.submit(download_file, session, task[2], task[0], task[1], task[3]) for task in all_tasks]
        for future in futures:
            print(future.result())

    print("Bulk download complete.")

if __name__ == "__main__":
    download_reports()
