import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export const cn = (...i: ClassValue[]) => twMerge(clsx(i));
export const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
export const uid = () => Math.random().toString(36).slice(2, 10);
export const fmtDate = (iso?: string) => (iso ? new Date(iso + "T12:00:00").toLocaleDateString("pt-BR") : "—");
export const fmtDateLong = (iso?: string) => (iso ? new Date(iso + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "");
export const daysUntil = (iso?: string) => (iso ? Math.ceil((new Date(iso + "T12:00:00").getTime() - Date.now()) / 86400000) : 0);
export const addMonths = (iso: string, m: number) => { const d = new Date(iso + "T12:00:00"); d.setMonth(d.getMonth() + m); return d.toISOString().slice(0, 10); };
export const addDays = (iso: string, n: number) => { const d = new Date(iso + "T12:00:00"); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
export const todayISO = () => new Date().toISOString().slice(0, 10);
export function encodePayload(o: unknown) { return btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/\+/g, "-").replace(/\//g, "_"); }
export function decodePayload<T>(s: string): T | null { try { return JSON.parse(decodeURIComponent(escape(atob(s.replace(/-/g, "+").replace(/_/g, "/"))))); } catch { return null; } }
export async function copyText(t: string) {
  try { await navigator.clipboard.writeText(t); return true; } catch {
    try { const a = document.createElement("textarea"); a.value = t; a.style.position = "fixed"; a.style.opacity = "0"; document.body.appendChild(a); a.select(); const ok = document.execCommand("copy"); a.remove(); return ok; } catch { return false; }
  }
}
/** Converte "1.299,90", "R$ 249,90", "249.90" ou número em reais. */
export function parsePrice(v: unknown): number {
  if (typeof v === "number") return v; if (typeof v !== "string") return 0;
  let s = v.replace(/[^\d.,]/g, ""); if (!s) return 0;
  if (s.includes(",") && s.includes(".")) s = s.lastIndexOf(",") > s.lastIndexOf(".") ? s.replace(/\./g, "").replace(",", ".") : s.replace(/,/g, "");
  else if (s.includes(",")) s = s.replace(",", "."); else if ((s.match(/\./g) ?? []).length > 1) s = s.replace(/\./g, "");
  return Number(s) || 0;
}
/** Reduz uma foto escolhida no aparelho para caber no registro (JPEG ~360 px). */
export function fileToDataUrl(file: File, max = 360): Promise<string> {
  return new Promise((res, rej) => { const img = new Image(); const url = URL.createObjectURL(file);
    img.onload = () => { const k = Math.min(1, max / Math.max(img.width, img.height)); const c = document.createElement("canvas"); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k); c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url); res(c.toDataURL("image/jpeg", 0.72)); };
    img.onerror = () => rej(new Error("Imagem inválida")); img.src = url; });
}
