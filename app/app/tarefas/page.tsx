"use client";
import { useState } from "react";
import { Plus, Trash2, Check } from "lucide-react";
import { useData } from "@/lib/store";
import { PageHeader, Progress, Badge } from "@/components/ui";
import { PHASES } from "@/lib/plan";
import { cn, fmtDate, uid, daysUntil, todayISO } from "@/lib/utils";

export default function Tarefas() {
  const { d, update } = useData(); const [title, setTitle] = useState(""); const [phase, setPhase] = useState(2); const [view, setView] = useState<"fase" | "semana" | "agenda">("fase");
  const toggle = (id: string) => update((x) => { const t = x.tasks.find((t) => t.id === id)!; t.done = !t.done; });
  const add = () => { if (!title.trim()) return; update((x) => x.tasks.push({ id: uid(), title: title.trim(), phase, done: false, owner: "Os dois", due: todayISO() })); setTitle(""); };
  const done = d.tasks.filter((t) => t.done).length;
  const late = d.tasks.filter((t) => !t.done && t.due && daysUntil(t.due) < 0);
  const wk = d.tasks.filter((t) => !t.done && t.due && daysUntil(t.due) <= 7).sort((a, b) => (a.due ?? "").localeCompare(b.due ?? ""));
  const Row = (t: (typeof d.tasks)[number]) => (
    <li key={t.id} className="group flex items-center gap-3 border-t border-line py-2.5 first:border-0">
      <button aria-label="Concluir" onClick={() => toggle(t.id)} className={cn("grid size-6 shrink-0 place-items-center rounded-full border transition", t.done ? "border-sage bg-sage text-white" : "border-line hover:border-sage")}>{t.done && <Check size={13} />}</button>
      <span className={cn("flex-1 text-sm", t.done && "text-muted line-through")}>{t.title}</span>
      <select value={t.owner} onChange={(e) => update((x) => { x.tasks.find((k) => k.id === t.id)!.owner = e.target.value; })} className="hidden rounded-lg border border-line bg-white px-1 py-0.5 text-xs sm:block">{["Os dois", d.wedding.partner1, d.wedding.partner2, "Assessoria", "Família"].map((o) => <option key={o}>{o}</option>)}</select>
      {t.due && !t.done && <span className={cn("text-xs", daysUntil(t.due) < 0 ? "font-semibold text-terra" : "text-muted")}>{fmtDate(t.due)}</span>}
      <button aria-label="Remover" onClick={() => update((x) => { x.tasks = x.tasks.filter((k) => k.id !== t.id); })} className="opacity-0 transition group-hover:opacity-100"><Trash2 size={14} className="text-muted" /></button>
    </li>);
  return (
    <div>
      <PageHeader title="Tarefas" sub="O checklist já vem pronto, contado a partir da data do casamento. Marquem, adaptem e deleguem." />
      <div className="card mb-4 p-5"><div className="mb-2 flex justify-between text-sm"><span className="font-semibold">{done} de {d.tasks.length} feitas</span>{late.length > 0 && <Badge tone="terra">{late.length} em atraso</Badge>}</div><Progress value={(done / Math.max(1, d.tasks.length)) * 100} /></div>
      <div className="mb-4 flex gap-2">{(["fase", "semana", "agenda"] as const).map((v) => <button key={v} onClick={() => setView(v)} className={cn("btn btn-sm", view === v ? "btn-primary" : "btn-ghost")}>{{ fase: "Por fase", semana: "Esta semana", agenda: "Agenda do mês" }[v]}</button>)}</div>
      <div className="card mb-4 flex flex-wrap gap-2 p-3"><input className="input min-w-0 flex-1" placeholder="Nova tarefa…" value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} /><select className="input w-auto" value={phase} onChange={(e) => setPhase(+e.target.value)}>{PHASES.map((p, i) => <option key={p} value={i}>{p}</option>)}</select><button className="btn btn-primary btn-sm" onClick={add}><Plus size={14} />Adicionar</button></div>
      {view === "fase" && PHASES.map((p, i) => { const ts = d.tasks.filter((t) => t.phase === i); if (!ts.length) return null; return <section key={p} className="card mb-3 p-5"><div className="mb-1 flex items-center justify-between"><h2 className="text-lg font-semibold">{p}</h2><span className="text-xs text-muted">{ts.filter((t) => t.done).length}/{ts.length}</span></div><ul>{ts.map(Row)}</ul></section>; })}
      {view === "semana" && <section className="card p-5"><h2 className="mb-1 text-lg font-semibold">Pra fazer agora</h2><p className="mb-2 text-xs text-muted">Atrasadas e as que vencem nos próximos 7 dias.</p><ul>{wk.length ? wk.map(Row) : <li className="py-4 text-sm text-muted">Nada urgente. Respirem.</li>}</ul></section>}
      {view === "agenda" && (() => { const byM: Record<string, typeof d.tasks> = {}; d.tasks.filter((t) => t.due && !t.done).sort((a, b) => a.due!.localeCompare(b.due!)).forEach((t) => { const k = t.due!.slice(0, 7); (byM[k] ??= []).push(t); }); return Object.entries(byM).map(([m, ts]) => <section key={m} className="card mb-3 p-5"><h2 className="mb-1 text-lg font-semibold capitalize">{new Date(m + "-15").toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}</h2><ul>{ts.map(Row)}</ul></section>); })()}
    </div>
  );
}
