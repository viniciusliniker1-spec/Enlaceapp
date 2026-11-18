"use client";
import { useEffect, useState } from "react";
import { Gift, MessageCircle, ExternalLink } from "lucide-react";
import { decodePayload, brl, fmtDateLong } from "@/lib/utils";
import { Logo } from "@/components/ui";

interface P { p1: string; p2: string; phone: string; date: string; gifts: { id: string; t: string; p: number; c: string; k: string; left: number; u: string }[] }
export default function Lista() {
  const [p, setP] = useState<P | null | undefined>(undefined); const [who, setWho] = useState("");
  useEffect(() => { const h = location.hash.slice(1); setP(h ? decodePayload<P>(h) : null); }, []);
  if (p === undefined) return null; if (!p) return <div className="grid min-h-screen place-items-center p-6 text-muted">Link inválido.</div>;
  const cats = [...new Set(p.gifts.map((g) => g.c))];
  const pick = (g: P["gifts"][number]) => { const n = who || prompt("Seu nome, para os noivos saberem quem presenteou:") || ""; if (!n) return; setWho(n); window.open(`https://wa.me/${p.phone}?text=${encodeURIComponent(`Oi, ${p.p1} e ${p.p2}! Aqui é ${n}. Quero dar de presente: ${g.t} (${brl(g.p)}). Podem reservar para mim?`)}`, "_blank"); };
  return (
    <div className="mx-auto min-h-screen max-w-2xl p-5">
      <header className="py-8 text-center"><Logo className="mb-6 justify-center" /><p className="text-sm text-muted">Lista de presentes de</p><h1 className="text-5xl font-semibold">{p.p1} e {p.p2}</h1><p className="mt-2 text-sm capitalize text-muted">{fmtDateLong(p.date)}</p><p className="mx-auto mt-4 max-w-md text-sm">Escolha um presente e avise os noivos pelo WhatsApp: eles reservam o item para você, e ninguém compra o mesmo.</p></header>
      {cats.map((c) => <section key={c} className="mb-5"><h2 className="mb-2 font-sans text-sm font-semibold uppercase tracking-widest text-sage">{c}</h2>
        <div className="card divide-y divide-line">{p.gifts.filter((g) => g.c === c).map((g) => <div key={g.id} className="flex items-center gap-3 p-4"><Gift className="shrink-0 text-gold" size={18} /><div className="min-w-0 flex-1"><div className="font-medium">{g.t}</div><div className="text-xs text-muted">{brl(g.p)}{g.k === "cota" ? " por cota" : ""} · faltam {g.left}</div></div>{g.u && <a aria-label="Ver produto" href={g.u} target="_blank" rel="noreferrer" className="text-muted"><ExternalLink size={15} /></a>}<button className="btn btn-primary btn-sm" onClick={() => pick(g)}><MessageCircle size={13} />Presentear</button></div>)}</div></section>)}
    </div>
  );
}
