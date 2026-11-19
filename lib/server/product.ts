import dns from "node:dns/promises";
import net from "node:net";

function privateIp(ip: string) {
  if (net.isIPv4(ip)) { const [a, b] = ip.split(".").map(Number); return a === 10 || a === 127 || a === 0 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 169 && b === 254) || a >= 224; }
  const l = ip.toLowerCase(); return l === "::1" || l === "::" || l.startsWith("fc") || l.startsWith("fd") || l.startsWith("fe80") || l.startsWith("::ffff:127.") || l.startsWith("::ffff:10.") || l.startsWith("::ffff:192.168.");
}
async function assertPublic(u: URL) {
  if (!/^https?:$/.test(u.protocol)) throw new Error("Só links http(s).");
  if (u.port && !["80", "443"].includes(u.port)) throw new Error("Porta não permitida.");
  const host = u.hostname.replace(/^\[|\]$/g, "");
  const ips = net.isIP(host) ? [host] : (await dns.lookup(host, { all: true })).map((r) => r.address);
  if (!ips.length || ips.some(privateIp)) throw new Error("Endereço não permitido.");
}
export async function fetchPage(url: string): Promise<{ html: string; finalUrl: string }> {
  let cur = new URL(url);
  for (let i = 0; i < 5; i++) {
    await assertPublic(cur);
    const res = await fetch(cur, { redirect: "manual", signal: AbortSignal.timeout(9000), headers: { "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36", accept: "text/html,application/xhtml+xml", "accept-language": "pt-BR,pt;q=0.9" } });
    if (res.status >= 300 && res.status < 400 && res.headers.get("location")) { cur = new URL(res.headers.get("location")!, cur); continue; }
    if (!res.ok) throw new Error(`A loja respondeu ${res.status}.`);
    const reader = res.body!.getReader(); const chunks: Uint8Array[] = []; let size = 0;
    while (size < 1_500_000) { const { done, value } = await reader.read(); if (done) break; chunks.push(value); size += value.length; }
    reader.cancel().catch(() => {});
    return { html: Buffer.concat(chunks).toString("utf8"), finalUrl: cur.toString() };
  }
  throw new Error("Redirecionamentos demais.");
}
const dec = (s: string) => s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ");
function meta(html: string, keys: string[]) {
  for (const k of keys) {
    const re1 = new RegExp(`<meta[^>]+(?:property|name|itemprop)=["']${k}["'][^>]*content=["']([^"']*)["']`, "i"); const re2 = new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name|itemprop)=["']${k}["']`, "i");
    const m = html.match(re1) ?? html.match(re2); if (m?.[1]) return dec(m[1]).trim();
  } return "";
}
function parsePrice(v: unknown): number {
  if (typeof v === "number") return v; if (typeof v !== "string") return 0;
  let s = v.replace(/[^\d.,]/g, ""); if (!s) return 0;
  if (s.includes(",") && s.includes(".")) s = s.lastIndexOf(",") > s.lastIndexOf(".") ? s.replace(/\./g, "").replace(",", ".") : s.replace(/,/g, "");
  else if (s.includes(",")) s = s.replace(",", "."); return Number(s) || 0;
}
export interface Product { title: string; image: string; price: number; store: string; url: string; }
export function parseProduct(html: string, finalUrl: string): Product {
  let title = "", image = "", price = 0;
  for (const m of html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const walk = (n: unknown): void => { if (!n || typeof n !== "object") return; const o = n as Record<string, unknown>;
        if (Array.isArray(n)) return n.forEach(walk);
        const t = o["@type"]; if ((Array.isArray(t) ? t : [t]).includes("Product")) {
          title ||= String(o.name ?? ""); const im = o.image; image ||= Array.isArray(im) ? String(typeof im[0] === "object" ? (im[0] as Record<string, unknown>).url : im[0]) : typeof im === "object" && im ? String((im as Record<string, unknown>).url ?? "") : String(im ?? "");
          const of = o.offers as unknown; const off = (Array.isArray(of) ? of[0] : of) as Record<string, unknown> | undefined; if (off) price ||= parsePrice(off.price ?? off.lowPrice ?? (off.priceSpecification as Record<string, unknown> | undefined)?.price);
        }
        Object.values(o).forEach(walk); };
      walk(JSON.parse(m[1]));
    } catch { /* json-ld inválido */ }
  }
  title ||= meta(html, ["og:title", "twitter:title"]) || dec((html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] ?? "").trim());
  image ||= meta(html, ["og:image", "twitter:image", "og:image:secure_url"]);
  price ||= parsePrice(meta(html, ["product:price:amount", "og:price:amount", "price"]));
  if (image.startsWith("//")) image = "https:" + image;
  const host = new URL(finalUrl).hostname.replace(/^www\./, ""); const store = /mercadoli/.test(host) ? "Mercado Livre" : /amazon/.test(host) ? "Amazon" : /shopee/.test(host) ? "Shopee" : /magazine|magalu/.test(host) ? "Magalu" : /americanas/.test(host) ? "Americanas" : /casasbahia|pontofrio|extra\.com/.test(host) ? "Casas Bahia" : host;
  return { title: title.replace(/\s*[|\-–]\s*(Mercado Livre|Amazon\.com\.br|Shopee Brasil).*$/i, "").slice(0, 160), image, price, store, url: finalUrl };
}

