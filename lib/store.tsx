"use client";
import { createContext, useContext, useEffect, useMemo, useState, useCallback, useRef, type ReactNode } from "react";
import type { AppState, AppUser, WeddingData, Wedding, WeddingMeta, TeamInfo } from "./types";
import { buildBudget, buildEnxoval, buildGifts, buildMoments, buildTables, buildTasks } from "./plan";
import { uid, addMonths, todayISO } from "./utils";

const COLLS = ["vendors", "payments", "cats", "guests", "tables", "tasks", "gifts", "enxoval", "moments", "recados"] as const;
type Op = { c: string; id: string; body: unknown | null };
const empty: AppState = { user: null, activeId: null, weddings: {}, meta: {}, hideMoney: false };

export function newWedding(w: Partial<Wedding>): WeddingData {
  const wedding: Wedding = {
    id: uid() + uid(), partner1: "", partner2: "", date: addMonths(todayISO(), 10), time: "16:30", city: "", venue: "", style: "classico", palette: 0,
    budget: 60000, guestsEstimate: 120, phone: "", ceremonyPlace: "", ceremonyAddr: "", receptionPlace: "", receptionAddr: "", dress: "Esporte fino",
    rsvpDeadline: addMonths(todayISO(), 8), message: "Com muita alegria, convidamos vocês para celebrar o nosso casamento.", liveTogether: false, homeType: "apto", honeymoon: true, ...w,
  };
  const enxoval = buildEnxoval(wedding);
  return { wedding, vendors: [], payments: [], cats: buildBudget(wedding), guests: [], tables: buildTables(wedding), tasks: buildTasks(wedding), gifts: buildGifts(wedding, enxoval), enxoval, moments: buildMoments(wedding), recados: [] };
}
function diff(a: WeddingData, b: WeddingData): Op[] {
  const ops: Op[] = [];
  if (JSON.stringify(a.wedding) !== JSON.stringify(b.wedding)) ops.push({ c: "wedding", id: "main", body: b.wedding });
  for (const c of COLLS) {
    const old = new Map((a[c] as { id: string }[]).map((x) => [x.id, JSON.stringify(x)])); const seen = new Set<string>();
    for (const x of b[c] as { id: string }[]) { seen.add(x.id); if (old.get(x.id) !== JSON.stringify(x)) ops.push({ c, id: x.id, body: x }); }
    for (const id of old.keys()) if (!seen.has(id)) ops.push({ c, id, body: null });
  }
  return ops;
}
async function api<T = unknown>(url: string, init?: RequestInit): Promise<T> {
  const r = await fetch(url, { ...init, headers: { "content-type": "application/json", ...(init?.headers ?? {}) } });
  const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error((j as { error?: string }).error || "Erro de conexão"); return j as T;
}
interface SrvWedding { id: string; role: WeddingMeta["role"]; data: WeddingData; seq: number; giftToken: string; scheduleToken: string; team: TeamInfo; billing: WeddingMeta["billing"]; }
const toLocal = (w: SrvWedding) => ({ data: w.data, meta: { seq: w.seq, role: w.role, giftToken: w.giftToken, scheduleToken: w.scheduleToken, team: w.team, billing: w.billing } as WeddingMeta });

