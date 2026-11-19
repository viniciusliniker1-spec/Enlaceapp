"use client";
import { useState } from "react";
import { Search, Link2, Loader2, Plus, ExternalLink, ImagePlus } from "lucide-react";
import { brl, cn, fileToDataUrl } from "@/lib/utils";

export interface Product { title: string; image: string; price: number; store: string; url: string; }
const STORES = [
  ["Mercado Livre", (q: string) => `https://lista.mercadolivre.com.br/${encodeURIComponent(q.trim().replace(/\s+/g, "-"))}`],
  ["Amazon", (q: string) => `https://www.amazon.com.br/s?k=${encodeURIComponent(q)}`],
  ["Shopee", (q: string) => `https://shopee.com.br/search?keyword=${encodeURIComponent(q)}`],
  ["Magalu", (q: string) => `https://www.magazineluiza.com.br/busca/${encodeURIComponent(q)}/`],
] as const;

export function ProductPicker({ onAdd, defaultQuery = "" }: { onAdd: (p: Product) => void; defaultQuery?: string }) {
  const [q, setQ] = useState(defaultQuery); const [url, setUrl] = useState(""); const [res, setRes] = useState<Product[] | null>(null); const [cfg, setCfg] = useState(true); const [restricted, setRestricted] = useState(false); const [busy, setBusy] = useState(""); const [err, setErr] = useState(""); const [draft, setDraft] = useState<Product | null>(null);
  const search = async () => { setBusy("s"); setErr(""); setRes(null); try { const r = await fetch(`/api/products/search?q=${encodeURIComponent(q)}`); const j = await r.json(); if (!r.ok) throw new Error(j.error); setCfg(j.configured); setRestricted(!!j.restricted); setRes(j.products); } catch (e) { setErr((e as Error).message); } setBusy(""); };
  const resolve = async () => { setBusy("r"); setErr(""); try { const r = await fetch("/api/products/resolve", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ url }) }); const j = await r.json(); if (!r.ok) throw new Error(j.error); setDraft(j.product); if (j.warning) setErr(j.warning); } catch (e) { setErr((e as Error).message); } setBusy(""); };
  return (
    <div className="space-y-5">
      <section><h3 className="mb-1 font-sans text-sm font-semibold tracking-tight">1. Procure o produto</h3>
        <div className="flex gap-2"><input className="input" placeholder="Ex.: air fryer, jogo de cama casal…" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && q.length > 1 && search()} /><button className="btn btn-primary btn-sm" disabled={q.length < 2 || !!busy} onClick={search}>{busy === "s" ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}Buscar</button></div>
        <div className="mt-2 flex flex-wrap gap-1.5 text-xs"><span className="py-1 text-muted">Abrir a busca na loja:</span>{STORES.map(([n, f]) => <a key={n} href={q.length > 1 ? f(q) : undefined} target="_blank" rel="noreferrer" aria-disabled={q.length < 2} className={cn("inline-flex items-center gap-1 rounded-full border border-line bg-white px-2.5 py-1 font-semibold", q.length < 2 && "pointer-events-none opacity-40")}>{n}<ExternalLink size={11} /></a>)}</div>
        {cfg === false && <p className="mt-2 rounded-xl bg-gold-soft p-3 text-xs">A busca integrada do Mercado Livre ainda não foi ativada neste servidor (precisa das chaves ML_CLIENT_ID e ML_CLIENT_SECRET). Use os botões acima para achar o produto na loja e cole o link abaixo.</p>}
        {restricted && <p className="mt-2 rounded-xl bg-gold-soft p-3 text-xs">O Mercado Livre não libera a busca por texto para este aplicativo. Use os botões acima para achar o produto na loja, copie o link do anúncio e cole no passo 2: o Enlace lê foto, nome e preço pela API oficial.</p>}{res && res.length > 0 && <div className="mt-3 grid max-h-80 gap-2 overflow-y-auto sm:grid-cols-2">{res.map((p) => <button key={p.url} onClick={() => setDraft(p)} className="card flex gap-2 p-2 text-left transition hover:-translate-y-0.5"><img src={p.image} alt="" loading="lazy" referrerPolicy="no-referrer" className="size-16 shrink-0 rounded-lg object-cover" /><span className="min-w-0"><span className="line-clamp-2 text-xs font-semibold">{p.title}</span><span className="block text-xs text-muted">{brl(p.price)} · {p.store}</span></span></button>)}</div>}
        {res && res.length === 0 && cfg && !restricted && <p className="mt-2 text-sm text-muted">Nada encontrado.</p>}</section>
      <section><h3 className="mb-1 font-sans text-sm font-semibold tracking-tight">2. Ou cole o link do produto</h3>
        <div className="flex gap-2"><input className="input" type="url" placeholder="https://…" value={url} onChange={(e) => setUrl(e.target.value)} /><button className="btn btn-ghost btn-sm" disabled={!/^https?:\/\//.test(url) || !!busy} onClick={resolve}>{busy === "r" ? <Loader2 size={14} className="animate-spin" /> : <Link2 size={14} />}Ler link</button></div></section>
      {err && <p role="alert" className="rounded-xl bg-gold-soft p-3 text-sm">{err}</p>}
      {draft && <section className="card p-4"><h3 className="mb-2 font-sans text-sm font-semibold tracking-tight">3. Confira e adicione</h3>
        <div className="flex gap-3">{draft.image ? <img src={draft.image} alt="" referrerPolicy="no-referrer" className="size-24 shrink-0 rounded-xl object-cover" /> : <div className="grid size-24 shrink-0 place-items-center rounded-xl bg-ivory text-xs text-muted">sem foto</div>}
          <div className="min-w-0 flex-1 space-y-2"><input className="input" value={draft.title} placeholder="Nome do produto" onChange={(e) => setDraft({ ...draft, title: e.target.value })} /><div className="grid grid-cols-2 gap-2"><input className="input" type="number" min={0} value={draft.price || ""} placeholder="Preço (R$)" onChange={(e) => setDraft({ ...draft, price: +e.target.value })} /><input className="input" value={draft.store} placeholder="Loja" onChange={(e) => setDraft({ ...draft, store: e.target.value })} /></div></div></div>
        <label className="btn btn-ghost btn-sm mt-3 cursor-pointer"><ImagePlus size={14} />{draft.image ? "Trocar foto" : "Enviar foto do aparelho"}<input type="file" accept="image/*" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (f) setDraft({ ...draft, image: await fileToDataUrl(f) }); }} /></label>
        <button className="btn btn-primary mt-3 w-full" disabled={!draft.title.trim()} onClick={() => { onAdd(draft); setDraft(null); setUrl(""); }}><Plus size={15} />Adicionar à lista de presentes</button></section>}
    </div>
  );
}
