"use client";
import { useState } from "react";
import { Plus, Check, Trash2, Download } from "lucide-react";
import { useData } from "@/lib/store";
import { PageHeader, Modal, Field, Money, Progress, Badge, Stat } from "@/components/ui";
import { calc } from "@/lib/calc";
import { addMonths, brl, cn, daysUntil, fmtDate, todayISO, uid } from "@/lib/utils";
import type { Method } from "@/lib/types";

export default function Financeiro() {
  const { d, update } = useData(); const c = calc(d); const [tab, setTab] = useState<"orc" | "pag">("pag"); const [open, setOpen] = useState(false); const [filter, setFilter] = useState<"todos" | "pagar" | "pagos" | "atrasados">("todos");
  const [g, setG] = useState({ vendorId: "", total: 0, entry: 0, parts: 4, method: "boleto" as Method, first: addMonths(todayISO(), 1) });
  const gen = () => {
    const v = d.vendors.find((x) => x.id === g.vendorId); if (!v) return; const total = g.total || v.value; const rest = total - g.entry; const each = Math.round((rest / g.parts) * 100) / 100;
    update((x) => { if (g.entry > 0) x.payments.push({ id: uid(), vendorId: v.id, label: "Entrada", amount: g.entry, due: todayISO(), method: "pix", paid: false });
      for (let i = 0; i < g.parts; i++) x.payments.push({ id: uid(), vendorId: v.id, label: `Parcela ${i + 1} de ${g.parts}`, amount: i === g.parts - 1 ? Math.round((rest - each * (g.parts - 1)) * 100) / 100 : each, due: addMonths(g.first, i), method: g.method, paid: false }); });
    setOpen(false);
  };
  const pays = d.payments.filter((p) => d.vendors.find((v) => v.id === p.vendorId)?.status !== "descartado").filter((p) => filter === "todos" || (filter === "pagar" && !p.paid) || (filter === "pagos" && p.paid) || (filter === "atrasados" && !p.paid && daysUntil(p.due) < 0)).sort((a, b) => a.due.localeCompare(b.due));
  const csv = () => { const rows = [["Fornecedor", "Parcela", "Valor", "Vencimento", "Forma", "Pago"], ...d.payments.map((p) => [d.vendors.find((v) => v.id === p.vendorId)?.name ?? "", p.label, p.amount, p.due, p.method, p.paid ? "sim" : "não"])]; const b = new Blob(["﻿" + rows.map((r) => r.join(";")).join("\n")], { type: "text/csv" }); const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "pagamentos.csv"; a.click(); };
  const over = c.closed > c.budget;
  return (
    <div>
      <PageHeader title="Orçamento e pagamentos" sub="O previsto, o fechado e o pago por categoria, com cada parcela e seu vencimento." actions={<><button className="btn btn-ghost" onClick={csv}><Download size={15} />Exportar</button><button className="btn btn-primary" onClick={() => { setG({ ...g, vendorId: d.vendors.find((v) => v.status === "contratado")?.id ?? "", total: 0 }); setOpen(true); }}><Plus size={15} />Parcelar contrato</button></>} />
      <div className="mb-5 grid gap-3 sm:grid-cols-4"><Stat label="Teto" value={<Money v={c.budget} />} /><Stat label="Fechado" value={<Money v={c.closed} />} hint={over ? <span className="text-terra">Acima do teto</span> : <><Money v={c.available} /> livres</>} /><Stat label="Pago" value={<Money v={c.paid} />} hint={`${c.closed ? Math.round((c.paid / c.closed) * 100) : 0}% do fechado`} /><Stat label="A pagar" value={<Money v={c.toPay} />} hint={c.overdue.length ? <span className="text-terra">{c.overdue.length} em atraso</span> : "Nada vencido"} /></div>
      <div className="mb-4 flex gap-2">{(["pag", "orc"] as const).map((t) => <button key={t} onClick={() => setTab(t)} className={cn("btn btn-sm", tab === t ? "btn-primary" : "btn-ghost")}>{t === "pag" ? "Pagamentos" : "Orçamento por categoria"}</button>)}</div>
      {tab === "orc" ? (
        <div className="card divide-y divide-line">{d.cats.map((k) => { const closed = d.vendors.filter((v) => v.category === k.name && v.status === "contratado").reduce((s, v) => s + v.value, 0); const paid = d.payments.filter((p) => p.paid && d.vendors.find((v) => v.id === p.vendorId)?.category === k.name).reduce((s, p) => s + p.amount, 0); return (
          <div key={k.id} className="grid items-center gap-3 p-4 sm:grid-cols-[1.2fr_1fr_2fr]"><div className="font-semibold">{k.name}</div>
            <label className="flex items-center gap-2 text-xs text-muted">Previsto <input type="number" className="input w-28 py-1" value={k.planned} onChange={(e) => update((x) => { x.cats.find((c) => c.id === k.id)!.planned = +e.target.value; })} /></label>
            <div><Progress value={(closed / Math.max(1, k.planned)) * 100} tone={closed > k.planned ? "terra" : "sage"} /><div className="mt-1 flex justify-between text-xs text-muted"><span>Fechado <Money v={closed} /></span><span>Pago <Money v={paid} /></span></div></div></div>); })}
          <div className="flex items-center justify-between p-4 text-sm font-semibold"><span>Soma dos previstos</span><Money v={d.cats.reduce((s, k) => s + k.planned, 0)} /></div></div>
      ) : (<>
        <div className="mb-3 flex flex-wrap gap-2">{(["todos", "pagar", "pagos", "atrasados"] as const).map((t) => <button key={t} onClick={() => setFilter(t)} className={cn("btn btn-sm", filter === t ? "btn-primary" : "btn-ghost")}>{{ todos: "Todos", pagar: "A pagar", pagos: "Pagos", atrasados: "Atrasados" }[t]}</button>)}</div>
        <div className="card divide-y divide-line">{pays.length === 0 && <p className="p-6 text-center text-sm text-muted">Nenhum pagamento nesse filtro.</p>}{pays.map((p) => { const dd = daysUntil(p.due); return (
          <div key={p.id} className="flex flex-wrap items-center gap-3 p-4"><button aria-label="Marcar como pago" onClick={() => update((x) => { const k = x.payments.find((q) => q.id === p.id)!; k.paid = !k.paid; k.paidAt = k.paid ? todayISO() : undefined; })} className={cn("grid size-7 place-items-center rounded-full border", p.paid ? "border-sage bg-sage text-white" : "border-line hover:border-sage")}>{p.paid && <Check size={14} />}</button>
            <div className="min-w-0 flex-1"><div className="text-sm font-semibold">{d.vendors.find((v) => v.id === p.vendorId)?.name}</div><div className="text-xs text-muted">{p.label} · {p.method} · vence {fmtDate(p.due)}</div></div>
            {!p.paid && <Badge tone={dd < 0 ? "terra" : dd <= 7 ? "gold" : "muted"}>{dd < 0 ? `${-dd} d atrasado` : dd === 0 ? "Hoje" : `Em ${dd} d`}</Badge>}{p.paid && <Badge tone="sage">Pago em {fmtDate(p.paidAt)}</Badge>}
            <Money v={p.amount} className="w-28 text-right font-semibold" /><button aria-label="Excluir" onClick={() => update((x) => { x.payments = x.payments.filter((q) => q.id !== p.id); })} className="text-muted hover:text-terra"><Trash2 size={14} /></button></div>); })}</div></>)}
      <Modal open={open} onClose={() => setOpen(false)} title="Parcelar contrato">
        <div className="space-y-3"><Field label="Fornecedor"><select className="input" value={g.vendorId} onChange={(e) => setG({ ...g, vendorId: e.target.value })}>{d.vendors.filter((v) => v.status !== "descartado").map((v) => <option key={v.id} value={v.id}>{v.name} · {brl(v.value)}</option>)}</select></Field>
          <div className="grid grid-cols-2 gap-3"><Field label="Entrada (R$)"><input type="number" className="input" value={g.entry} onChange={(e) => setG({ ...g, entry: +e.target.value })} /></Field><Field label="Parcelas"><input type="number" min={1} max={36} className="input" value={g.parts} onChange={(e) => setG({ ...g, parts: Math.max(1, +e.target.value) })} /></Field></div>
          <div className="grid grid-cols-2 gap-3"><Field label="1º vencimento"><input type="date" className="input" value={g.first} onChange={(e) => setG({ ...g, first: e.target.value })} /></Field><Field label="Forma"><select className="input" value={g.method} onChange={(e) => setG({ ...g, method: e.target.value as Method })}><option value="pix">Pix</option><option value="boleto">Boleto</option><option value="cartao">Cartão</option></select></Field></div>
          <button className="btn btn-primary w-full" disabled={!g.vendorId} onClick={gen}>Gerar parcelas</button></div>
      </Modal>
    </div>
  );
}
