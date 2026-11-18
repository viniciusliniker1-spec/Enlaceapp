import postgres from "postgres";

/** Postgres em produção (DATABASE_URL: Neon, Supabase, Vercel Postgres…). Sem DATABASE_URL usa PGlite (Postgres em WASM, para dev e testes). */
export type Ex = {
  all<T = Record<string, unknown>>(sql: string, ...p: unknown[]): Promise<T[]>;
  one<T = Record<string, unknown>>(sql: string, ...p: unknown[]): Promise<T | null>;
  run(sql: string, ...p: unknown[]): Promise<void>;
};
type Raw = (text: string, params: unknown[]) => Promise<Record<string, unknown>[]>;
const conv = (s: string) => { let i = 0; return s.replace(/\?/g, () => `$${++i}`); };
const mk = (raw: Raw): Ex => ({
  all: async <T,>(sql: string, ...p: unknown[]) => (await raw(conv(sql), p)) as T[],
  one: async <T,>(sql: string, ...p: unknown[]) => ((await raw(conv(sql), p))[0] as T) ?? null,
  run: async (sql: string, ...p: unknown[]) => { await raw(conv(sql), p); },
});
interface Driver { ex: Ex; tx<T>(fn: (x: Ex) => Promise<T>): Promise<T>; }

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, name TEXT NOT NULL, pass TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'casal', created_at BIGINT NOT NULL);
CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, expires_at BIGINT NOT NULL);
CREATE TABLE IF NOT EXISTS weddings (id TEXT PRIMARY KEY, owner_id TEXT NOT NULL REFERENCES users(id), gift_token TEXT UNIQUE NOT NULL, schedule_token TEXT UNIQUE NOT NULL, created_at BIGINT NOT NULL);
CREATE TABLE IF NOT EXISTS members (wedding_id TEXT NOT NULL REFERENCES weddings(id) ON DELETE CASCADE, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, role TEXT NOT NULL, PRIMARY KEY (wedding_id, user_id));
CREATE TABLE IF NOT EXISTS member_invites (token TEXT PRIMARY KEY, wedding_id TEXT NOT NULL REFERENCES weddings(id) ON DELETE CASCADE, email TEXT NOT NULL, role TEXT NOT NULL, created_at BIGINT NOT NULL);
CREATE TABLE IF NOT EXISTS records (wedding_id TEXT NOT NULL REFERENCES weddings(id) ON DELETE CASCADE, coll TEXT NOT NULL, id TEXT NOT NULL, body TEXT NOT NULL, deleted INTEGER NOT NULL DEFAULT 0, seq INTEGER NOT NULL, PRIMARY KEY (wedding_id, coll, id));
CREATE INDEX IF NOT EXISTS records_seq ON records (wedding_id, seq);
CREATE TABLE IF NOT EXISTS counters (wedding_id TEXT PRIMARY KEY, seq INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS invitations (token TEXT PRIMARY KEY, wedding_id TEXT NOT NULL REFERENCES weddings(id) ON DELETE CASCADE, family TEXT NOT NULL, UNIQUE (wedding_id, family));
CREATE TABLE IF NOT EXISTS reset_tokens (token TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, expires_at BIGINT NOT NULL);
CREATE TABLE IF NOT EXISTS rate_hits (k TEXT NOT NULL, t BIGINT NOT NULL);
CREATE INDEX IF NOT EXISTS rate_hits_k ON rate_hits (k, t);
CREATE TABLE IF NOT EXISTS billing (scope TEXT PRIMARY KEY, status TEXT NOT NULL, trial_ends BIGINT NOT NULL, paid_until BIGINT NOT NULL DEFAULT 0, customer_id TEXT, subscription_id TEXT, updated_at BIGINT NOT NULL);
CREATE TABLE IF NOT EXISTS webhook_events (id TEXT PRIMARY KEY, t BIGINT NOT NULL);
`;
const g = globalThis as unknown as { __enlaceDrv?: Promise<Driver> };
async function init(): Promise<Driver> {
  const url = process.env.DATABASE_URL;
  let drv: Driver;
  if (url) {
    // Neon costuma incluir sslmode e channel_binding na URL; o driver recebe SSL por opção, então removemos os dois.
    let clean = url; try { const u = new URL(url); u.searchParams.delete("channel_binding"); u.searchParams.delete("sslmode"); clean = u.toString(); } catch { /* usa a URL original */ }
    const sql = postgres(clean, { max: 1, prepare: false, idle_timeout: 20, ssl: /localhost|127\.0\.0\.1/.test(url) ? false : "require" });
    const raw: Raw = (t, p) => sql.unsafe(t, p as never[]) as unknown as Promise<Record<string, unknown>[]>;
    drv = { ex: mk(raw), tx: (fn) => sql.begin(async (t) => fn(mk((text, p) => t.unsafe(text, p as never[]) as unknown as Promise<Record<string, unknown>[]>))) as Promise<never> };
  } else {
    const { PGlite } = await import("@electric-sql/pglite");
    const dir = process.env.DATA_DIR || ".data/pg";
    const pg = new PGlite(dir.startsWith("memory:") ? undefined : dir);
    await pg.waitReady;
    drv = { ex: mk(async (t, p) => (await pg.query(t, p as never[])).rows as Record<string, unknown>[]), tx: (fn) => pg.transaction(async (t) => fn(mk(async (text, p) => (await t.query(text, p as never[])).rows as Record<string, unknown>[]))) };
  }
  for (const stmt of SCHEMA.split(";").map((s) => s.trim()).filter(Boolean)) await drv.ex.run(stmt);
  return drv;
}
const drv = () => (g.__enlaceDrv ??= init());
export const now = () => Date.now();
export const all = async <T = Record<string, unknown>>(sql: string, ...p: unknown[]) => (await drv()).ex.all<T>(sql, ...p);
export const one = async <T = Record<string, unknown>>(sql: string, ...p: unknown[]) => (await drv()).ex.one<T>(sql, ...p);
export const run = async (sql: string, ...p: unknown[]) => (await drv()).ex.run(sql, ...p);
export const tx = async <T>(fn: (x: Ex) => Promise<T>) => (await drv()).tx(fn);
export const N = (v: unknown) => Number(v);

export async function putRecord(x: Ex, weddingId: string, coll: string, id: string, body: unknown | null) {
  const c = await x.one<{ seq: number }>("INSERT INTO counters (wedding_id, seq) VALUES (?, 1) ON CONFLICT (wedding_id) DO UPDATE SET seq = counters.seq + 1 RETURNING seq", weddingId);
  const seq = N(c!.seq);
  await x.run("INSERT INTO records (wedding_id, coll, id, body, deleted, seq) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT (wedding_id, coll, id) DO UPDATE SET body = EXCLUDED.body, deleted = EXCLUDED.deleted, seq = EXCLUDED.seq", weddingId, coll, id, body === null ? "null" : JSON.stringify(body), body === null ? 1 : 0, seq);
  return seq;
}
export async function getRecord<T = unknown>(x: Ex, weddingId: string, coll: string, id: string, lock = false): Promise<T | null> {
  const r = await x.one<{ body: string; deleted: number }>(`SELECT body, deleted FROM records WHERE wedding_id = ? AND coll = ? AND id = ?${lock ? " FOR UPDATE" : ""}`, weddingId, coll, id);
  return r && !r.deleted ? (JSON.parse(r.body) as T) : null;
}
export async function listRecords<T = unknown>(x: Ex, weddingId: string, coll: string): Promise<T[]> {
  return (await x.all<{ body: string }>("SELECT body FROM records WHERE wedding_id = ? AND coll = ? AND deleted = 0 ORDER BY seq", weddingId, coll)).map((r) => JSON.parse(r.body) as T);
}
/** Executor padrão (fora de transação). */
export const X: Ex = { all, one, run };
