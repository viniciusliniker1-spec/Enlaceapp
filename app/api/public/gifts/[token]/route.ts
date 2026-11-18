import { one, tx, putRecord, listRecords, getRecord } from "@/lib/server/db";
import { json, fail, rateLimit } from "@/lib/server/auth";
export const runtime = "nodejs"; export const dynamic = "force-dynamic";
type Ctx = { params: Promise<{ token: string }> };
interface Gift { id: string; title: string; category: string; price: number; url: string; qty: number; got: number; reservedBy: string[]; kind: string; image?: string; store?: string; }
const wid = (t: string) => one<{ id: string }>("SELECT id FROM weddings WHERE gift_token = ?", t)?.id ?? null;
export async function GET(_: Request, { params }: Ctx) {
  const { token } = await params; const id = wid(token); if (!id) return fail("Lista não encontrada.", 404);
  const w = getRecord<{ partner1: string; partner2: string; date: string; phone: string }>(id, "wedding", "main")!;
  return json({ p1: w.partner1, p2: w.partner2, date: w.date, gifts: listRecords<Gift>(id, "gifts").map((g) => ({ id: g.id, title: g.title, category: g.category, price: g.price, url: g.url, qty: g.qty, got: g.got, kind: g.kind, image: g.image ?? "", store: g.store ?? "" })) });
}
/** Reserva atômica: dois convidados nunca levam o mesmo item. */
export async function POST(req: Request, { params }: Ctx) {
  if (!rateLimit("gift:" + (req.headers.get("x-forwarded-for") ?? "local"), 30, 600000)) return fail("Muitas tentativas.", 429);
  const { token } = await params; const id = wid(token); if (!id) return fail("Lista não encontrada.", 404);
  const b = (await req.json().catch(() => null)) as { giftId?: string; name?: string; qty?: number } | null; const name = (b?.name ?? "").trim().slice(0, 60); if (!b?.giftId || !name) return fail("Informe seu nome.");
  const res = tx(() => {
    const g = getRecord<Gift>(id, "gifts", b.giftId!); if (!g) return { err: "Presente não encontrado.", status: 404 };
    const qty = Math.max(1, Math.min(g.qty - g.got, Math.floor(b.qty ?? 1))); if (g.got >= g.qty) return { err: "Esse presente já foi escolhido por outra pessoa.", status: 409 };
    putRecord(id, "gifts", g.id, { ...g, got: g.got + qty, reservedBy: [...g.reservedBy, qty > 1 ? `${name} (${qty})` : name] }); return { url: g.url, qty };
  });
  if ("err" in res) return fail(res.err!, res.status); return json({ ok: true, url: res.url });
}
