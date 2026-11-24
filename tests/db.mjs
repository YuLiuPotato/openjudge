import { DatabaseSync } from 'node:sqlite';

export function makeDb() {
  const db = new DatabaseSync(':memory:');
  db.exec(`PRAGMA foreign_keys = ON;
    CREATE TABLE decisions (id TEXT PRIMARY KEY, author_id TEXT NOT NULL, title TEXT NOT NULL, context TEXT NOT NULL, option_a TEXT NOT NULL, option_b TEXT NOT NULL, option_a_description TEXT NOT NULL DEFAULT '', option_b_description TEXT NOT NULL DEFAULT '', category TEXT NOT NULL, goal TEXT NOT NULL, risk TEXT NOT NULL, created_at INTEGER NOT NULL);
    CREATE TABLE reviews (id TEXT PRIMARY KEY, decision_id TEXT NOT NULL REFERENCES decisions(id) ON DELETE CASCADE, author_id TEXT NOT NULL, choice TEXT NOT NULL, angle TEXT NOT NULL, reason TEXT NOT NULL, created_at INTEGER NOT NULL, allow_contact INTEGER NOT NULL DEFAULT 0, UNIQUE(decision_id, author_id));
    CREATE TABLE identity_keys (user_id TEXT PRIMARY KEY, backup TEXT NOT NULL, fingerprint TEXT NOT NULL);
    CREATE TABLE conversations (id TEXT PRIMARY KEY, decision_id TEXT NOT NULL REFERENCES decisions(id) ON DELETE CASCADE, review_id TEXT NOT NULL UNIQUE REFERENCES reviews(id) ON DELETE CASCADE, author_id TEXT NOT NULL, reviewer_id TEXT NOT NULL, created_at INTEGER NOT NULL);
    CREATE TABLE messages (id TEXT PRIMARY KEY, conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE, sender_id TEXT NOT NULL, body TEXT NOT NULL, created_at INTEGER NOT NULL);`);
  return {
    prepare(sql) {
      return { bind(...values) {
        const stmt = db.prepare(sql);
        return {
          async first() { return stmt.get(...values) ?? null; },
          async all() { return { results: stmt.all(...values) }; },
          async run() { const result = stmt.run(...values); return { meta: { changes: Number(result.changes) } }; },
        };
      }};
    },
    async batch(statements) {
      db.exec('BEGIN');
      try { const results = []; for (const statement of statements) results.push(await statement.run()); db.exec('COMMIT'); return results; }
      catch (error) { db.exec('ROLLBACK'); throw error; }
    },
  };
}
