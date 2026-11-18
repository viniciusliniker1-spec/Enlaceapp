import { all, one, tx, putRecord, getRecord, run, now } from "./db";
import { rid } from "./auth";

export const COLLS = ["vendors", "payments", "cats", "guests", "tables", "tasks", "gifts", "enxoval", "moments", "recados"] as const;
export type Coll = (typeof COLLS)[number] | "wedding";

export function snapshot(weddingId: string) {
  const out: Record<string, unknown> = {}; let seq = 0;
  for (const r of all<{ coll: string; body: string; seq: number }>("SELECT coll, body, seq FROM records WHERE wedding_id = ? AND deleted = 0 ORDER BY seq", weddingId)) {
    seq = Math.max(seq, r.seq); const b = JSON.parse(r.body);
    if (r.coll === "wedding") out.wedding = b; else (out[r.coll] ??= [] as unknown[]), r.coll !== "wedding" && (out[r.coll] as unknown[]).push(b);
  }
  const c = one<{ seq: number }>("SELECT seq FROM counters WHERE wedding_id = ?", weddingId); seq = c?.seq ?? seq;
  for (const k of COLLS) out[k] ??= [];
  const w = one<{ gift_token: string; schedule_token: string }>("SELECT gift_token, schedule_token FROM weddings WHERE id = ?", weddingId)!;
  return { data: out, seq, giftToken: w.gift_token, scheduleToken: w.schedule_token };
}
export function members(weddingId: string) {
  const owner = one<{ id: string; email: string; name: string }>("SELECT u.id, u.email, u.name FROM weddings w JOIN users u ON u.id = w.owner_id WHERE w.id = ?", weddingId)!;
  const ms = all<{ id: string; email: string; name: string; role: string }>("SELECT u.id, u.email, u.name, m.role FROM members m JOIN users u ON u.id = m.user_id WHERE m.wedding_id = ?", weddingId);
  const inv = all<{ token: string; email: string; role: string }>("SELECT token, email, role FROM member_invites WHERE wedding_id = ?", weddingId);
  return { owner, members: ms, pending: inv };
}
export function createWedding(userId: string, data: Record<string, unknown>) {
  const w = data.wedding as { id: string }; if (!w?.id) throw new Error("dados inválidos");
  return tx(() => {
    run("INSERT INTO weddings (id, owner_id, gift_token, schedule_token, created_at) VALUES (?, ?, ?, ?, ?)", w.id, userId, rid(16), rid(16), now());
    putRecord(w.id, "wedding", "main", data.wedding);
    for (const c of COLLS) for (const item of (data[c] as { id: string }[] | undefined) ?? []) putRecord(w.id, c, item.id, item);
    return w.id;
  });
}
/** Garante um token de convite por família da lista A. */
export function ensureInvitations(weddingId: string) {
  return tx(() => {
    const fams = new Set<string>();
    all<{ body: string }>("SELECT body FROM records WHERE wedding_id = ? AND coll = 'guests' AND deleted = 0", weddingId).forEach((r) => { const g = JSON.parse(r.body); if (g.list === "A") fams.add(g.group); });
    const out: Record<string, string> = {};
    for (const f of fams) { const ex = one<{ token: string }>("SELECT token FROM invitations WHERE wedding_id = ? AND family = ?", weddingId, f); if (ex) out[f] = ex.token; else { const t = rid(12); run("INSERT INTO invitations (token, wedding_id, family) VALUES (?, ?, ?)", t, weddingId, f); out[f] = t; } }
    return out;
  });
}
export { getRecord };
