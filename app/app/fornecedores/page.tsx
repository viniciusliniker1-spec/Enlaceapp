"use client";
import { useState } from "react";
import { Plus, Paperclip, Trash2, MessageCircle, Trophy, Search, MapPin, Loader2 } from "lucide-react";
import { useData } from "@/lib/store";
import { PageHeader, Modal, Field, Money, Badge, Empty } from "@/components/ui";
import { VENDOR_CATS } from "@/lib/plan";
import { cn, uid, brl } from "@/lib/utils";
import type { Vendor, Status } from "@/lib/types";

const blank = (): Vendor => ({ id: uid(), name: "", category: VENDOR_CATS[1], contact: "", phone: "", status: "cotacao", value: 0, notes: "", docs: [] });
const TONE = { contratado: "sage", cotacao: "gold", descartado: "muted" } as const; const LBL = { contratado: "Contratado", cotacao: "Em cotação", descartado: "Descartado" };
export default function Fornecedores() {
  const { d, update } = useData(); const [sOpen, setSOpen] = useState(false); const [sq, setSq] = useState({ cat: VENDOR_CATS[1], city: d.wedding.city }); const [places, setPlaces] = useState<{ name: string; address: string; phone: string; rating: number; mapsUrl: string }[] | null>(null); const [cfg, setCfg] = useState(true); const [busy, setBusy] = useState(false); const [serr, setSerr] = useState("");
  const q = `${sq.cat.split(" e ")[0]} para casamento ${sq.city}`;
  const findPlaces = async () => { setBusy(true); setSerr(""); setPlaces(null); try { const r = await fetch(`/api/vendors/search?q=${encodeURIComponent(q)}`); const j = await r.json(); if (!r.ok) throw new Error(j.error); setCfg(j.configured); setPlaces(j.places); } catch (e) { setSerr((e as Error).message); } setBusy(false); };
  const addPlace = (p: { name: string; address: string; phone: string }) => { update((x) => x.vendors.push({ id: uid(), name: p.name, category: sq.cat, contact: "", phone: p.phone, status: "cotacao", value: 0, notes: p.address, docs: [] })); }; const [f, setF] = useState<Vendor | null>(null); const [tab, setTab] = useState<Status | "todos" | "comparar">("todos");
  const list = d.vendors.filter((v) => tab === "todos" || tab === "comparar" || v.status === tab);
  const save = () => { if (!f?.name) return; update((x) => { const i = x.vendors.findIndex((v) => v.id === f.id); if (i >= 0) x.vendors[i] = f; else x.vendors.push(f); }); setF(null); };
  const setStatus = (id: string, s: Status) => update((x) => { x.vendors.find((v) => v.id === id)!.status = s; });
  const cats = [...new Set(d.vendors.map((v) => v.category))];
  return (
    <div>
      <PageHeader title="Fornecedores" sub="Da cotação ao contrato: contato, status, valor e documentos de cada um num lugar só." actions={<><button className="btn btn-ghost" onClick={() => setSOpen(true)}><Search size={15} />Buscar fornecedores</button><button className="btn btn-primary" onClick={() => setF(blank())}><Plus size={15} />Novo fornecedor</button></>} />
      <div className="mb-4 flex flex-wrap gap-2">{(["todos", "contratado", "cotacao", "descartado", "comparar"] as const).map((t) => <button key={t} onClick={() => setTab(t)} className={cn("btn btn-sm", tab === t ? "btn-primary" : "btn-ghost")}>{t === "todos" ? "Todos" : t === "comparar" ? "Comparar cotações" : LBL[t]} {t !== "comparar" && <span className="opacity-60">{t === "todos" ? d.vendors.length : d.vendors.filter((v) => v.status === t).length}</span>}</button>)}</div>
      {tab === "comparar" ? (
        cats.map((c) => { const vs = d.vendors.filter((v) => v.category === c && v.status !== "descartado").sort((a, b) => a.value - b.value); if (vs.length < 1) return null; return (
          <section key={c} className="card mb-3 p-5"><h2 className="mb-2 text-lg font-semibold">{c}</h2>{vs.map((v, i) => <div key={v.id} className="flex items-center justify-between border-t border-line py-2 text-sm first:border-0"><span className="flex items-center gap-2">{i === 0 && vs.length > 1 && <Trophy size={14} className="text-gold" />}{v.name} <Badge tone={TONE[v.status]}>{LBL[v.status]}</Badge></span><Money v={v.value} className="font-semibold" /></div>)}
            {vs.length > 1 && <p className="mt-2 text-xs text-muted">Diferença entre a mais barata e a mais cara: {brl(vs[vs.length - 1].value - vs[0].value)}</p>}</section>); })
      ) : list.length === 0 ? <Empty>Nenhum fornecedor aqui ainda. Cadastrem o primeiro orçamento que receberam.</Empty> : (
        <div className="grid gap-3 md:grid-cols-2">{list.map((v) => { const pays = d.payments.filter((p) => p.vendorId === v.id); const paid = pays.filter((p) => p.paid).reduce((s, p) => s + p.amount, 0); return (
          <article key={v.id} className="card p-5">
            <div className="flex items-start justify-between gap-2"><div><h3 className="font-sans text-lg font-semibold tracking-tight">{v.name}</h3><div className="text-xs text-muted">{v.category}{v.contact && ` · ${v.contact}`}</div></div><Badge tone={TONE[v.status]}>{LBL[v.status]}</Badge></div>
            <div className="mt-3 flex items-end justify-between"><div><div className="label">Valor</div><Money v={v.value} className="text-xl font-semibold" /></div>{pays.length > 0 && <div className="text-right text-xs text-muted">Pago <Money v={paid} /> de <Money v={pays.reduce((s, p) => s + p.amount, 0)} /></div>}{v.status === "contratado" && !pays.length && <Badge tone="terra">Sem pagamento definido</Badge>}</div>
            {v.docs.length > 0 && <div className="mt-3 flex flex-wrap gap-1.5">{v.docs.map((x) => <span key={x} className="inline-flex items-center gap-1 rounded-lg bg-ivory px-2 py-1 text-xs"><Paperclip size={11} />{x}</span>)}</div>}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <select className="input w-auto py-1 text-xs" value={v.status} onChange={(e) => setStatus(v.id, e.target.value as Status)}>{(Object.keys(LBL) as Status[]).map((s) => <option key={s} value={s}>{LBL[s]}</option>)}</select>
              <button className="btn btn-ghost btn-sm" onClick={() => setF(v)}>Editar</button>
              {v.phone && <a className="btn btn-ghost btn-sm" href={`https://wa.me/${v.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"><MessageCircle size={13} />WhatsApp</a>}
              <button aria-label="Excluir" className="ml-auto p-1.5 text-muted hover:text-terra" onClick={() => confirm("Excluir este fornecedor e os pagamentos dele?") && update((x) => { x.vendors = x.vendors.filter((k) => k.id !== v.id); x.payments = x.payments.filter((p) => p.vendorId !== v.id); })}><Trash2 size={15} /></button>
            </div>
          </article>); })}</div>)}
      <Modal open={sOpen} onClose={() => setSOpen(false)} title="Buscar fornecedores reais" wide>
        <div className="space-y-3"><div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]"><select className="input" value={sq.cat} onChange={(e) => setSq({ ...sq, cat: e.target.value })}>{VENDOR_CATS.map((c) => <option key={c}>{c}</option>)}</select><input className="input" placeholder="Cidade" value={sq.city} onChange={(e) => setSq({ ...sq, city: e.target.value })} /><button className="btn btn-primary btn-sm" disabled={busy || sq.city.length < 2} onClick={findPlaces}>{busy ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}Buscar</button></div>
          <a className="btn btn-ghost btn-sm w-full" target="_blank" rel="noreferrer" href={`https://www.google.com/maps/search/${encodeURIComponent(q)}`}><MapPin size={14} />Abrir busca no Google Maps</a>
          {!cfg && <p className="rounded-xl bg-gold-soft p-3 text-xs">A busca integrada precisa da chave GOOGLE_PLACES_KEY no servidor. Enquanto isso, use o Google Maps acima e cadastre o fornecedor em "Novo fornecedor".</p>}
          {serr && <p role="alert" className="text-sm text-terra">{serr}</p>}
          <div className="max-h-96 divide-y divide-line overflow-y-auto">{places?.map((p) => <div key={p.name + p.address} className="flex items-center justify-between gap-3 py-2.5 text-sm"><div className="min-w-0"><div className="font-semibold">{p.name} {p.rating > 0 && <span className="text-xs text-gold">★ {p.rating}</span>}</div><div className="truncate text-xs text-muted">{p.address}{p.phone && ` · ${p.phone}`}</div></div><div className="flex shrink-0 gap-1.5">{p.mapsUrl && <a className="btn btn-ghost btn-sm" href={p.mapsUrl} target="_blank" rel="noreferrer">Mapa</a>}<button className="btn btn-primary btn-sm" disabled={d.vendors.some((v) => v.name === p.name)} onClick={() => addPlace(p)}>{d.vendors.some((v) => v.name === p.name) ? "Na lista" : "Adicionar"}</button></div></div>)}</div></div>
      </Modal>
      <Modal open={!!f} onClose={() => setF(null)} title={f && d.vendors.some((v) => v.id === f.id) ? "Editar fornecedor" : "Novo fornecedor"}>
        {f && <div className="space-y-3">
          <Field label="Nome"><input className="input" autoFocus value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-3"><Field label="Categoria"><select className="input" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>{VENDOR_CATS.map((c) => <option key={c}>{c}</option>)}</select></Field><Field label="Status"><select className="input" value={f.status} onChange={(e) => setF({ ...f, status: e.target.value as Status })}>{(Object.keys(LBL) as Status[]).map((s) => <option key={s} value={s}>{LBL[s]}</option>)}</select></Field></div>
          <div className="grid grid-cols-2 gap-3"><Field label="Contato"><input className="input" value={f.contact} onChange={(e) => setF({ ...f, contact: e.target.value })} /></Field><Field label="WhatsApp"><input className="input" inputMode="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></Field></div>
          <Field label="Valor (R$)"><input type="number" className="input" value={f.value} onChange={(e) => setF({ ...f, value: +e.target.value })} /></Field>
          <Field label="Documentos (nomes dos arquivos, separados por vírgula)"><input className="input" value={f.docs.join(", ")} onChange={(e) => setF({ ...f, docs: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} placeholder="Proposta.pdf, Contrato.pdf" /></Field>
          <Field label="Anotações"><textarea className="input min-h-20" value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} /></Field>
          <button className="btn btn-primary w-full" onClick={save}>Salvar</button>
        </div>}
      </Modal>
    </div>
  );
}
