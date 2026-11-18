import { all, tx, putRecord, N } from "@/lib/server/db";
import { currentUser, json, fail, memberRole } from "@/lib/server/auth";
import { COLLS } from "@/lib/server/wedding";
import { accessFor, paywall } from "@/lib/server/billing";
export const runtime = "nodejs"; export const dynamic = "force-dynamic";
type Ctx = { params: Promise<{ id: string }> };
export async function GET(req: Request, { params }: Ctx) {
  const u = await currentUser(); if (!u) return fail("Não autenticado.", 401); const { id } = await params; if (!(await memberRole(id, u.id))) return fail("Sem acesso.", 403);
  const since = Number(new URL(req.url).searchParams.get("since") ?? 0);
  const rows = await all<{ coll: string; id: string; body: string; deleted: number; seq: unknown }>("SELECT coll, id, body, deleted, seq FROM records WHERE wedding_id = ? AND seq > ? ORDER BY seq LIMIT 2000", id, since);
  return json({ seq: rows.length ? N(rows[rows.length - 1].seq) : since, changes: rows.map((r) => ({ c: r.coll, id: r.id, body: r.deleted ? null : JSON.parse(r.body) })) });
}
export async function POST(req: Request, { params }: Ctx) {
  const u = await currentUser(); if (!u) return fail("Não autenticado.", 401); const { id } = await params; const role = await memberRole(id, u.id);
  if (!role) return fail("Sem acesso.", 403); if (role === "ver") return fail("Você só pode visualizar este casamento.", 403);
  if ((await accessFor(id)).state === "blocked") return fail(paywall.error, 402, { code: paywall.code });
  const b = (await req.json().catch(() => null)) as { ops?: { c: string; id: string; body: Record<string, unknown> | null }[] } | null;
  if (!b?.ops || !Array.isArray(b.ops) || b.ops.length > 600) return fail("Operações inválidas.");
  const okColl = new Set<string>(["wedding", ...COLLS]);
  for (const o of b.ops) { if (!okColl.has(o.c) || typeof o.id !== "string" || o.id.length > 64) return fail("Operação inválida."); if (o.body && JSON.stringify(o.body).length > 60_000) return fail("Registro grande demais.", 413); if (o.c === "wedding" && (o.body === null || o.id !== "main")) return fail("Não é possível apagar os dados do casamento."); }
  const seq = await tx(async (x) => { let s = 0; for (const o of b.ops!) s = await putRecord(x, id, o.c, o.id, o.body); return s; });
  return json({ seq });
}
