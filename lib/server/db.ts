import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import path from "node:path";

const g = globalThis as unknown as { __enlaceDb?: DatabaseSync };
export function db(): DatabaseSync {
  if (g.__enlaceDb) return g.__enlaceDb;
  const dir = process.env.DATA_DIR || path.join(process.cwd(), ".data");
  mkdirSync(dir, { recursive: true });
  const d = new DatabaseSync(path.join(dir, "enlace.db"));
  d.exec(`
    PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;
    CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, name TEXT NOT NULL, pass TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'casal', created_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, expires_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS weddings (id TEXT PRIMARY KEY, owner_id TEXT NOT NULL REFERENCES users(id), gift_token TEXT UNIQUE NOT NULL, schedule_token TEXT UNIQUE NOT NULL, created_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS members (wedding_id TEXT NOT NULL REFERENCES weddings(id) ON DELETE CASCADE, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, role TEXT NOT NULL, PRIMARY KEY (wedding_id, user_id));
    CREATE TABLE IF NOT EXISTS member_invites (token TEXT PRIMARY KEY, wedding_id TEXT NOT NULL REFERENCES weddings(id) ON DELETE CASCADE, email TEXT NOT NULL, role TEXT NOT NULL, created_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS records (wedding_id TEXT NOT NULL REFERENCES weddings(id) ON DELETE CASCADE, coll TEXT NOT NULL, id TEXT NOT NULL, body TEXT NOT NULL, deleted INTEGER NOT NULL DEFAULT 0, seq INTEGER NOT NULL, PRIMARY KEY (wedding_id, coll, id));
    CREATE INDEX IF NOT EXISTS records_seq ON records (wedding_id, seq);
    CREATE TABLE IF NOT EXISTS counters (wedding_id TEXT PRIMARY KEY, seq INTEGER NOT NULL DEFAULT 0);
    CREATE TABLE IF NOT EXISTS invitations (token TEXT PRIMARY KEY, wedding_id TEXT NOT NULL REFERENCES weddings(id) ON DELETE CASCADE, family TEXT NOT NULL, UNIQUE (wedding_id, family));
  `);
  return (g.__enlaceDb = d);
}
export const now = () => Date.now();
export type Row = Record<string, unknown>;
export const all = <T = Row>(sql: string, ...p: (string | number | null)[]) => db().prepare(sql).all(...p) as unknown as T[];
export const one = <T = Row>(sql: string, ...p: (string | number | null)[]) => (db().prepare(sql).get(...p) as unknown as T) ?? null;
export const run = (sql: string, ...p: (string | number | null)[]) => db().prepare(sql).run(...p);
export function tx<T>(fn: () => T): T { const d = db(); d.exec("BEGIN IMMEDIATE"); try { const r = fn(); d.exec("COMMIT"); return r; } catch (e) { d.exec("ROLLBACK"); throw e; } }

/** Próximo número de sequência do casamento (ordena as mudanças para o polling). */
export function nextSeq(weddingId: string): number {
  run("INSERT INTO counters (wedding_id, seq) VALUES (?, 1) ON CONFLICT(wedding_id) DO UPDATE SET seq = seq + 1", weddingId);
  return one<{ seq: number }>("SELECT seq FROM counters WHERE wedding_id = ?", weddingId)!.seq;
}
export function putRecord(weddingId: string, coll: string, id: string, body: unknown | null) {
  const seq = nextSeq(weddingId);
  run("INSERT INTO records (wedding_id, coll, id, body, deleted, seq) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(wedding_id, coll, id) DO UPDATE SET body = excluded.body, deleted = excluded.deleted, seq = excluded.seq", weddingId, coll, id, body === null ? "null" : JSON.stringify(body), body === null ? 1 : 0, seq);
  return seq;
}
export function getRecord<T = unknown>(weddingId: string, coll: string, id: string): T | null {
  const r = one<{ body: string; deleted: number }>("SELECT body, deleted FROM records WHERE wedding_id = ? AND coll = ? AND id = ?", weddingId, coll, id);
  return r && !r.deleted ? (JSON.parse(r.body) as T) : null;
}
export function listRecords<T = unknown>(weddingId: string, coll: string): T[] {
  return all<{ body: string }>("SELECT body FROM records WHERE wedding_id = ? AND coll = ? AND deleted = 0 ORDER BY seq", weddingId, coll).map((r) => JSON.parse(r.body) as T);
}
