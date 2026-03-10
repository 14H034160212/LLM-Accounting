import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Ensure the data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(path.join(dataDir, 'data.db'));

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY,
    seller TEXT,
    buyer TEXT,
    amount REAL,
    tax REAL,
    date TEXT,
    type TEXT,
    status TEXT,
    currency TEXT,
    raw_json TEXT,
    image_url TEXT
  );
`);

try {
  db.exec("ALTER TABLE invoices ADD COLUMN image_url TEXT;");
} catch (e) {
  // column might already exist
}

db.exec(`
  CREATE TABLE IF NOT EXISTS journals (
    id TEXT PRIMARY KEY,
    invoice_id TEXT,
    summary TEXT,
    debit_account TEXT,
    credit_account TEXT,
    amount REAL,
    date TEXT,
    status TEXT,
    ai_generated BOOLEAN,
    FOREIGN KEY(invoice_id) REFERENCES invoices(id)
  );

  CREATE TABLE IF NOT EXISTS tax_records (
    id TEXT PRIMARY KEY,
    period TEXT,
    output_tax REAL,
    input_tax REAL,
    net_payable REAL,
    status TEXT,
    deadline TEXT
  );
`);

export default db;
