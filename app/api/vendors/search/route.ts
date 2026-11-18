import { currentUser, json, fail, rateLimit } from "@/lib/server/auth";
import { searchPlaces } from "@/lib/server/product";
export const runtime = "nodejs"; export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  const u = await currentUser(); if (!u) return fail("Não autenticado.", 401); if (!rateLimit("vs:" + u.id, 40, 600000)) return fail("Muitas buscas.", 429);
  const q = (new URL(req.url).searchParams.get("q") ?? "").trim(); if (q.length < 3) return fail("Digite a categoria e a cidade.");
  try { return json({ configured: true, places: await searchPlaces(q) }); } catch (e) { const m = (e as Error).message; if (m === "places_not_configured") return json({ configured: false, places: [] }); return fail(m, 502); }
}