interface Ctx {
  state: AppState; ready: boolean; data: WeddingData | null; meta: WeddingMeta | null; canEdit: boolean; syncError: string; saving: boolean;
  update: (fn: (d: WeddingData) => void) => void; setState: (fn: (s: AppState) => AppState) => void;
  createWedding: (w: Partial<Wedding>) => Promise<string>; createDemo: (d: WeddingData) => Promise<void>; switchTo: (id: string) => void; removeWedding: (id: string) => Promise<void>;
  auth: (mode: "login" | "register", body: Record<string, string>) => Promise<void>; logout: () => Promise<void>; setTeam: (id: string, t: TeamInfo) => void;
}
const C = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setS] = useState<AppState>(empty); const [ready, setReady] = useState(false); const [syncError, setSyncError] = useState(""); const [saving, setSaving] = useState(false);
  const queue = useRef<Map<string, Op & { w: string }>>(new Map()); const recent = useRef<Map<string, number>>(new Map()); const timer = useRef<ReturnType<typeof setTimeout> | null>(null); const stateRef = useRef(state); stateRef.current = state;

  const load = useCallback(async () => {
    try {
      const { user } = await api<{ user: AppUser | null }>("/api/auth/me");
      if (!user) { setS((s) => ({ ...s, user: null, weddings: {}, meta: {}, activeId: null })); return; }
      const { weddings } = await api<{ weddings: SrvWedding[] }>("/api/weddings"); const wd: Record<string, WeddingData> = {}; const meta: Record<string, WeddingMeta> = {};
      for (const w of weddings) { const l = toLocal(w); wd[w.id] = l.data; meta[w.id] = l.meta; }
      let active: string | null = null; try { active = localStorage.getItem("enlace:active"); } catch {}
      if (!active || !wd[active]) active = Object.keys(wd)[0] ?? null;
      let hide = false; try { hide = localStorage.getItem("enlace:hide") === "1"; } catch {}
      setS({ user, weddings: wd, meta, activeId: active, hideMoney: hide });
    } catch (e) { setSyncError((e as Error).message); }
  }, []);
  useEffect(() => { load().finally(() => setReady(true)); }, [load]);
  useEffect(() => { document.documentElement.classList.toggle("privacy-blur", state.hideMoney); try { localStorage.setItem("enlace:hide", state.hideMoney ? "1" : "0"); } catch {} }, [state.hideMoney]);
  useEffect(() => { if (state.activeId) try { localStorage.setItem("enlace:active", state.activeId); } catch {} }, [state.activeId]);

  const flush = useCallback(async () => {
    const items = [...queue.current.values()]; if (!items.length) return; queue.current.clear(); setSaving(true);
    const byW: Record<string, Op[]> = {}; items.forEach((i) => (byW[i.w] ??= []).push({ c: i.c, id: i.id, body: i.body }));
    try { for (const [w, ops] of Object.entries(byW)) { await api(`/api/w/${w}/ops`, { method: "POST", body: JSON.stringify({ ops }) }); const t = Date.now(); ops.forEach((o) => recent.current.set(`${w}:${o.c}:${o.id}`, t)); } setSyncError(""); }
    catch (e) { const m = (e as Error).message; setSyncError(m); if (/período grátis/i.test(m)) { queue.current.clear(); setS((x) => { const w = Object.keys(byW)[0]; return x.meta[w] ? { ...x, meta: { ...x.meta, [w]: { ...x.meta[w], billing: { ...x.meta[w].billing, state: "blocked" } } } } : x; }); return setSaving(false); } items.forEach((i) => queue.current.set(`${i.w}:${i.c}:${i.id}`, i)); }
    setSaving(false);
  }, []);
  const schedule = useCallback(() => { if (timer.current) clearTimeout(timer.current); timer.current = setTimeout(flush, 350); }, [flush]);
  useEffect(() => { const h = () => { if (queue.current.size) { const items = [...queue.current.values()]; const byW: Record<string, Op[]> = {}; items.forEach((i) => (byW[i.w] ??= []).push({ c: i.c, id: i.id, body: i.body })); for (const [w, ops] of Object.entries(byW)) navigator.sendBeacon?.(`/api/w/${w}/ops`, new Blob([JSON.stringify({ ops })], { type: "application/json" })); } }; addEventListener("pagehide", h); return () => removeEventListener("pagehide", h); }, []);

  const activeRole = state.activeId ? state.meta[state.activeId]?.role : undefined; const canEdit = activeRole === "owner" || activeRole === "editar";
  const update = useCallback((fn: (d: WeddingData) => void) => {
    const s = stateRef.current; const id = s.activeId; if (!id || !s.weddings[id]) return; const role = s.meta[id]?.role; if (role === "ver") { setSyncError("Você só pode visualizar este casamento."); return; }
    const old = s.weddings[id]; const d = structuredClone(old); fn(d); const ops = diff(old, d); if (!ops.length) return;
    ops.forEach((o) => queue.current.set(`${id}:${o.c}:${o.id}`, { ...o, w: id })); schedule();
    setS((x) => ({ ...x, weddings: { ...x.weddings, [id]: d } }));
  }, [schedule]);

  // polling: traz mudanças de outros membros e respostas públicas (RSVP, presentes reservados)
  useEffect(() => {
    if (!state.user || !state.activeId) return; const id = state.activeId; let stop = false;
    const tick = async () => {
      if (stop || document.hidden || queue.current.size) return;
      try {
        const seq = stateRef.current.meta[id]?.seq ?? 0; const r = await api<{ seq: number; changes: Op[] }>(`/api/w/${id}/ops?since=${seq}`); if (stop || !r.changes.length) return;
        const t = Date.now();
        setS((x) => { const d = structuredClone(x.weddings[id]); if (!d) return x;
          for (const ch of r.changes) { const key = `${id}:${ch.c}:${ch.id}`; if (queue.current.has(key) || t - (recent.current.get(key) ?? 0) < 4000) continue;
            if (ch.c === "wedding") { if (ch.body) d.wedding = ch.body as Wedding; continue; }
            const arr = (d as unknown as Record<string, { id: string }[]>)[ch.c]; if (!arr) continue; const i = arr.findIndex((q) => q.id === ch.id);
            if (ch.body === null) { if (i >= 0) arr.splice(i, 1); } else if (i >= 0) arr[i] = ch.body as { id: string }; else arr.push(ch.body as { id: string }); }
          return { ...x, weddings: { ...x.weddings, [id]: d }, meta: { ...x.meta, [id]: { ...x.meta[id], seq: r.seq } } }; });
      } catch { /* offline: tenta de novo */ }
    };
    const i = setInterval(tick, 5000); return () => { stop = true; clearInterval(i); };
  }, [state.user, state.activeId]);

  const adopt = useCallback((w: SrvWedding) => { const l = toLocal(w); setS((s) => ({ ...s, activeId: w.id, weddings: { ...s.weddings, [w.id]: l.data }, meta: { ...s.meta, [w.id]: l.meta } })); }, []);
  const createWedding = useCallback(async (w: Partial<Wedding>) => { const d = newWedding(w); const r = await api<SrvWedding>("/api/weddings", { method: "POST", body: JSON.stringify({ data: d }) }); adopt({ ...r, id: d.wedding.id }); return d.wedding.id; }, [adopt]);
  const createDemo = useCallback(async (d: WeddingData) => { const r = await api<SrvWedding>("/api/weddings", { method: "POST", body: JSON.stringify({ data: d }) }); adopt({ ...r, id: d.wedding.id }); }, [adopt]);
  const auth = useCallback(async (mode: "login" | "register", body: Record<string, string>) => { await api(`/api/auth/${mode}`, { method: "POST", body: JSON.stringify(body) }); await load(); }, [load]);
  const logout = useCallback(async () => { await flush(); await api("/api/auth/logout", { method: "POST" }); setS({ ...empty }); }, [flush]);
  const switchTo = useCallback((id: string) => setS((s) => ({ ...s, activeId: id })), []);
  const removeWedding = useCallback(async (id: string) => { await api(`/api/w/${id}`, { method: "DELETE" }); setS((s) => { const w = { ...s.weddings }; const m = { ...s.meta }; delete w[id]; delete m[id]; return { ...s, weddings: w, meta: m, activeId: s.activeId === id ? Object.keys(w)[0] ?? null : s.activeId }; }); }, []);
  const setTeam = useCallback((id: string, t: TeamInfo) => setS((s) => ({ ...s, meta: { ...s.meta, [id]: { ...s.meta[id], team: t } } })), []);
  const setState = useCallback((fn: (s: AppState) => AppState) => setS((s) => fn(s)), []);
  const data = state.activeId ? state.weddings[state.activeId] ?? null : null; const meta = state.activeId ? state.meta[state.activeId] ?? null : null;
  const v = useMemo(() => ({ state, ready, data, meta, canEdit, syncError, saving, update, setState, createWedding, createDemo, switchTo, removeWedding, auth, logout, setTeam }), [state, ready, data, meta, canEdit, syncError, saving, update, setState, createWedding, createDemo, switchTo, removeWedding, auth, logout, setTeam]);
  return <C.Provider value={v}>{children}</C.Provider>;
}
export const useStore = () => { const c = useContext(C); if (!c) throw new Error("StoreProvider ausente"); return c; };
export const useData = () => { const { data, update } = useStore(); if (!data) throw new Error("sem casamento"); return { d: data, update }; };
