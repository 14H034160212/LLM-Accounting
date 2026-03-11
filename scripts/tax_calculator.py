import sqlite3
import pandas as pd
import json
from pathlib import Path

# Config
DB_PATH = Path('/data/qbao775/llm-accounting/data/data.db')

def calculate_taxes():
    """Calculate real-time tax liability from ingested invoices."""
    try:
        conn = sqlite3.connect(DB_PATH)
        df = pd.read_sql_query("SELECT amount, tax, date FROM invoices", conn)
        conn.close()

        if df.empty:
            return {"status": "no_data"}

        # Convert to datetime
        df['date'] = pd.to_datetime(df['date'], errors='coerce')
        df = df.dropna(subset=['date'])

        # Monthly Aggregation
        monthly = df.set_index('date').resample('M').sum().reset_index()
        monthly['date'] = monthly['date'].dt.strftime('%b %Y')

        # Current Quarter GST (Assuming current is last month in data)
        latest_month = monthly.iloc[-1]
        
        return {
            "status": "success",
            "total_gst_input": float(df['tax'].sum()),
            "total_expenditure": float(df['amount'].sum()),
            "monthly_trends": monthly[['date', 'amount', 'tax']].to_dict(orient='records'),
            "current_period_estimate": {
                "month": latest_month['date'],
                "gst": float(latest_month['tax']),
                "net": float(latest_month['amount'])
            }
        }

    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    result = calculate_taxes()
    print(json.dumps(result, indent=2))
