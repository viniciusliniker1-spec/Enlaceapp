"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { CalendarHeart, ArrowRight, AlertTriangle } from "lucide-react";
import { useData } from "@/lib/store";
import { calc } from "@/lib/calc";
import { Money, Progress, Stat, Badge } from "@/components/ui";
import { daysUntil, fmtDate, fmtDateLong } from "@/lib/utils";
import { PHASES } from "@/lib/plan";

export default function Visao() {
  const { d } = useData(); const c = calc(d); const w = d.wedding; const days = daysUntil(w.date);
  const months = days / 30; const phase = months > 12 ? 0 : months > 9 ? 1 : months > 6 ? 2 : months > 3 ? 3 : months > 1 ? 4 : days > 7 ? 5 : 6;
  const next = d.tasks.filter((t) => !t.done).slice(0, 4);
  const pct = c.budget ? Math.round((c.closed / c.budget) * 100) : 0;
  const nextStep = c.overdue.length ? { t: `${c.overdue.length} pagamento(s) atrasado(s)`, h: "/app/financeiro", d: "Resolvam primeiro para não perder prazo com fornecedores." } : c.undefinedPay.length ? { t: `${c.undefinedPay.length} contratado(s) sem pagamento definido`, h: "/app/fornecedores", d: `Comecem por ${c.undefinedPay[0].name}.` } : c.pending > 0 && days < 240 ? { t: `${c.pending} convidados ainda sem resposta`, h: "/app/convidados", d: "Mandem o convite digital ou cobrem pelo WhatsApp." } : { t: next[0]?.title ?? "Tudo em dia", h: "/app/tarefas", d: "Próxima tarefa do checklist." };
  return (
    <div className="space-y-5">
      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grain relative overflow-hidden rounded-3xl bg-sage-deep p-6 text-white sm:p-8">
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div><div className="flex items-center gap-2 text-sm text-gold-soft"><CalendarHeart size={16} />{fmtDateLong(w.date)} · {w.time} · {w.city}</div>
            <h1 className="mt-2 text-4xl font-semibold sm:text-5xl">{w.partner1} e {w.partner2}</h1>
            <p className="mt-2 text-sm text-white/70">Fase atual: {PHASES[phase]} · {c.tasksDone} de {d.tasks.length} tarefas</p></div>
          <div className="text-right"><div className="font-serif text-6xl font-semibold leading-none">{Math.max(days, 0)}</div><div className="text-sm text-white/70">dias para o casamento</div></div>
        </div>
      </motion.section>
      <Link href={nextStep.h} className="card flex items-center justify-between gap-3 border-terra/30 bg-terra-soft/50 p-4 transition hover:-translate-y-0.5">
        <div className="flex items-center gap-3">{c.overdue.length > 0 && <AlertTriangle className="text-terra" />}<div><div className="label text-terra">Próximo passo</div><div className="font-semibold">{nextStep.t}</div><div className="text-sm text-muted">{nextStep.d}</div></div></div><ArrowRight className="shrink-0 text-terra" />
      </Link>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Orçamento" value={`${pct}%`} hint={<><Money v={c.available} /> disponíveis</>} />
        <Stat label="Fornecedores" value={c.contracted.length} hint={`${d.vendors.filter((v) => v.status === "cotacao").length} em cotação`} />
        <Stat label="Pago" value={<Money v={c.paid} />} hint={<><Money v={c.toPay} /> a pagar</>} />
        <Stat label="Convidados" value={`${c.confirmed}/${c.gA.length}`} hint={`${c.pending} pendentes · ${c.gB.length} na lista B`} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card p-5"><div className="mb-3 flex items-center justify-between"><h2 className="text-xl font-semibold">Próximos 7 dias</h2><Link href="/app/financeiro" className="text-xs font-semibold text-sage">Ver tudo</Link></div>
          {c.next7.length === 0 ? <p className="text-sm text-muted">Nada vence esta semana.</p> : c.next7.map((p) => (
            <div key={p.id} className="flex items-center justify-between border-t border-line py-2.5 first:border-0"><div><div className="text-sm font-semibold">{d.vendors.find((v) => v.id === p.vendorId)?.name}</div><div className="text-xs text-muted">{p.label} · {fmtDate(p.due)} · {p.method}</div></div><div className="text-right"><Money v={p.amount} className="text-sm font-semibold" /><div><Badge tone="terra">{daysUntil(p.due) === 0 ? "Hoje" : `Em ${daysUntil(p.due)} d`}</Badge></div></div></div>))}
        </section>
        <section className="card p-5"><div className="mb-3 flex items-center justify-between"><h2 className="text-xl font-semibold">Tarefas</h2><Link href="/app/tarefas" className="text-xs font-semibold text-sage">Ver checklist</Link></div>
          <Progress value={(c.tasksDone / Math.max(1, d.tasks.length)) * 100} className="mb-4" />
          {next.map((t) => <div key={t.id} className="flex items-center justify-between border-t border-line py-2.5 text-sm first:border-0"><span>{t.title}</span><span className="text-xs text-muted">{PHASES[t.phase]}</span></div>)}
        </section>
        <section className="card p-5"><h2 className="mb-3 text-xl font-semibold">Orçamento por categoria</h2>
          {d.cats.filter((k) => k.planned > 0).slice(0, 6).map((k) => { const closed = d.vendors.filter((v) => v.category === k.name && v.status === "contratado").reduce((s, v) => s + v.value, 0); return (
            <div key={k.id} className="mb-3"><div className="mb-1 flex justify-between text-xs"><span className="font-medium">{k.name}</span><span className="text-muted"><Money v={closed} /> / <Money v={k.planned} /></span></div><Progress value={(closed / Math.max(1, k.planned)) * 100} tone={closed > k.planned ? "terra" : "sage"} /></div>); })}
        </section>
        <section className="card p-5"><h2 className="mb-3 text-xl font-semibold">Enxoval e presentes</h2>
          {(() => { const have = d.enxoval.filter((e) => e.state === "tenho" || e.state === "comprado").length; return (<>
            <div className="mb-1 flex justify-between text-sm"><span>Enxoval da casa</span><span className="text-muted">{have}/{d.enxoval.length}</span></div><Progress value={(have / Math.max(1, d.enxoval.length)) * 100} tone="gold" className="mb-4" />
            <div className="mb-1 flex justify-between text-sm"><span>Presentes já escolhidos</span><span className="text-muted">{d.gifts.filter((g) => g.got > 0 || g.reservedBy.length).length}/{d.gifts.length}</span></div><Progress value={(d.gifts.filter((g) => g.got > 0 || g.reservedBy.length).length / Math.max(1, d.gifts.length)) * 100} tone="terra" className="mb-4" />
            <Link href="/app/presentes" className="btn btn-ghost btn-sm">Abrir presentes <ArrowRight size={13} /></Link></>); })()}
        </section>
      </div>
    </div>
  );
}
