"use client";
import { useRouter } from "next/navigation";
import { Plus, ArrowRight } from "lucide-react";
import { useStore } from "@/lib/store";
import { PageHeader, Progress, Badge, Money } from "@/components/ui";
import { calc } from "@/lib/calc";
import { daysUntil, fmtDate } from "@/lib/utils";

export default function Assessor() {
  const { state, switchTo } = useStore(); const router = useRouter();
  const rows = Object.values(state.weddings).sort((a, b) => a.wedding.date.localeCompare(b.wedding.date));
  return (
    <div>
      <PageHeader title="Carteira de casamentos" sub="Todos os casamentos que você assessora, com o que pede atenção primeiro." actions={<button className="btn btn-primary" onClick={() => router.push("/app/comecar")}><Plus size={15} />Novo casamento</button>} />
      <div className="mb-5 grid gap-3 sm:grid-cols-3"><div className="card p-4"><div className="label">Casamentos ativos</div><div className="text-3xl font-semibold">{rows.length}</div></div><div className="card p-4"><div className="label">Pagamentos em atraso</div><div className="text-3xl font-semibold text-terra">{rows.reduce((s, r) => s + calc(r).overdue.length, 0)}</div></div><div className="card p-4"><div className="label">Total sob gestão</div><div className="text-3xl font-semibold"><Money v={rows.reduce((s, r) => s + r.wedding.budget, 0)} /></div></div></div>
      <div className="space-y-3">{rows.map((r) => { const c = calc(r); const dd = daysUntil(r.wedding.date); return (
        <button key={r.wedding.id} onClick={() => { switchTo(r.wedding.id); router.push("/app"); }} className="card flex w-full flex-wrap items-center gap-4 p-5 text-left transition hover:-translate-y-0.5">
          <div className="min-w-0 flex-1"><div className="font-serif text-xl font-semibold">{r.wedding.partner1} e {r.wedding.partner2}</div><div className="text-xs text-muted">{fmtDate(r.wedding.date)} · {r.wedding.city} · {dd} dias</div></div>
          <div className="w-40"><div className="mb-1 text-xs text-muted">Tarefas {c.tasksDone}/{r.tasks.length}</div><Progress value={(c.tasksDone / Math.max(1, r.tasks.length)) * 100} /></div>
          <div className="flex gap-1.5">{c.overdue.length > 0 && <Badge tone="terra">{c.overdue.length} atrasado(s)</Badge>}{c.pending > 0 && <Badge tone="gold">{c.pending} sem resposta</Badge>}{!c.overdue.length && !c.pending && <Badge tone="sage">Em dia</Badge>}</div><ArrowRight size={16} className="text-muted" /></button>); })}</div>
    </div>
  );
}