/** Busca oficial no Mercado Livre (exige app registrado: ML_CLIENT_ID e ML_CLIENT_SECRET). */
let mlToken: { t: string; exp: number } | null = null;
async function mlAuth(): Promise<string> {
  const id = process.env.ML_CLIENT_ID, secret = process.env.ML_CLIENT_SECRET; if (!id || !secret) throw new Error("ml_not_configured");
  if (!mlToken || mlToken.exp < Date.now()) {
    const r = await fetch("https://api.mercadolibre.com/oauth/token", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded", accept: "application/json" }, body: new URLSearchParams({ grant_type: "client_credentials", client_id: id.trim(), client_secret: secret.trim() }), signal: AbortSignal.timeout(9000) });
    if (!r.ok) throw new Error("Falha ao autenticar no Mercado Livre."); const j = (await r.json()) as { access_token: string; expires_in: number }; mlToken = { t: j.access_token, exp: Date.now() + (j.expires_in - 60) * 1000 };
  }
  return mlToken.t;
}
/** A busca por texto é restrita pelo Mercado Livre a parceiros certificados; se vier 403 avisamos a interface. */
export async function searchMercadoLivre(q: string): Promise<Product[]> {
  const t = await mlAuth();
  const r = await fetch(`https://api.mercadolibre.com/sites/MLB/search?q=${encodeURIComponent(q)}&limit=12`, { headers: { authorization: `Bearer ${t}` }, signal: AbortSignal.timeout(9000) });
  if (r.status === 403) throw new Error("ml_search_restricted");
  if (!r.ok) throw new Error(`Mercado Livre respondeu ${r.status}.`);
  const j = (await r.json()) as { results: { title: string; price: number; thumbnail: string; permalink: string }[] };
  return j.results.map((x) => ({ title: x.title, price: x.price, image: x.thumbnail.replace("http://", "https://").replace(/-I\.jpg$/, "-O.jpg"), store: "Mercado Livre", url: x.permalink }));
}
/** Lê um produto do Mercado Livre pela API oficial a partir do link (anúncio MLB123… ou catálogo /p/MLB123…). Retorna null se não conseguir. */
export async function resolveMercadoLivre(rawUrl: string): Promise<Product | null> {
  if (!process.env.ML_CLIENT_ID || !process.env.ML_CLIENT_SECRET) return null;
  let text = rawUrl; try { text = decodeURIComponent(rawUrl); } catch { /* mantém */ }
  const cat = text.match(/\/p\/(ML[A-Z])-?(\d{6,})/i); const item = text.match(/(ML[A-Z])-?(\d{6,})/i); const m = cat ?? item; if (!m) return null;
  const id = `${m[1].toUpperCase()}${m[2]}`;
  try {
    const t = await mlAuth(); const h = { authorization: `Bearer ${t}` };
    if (cat) {
      const r = await fetch(`https://api.mercadolibre.com/products/${id}`, { headers: h, signal: AbortSignal.timeout(9000) }); if (!r.ok) return null;
      const j = (await r.json()) as { name?: string; pictures?: { url?: string }[]; buy_box_winner?: { price?: number; item_id?: string } };
      return { title: j.name ?? "", image: j.pictures?.[0]?.url ?? "", price: j.buy_box_winner?.price ?? 0, store: "Mercado Livre", url: `https://www.mercadolivre.com.br/p/${id}` };
    }
    const r = await fetch(`https://api.mercadolibre.com/items/${id}`, { headers: h, signal: AbortSignal.timeout(9000) }); if (!r.ok) return null;
    const j = (await r.json()) as { title?: string; price?: number; pictures?: { secure_url?: string; url?: string }[]; thumbnail?: string; permalink?: string };
    return { title: j.title ?? "", image: j.pictures?.[0]?.secure_url ?? j.pictures?.[0]?.url ?? (j.thumbnail ?? "").replace("http://", "https://"), price: j.price ?? 0, store: "Mercado Livre", url: j.permalink ?? rawUrl };
  } catch { return null; }
}
export interface Place { name: string; address: string; phone: string; rating: number; mapsUrl: string; }
/** Fornecedores reais via Google Places (GOOGLE_PLACES_KEY). */
export async function searchPlaces(q: string): Promise<Place[]> {
  const key = process.env.GOOGLE_PLACES_KEY; if (!key) throw new Error("places_not_configured");
  const r = await fetch("https://places.googleapis.com/v1/places:searchText", { method: "POST", headers: { "content-type": "application/json", "X-Goog-Api-Key": key, "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.rating,places.googleMapsUri" }, body: JSON.stringify({ textQuery: q, languageCode: "pt-BR", maxResultCount: 12 }), signal: AbortSignal.timeout(9000) });
  if (!r.ok) throw new Error(`Google Places respondeu ${r.status}.`);
  const j = (await r.json()) as { places?: { displayName?: { text: string }; formattedAddress?: string; nationalPhoneNumber?: string; rating?: number; googleMapsUri?: string }[] };
  return (j.places ?? []).map((p) => ({ name: p.displayName?.text ?? "", address: p.formattedAddress ?? "", phone: p.nationalPhoneNumber ?? "", rating: p.rating ?? 0, mapsUrl: p.googleMapsUri ?? "" }));
}

const BLOCKED_TITLE = /^(mercado libre|mercado livre|robot check|amazon\.com\.br:? ?algo deu errado|algo deu errado|access denied|just a moment|attention required|acesso negado|captcha|erro|403|404)/i;
export function looksBlocked(p: Product, finalUrl: string) { return /account-verification|captcha|\/login|\/signin|challenge|blocked/i.test(finalUrl) || BLOCKED_TITLE.test(p.title.trim()) || !p.title; }
/** Chute de nome a partir do endereço (ex.: /apple-iphone-15-128-gb/p/MLB123). */
export function titleFromUrl(url: string): string {
  try { const u = new URL(url); const go = u.searchParams.get("go"); const path = new URL(go ?? url).pathname; const seg = path.split("/").filter(Boolean).filter((x) => !/^(p|dp|gp|produto|product|up|item|MLB-?\d+|[A-Z0-9]{10})$/i.test(x)).sort((a, b) => b.length - a.length)[0] ?? "";
    return decodeURIComponent(seg).replace(/[-_+]+/g, " ").replace(/\.[a-z]{2,4}$/i, "").replace(/\b(\w)/, (m) => m.toUpperCase()).slice(0, 120); } catch { return ""; }
}
