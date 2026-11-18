"use client";
import { useMemo, useState } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import { Check, X, Share2, Plus, Trash2, Link2, Gift as GiftI, Heart } from "lucide-react";
import { useData } from "@/lib/store";
import { PageHeader, Progress, Badge, Field, Modal, Money } from "@/components/ui";
import { cn, encodePayload, uid, brl } from "@/lib/utils";
import type { EnxovalItem, Gift } from "@/lib/types";

const ST: Record<EnxovalItem["state"], string> = { novo: "Pendente", tenho: "Já temos", falta: "Falta", comprado: "Comprado/ganhado" };
function Swipe({ items, onAnswer }: { items: EnxovalItem[]; onAnswer: (id: string, s: EnxovalItem["state"]) => void }) {
  const x = useMotionValue(0); const rot = useTransform(x, [-200, 200], [-12, 12]); const it = items[0];
  if (!it) return <div className="card grid h-64 place-items-center p-6 text-center text-sm text-muted">Tudo revisado! Vejam a lista completa abaixo.</div>;
  return (
    <div className="relative mx-auto h-64 max-w-sm">
      {items[1] && <div className="card absolute inset-x-3 top-3 h-56 opacity-60" />}
      <AnimatePresence mode="popLayout">
        <motion.div key={it.id} style={{ x, rotate: rot }} drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.8} onDragEnd={(_, i) => { if (i.offset.x > 110) onAnswer(it.id, "tenho"); else if (i.offset.x < -110) onAnswer(it.id, "falta"); }} exit={{ opacity: 0, scale: 0.9 }}
          className="card absolute inset-0 flex cursor-grab flex-col items-center justify-center gap-2 p-6 text-center active:cursor-grabbing">
          <Badge tone="gold">{it.room}</Badge><div className="font-serif text-3xl font-semibold">{it.name}</div><div className="text-sm text-muted">Quantidade sugerida: {it.qty}{it.essential ? " · essencial" : ""}</div>
          <div className="mt-3 flex gap-3"><button className="btn btn-ghost" onClick={() => onAnswer(it.id, "falta")}><X size={15} />Ainda não</button><button className="btn btn-primary" onClick={() => onAnswer(it.id, "tenho")}><Check size={15} />Já temos</button></div>
          <p className="text-[11px] text-muted">ou arraste para os lados</p>
        </motion.div>
      </AnimatePresence>
    </div>);
}
export default function Presentes() {
  const { d, update } = useData(); const [tab, setTab] = useState<"enxoval" | "lista" | "links">("enxoval"); const [room, setRoom] = useState("Todos"); const [g, setG] = useState<Gift | null>(null); const [copied, setCopied] = useState(false);
  const rooms = useMemo(() => ["Todos", ...new Set(d.enxoval.map((e) => e.room))], [d.enxoval]);
  const pend = d.enxoval.filter((e) => e.state === "novo"); const have = d.enxoval.filter((e) => e.state === "tenho" || e.state === "comprado").length;
  const setS = (id: string, s: EnxovalItem["state"]) => update((x) => { x.enxoval.find((e) => e.id === id)!.state = s; });
  const w = d.wedding;
  const share = async () => { const url = `${location.origin}/lista#${encodePayload({ p1: w.partner1, p2: w.partner2, phone: w.phone, date: w.date, gifts: d.gifts.filter((x) => x.got < x.qty).map((x) => ({ id: x.id, t: x.title, p: x.price, c: x.category, k: x.kind, left: x.qty - x.got, u: x.url })) })}`; await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1800); };
  const addFromEnx = (e: EnxovalItem) => update((x) => { x.gifts.push({ id: uid(), title: e.name, category: e.room, price: 150, url: "", qty: Math.min(e.qty, 3), got: 0, reservedBy: [], kind: "casa" }); x.enxoval.find((k) => k.id === e.id)!.state = "falta"; });
  const save = () => { if (!g?.title) return; update((x) => { const i = x.gifts.findIndex((k) => k.id === g.id); if (i >= 0) x.gifts[i] = g; else x.gifts.push(g); }); setG(null); };
  const host = (u: string) => { try { return new URL(u).hostname.replace("www.", ""); } catch { return ""; } };
  return (
    <div>
      <PageHeader title="Presentes e enxoval" sub="Montem o enxoval da casa, escolham o que querem ganhar e compartilhem um link: ninguém dá o mesmo item." actions={<button className="btn btn-primary" onClick={share}><Share2 size={15} />{copied ? "Link copiado!" : "Copiar link da lista"}</button>} />
      <div className="mb-4 flex gap-2">{([["enxoval", "Enxoval da casa"], ["lista", "Lista de presentes"], ["links", "Links salvos"]] as const).map(([k, l]) => <button key={k} onClick={() => setTab(k)} className={cn("btn btn-sm", tab === k ? "btn-primary" : "btn-ghost")}>{l}</button>)}</div>
      {tab === "enxoval" && (<>
        <div className="card mb-4 p-5"><div className="mb-2 flex justify-between text-sm"><span className="font-semibold">{have} de {d.enxoval.length} itens resolvidos</span><span className="text-muted">{pend.length} para revisar</span></div><Progress value={(have / Math.max(1, d.enxoval.length)) * 100} tone="gold" /></div>
        <Swipe items={pend} onAnswer={setS} />
        <div className="my-4 flex flex-wrap gap-2">{rooms.map((r) => { const rs = d.enxoval.filter((e) => r === "Todos" || e.room === r); return <button key={r} onClick={() => setRoom(r)} className={cn("btn btn-sm", room === r ? "btn-primary" : "btn-ghost")}>{r} <span className="opacity-60">{rs.filter((e) => e.state === "tenho" || e.state === "comprado").length}/{rs.length}</span></button>; })}</div>
        <div className="card divide-y divide-line">{d.enxoval.filter((e) => room === "Todos" || e.room === room).map((e) => (
          <div key={e.id} className="flex flex-wrap items-center gap-2 px-4 py-2.5 text-sm"><span className="min-w-0 flex-1"><span className="font-medium">{e.name}</span> {e.essential && <Badge tone="sage">essencial</Badge>}</span>
            <label className="flex items-center gap-1 text-xs text-muted">Qtd <input type="number" min={1} className="input w-16 py-1" value={e.qty} onChange={(ev) => update((x) => { x.enxoval.find((k) => k.id === e.id)!.qty = +ev.target.value; })} /></label>
            <select className="rounded-lg border border-line bg-white px-1.5 py-1 text-xs" value={e.state} onChange={(ev) => setS(e.id, ev.target.value as EnxovalItem["state"])}>{(Object.keys(ST) as EnxovalItem["state"][]).map((s) => <option key={s} value={s}>{ST[s]}</option>)}</select>
            {e.state === "falta" && !d.gifts.some((k) => k.title === e.name) && <button className="btn btn-ghost btn-sm" onClick={() => addFromEnx(e)}><GiftI size={12} />Pôr na lista</button>}</div>))}</div></>)}
      {tab === "lista" && (<>
        <div className="mb-4 flex justify-end"><button className="btn btn-ghost" onClick={() => setG({ id: uid(), title: "", category: "Casa", price: 100, url: "", qty: 1, got: 0, reservedBy: [], kind: "casa" })}><Plus size={15} />Novo presente ou cota</button></div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{d.gifts.map((x) => (
          <article key={x.id} className="card flex flex-col p-4"><div className="flex items-start justify-between gap-2"><Badge tone={x.kind === "lua-de-mel" ? "terra" : x.kind === "cota" ? "gold" : "sage"}>{x.category}</Badge>{x.got >= x.qty && <Badge tone="sage"><Check size={11} className="mr-1" />Garantido</Badge>}</div>
            <h3 className="mt-2 font-sans text-base font-semibold tracking-tight">{x.title}</h3><Money v={x.price} className="text-lg font-semibold" /><div className="text-xs text-muted">{x.got}/{x.qty} escolhidos{x.reservedBy.length > 0 && ` · ${x.reservedBy.join(", ")}`}</div><Progress value={(x.got / x.qty) * 100} className="mt-2" tone="terra" />
            <div className="mt-3 flex flex-wrap gap-1.5"><button className="btn btn-ghost btn-sm" onClick={() => { const who = prompt("Quem escolheu este presente?"); if (who) update((s) => { const k = s.gifts.find((q) => q.id === x.id)!; k.got = Math.min(k.qty, k.got + 1); k.reservedBy.push(who); }); }}><Heart size={12} />Alguém escolheu</button><button className="btn btn-ghost btn-sm" onClick={() => setG(x)}>Editar</button><button aria-label="Excluir" className="ml-auto text-muted hover:text-terra" onClick={() => update((s) => { s.gifts = s.gifts.filter((q) => q.id !== x.id); })}><Trash2 size={14} /></button></div></article>))}</div></>)}
      {tab === "links" && (
        <div className="space-y-3"><p className="text-sm text-muted">Cole o link de qualquer loja (Amazon, Mercado Livre, Shopee…), ajuste nome e preço e ele entra na lista de presentes.</p>
          <div className="card divide-y divide-line">{d.gifts.filter((x) => x.url).map((x) => <a key={x.id} href={x.url} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-2 p-4 text-sm hover:bg-ivory"><span className="flex items-center gap-2"><Link2 size={14} />{x.title}</span><span className="text-xs text-muted">{host(x.url)} · {brl(x.price)}</span></a>)}{!d.gifts.some((x) => x.url) && <p className="p-6 text-center text-sm text-muted">Nenhum link salvo ainda.</p>}</div>
          <button className="btn btn-primary" onClick={() => setG({ id: uid(), title: "", category: "Casa", price: 0, url: "", qty: 1, got: 0, reservedBy: [], kind: "casa" })}><Plus size={15} />Salvar produto por link</button></div>)}
      <Modal open={!!g} onClose={() => setG(null)} title="Presente"><div className="space-y-3">{g && <>
        <Field label="Nome"><input className="input" autoFocus value={g.title} onChange={(e) => setG({ ...g, title: e.target.value })} /></Field>
        <div className="grid grid-cols-2 gap-3"><Field label="Preço (R$)"><input type="number" className="input" value={g.price} onChange={(e) => setG({ ...g, price: +e.target.value })} /></Field><Field label="Quantidade"><input type="number" min={1} className="input" value={g.qty} onChange={(e) => setG({ ...g, qty: Math.max(1, +e.target.value) })} /></Field></div>
        <div className="grid grid-cols-2 gap-3"><Field label="Categoria"><input className="input" value={g.category} onChange={(e) => setG({ ...g, category: e.target.value })} /></Field><Field label="Tipo"><select className="input" value={g.kind} onChange={(e) => setG({ ...g, kind: e.target.value as Gift["kind"] })}><option value="casa">Casa</option><option value="lua-de-mel">Lua de mel</option><option value="cota">Cota</option></select></Field></div>
        <Field label="Link do produto"><input className="input" type="url" value={g.url} onChange={(e) => setG({ ...g, url: e.target.value })} placeholder="https://…" /></Field><button className="btn btn-primary w-full" onClick={save}>Salvar</button></>}</div></Modal>
    </div>
  );
}
