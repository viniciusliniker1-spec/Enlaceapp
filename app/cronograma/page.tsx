"use client";
import { useEffect, useState } from "react";
import { Phone } from "lucide-react";
import { decodePayload, fmtDateLong } from "@/lib/utils";
import { Logo } from "@/components/ui";
interface P { p1: string; p2: string; date: string; venue: string; addr: string; phone: string; m: [string, string, string][]; v: [string, string, string, string][] }
export default function Pub() {
  const [p, setP] = useState<P | null | undefined>(undefined);
  useEffect(() => { const h = location.hash.slice(1); setP(h ? decodePayload<P>(h) : null); }, []);
  if (p === undefined) return null; if (!p) return <div className="grid min-h-screen place-items-center text-muted">Link inválido.</div>;
  return (
    <div className="mx-auto max-w-2xl p-5">
      <header className="py-6 text-center"><Logo className="mb-4 justify-center" /><p className="text-sm text-muted">Cronograma para fornecedores</p><h1 className="text-4xl font-semibold">{p.p1} e {p.p2}</h1><p className="mt-1 text-sm capitalize text-muted">{fmtDateLong(p.date)} · {p.venue}{p.addr && `, ${p.addr}`}</p></header>
      <section className="card mb-5 p-4">{p.m.map(([t, ti, w], i) => <div key={i} className="flex gap-4 border-t border-line py-2.5 first:border-0"><div className="w-14 font-serif text-lg font-semibold text-sage">{t}</div><div className="flex-1"><div className="text-sm font-medium">{ti}</div>{w && <div className="text-xs text-muted">{w}</div>}</div></div>)}</section>
      <h2 className="mb-2 text-xl font-semibold">Equipe contratada</h2><section className="card divide-y divide-line">{p.v.map(([n, c, ct, ph], i) => <div key={i} className="flex items-center justify-between p-3 text-sm"><div><div className="font-semibold">{n}</div><div className="text-xs text-muted">{c}{ct && ` · ${ct}`}</div></div>{ph && <a href={`https://wa.me/${ph.replace(/\D/g, "")}`} aria-label={`Contato ${n}`} className="text-sage"><Phone size={16} /></a>}</div>)}</section>
      {p.phone && <a className="btn btn-primary mt-5 w-full" href={`https://wa.me/${p.phone}`}>Falar com os noivos</a>}
    </div>
  );
}
