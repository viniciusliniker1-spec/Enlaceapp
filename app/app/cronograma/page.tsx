"use client";
import { Plus, Trash2, Share2, Printer } from "lucide-react";
import { useState } from "react";
import { useData } from "@/lib/store";
import { PageHeader } from "@/components/ui";
import { encodePayload, uid, fmtDateLong } from "@/lib/utils";

export default function Cronograma() {
  const { d, update } = useData(); const w = d.wedding; const [copied, setCopied] = useState(false);
  const sorted = [...d.moments].sort((a, b) => a.time.localeCompare(b.time));
  const share = async () => { const url = `${location.origin}/cronograma#${encodePayload({ p1: w.partner1, p2: w.partner2, date: w.date, venue: w.receptionPlace || w.venue, addr: w.receptionAddr, phone: w.phone, m: sorted.map((m) => [m.time, m.title, m.who]), v: d.vendors.filter((v) => v.status === "contratado").map((v) => [v.name, v.category, v.contact, v.phone]) })}`; await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1800); };
  return (
    <div>
      <PageHeader title="Cronograma do dia" sub="Hora a hora, com quem é responsável. Compartilhem o link com todos os fornecedores (sem login) ou imprimam." actions={<><button className="btn btn-ghost" onClick={() => window.print()}><Printer size={15} />PDF</button><button className="btn btn-primary" onClick={share}><Share2 size={15} />{copied ? "Link copiado!" : "Link para fornecedores"}</button></>} />
      <div className="card p-3">{sorted.map((m) => (
        <div key={m.id} className="flex flex-wrap items-center gap-2 border-t border-line py-2 first:border-0">
          <input type="time" className="input w-28" value={m.time} onChange={(e) => update((x) => { x.moments.find((k) => k.id === m.id)!.time = e.target.value; })} />
          <input className="input min-w-0 flex-1" value={m.title} onChange={(e) => update((x) => { x.moments.find((k) => k.id === m.id)!.title = e.target.value; })} />
          <input className="input w-40" value={m.who} onChange={(e) => update((x) => { x.moments.find((k) => k.id === m.id)!.who = e.target.value; })} placeholder="Responsável" />
          <button aria-label="Excluir" className="no-print text-muted hover:text-terra" onClick={() => update((x) => { x.moments = x.moments.filter((k) => k.id !== m.id); })}><Trash2 size={14} /></button></div>))}
        <button className="btn btn-ghost btn-sm no-print m-2" onClick={() => update((x) => x.moments.push({ id: uid(), time: "12:00", title: "Novo momento", who: "" }))}><Plus size={14} />Momento</button></div>
      <p className="mt-3 text-xs text-muted">{fmtDateLong(w.date)} · {w.receptionPlace || w.venue}</p>
    </div>
  );
}
