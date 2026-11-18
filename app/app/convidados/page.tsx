"use client";
import { useMemo, useState } from "react";
import { Plus, Trash2, ArrowRightLeft, Download, ClipboardPaste, Printer, Search } from "lucide-react";
import { useData } from "@/lib/store";
import { PageHeader, Modal, Field, Stat, Badge } from "@/components/ui";
import { calc } from "@/lib/calc";
import { cn, uid } from "@/lib/utils";
import type { Guest } from "@/lib/types";

const RS = { pendente: "gold", confirmado: "sage", recusado: "terra" } as const;
export default function Convidados() {
  const { d, update } = useData(); const c = calc(d); const [list, setList] = useState<"A" | "B">("A"); const [q, setQ] = useState(""); const [rs, setRs] = useState("todos"); const [add, setAdd] = useState(false); const [paste, setPaste] = useState(false);
  const [n, setN] = useState({ name: "", group: "", fee: "inteira" as Guest["fee"], phone: "" }); const [txt, setTxt] = useState(""); const [grp, setGrp] = useState("");
  const groups = useMemo(() => [...new Set(d.guests.map((g) => g.group))], [d.guests]);
  const shown = d.guests.filter((g) => g.list === list && (rs === "todos" || g.rsvp === rs) && (g.name + g.group).toLowerCase().includes(q.toLowerCase()));
  const byGroup = shown.reduce<Record<string, Guest[]>>((a, g) => ((a[g.group || "Sem grupo"] ??= []).push(g), a), {});
  const patch = (id: string, p: Partial<Guest>) => update((x) => Object.assign(x.guests.find((g) => g.id === id)!, p));
  const addOne = () => { if (!n.name.trim()) return; update((x) => x.guests.push({ id: uid(), name: n.name.trim(), group: n.group.trim() || "Sem grupo", list, rsvp: "pendente", fee: n.fee, phone: n.phone })); setN({ ...n, name: "", phone: "" }); };
  const importTxt = () => { const names = txt.split("\n").map((s) => s.trim()).filter(Boolean); update((x) => names.forEach((nm) => x.guests.push({ id: uid(), name: nm, group: grp || "Importados", list, rsvp: "pendente", fee: "inteira", phone: "" }))); setTxt(""); setPaste(false); };
  const csv = () => { const rows = [["Nome", "Grupo", "Lista", "Presença", "Faixa", "Mesa"], ...d.guests.map((g) => [g.name, g.group, g.list, g.rsvp, g.fee, d.tables.find((t) => t.id === g.tableId)?.name ?? ""])]; const b = new Blob(["﻿" + rows.map((r) => r.join(";")).join("\n")], { type: "text/csv" }); const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "convidados.csv"; a.click(); };
  const free = d.wedding.guestsEstimate - c.gA.filter((g) => g.rsvp !== "recusado").length;
  return (
    <div>
      <PageHeader title="Convidados" sub="Lista A (os convites firmes) e lista B (a segunda chamada, se alguém da A não puder vir). Com faixas de buffet." actions={<><button className="btn btn-ghost" onClick={csv}><Download size={15} />CSV</button><button className="btn btn-ghost" onClick={() => window.print()}><Printer size={15} />PDF</button><button className="btn btn-ghost" onClick={() => setPaste(true)}><ClipboardPaste size={15} />Colar lista</button><button className="btn btn-primary" onClick={() => setAdd(true)}><Plus size={15} />Convidado</button></>} />
      <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5"><Stat label="Esperados (A)" value={c.gA.filter((g) => g.rsvp !== "recusado").length} hint={`de ${d.wedding.guestsEstimate} estimados`} /><Stat label="Confirmados" value={c.confirmed} /><Stat label="Pendentes" value={c.pending} /><Stat label="Recusaram" value={c.declined} hint={c.gB.length ? `${c.gB.length} na lista B` : undefined} /><Stat label="Pagantes no buffet" value={c.payers} hint="inteira = 1 · meia = 0,5" /></div>
      {free > 0 && c.declined > 0 && c.gB.length > 0 && <p className="mb-4 rounded-xl bg-sage-soft p-3 text-sm">Há <b>{Math.min(free, c.gB.length)}</b> vaga(s) liberada(s). Promovam convidados da lista B no botão <ArrowRightLeft size={12} className="inline" />.</p>}
      <div className="no-print mb-4 flex flex-wrap items-center gap-2">
        {(["A", "B"] as const).map((l) => <button key={l} onClick={() => setList(l)} className={cn("btn btn-sm", list === l ? "btn-primary" : "btn-ghost")}>Lista {l} <span className="opacity-60">{d.guests.filter((g) => g.list === l).length}</span></button>)}
        <select className="input w-auto py-1.5 text-xs" value={rs} onChange={(e) => setRs(e.target.value)}><option value="todos">Todas as respostas</option><option value="pendente">Pendentes</option><option value="confirmado">Confirmados</option><option value="recusado">Recusaram</option></select>
        <div className="relative ml-auto w-full sm:w-60"><Search size={14} className="absolute left-3 top-3 text-muted" /><input className="input pl-8" placeholder="Buscar nome ou família" value={q} onChange={(e) => setQ(e.target.value)} /></div></div>
      {Object.keys(byGroup).length === 0 && <div className="rounded-2xl border border-dashed border-line p-8 text-center text-sm text-muted">Ninguém na lista {list}. Adicionem ou colem uma lista de nomes.</div>}
      <div className="space-y-3">{Object.entries(byGroup).map(([gr, gs]) => <section key={gr} className="card p-4"><h2 className="mb-1 font-sans text-sm font-semibold tracking-tight text-sage-deep">{gr} <span className="font-normal text-muted">· {gs.length}</span></h2>
        {gs.map((g) => <div key={g.id} className="flex flex-wrap items-center gap-2 border-t border-line py-2 text-sm first:border-0"><span className="min-w-0 flex-1 font-medium">{g.name}</span>
          <select className="rounded-lg border border-line bg-white px-1.5 py-1 text-xs" value={g.fee} onChange={(e) => patch(g.id, { fee: e.target.value as Guest["fee"] })}><option value="inteira">Inteira</option><option value="meia">Meia</option><option value="isenta">Isenta</option></select>
          <select className={cn("rounded-lg border px-1.5 py-1 text-xs font-semibold", g.rsvp === "confirmado" ? "border-sage/40 bg-sage-soft" : g.rsvp === "recusado" ? "border-terra/40 bg-terra-soft" : "border-gold/40 bg-gold-soft")} value={g.rsvp} onChange={(e) => patch(g.id, { rsvp: e.target.value as Guest["rsvp"] })}><option value="pendente">Pendente</option><option value="confirmado">Confirmado</option><option value="recusado">Não vai</option></select>
          {g.tableId && <Badge>{d.tables.find((t) => t.id === g.tableId)?.name}</Badge>}
          <button title={g.list === "A" ? "Mover para a lista B" : "Promover para a lista A"} className="no-print rounded-full p-1.5 text-muted hover:bg-ivory" onClick={() => patch(g.id, { list: g.list === "A" ? "B" : "A" })}><ArrowRightLeft size={14} /></button>
          <button aria-label="Excluir" className="no-print rounded-full p-1.5 text-muted hover:text-terra" onClick={() => update((x) => { x.guests = x.guests.filter((k) => k.id !== g.id); })}><Trash2 size={14} /></button></div>)}</section>)}</div>
      <Modal open={add} onClose={() => setAdd(false)} title={`Adicionar à lista ${list}`}><div className="space-y-3"><Field label="Nome"><input className="input" autoFocus value={n.name} onChange={(e) => setN({ ...n, name: e.target.value })} onKeyDown={(e) => e.key === "Enter" && addOne()} /></Field><Field label="Família ou grupo"><input className="input" list="grupos" value={n.group} onChange={(e) => setN({ ...n, group: e.target.value })} /><datalist id="grupos">{groups.map((g) => <option key={g} value={g} />)}</datalist></Field><div className="grid grid-cols-2 gap-3"><Field label="Faixa"><select className="input" value={n.fee} onChange={(e) => setN({ ...n, fee: e.target.value as Guest["fee"] })}><option value="inteira">Inteira</option><option value="meia">Meia</option><option value="isenta">Isenta</option></select></Field><Field label="WhatsApp"><input className="input" inputMode="tel" value={n.phone} onChange={(e) => setN({ ...n, phone: e.target.value })} /></Field></div><button className="btn btn-primary w-full" onClick={addOne}>Adicionar e continuar</button></div></Modal>
      <Modal open={paste} onClose={() => setPaste(false)} title="Colar lista de nomes"><div className="space-y-3"><p className="text-sm text-muted">Um nome por linha, direto da planilha ou do bloco de notas. Entram na lista {list}.</p><Field label="Família ou grupo (opcional)"><input className="input" value={grp} onChange={(e) => setGrp(e.target.value)} /></Field><textarea className="input min-h-40" value={txt} onChange={(e) => setTxt(e.target.value)} placeholder={"Tia Cida\nJorge Andrade\n…"} /><button className="btn btn-primary w-full" onClick={importTxt} disabled={!txt.trim()}>Importar</button></div></Modal>
    </div>
  );
}
