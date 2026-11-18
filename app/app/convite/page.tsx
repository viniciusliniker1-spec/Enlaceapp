"use client";
import { useMemo, useState } from "react";
import { Copy, MessageCircle, Plus, Trash2, Check } from "lucide-react";
import { useData } from "@/lib/store";
import { PageHeader, Badge, Field } from "@/components/ui";
import { InviteCard, type InviteData } from "@/components/invite";
import { PALETTES, STYLES } from "@/lib/plan";
import { cn, encodePayload, uid, todayISO } from "@/lib/utils";

export default function ConviteAdmin() {
  const { d, update } = useData(); const w = d.wedding; const [done, setDone] = useState(""); const [rn, setRn] = useState({ from: "", text: "" });
  const set = (p: Partial<typeof w>) => update((x) => Object.assign(x.wedding, p));
  const base: InviteData = { p1: w.partner1, p2: w.partner2, date: w.date, time: w.time, cerN: w.ceremonyPlace, cerA: w.ceremonyAddr, recN: w.receptionPlace || w.venue, recA: w.receptionAddr, dress: w.dress, deadline: w.rsvpDeadline, style: w.style, palette: w.palette, msg: w.message, phone: w.phone };
  const families = useMemo(() => { const m: Record<string, string[]> = {}; d.guests.filter((g) => g.list === "A").forEach((g) => (m[g.group] ??= []).push(g.name)); return Object.entries(m); }, [d.guests]);
  const link = (fam: string, names: string[]) => `${location.origin}/convite#${encodePayload({ ...base, family: fam, guests: names })}`;
  const wa = (fam: string, names: string[]) => { const ph = d.guests.find((g) => g.group === fam && g.phone)?.phone.replace(/\D/g, ""); const t = `Oi, ${fam}! Vamos nos casar e preparamos um convite especial para vocês. Está tudo aqui, com a confirmação de presença: ${link(fam, names)}`; return `https://wa.me/${ph ?? ""}?text=${encodeURIComponent(t)}`; };
  const copy = async (fam: string, names: string[]) => { await navigator.clipboard.writeText(link(fam, names)); setDone(fam); setTimeout(() => setDone(""), 1500); };
  return (
    <div>
      <PageHeader title="Convite digital" sub="Cinco modelos, três paletas. Um link por família: quem recebe abre sem conta, confirma cada pessoa e a resposta volta pelo WhatsApp de vocês." />
      <div className="grid min-w-0 gap-5 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0 space-y-4">
          <section className="card p-5"><h2 className="mb-3 text-lg font-semibold">Modelo e cores</h2>
            <div className="mb-3 flex flex-wrap gap-2">{STYLES.map((s) => <button key={s.id} onClick={() => set({ style: s.id })} className={cn("btn btn-sm", w.style === s.id ? "btn-primary" : "btn-ghost")}>{s.name}</button>)}</div>
            <div className="flex gap-2">{PALETTES.map((p, i) => <button key={i} aria-label={`Paleta ${i + 1}`} onClick={() => set({ palette: i })} className={cn("flex overflow-hidden rounded-full border-2", w.palette === i ? "border-ink" : "border-transparent")}>{p.map((c) => <span key={c} className="h-7 w-5" style={{ background: c }} />)}</button>)}</div></section>
          <section className="card grid gap-3 p-5 sm:grid-cols-2"><h2 className="text-lg font-semibold sm:col-span-2">Dados do convite</h2>
            <Field label="Cerimônia: local"><input className="input" value={w.ceremonyPlace} onChange={(e) => set({ ceremonyPlace: e.target.value })} /></Field><Field label="Cerimônia: endereço"><input className="input" value={w.ceremonyAddr} onChange={(e) => set({ ceremonyAddr: e.target.value })} /></Field>
            <Field label="Recepção: local"><input className="input" value={w.receptionPlace} onChange={(e) => set({ receptionPlace: e.target.value })} /></Field><Field label="Recepção: endereço"><input className="input" value={w.receptionAddr} onChange={(e) => set({ receptionAddr: e.target.value })} /></Field>
            <Field label="Horário"><input type="time" className="input" value={w.time} onChange={(e) => set({ time: e.target.value })} /></Field><Field label="Traje"><input className="input" value={w.dress} onChange={(e) => set({ dress: e.target.value })} /></Field>
            <Field label="Confirmar presença até"><input type="date" className="input" value={w.rsvpDeadline} onChange={(e) => set({ rsvpDeadline: e.target.value })} /></Field><Field label="WhatsApp que recebe as respostas"><input className="input" inputMode="tel" value={w.phone} onChange={(e) => set({ phone: e.target.value.replace(/\D/g, "") })} placeholder="5519999999999" /></Field>
            <Field label="Mensagem" className="sm:col-span-2"><textarea className="input min-h-16" value={w.message} onChange={(e) => set({ message: e.target.value })} /></Field></section>
          <section className="card p-5"><h2 className="mb-1 text-lg font-semibold">Links por família</h2><p className="mb-3 text-xs text-muted">Cada link já carrega os nomes da família. Quem responde cai no seu WhatsApp; depois marquem a resposta na aba Convidados.</p>
            {families.length === 0 && <p className="text-sm text-muted">Adicionem convidados na lista A para gerar os links.</p>}
            {families.map(([fam, names]) => <div key={fam} className="flex flex-wrap items-center gap-2 border-t border-line py-2.5 text-sm first:border-0"><div className="min-w-0 flex-1"><div className="font-semibold">{fam}</div><div className="truncate text-xs text-muted">{names.join(", ")}</div></div><button className="btn btn-ghost btn-sm" onClick={() => copy(fam, names)}>{done === fam ? <Check size={13} /> : <Copy size={13} />}{done === fam ? "Copiado" : "Copiar"}</button><a className="btn btn-primary btn-sm" href={wa(fam, names)} target="_blank" rel="noreferrer"><MessageCircle size={13} />WhatsApp</a></div>)}</section>
          <section className="card p-5"><h2 className="mb-3 text-lg font-semibold">Varal de recados</h2>
            <div className="mb-3 flex flex-wrap gap-2"><input className="input w-40" placeholder="De quem" value={rn.from} onChange={(e) => setRn({ ...rn, from: e.target.value })} /><input className="input min-w-0 flex-1" placeholder="Cole o recado recebido no WhatsApp" value={rn.text} onChange={(e) => setRn({ ...rn, text: e.target.value })} /><button className="btn btn-primary btn-sm" onClick={() => { if (!rn.text) return; update((x) => x.recados.unshift({ id: uid(), from: rn.from || "Convidado", text: rn.text, date: todayISO() })); setRn({ from: "", text: "" }); }}><Plus size={14} /></button></div>
            {d.recados.map((r) => <div key={r.id} className="flex items-start justify-between gap-2 border-t border-line py-2 text-sm"><div><b>{r.from}</b> <span className="text-xs text-muted">{r.date}</span><p>{r.text}</p></div><button aria-label="Excluir" onClick={() => update((x) => { x.recados = x.recados.filter((k) => k.id !== r.id); })}><Trash2 size={13} className="text-muted" /></button></div>)}</section>
        </div>
        <div className="min-w-0 lg:sticky lg:top-20 lg:self-start"><Badge tone="gold">Prévia ao vivo</Badge><div className="mt-2 overflow-hidden rounded-[2rem] border-8 border-ink shadow-2xl"><InviteCard i={{ ...base, family: families[0]?.[0] ?? "Família Ribeiro" }} compact /></div></div>
      </div>
    </div>
  );
}
