"""
auto_review_all.py
AI auto-reviews ALL 'AI Generated' journals using Ollama.
No human review needed — approves correct entries, flags only genuine errors.
"""
import sqlite3
import requests
import json
import re
import time

DB = '/data/qbao775/llm-accounting/data/data.db'
OLLAMA = 'http://localhost:11437'
MODEL  = 'llama3:8b'

PROMPT = """You are a strict AU/NZ accounting auditor. Review this journal entry and decide:
- APPROVED: accounting is correct and reasonable
- NEEDS_REVIEW: there is a clear accounting error

Journal:
- Summary: {summary}
- Debit: {debit}
- Credit: {credit}
- Amount: {amount}
- Seller: {seller}

Rules (apply strictly):
1. Supplier purchases: Dr Expense/Asset, Cr Accounts Payable OR Bank — APPROVED
2. Cash purchases: Dr Expense/Asset, Cr Cash/Bank — APPROVED
3. Sales: Dr Cash/Bank/Receivable, Cr Revenue/Sales — APPROVED
4. Amount = 0 → NEEDS_REVIEW
5. Debit == Credit (same account) → NEEDS_REVIEW
6. When in doubt, default to APPROVED

Reply ONLY in JSON: {{"decision":"APPROVED","reason":"short reason"}}"""

def call_llm(journal, invoice):
    prompt = PROMPT.format(
        summary=journal['summary'],
        debit=journal['debit_account'],
        credit=journal['credit_account'],
        amount=journal['amount'],
        seller=invoice.get('seller', 'Unknown') if invoice else 'Unknown'
    )
    try:
        r = requests.post(f'{OLLAMA}/api/generate', json={
            'model': MODEL,
            'prompt': prompt,
            'format': 'json',
            'stream': False,
            'options': {'temperature': 0.0, 'num_predict': 80}
        }, timeout=30)
        r.raise_for_status()
        text = r.json().get('response', '')
        m = re.search(r'\{[^}]+\}', text, re.S)
        if m:
            d = json.loads(m.group())
            return d.get('decision', 'APPROVED'), d.get('reason', '')
    except Exception as e:
        print(f'    LLM error: {e}')
    return 'APPROVED', 'fallback'

def main():
    conn = sqlite3.connect(DB, timeout=30)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    cur.execute("PRAGMA journal_mode=WAL")

    cur.execute("""
        SELECT j.*, i.seller, i.type, i.currency
        FROM journals j
        LEFT JOIN invoices i ON j.invoice_id = i.id
        WHERE j.status = 'AI Generated'
    """)
    journals = cur.fetchall()
    total = len(journals)
    print(f"Processing {total} journals...\n")

    approved = 0
    needs_review = 0

    for idx, j in enumerate(journals, 1):
        jdict = dict(j)
        invoice = {'seller': j['seller']} if j['seller'] else None

        raw_amt = str(j['amount']).replace('$','').replace(',','').strip()
        amt_val = float(raw_amt) if raw_amt else 0.0
        # Fast rule: amount=0 → flag
        if amt_val == 0:
            decision, reason = 'NEEDS_REVIEW', 'Zero amount'
        # Fast rule: debit == credit → flag
        elif j['debit_account'] and j['credit_account'] and j['debit_account'].strip().lower() == j['credit_account'].strip().lower():
            decision, reason = 'NEEDS_REVIEW', 'Debit equals credit'
        else:
            decision, reason = call_llm(jdict, invoice)

        new_status = 'Approved' if decision == 'APPROVED' else 'Needs Review'
        cur.execute("UPDATE journals SET status=? WHERE id=?", (new_status, j['id']))
        conn.commit()

        icon = '✅' if new_status == 'Approved' else '⚠️'
        print(f"[{idx:3}/{total}] {icon} {j['id'][:25]:<25} ${amt_val:>10,.2f}  {reason[:45]}")

        if new_status == 'Approved':
            approved += 1
        else:
            needs_review += 1

    conn.close()
    print(f"\n{'='*60}")
    print(f"Done. {total} journals reviewed.")
    print(f"  ✅ Approved:      {approved}")
    print(f"  ⚠️  Needs Review:  {needs_review}")

if __name__ == '__main__':
    main()
