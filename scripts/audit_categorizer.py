import sqlite3
import json
from pathlib import Path

# Config
DB_PATH = Path('/data/qbao775/llm-accounting/data/data.db')

def categorize_invoices():
    """Simulate an AI agent categorizing raw invoices into Audit-Ready Ledgers."""
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # Fetch up to 50 recent uncategorized invoices
        cursor.execute("SELECT id, invoice_id, seller_name, amount, date FROM invoices ORDER BY id DESC LIMIT 50")
        rows = cursor.fetchall()
        
        categories = {
            "Operating Expenses (OpEx)": [],
            "Capital Expenditures (CapEx)": [],
            "Cost of Goods Sold (COGS)": [],
            "Unclassified / Flagged for Review": []
        }

        # Simple heuristic + keyword mapping (simulating an LLM classification pass for speed)
        for row in rows:
            seller = (row['seller_name'] or "").upper()
            amount = float(row['amount'] or 0)
            
            item = {
                "id": row['invoice_id'],
                "seller": row['seller_name'],
                "amount": amount,
                "date": row['date']
            }

            if amount > 5000:
                categories["Capital Expenditures (CapEx)"].append(item)
            elif any(keyword in seller for keyword in ["LCO", "TECH", "SOFTWARE", "CLOUD"]):
                categories["Operating Expenses (OpEx)"].append(item)
            elif any(keyword in seller for keyword in ["SUPPLY", "LOGISTICS", "FREIGHT"]):
                categories["Cost of Goods Sold (COGS)"].append(item)
            else:
                categories["Unclassified / Flagged for Review"].append(item)

        conn.close()

        # Summarize
        summary = {k: len(v) for k, v in categories.items()}
        
        return {
            "status": "success",
            "summary": summary,
            "details": categories
        }

    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    result = categorize_invoices()
    print(json.dumps(result, indent=2))
