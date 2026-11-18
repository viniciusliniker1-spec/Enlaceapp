"use client";
import { useRef, useState } from "react";
import { Plus, Wand2, Printer, Trash2, X } from "lucide-react";
import { useData } from "@/lib/store";
import { PageHeader, Badge } from "@/components/ui";
import { cn, uid } from "@/lib/utils";
import type { Table } from "@/lib/types";

const KIND: Record<Table["kind"], string> = { mesa: "Mesa", casal: "Casal", pista: "Pista", bar: "Bar", bolo: "Bolo" };
export default function Mesas() {
  const { d, update } = useData(); const [sel, setSel] = useState<string | null>(null); const drag = useRef<{ id: string; dx: number; dy: number } | null>(null); const box = useRef<HTMLDivElement>(null);
  const eligible = d.guests.filter((g) => g.list === "A" && g.rsvp !== "recusado"); const unseated = eligible.filter((g) => !g.tableId || !d.tables.some((t) => t.id === g.tableId));
  const occ = (id: string) => eligible.filter((g) => g.tableId === id).length;
  const move = (e: React.PointerEvent) => { if (!drag.current || !box.current) return; const r = box.current.getBoundingClientRect(); const { id, dx, dy } = drag.current; const x = Math.max(0, Math.min(r.width - 90, e.clientX - r.left - dx)); const y = Math.max(0, Math.min(r.height - 90, e.clientY - r.top - dy)); update((s) => { const t = s.tables.find((k) => k.id === id)!; t.x = Math.round(x); t.y = Math.round(y); }); };
  const auto = () => update((x) => {
    const seatT = x.tables.filter((t) => t.seats > 0); const left = new Map(seatT.map((t) => [t.id, t.seats - x.guests.filter((g) => g.tableId === t.id && g.list === "A" && g.rsvp !== "recusado").length]));
    const groups: Record<string, typeof x.guests> = {}; x.guests.filter((g) => g.list === "A" && g.rsvp !== "recusado" && (!g.tableId || !x.tables.some((t) => t.id === g.tableId))).forEach((g) => (groups[g.group] ??= []).push(g));
    Object.values(groups).sort((a, b) => b.length - a.length).forEach((gs) => { for (const g of gs) { const t = seatT.filter((k) => (left.get(k.id) ?? 0) > 0).sort((a, b) => (left.get(b.id)! - left.get(a.id)!))[0]; const same = seatT.find((k) => (left.get(k.id) ?? 0) > 0 && x.guests.some((o) => o.tableId === k.id && o.group === g.group)); const pick = same ?? t; if (!pick) return; g.tableId = pick.id; left.set(pick.id, left.get(pick.id)! - 1); } });
  });
  const addT = (kind: Table["kind"]) => update((x) => x.tables.push({ id: uid(), name: kind === "mesa" ? `Mesa ${x.tables.filter((t) => t.kind === "mesa").length + 1}` : KIND[kind], seats: kind === "mesa" ? 8 : kind === "casal" ? 4 : 0, x: 40, y: 40, kind }));
  const T = d.tables.find((t) => t.id === sel);
  return (
    <div>
      <PageHeader title="Mesas" sub="Arrastem as mesas na planta e distribuam os convidados. O lugar de quem não vai fica livre." actions={<><button className="btn btn-ghost" onClick={() => addT("mesa")}><Plus size={15} />Mesa</button><button className="btn btn-ghost" onClick={() => addT("bar")}>Bar</button><button className="btn btn-ghost" onClick={() => addT("pista")}>Pista</button><button className="btn btn-ghost" onClick={() => window.print()}><Printer size={15} />PDF</button><button className="btn btn-primary" onClick={auto}><Wand2 size={15} />Distribuir automático</button></>} />
      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <div className="card overflow-auto p-2"><div ref={box} className="relative h-[820px] min-w-[760px] rounded-xl bg-[radial-gradient(#e9e0d4_1px,transparent_1px)] [background-size:22px_22px]" onPointerMove={move} onPointerUp={() => (drag.current = null)} onPointerLeave={() => (drag.current = null)}>
          {d.tables.map((t) => { const o = occ(t.id); const full = t.seats > 0 && o >= t.seats; const wide = t.kind === "pista" || t.kind === "bar"; return (
            <div key={t.id} onPointerDown={(e) => { const r = (e.currentTarget as HTMLElement).getBoundingClientRect(); drag.current = { id: t.id, dx: e.clientX - r.left, dy: e.clientY - r.top }; setSel(t.id); (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); }}
              style={{ left: t.x, top: t.y, touchAction: "none" }} className={cn("absolute grid cursor-grab select-none place-items-center text-center text-xs font-semibold shadow-sm active:cursor-grabbing", wide ? "h-24 w-56 rounded-2xl" : "size-[92px] rounded-full", t.kind === "casal" ? "bg-gold-soft text-gold ring-2 ring-gold/40" : t.kind === "pista" ? "bg-terra-soft text-terra" : t.kind === "bar" ? "bg-sage-soft text-sage-deep" : full ? "bg-sage text-white" : "bg-white text-ink ring-1 ring-line", sel === t.id && "ring-2 !ring-sage")}>
              <div><div>{t.name}</div>{t.seats > 0 && <div className="font-normal opacity-80">{o}/{t.seats}</div>}</div></div>); })}
        </div></div>
        <aside className="space-y-3">
          {T ? <div className="card p-4"><div className="mb-2 flex items-center justify-between"><input className="input py-1 font-semibold" value={T.name} onChange={(e) => update((x) => { x.tables.find((t) => t.id === T.id)!.name = e.target.value; })} /><button aria-label="Fechar" onClick={() => setSel(null)} className="ml-2"><X size={16} /></button></div>
            {T.seats > 0 && <label className="mb-2 flex items-center gap-2 text-xs text-muted">Lugares <input type="number" min={1} className="input w-20 py-1" value={T.seats} onChange={(e) => update((x) => { x.tables.find((t) => t.id === T.id)!.seats = +e.target.value; })} /></label>}
            {eligible.filter((g) => g.tableId === T.id).map((g) => <div key={g.id} className="flex items-center justify-between py-1 text-sm"><span>{g.name}</span><button aria-label="Tirar da mesa" className="text-muted hover:text-terra" onClick={() => update((x) => { x.guests.find((k) => k.id === g.id)!.tableId = undefined; })}><X size={13} /></button></div>)}
            {T.seats > 0 && occ(T.id) < T.seats && unseated.length > 0 && <select className="input mt-2 text-sm" value="" onChange={(e) => update((x) => { x.guests.find((g) => g.id === e.target.value)!.tableId = T.id; })}><option value="">+ Sentar convidado…</option>{unseated.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}</select>}
            <button className="mt-3 flex items-center gap-1 text-xs text-muted hover:text-terra" onClick={() => { update((x) => { x.guests.forEach((g) => { if (g.tableId === T.id) g.tableId = undefined; }); x.tables = x.tables.filter((t) => t.id !== T.id); }); setSel(null); }}><Trash2 size={12} />Excluir mesa</button></div>
            : <div className="card p-4 text-sm text-muted">Toquem numa mesa para ver e sentar convidados.</div>}
          <div className="card p-4"><div className="mb-2 flex items-center justify-between"><h2 className="font-sans text-sm font-semibold tracking-tight">Sem lugar</h2><Badge tone={unseated.length ? "terra" : "sage"}>{unseated.length}</Badge></div>
            <div className="max-h-72 overflow-y-auto">{unseated.map((g) => <div key={g.id} className="flex items-center justify-between gap-2 py-1 text-sm"><span className="truncate">{g.name}</span>
              <select className="w-24 rounded-lg border border-line bg-white px-1 py-0.5 text-xs" value="" onChange={(e) => update((x) => { x.guests.find((k) => k.id === g.id)!.tableId = e.target.value; })}><option value="">Mesa…</option>{d.tables.filter((t) => t.seats > 0 && occ(t.id) < t.seats).map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>)}{!unseated.length && <p className="text-sm text-muted">Todo mundo tem lugar.</p>}</div></div>
        </aside>
      </div>
    </div>
  );
}
