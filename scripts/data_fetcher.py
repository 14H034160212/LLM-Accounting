import requests
import json
import os
import time
from pathlib import Path

# Paths
BASE_DIR = Path("/data/qbao775/llm-accounting")
DATA_DIR = BASE_DIR / "data"
REPORTS_DIR = DATA_DIR / "reports"
ANN_JSON = DATA_DIR / "announcements_asx.json"

# Ensure directories exist
REPORTS_DIR.mkdir(parents=True, exist_ok=True)

def download_reports():
    exchanges = [
        ("ASX", DATA_DIR / "announcements_asx.json"),
        ("NZX", DATA_DIR / "announcements_nzx.json")
    ]
    
    session = requests.Session()
    session.headers.update({
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    })
    
    total_count = 0
    for prefix, json_path in exchanges:
        if not json_path.exists():
            print(f"Metadata not found for {prefix}: {json_path}")
            continue
            
        with open(json_path, 'r') as f:
            announcements = json.load(f)
            
        print(f"--- Processing {prefix} ---")
        count = 0
        for ann in announcements:
            ticker = ann['ticker']
            url = ann['pdf_link']
            title = ann['headline']
            
            # Construct filename
            if prefix == "ASX":
                doc_key = url.split('/')[-1].split('&')[0]
            else:
                doc_key = url.split('/')[-1].replace('.pdf', '')
                
            filename = f"{prefix}_{ticker}_{doc_key}.pdf"
            filepath = REPORTS_DIR / filename
            
            if filepath.exists():
                print(f"Skipping (exists): {filename}")
                continue
                
            print(f"Downloading {ticker}: {title}...")
            try:
                resp = session.get(url, stream=True)
                if resp.status_code == 200:
                    with open(filepath, 'wb') as f_out:
                        for chunk in resp.iter_content(chunk_size=8192):
                            f_out.write(chunk)
                    print(f"Saved: {filename}")
                    count += 1
                else:
                    print(f"Failed to download {ticker}: {resp.status_code}")
            except Exception as e:
                print(f"Error downloading {ticker}: {e}")
                
            time.sleep(1) # Be nice
        
        print(f"Finished {prefix}. Downloaded {count} reports.")
        total_count += count
        
    print(f"All done. Total downloaded in this run: {total_count}")

if __name__ == "__main__":
    download_reports()
