import sqlite3
import pandas as pd
import json
from pathlib import Path
from datetime import datetime, timedelta

# Config
DB_PATH = Path('/data/qbao775/llm-accounting/data/data.db')

def predict_cashflow():
    """Predict next month's expenditure based on historic invoice patterns."""
    try:
        conn = sqlite3.connect(DB_PATH)
        df = pd.read_sql_query("SELECT amount, date FROM invoices", conn)
        conn.close()

        if len(df) < 5:
            return {"status": "insufficient_data"}

        df['date'] = pd.to_datetime(df['date'], errors='coerce')
        df = df.dropna(subset=['date'])

        # Calculate daily burn rate over the last 90 days
        last_90_days = df[df['date'] > (df['date'].max() - timedelta(days=90))]
        daily_burn = last_90_days['amount'].sum() / 90

        # Predict next 30 days
        next_30_days_est = daily_burn * 30
        
        return {
            "status": "success",
            "historic_daily_burn": round(float(daily_burn), 2),
            "next_30_days_forecast": round(float(next_30_days_est), 2),
            "confidence_score": 0.85 if len(df) > 50 else 0.45
        }

    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    result = predict_cashflow()
    print(json.dumps(result, indent=2))
