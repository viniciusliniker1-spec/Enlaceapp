"use client";
import { use, useEffect, useState } from "react";
import { Gift, ExternalLink, Check } from "lucide-react";
import { brl, fmtDateLong } from "@/lib/utils";
import { Logo, Modal, Field } from "@/components/ui";

interface G { id: string; title: string; category: string; price: number; url: string; qty: number; got: number; kind: string; image: string; store: string }
interface P { p1: string; p2: string; date: string; gifts: G[] }
export default function Lista({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params); const [p, setP] = useState<P | null | undefined>(undefined); const [sel, setSel] = useState<G | null>(null); const [name, setName] = useState(""); const [qty, setQty] = useState(1); const [err, setErr] = useState(""); const [done, setDone] = useState<{ g: G; url: string } | null>(null); const [busy, setBusy] = useState(false);
  const load = () => fetch(`/api/public/gifts/${token}`).then((r) => (r.ok ? r.json() : null)).then(setP).catch(() => setP(null));
  useEffect(() => { load(); try { setName(localStorage.getItem("enlace:guest") ?? ""); } catch {} }, [token]); // eslint-disable-line
  if (p === undefined) return <div className="grid min-h-screen place-items-center text-muted">Carregando…</div>; if (!p) return <div className="grid min-h-screen place-items-center p-6 text-muted">Lista não encontrada.</div>;
  const cats = [...new Set(p.gifts.map((g) => g.category))];
  const reserve = async () => { if (!sel) return; setBusy(true); setErr(""); const r = await fetch(`/api/public/gifts/${token}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ giftId: sel.id, name, qty }) }); const j = await r.json(); setBusy(false); if (!r.ok) { setErr(j.error); load(); return; } try { localStorage.setItem("enlace:guest", name); } catch {} setDone({ g: sel, url: j.url || sel.url }); setSel(null); load(); };
  return (
    <div className="mx-auto min-h-screen max-w-3xl p-5">
      <header className="py-8 text-center"><Logo className="mb-6 justify-center" /><p className="text-sm text-muted">Lista de presentes de</p><h1 className="text-5xl font-semibold">{p.p1} e {p.p2}</h1><p className="mt-2 text-sm capitalize text-muted">{fmtDateLong(p.date)}</p><p className="mx-auto mt-4 max-w-md text-sm">Escolha um presente e reserve: ele some da lista para os outros convidados, e ninguém compra o mesmo item.</p></header>
      {done && <div role="status" className="mb-5 rounded-2xl bg-sage-soft p-4 text-sm"><b>Reservado: {done.g.title}.</b> Obrigado! {done.url ? <>Agora é só comprar na loja: <a className="font-semibold underline" href={done.url} target="_blank" rel="noreferrer">abrir o produto</a>.</> : "Combine a entrega ou o valor com os noivos."}</div>}
      {cats.map((c) => <section key={c} className="mb-6"><h2 className="mb-2 font-sans text-sm font-semibold uppercase tracking-widest text-sage">{c}</h2>
        <div className="grid gap-3 sm:grid-cols-2">{p.gifts.filter((g) => g.category === c).map((g) => { const left = g.qty - g.got; return (
          <div key={g.id} className="card flex gap-3 p-3">{g.image ? <img src={g.image} alt="" loading="lazy" referrerPolicy="no-referrer" className="size-20 shrink-0 rounded-xl object-cover" /> : <div className="grid size-20 shrink-0 place-items-center rounded-xl bg-gold-soft text-gold"><Gift /></div>}
            <div className="flex min-w-0 flex-1 flex-col"><div className="line-clamp-2 text-sm font-semibold">{g.title}</div><div className="text-xs text-muted">{brl(g.price)}{g.kind === "cota" ? " por cota" : ""}{g.store && ` · ${g.store}`}</div>
              <div className="mt-auto flex items-center gap-2 pt-2">{left > 0 ? <button className="btn btn-primary btn-sm" onClick={() => { setSel(g); setQty(1); setErr(""); }}>Presentear</button> : <span className="inline-flex items-center gap-1 text-xs font-semibold text-sage"><Check size={13} />Já escolhido</span>}{g.url && <a aria-label="Ver produto" href={g.url} target="_blank" rel="noreferrer" className="text-muted"><ExternalLink size={14} /></a>}{left > 0 && g.qty > 1 && <span className="text-xs text-muted">faltam {left}</span>}</div></div></div>); })}</div></section>)}
      <Modal open={!!sel} onClose={() => setSel(null)} title={sel?.title ?? ""}>{sel && <div className="space-y-3"><Field label="Seu nome (os noivos vão ver)"><input className="input" autoFocus value={name} onChange={(e) => setName(e.target.value)} /></Field>{sel.qty - sel.got > 1 && <Field label="Quantidade"><input type="number" min={1} max={sel.qty - sel.got} className="input" value={qty} onChange={(e) => setQty(Math.max(1, Math.min(sel.qty - sel.got, +e.target.value)))} /></Field>}{err && <p role="alert" className="text-sm text-terra">{err}</p>}<button className="btn btn-primary w-full" disabled={!name.trim() || busy} onClick={reserve}>{busy ? "Reservando…" : "Reservar este presente"}</button></div>}</Modal>
    </div>
  );
}
