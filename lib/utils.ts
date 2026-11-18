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
