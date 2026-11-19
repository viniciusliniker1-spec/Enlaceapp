import { currentUser, json, fail, rateLimit } from "@/lib/server/auth";
import { fetchPage, parseProduct, looksBlocked, titleFromUrl, resolveMercadoLivre } from "@/lib/server/product";
export const runtime = "nodejs"; export const dynamic = "force-dynamic";
export async function POST(req: Request) {
  const u = await currentUser(); if (!u) return fail("Não autenticado.", 401); if (!rateLimit("res:" + u.id, 40, 600000)) return fail("Muitas consultas. Aguarde um pouco.", 429);
  const b = (await req.json().catch(() => ({}))) as { url?: string }; let url: URL; try { url = new URL((b.url ?? "").trim()); } catch { return fail("Link inválido."); }
  try {
    if (/mercadoli(vre|bre)\./i.test(url.hostname)) { const ml = await resolveMercadoLivre(url.toString()); if (ml?.title) return json({ product: ml, warning: ml.price ? "" : "Não encontrei o preço neste anúncio. Informe o preço." }); }
    const { html, finalUrl } = await fetchPage(url.toString());
    if (/mercadoli(vre|bre)\./i.test(new URL(finalUrl).hostname) && finalUrl !== url.toString()) { const ml = await resolveMercadoLivre(finalUrl); if (ml?.title) return json({ product: ml, warning: ml.price ? "" : "Informe o preço." }); } const p = parseProduct(html, finalUrl);
    if (looksBlocked(p, finalUrl)) return json({ product: { title: titleFromUrl(url.toString()), image: "", price: 0, store: p.store, url: url.toString() }, warning: "A loja bloqueou a leitura automática deste link. Conferi o nome pelo endereço; ajuste o nome e o preço e, se quiser, cole o endereço da foto." });
    return json({ product: p, warning: p.price ? "" : "Não encontrei o preço nesta página. Informe o preço." });
  } catch (e) { return json({ product: { title: titleFromUrl(url.toString()), image: "", price: 0, store: url.hostname.replace(/^www\./, ""), url: url.toString() }, warning: `${(e as Error).message || "Falha ao abrir o link."} Preencha os dados manualmente.` }); }
}
