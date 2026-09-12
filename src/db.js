// Uses Node.js's built-in SQLite module (node:sqlite) instead of the
// better-sqlite3 npm package. This avoids native compilation entirely
// (no Visual Studio / build tools needed on Windows) — it just works as
// long as Node.js is 22.5+ (stable/RC since Node 24.15, no flag needed).
import { DatabaseSync } from 'node:sqlite';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const dbPath = process.env.DB_PATH || './data/atomix.db';
const resolvedPath = path.isAbsolute(dbPath) ? dbPath : path.join(process.cwd(), dbPath);
fs.mkdirSync(path.dirname(resolvedPath), { recursive: true });

export const db = new DatabaseSync(resolvedPath);
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

// Generic JSON-document collections. Each row is one entity of that type,
// stored as a JSON blob in `data`, so the schema matches the frontend's
// TypeScript types exactly without needing a rigid relational mapping.
export const COLLECTIONS = [
  'patients',
  'staff',
  'medicines',
  'vending_machines',
  'robots',
  'iot_devices',
  'visits',
  'prescriptions',
  'audit_logs',
  'alerts',
  'traceability',
  'emergencies',
  'camera_nodes',
];

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL,
      department TEXT,
      title TEXT,
      badge_id TEXT,
      avatar_url TEXT,
      last_login TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  for (const table of COLLECTIONS) {
    db.exec(`
      CREATE TABLE IF NOT EXISTS ${table} (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );
    `);
  }
}

function isEmpty(table) {
  const row = db.prepare(`SELECT COUNT(*) as c FROM ${table}`).get();
  return row.c === 0;
}

function seedDatabase() {
  const seedPath = path.join(__dirname, 'seed', 'seed-data.json');
  if (!fs.existsSync(seedPath)) {
    console.warn('No seed-data.json found, skipping seed.');
    return;
  }
  const seed = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));

  const insertDoc = (table) =>
    db.prepare(`INSERT INTO ${table} (id, data) VALUES (?, ?)`);

  const mapping = {
    patients: seed.patients,
    staff: seed.staff,
    medicines: seed.medicines,
    vending_machines: seed.vendingMachines,
    robots: seed.robots,
    iot_devices: seed.iotDevices,
    visits: seed.visits,
    prescriptions: seed.prescriptions,
    audit_logs: seed.auditLogs,
    alerts: seed.alerts,
    traceability: seed.traceability,
    emergencies: seed.emergencies,
    camera_nodes: seed.cameraNodes || [],
  };

  const txn = () => {
    for (const [table, rows] of Object.entries(mapping)) {
      if (!isEmpty(table)) continue;
      const stmt = insertDoc(table);
      for (const row of rows || []) {
        const idField = row.id || row.transactionId;
        stmt.run(idField, JSON.stringify(row));
      }
      console.log(`Seeded ${table}: ${(rows || []).length} rows`);
    }

    if (isEmpty('users')) {
      const insertUser = db.prepare(`
        INSERT INTO users (id, name, email, password_hash, role, department, title, badge_id, avatar_url, last_login)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const u of seed.users || []) {
        insertUser.run(
          u.id,
          u.name,
          u.email.toLowerCase(),
          bcrypt.hashSync(u.password, 10),
          u.role,
          u.department || null,
          u.title || null,
          u.badgeId || null,
          u.avatarUrl || null,
          u.lastLogin || null
        );
      }
      console.log(`Seeded users: ${(seed.users || []).length} rows`);
    }
  };

  // node:sqlite's DatabaseSync has no .transaction() helper (unlike
  // better-sqlite3), so we wrap the seed step in a manual transaction.
  db.exec('BEGIN');
  try {
    txn();
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

export function initDb() {
  initSchema();
  seedDatabase();
}
