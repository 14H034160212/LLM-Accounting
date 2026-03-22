import sqlite3
import pandas as pd
import json
from pathlib import Path

# Config
DB_PATH = Path('/data/qbao775/llm-accounting/data/data.db')

def analyze_audit():
    """Consolidated audit analysis including anomalies and categories."""
    try:
        conn = sqlite3.connect(DB_PATH)
        df = pd.read_sql_query("SELECT id, seller, amount, date FROM invoices WHERE reextract_status = 'completed'", conn)
        
        # Also get journals context
        journals_df = pd.read_sql_query("SELECT * FROM journals", conn)
        conn.close()

        if len(df) < 5:
            return {"status": "insufficient_data", "count": len(df)}

        df['amount'] = pd.to_numeric(df['amount'], errors='coerce')
        df['date'] = pd.to_datetime(df['date'], errors='coerce')
        df = df.dropna(subset=['amount', 'date'])

        alerts = []

        # 1. Price Outliers per Seller
        for seller in df['seller'].unique():
            if not seller: continue
            seller_df = df[df['seller'] == seller]
            if len(seller_df) >= 3:
                mean = seller_df['amount'].mean()
                std = seller_df['amount'].std()
                outliers = seller_df[seller_df['amount'] > (mean + 2 * std)]
                for _, row in outliers.iterrows():
                    alerts.append({
                        "type": "Price Anomaly",
                        "severity": "High" if row['amount'] > (mean + 3 * std) else "Medium",
                        "description": f"Invoice from {seller} for ${row['amount']:.2f} is significantly above average.",
                        "invoice_id": row['id']
                    })

        # 2. Duplicate Detection (Same seller, same amount, same date)
        duplicates = df[df.duplicated(subset=['seller', 'amount', 'date'], keep=False)]
        for _, row in duplicates.iterrows():
            # Avoid adding multiple alerts for the same pair
            alerts.append({
                "type": "Duplicate Risk",
                "severity": "High",
                "description": f"Potential duplicate from {row['seller']} on {row['date'].strftime('%Y-%m-%d')}.",
                "invoice_id": row['id']
            })

        # 3. Vendor Concentration
        total_spend = df['amount'].sum()
        if total_spend > 0:
            vendor_spend = df.groupby('seller')['amount'].sum().sort_values(ascending=False)
            top_vendor = vendor_spend.index[0]
            concentration = (vendor_spend.iloc[0] / total_spend) * 100
            if concentration > 40:
                alerts.append({
                    "type": "Risk Concentration",
                    "severity": "Medium",
                    "description": f"High reliance on {top_vendor} ({concentration:.1f}% of total spend).",
                    "invoice_id": None
                })

        return {
            "status": "success",
            "total_documents": len(df),
            "alerts": alerts[:15]
        }

    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    result = analyze_audit()
    print(json.dumps(result, indent=2))
