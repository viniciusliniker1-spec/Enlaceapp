import { one, tx, putRecord, listRecords, getRecord, X } from "@/lib/server/db";
import { json, fail, rateLimit, rid, ipOf } from "@/lib/server/auth";
import { accessFor, paywall } from "@/lib/server/billing";
export const runtime = "nodejs"; export const dynamic = "force-dynamic";
type Ctx = { params: Promise<{ token: string }> };
interface W { partner1: string; partner2: string; date: string; time: string; ceremonyPlace: string; ceremonyAddr: string; receptionPlace: string; venue: string; receptionAddr: string; dress: string; rsvpDeadline: string; message: string; style: string; palette: number; phone: string; }
interface G { id: string; name: string; group: string; list: string; rsvp: string; }
const inv = (t: string) => one<{ wedding_id: string; family: string }>("SELECT wedding_id, family FROM invitations WHERE token = ?", t);
export async function GET(_: Request, { params }: Ctx) {
  const { token } = await params; const i = await inv(token); if (!i) return fail("Convite não encontrado.", 404);
  const w = (await getRecord<W>(X, i.wedding_id, "wedding", "main"))!; const guests = (await listRecords<G>(X, i.wedding_id, "guests")).filter((g) => g.group === i.family && g.list === "A");
  return json({ p1: w.partner1, p2: w.partner2, date: w.date, time: w.time, cerN: w.ceremonyPlace, cerA: w.ceremonyAddr, recN: w.receptionPlace || w.venue, recA: w.receptionAddr, dress: w.dress, deadline: w.rsvpDeadline, style: w.style, palette: w.palette, msg: w.message, phone: w.phone, family: i.family, guests: guests.map((g) => ({ id: g.id, name: g.name, rsvp: g.rsvp })) });
}
export async function POST(req: Request, { params }: Ctx) {
  if (!(await rateLimit("rsvp:" + ipOf(req), 30, 600000))) return fail("Muitas tentativas.", 429);
  const { token } = await params; const i = await inv(token); if (!i) return fail("Convite não encontrado.", 404);
  if ((await accessFor(i.wedding_id)).state === "blocked") return fail("Este convite está temporariamente indisponível. Avise os noivos.", 402, { code: paywall.code });
  const b = (await req.json().catch(() => null)) as { answers?: Record<string, boolean>; recado?: string } | null; if (!b?.answers) return fail("Respostas ausentes.");
  await tx(async (x) => {
    const guests = (await listRecords<G>(x, i.wedding_id, "guests")).filter((g) => g.group === i.family && g.list === "A");
    for (const g of guests) if (g.id in b.answers!) await putRecord(x, i.wedding_id, "guests", g.id, { ...g, rsvp: b.answers![g.id] ? "confirmado" : "recusado" });
    const text = (b.recado ?? "").trim().slice(0, 600); if (text) { const id = rid(8); await putRecord(x, i.wedding_id, "recados", id, { id, from: i.family, text, date: new Date().toISOString().slice(0, 10) }); }
  });
  return json({ ok: true });
}
