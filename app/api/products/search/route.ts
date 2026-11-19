import { currentUser, json, fail, rateLimit } from "@/lib/server/auth";
import { searchMercadoLivre } from "@/lib/server/product";
export const runtime = "nodejs"; export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  const u = await currentUser(); if (!u) return fail("Não autenticado.", 401); if (!rateLimit("srch:" + u.id, 60, 600000)) return fail("Muitas buscas.", 429);
  const q = (new URL(req.url).searchParams.get("q") ?? "").trim(); if (q.length < 2) return fail("Digite ao menos 2 letras.");
  try { return json({ configured: true, products: await searchMercadoLivre(q) }); }
  catch (e) { const m = (e as Error).message; if (m === "ml_not_configured") return json({ configured: false, products: [] }); if (m === "ml_search_restricted") return json({ configured: true, restricted: true, products: [] }); return fail(m, 502); }
}
