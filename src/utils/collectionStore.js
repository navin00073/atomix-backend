import { db } from '../db.js';
import { nanoid } from 'nanoid';

/**
 * Generic helper for CRUD operations on a JSON-document table.
 * Every row is { id, data: JSON, created_at, updated_at }.
 */
export function createCollectionStore(table) {
  // Statements are prepared lazily (on first use) rather than at construction
  // time, because routers are built at import time, before initDb() has had
  // a chance to create the tables.
  let stmts = null;
  function getStmts() {
    if (!stmts) {
      stmts = {
        list: db.prepare(`SELECT data FROM ${table} ORDER BY created_at ASC`),
        get: db.prepare(`SELECT data FROM ${table} WHERE id = ?`),
        insert: db.prepare(`INSERT INTO ${table} (id, data) VALUES (?, ?)`),
        update: db.prepare(`UPDATE ${table} SET data = ?, updated_at = datetime('now') WHERE id = ?`),
        del: db.prepare(`DELETE FROM ${table} WHERE id = ?`),
      };
    }
    return stmts;
  }

  function parseRow(row) {
    return row ? JSON.parse(row.data) : null;
  }

  return {
    /** Return all documents, optionally filtered by a predicate. */
    list(filterFn) {
      const all = getStmts().list.all().map(parseRow);
      return filterFn ? all.filter(filterFn) : all;
    },
    get(id) {
      return parseRow(getStmts().get.get(id));
    },
    create(doc, idPrefix = 'ID') {
      const id = doc.id || `${idPrefix}-${nanoid(8).toUpperCase()}`;
      const full = { ...doc, id };
      getStmts().insert.run(id, JSON.stringify(full));
      return full;
    },
    update(id, patch) {
      const existing = this.get(id);
      if (!existing) return null;
      const merged = { ...existing, ...patch, id };
      getStmts().update.run(JSON.stringify(merged), id);
      return merged;
    },
    replace(id, doc) {
      const existing = this.get(id);
      if (!existing) return null;
      const full = { ...doc, id };
      getStmts().update.run(JSON.stringify(full), id);
      return full;
    },
    delete(id) {
      const existing = this.get(id);
      if (!existing) return false;
      getStmts().del.run(id);
      return true;
    },
  };
}
