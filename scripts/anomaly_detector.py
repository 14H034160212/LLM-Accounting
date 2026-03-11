import sqlite3
import pandas as pd
import json
from pathlib import Path

# Config
DB_PATH = Path('/data/qbao775/llm-accounting/data/data.db')

def analyze_anomalies():
    """Analyze invoice data for anomalies using statistical methods."""
    try:
        conn = sqlite3.connect(DB_PATH)
        df = pd.read_sql_query("SELECT id, seller, amount, date FROM invoices", conn)
        conn.close()

        if len(df) < 10:
            return {"status": "insufficient_data", "count": len(df)}

        anomalies = []

        # 1. Price Outliers per Seller
        for seller in df['seller'].unique():
            seller_df = df[df['seller'] == seller]
            if len(seller_df) >= 3:
                mean = seller_df['amount'].mean()
                std = seller_df['amount'].std()
                # Flag anything 2 standard deviations above mean
                outliers = seller_df[seller_df['amount'] > (mean + 2 * std)]
                for _, row in outliers.iterrows():
                    anomalies.append({
                        "type": "Price Outlier",
                        "severity": "High" if row['amount'] > (mean + 3 * std) else "Medium",
                        "description": f"Invoice from {seller} for ${row['amount']} is significantly above average (${mean:.2f}).",
                        "invoice_id": row['id']
                    })

        # 2. Potential Double Billing
        # Sort by date and check for same day, same amount, same seller
        duplicates = df[df.duplicated(subset=['seller', 'amount', 'date'], keep=False)]
        for _, row in duplicates.iterrows():
             anomalies.append({
                "type": "Duplicate Risk",
                "severity": "High",
                "description": f"Potential duplicate invoice from {row['seller']} for ${row['amount']} on {row['date']}.",
                "invoice_id": row['id']
            })

        return {
            "status": "success",
            "total_processed": len(df),
            "anomalies_found": len(anomalies),
            "results": anomalies[:10] # Return top 10
        }

    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    result = analyze_anomalies()
    print(json.dumps(result, indent=2))
