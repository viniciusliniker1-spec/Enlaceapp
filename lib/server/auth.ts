import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { one, run, all, now, N } from "./db";

export interface User { id: string; email: string; name: string; role: "casal" | "assessor"; }
const COOKIE = "enlace_session"; const TTL = 1000 * 60 * 60 * 24 * 60;
export const rid = (n = 12) => randomBytes(n).toString("base64url");
export function hashPass(p: string) { const salt = randomBytes(16); return `${salt.toString("hex")}:${scryptSync(p, salt, 64).toString("hex")}`; }
export function checkPass(p: string, stored: string) { const [s, h] = stored.split(":"); const a = Buffer.from(h, "hex"); const b = scryptSync(p, Buffer.from(s, "hex"), 64); return a.length === b.length && timingSafeEqual(a, b); }
export async function startSession(userId: string) {
  const token = rid(32); await run("INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)", token, userId, now() + TTL);
  (await cookies()).set(COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production" && process.env.INSECURE_COOKIES !== "1", path: "/", maxAge: TTL / 1000 });
}
export async function endSession() { const c = await cookies(); const t = c.get(COOKIE)?.value; if (t) await run("DELETE FROM sessions WHERE token = ?", t); c.delete(COOKIE); }
export async function currentUser(): Promise<User | null> {
  const t = (await cookies()).get(COOKIE)?.value; if (!t) return null;
  const r = await one<User & { expires_at: unknown }>("SELECT u.id, u.email, u.name, u.role, s.expires_at FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = ?", t);
  if (!r || N(r.expires_at) < now()) return null; return { id: r.id, email: r.email, name: r.name, role: r.role };
}
export const json = (data: unknown, status = 200) => NextResponse.json(data, { status });
export const fail = (msg: string, status = 400, extra: Record<string, unknown> = {}) => NextResponse.json({ error: msg, ...extra }, { status });
export async function memberRole(weddingId: string, userId: string): Promise<"owner" | "editar" | "ver" | null> {
  const w = await one<{ owner_id: string }>("SELECT owner_id FROM weddings WHERE id = ?", weddingId); if (!w) return null;
  if (w.owner_id === userId) return "owner";
  const m = await one<{ role: "editar" | "ver" }>("SELECT role FROM members WHERE wedding_id = ? AND user_id = ?", weddingId, userId); return m?.role ?? null;
}
export async function claimInvitesFor(user: User) {
  for (const inv of await all<{ token: string; wedding_id: string; role: string }>("SELECT token, wedding_id, role FROM member_invites WHERE lower(email) = lower(?)", user.email)) {
    await run("INSERT INTO members (wedding_id, user_id, role) VALUES (?, ?, ?) ON CONFLICT (wedding_id, user_id) DO UPDATE SET role = EXCLUDED.role", inv.wedding_id, user.id, inv.role); await run("DELETE FROM member_invites WHERE token = ?", inv.token);
  }
}
/** Limitador por chave, guardado no banco (funciona entre instâncias serverless). */
export async function rateLimit(key: string, max: number, windowMs: number) {
  const t = now(); await run("DELETE FROM rate_hits WHERE k = ? AND t < ?", key, t - windowMs); await run("INSERT INTO rate_hits (k, t) VALUES (?, ?)", key, t);
  const c = await one<{ n: unknown }>("SELECT COUNT(*) AS n FROM rate_hits WHERE k = ?", key); return N(c!.n) <= max;
}
export const ipOf = (req: Request) => (req.headers.get("x-forwarded-for") ?? "local").split(",")[0].trim();
