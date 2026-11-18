import { one, tx, putRecord, listRecords, getRecord, X } from "@/lib/server/db";
import { json, fail, rateLimit, ipOf } from "@/lib/server/auth";
import { accessFor, paywall } from "@/lib/server/billing";
export const runtime = "nodejs"; export const dynamic = "force-dynamic";
type Ctx = { params: Promise<{ token: string }> };
interface Gift { id: string; title: string; category: string; price: number; url: string; qty: number; got: number; reservedBy: string[]; kind: string; image?: string; store?: string; }
const wid = async (t: string) => (await one<{ id: string }>("SELECT id FROM weddings WHERE gift_token = ?", t))?.id ?? null;
export async function GET(_: Request, { params }: Ctx) {
  const { token } = await params; const id = await wid(token); if (!id) return fail("Lista não encontrada.", 404);
  const w = (await getRecord<{ partner1: string; partner2: string; date: string }>(X, id, "wedding", "main"))!;
  return json({ p1: w.partner1, p2: w.partner2, date: w.date, gifts: (await listRecords<Gift>(X, id, "gifts")).map((g) => ({ id: g.id, title: g.title, category: g.category, price: g.price, url: g.url, qty: g.qty, got: g.got, kind: g.kind, image: g.image ?? "", store: g.store ?? "" })) });
}
/** Reserva atômica: a linha do presente é travada (FOR UPDATE), então dois convidados nunca levam o mesmo item. */
export async function POST(req: Request, { params }: Ctx) {
  if (!(await rateLimit("gift:" + ipOf(req), 30, 600000))) return fail("Muitas tentativas.", 429);
  const { token } = await params; const id = await wid(token); if (!id) return fail("Lista não encontrada.", 404);
  if ((await accessFor(id)).state === "blocked") return fail("Esta lista está temporariamente indisponível. Avise os noivos.", 402, { code: paywall.code });
  const b = (await req.json().catch(() => null)) as { giftId?: string; name?: string; qty?: number } | null; const name = (b?.name ?? "").trim().slice(0, 60); if (!b?.giftId || !name) return fail("Informe seu nome.");
  const res = await tx(async (x) => {
    const g = await getRecord<Gift>(x, id, "gifts", b.giftId!, true); if (!g) return { err: "Presente não encontrado.", status: 404 };
    if (g.got >= g.qty) return { err: "Esse presente já foi escolhido por outra pessoa.", status: 409 };
    const qty = Math.max(1, Math.min(g.qty - g.got, Math.floor(b.qty ?? 1)));
    await putRecord(x, id, "gifts", g.id, { ...g, got: g.got + qty, reservedBy: [...g.reservedBy, qty > 1 ? `${name} (${qty})` : name] }); return { url: g.url, qty };
  });
  if ("err" in res) return fail(res.err!, res.status); return json({ ok: true, url: res.url });
}
