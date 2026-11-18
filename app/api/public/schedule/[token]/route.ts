import { one, listRecords, getRecord } from "@/lib/server/db";
import { json, fail } from "@/lib/server/auth";
export const runtime = "nodejs"; export const dynamic = "force-dynamic";
export async function GET(_: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params; const id = one<{ id: string }>("SELECT id FROM weddings WHERE schedule_token = ?", token)?.id; if (!id) return fail("Cronograma não encontrado.", 404);
  const w = getRecord<{ partner1: string; partner2: string; date: string; venue: string; receptionPlace: string; receptionAddr: string; phone: string }>(id, "wedding", "main")!;
  const m = listRecords<{ time: string; title: string; who: string }>(id, "moments").sort((a, b) => a.time.localeCompare(b.time)); const v = listRecords<{ name: string; category: string; contact: string; phone: string; status: string }>(id, "vendors").filter((x) => x.status === "contratado");
  return json({ p1: w.partner1, p2: w.partner2, date: w.date, venue: w.receptionPlace || w.venue, addr: w.receptionAddr, phone: w.phone, m: m.map((x) => [x.time, x.title, x.who]), v: v.map((x) => [x.name, x.category, x.contact, x.phone]) });
}
