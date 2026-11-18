import { all } from "@/lib/server/db";
import { currentUser, json, fail, memberRole } from "@/lib/server/auth";
import { snapshot, createWedding, members } from "@/lib/server/wedding";
export const runtime = "nodejs"; export const dynamic = "force-dynamic";
export async function GET() {
  const u = await currentUser(); if (!u) return fail("Não autenticado.", 401);
  const ids = all<{ id: string }>("SELECT id FROM weddings WHERE owner_id = ? UNION SELECT wedding_id AS id FROM members WHERE user_id = ?", u.id, u.id).map((r) => r.id);
  return json({ weddings: ids.map((id) => ({ id, role: memberRole(id, u.id), ...snapshot(id), team: members(id) })) });
}
export async function POST(req: Request) {
  const u = await currentUser(); if (!u) return fail("Não autenticado.", 401);
  const b = (await req.json().catch(() => null)) as { data?: Record<string, unknown> } | null; if (!b?.data) return fail("Dados ausentes.");
  if (JSON.stringify(b.data).length > 2_000_000) return fail("Dados grandes demais.", 413);
  try { const id = createWedding(u.id, b.data); return json({ id, ...snapshot(id), role: "owner", team: members(id) }); } catch (e) { return fail((e as Error).message); }
}
