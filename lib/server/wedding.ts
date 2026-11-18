import { all, one, tx, putRecord, run, now, N, X, type Ex } from "./db";
import { rid } from "./auth";
import { accessFor, ensureBilling, scopeFor } from "./billing";

export const COLLS = ["vendors", "payments", "cats", "guests", "tables", "tasks", "gifts", "enxoval", "moments", "recados"] as const;

export async function snapshot(weddingId: string) {
  const out: Record<string, unknown[] | unknown> = {};
  for (const r of await all<{ coll: string; body: string }>("SELECT coll, body FROM records WHERE wedding_id = ? AND deleted = 0 ORDER BY seq", weddingId)) {
    const b = JSON.parse(r.body); if (r.coll === "wedding") out.wedding = b; else ((out[r.coll] ??= []) as unknown[]).push(b);
  }
  for (const k of COLLS) out[k] ??= [];
  const c = await one<{ seq: unknown }>("SELECT seq FROM counters WHERE wedding_id = ?", weddingId);
  const w = (await one<{ gift_token: string; schedule_token: string }>("SELECT gift_token, schedule_token FROM weddings WHERE id = ?", weddingId))!;
  const a = await accessFor(weddingId);
  return { data: out, seq: c ? N(c.seq) : 0, giftToken: w.gift_token, scheduleToken: w.schedule_token, billing: { state: a.state, daysLeft: a.daysLeft, plan: a.plan, price: a.price, canceled: a.canceled } };
}
export async function members(weddingId: string) {
  const owner = (await one<{ id: string; email: string; name: string }>("SELECT u.id, u.email, u.name FROM weddings w JOIN users u ON u.id = w.owner_id WHERE w.id = ?", weddingId))!;
  const ms = await all<{ id: string; email: string; name: string; role: string }>("SELECT u.id, u.email, u.name, m.role FROM members m JOIN users u ON u.id = m.user_id WHERE m.wedding_id = ?", weddingId);
  const inv = await all<{ token: string; email: string; role: string }>("SELECT token, email, role FROM member_invites WHERE wedding_id = ?", weddingId);
  return { owner, members: ms, pending: inv };
}
export async function createWedding(userId: string, data: Record<string, unknown>) {
  const w = data.wedding as { id: string }; if (!w?.id) throw new Error("dados inválidos");
  await tx(async (x: Ex) => {
    await x.run("INSERT INTO weddings (id, owner_id, gift_token, schedule_token, created_at) VALUES (?, ?, ?, ?, ?)", w.id, userId, rid(16), rid(16), now());
    await putRecord(x, w.id, "wedding", "main", data.wedding);
    for (const c of COLLS) for (const item of (data[c] as { id: string }[] | undefined) ?? []) await putRecord(x, w.id, c, item.id, item);
    const s = await scopeFor(w.id, x); await ensureBilling(s.scope, x);
  });
  return w.id;
}
export async function ensureInvitations(weddingId: string) {
  return tx(async (x) => {
    const fams = new Set<string>();
    (await x.all<{ body: string }>("SELECT body FROM records WHERE wedding_id = ? AND coll = 'guests' AND deleted = 0", weddingId)).forEach((r) => { const g = JSON.parse(r.body); if (g.list === "A") fams.add(g.group); });
    const out: Record<string, string> = {};
    for (const f of fams) { const ex = await x.one<{ token: string }>("SELECT token FROM invitations WHERE wedding_id = ? AND family = ?", weddingId, f); if (ex) out[f] = ex.token; else { const t = rid(12); await x.run("INSERT INTO invitations (token, wedding_id, family) VALUES (?, ?, ?) ON CONFLICT DO NOTHING", t, weddingId, f); out[f] = (await x.one<{ token: string }>("SELECT token FROM invitations WHERE wedding_id = ? AND family = ?", weddingId, f))!.token; } }
    return out;
  });
}
export { X, run };
