"use client";
import { createContext, useContext, useEffect, useMemo, useState, useCallback, type ReactNode } from "react";
import type { AppState, WeddingData, Wedding } from "./types";
import { buildBudget, buildEnxoval, buildGifts, buildMoments, buildTables, buildTasks } from "./plan";
import { uid, addMonths, todayISO } from "./utils";

const KEY = "enlace:v1";
const empty: AppState = { role: "casal", activeId: null, weddings: {}, hideMoney: false, onboarded: false };

export function newWedding(w: Partial<Wedding>): WeddingData {
  const wedding: Wedding = {
    id: uid(), partner1: "", partner2: "", date: addMonths(todayISO(), 10), time: "16:30", city: "", venue: "", style: "classico", palette: 0,
    budget: 60000, guestsEstimate: 120, phone: "", ceremonyPlace: "", ceremonyAddr: "", receptionPlace: "", receptionAddr: "", dress: "Esporte fino",
    rsvpDeadline: addMonths(todayISO(), 8), message: "Com muita alegria, convidamos vocês para celebrar o nosso casamento.", liveTogether: false, homeType: "apto", honeymoon: true, ...w,
  };
  const enxoval = buildEnxoval(wedding);
  return { wedding, vendors: [], payments: [], cats: buildBudget(wedding), guests: [], tables: buildTables(wedding), tasks: buildTasks(wedding), gifts: buildGifts(wedding, enxoval), enxoval, moments: buildMoments(wedding), recados: [], members: [] };
}

interface Ctx {
  state: AppState; ready: boolean; data: WeddingData | null;
  update: (fn: (d: WeddingData) => void) => void; setState: (fn: (s: AppState) => AppState) => void;
  createWedding: (w: Partial<Wedding>, role?: AppState["role"]) => string; switchTo: (id: string) => void; removeWedding: (id: string) => void;
}
const C = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setS] = useState<AppState>(empty); const [ready, setReady] = useState(false);
  useEffect(() => { try { const r = localStorage.getItem(KEY); if (r) setS({ ...empty, ...JSON.parse(r) }); } catch {} setReady(true); }, []);
  useEffect(() => { if (ready) try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {} }, [state, ready]);
  useEffect(() => { document.documentElement.classList.toggle("privacy-blur", state.hideMoney); }, [state.hideMoney]);
  const setState = useCallback((fn: (s: AppState) => AppState) => setS((s) => fn(s)), []);
  const update = useCallback((fn: (d: WeddingData) => void) => setS((s) => {
    if (!s.activeId || !s.weddings[s.activeId]) return s; const d = structuredClone(s.weddings[s.activeId]); fn(d); return { ...s, weddings: { ...s.weddings, [s.activeId]: d } };
  }), []);
  const createWedding = useCallback((w: Partial<Wedding>, role?: AppState["role"]) => { const d = newWedding(w); setS((s) => ({ ...s, role: role ?? s.role, onboarded: true, activeId: d.wedding.id, weddings: { ...s.weddings, [d.wedding.id]: d } })); return d.wedding.id; }, []);
  const switchTo = useCallback((id: string) => setS((s) => ({ ...s, activeId: id })), []);
  const removeWedding = useCallback((id: string) => setS((s) => { const w = { ...s.weddings }; delete w[id]; const ids = Object.keys(w); return { ...s, weddings: w, activeId: s.activeId === id ? ids[0] ?? null : s.activeId }; }), []);
  const data = state.activeId ? state.weddings[state.activeId] ?? null : null;
  const v = useMemo(() => ({ state, ready, data, update, setState, createWedding, switchTo, removeWedding }), [state, ready, data, update, setState, createWedding, switchTo, removeWedding]);
  return <C.Provider value={v}>{children}</C.Provider>;
}
export const useStore = () => { const c = useContext(C); if (!c) throw new Error("StoreProvider ausente"); return c; };
export const useData = () => { const { data, update } = useStore(); if (!data) throw new Error("sem casamento"); return { d: data, update }; };
