"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { brl, cn } from "@/lib/utils";

export function LandingQuiz() {
  const [guests, setGuests] = useState(120); const [budget, setBudget] = useState(60000); const [months, setMonths] = useState(10); const [moves, setMoves] = useState(false);
  const per = Math.round(budget / guests); const tasks = 46; const perMonth = Math.ceil(tasks / Math.max(3, months)); const items = moves ? 68 : 52;
  return (
    <div className="grid gap-6 rounded-3xl bg-sage-deep p-6 text-white sm:p-10 lg:grid-cols-2">
      <div className="space-y-5">
        <div><label className="text-sm text-white/70" htmlFor="q-g">Quantos convidados?</label><div className="mt-1 flex items-center gap-3"><input id="q-g" type="range" min={30} max={400} step={10} value={guests} onChange={(e) => setGuests(+e.target.value)} className="flex-1 accent-[#c2603f]" /><b className="w-12 text-right tabular-nums">{guests}</b></div></div>
        <div><label className="text-sm text-white/70" htmlFor="q-b">Orçamento total</label><div className="mt-1 flex items-center gap-3"><input id="q-b" type="range" min={15000} max={250000} step={5000} value={budget} onChange={(e) => setBudget(+e.target.value)} className="flex-1 accent-[#c2603f]" /><b className="w-24 text-right tabular-nums">{brl(budget)}</b></div></div>
        <div><label className="text-sm text-white/70" htmlFor="q-m">Meses até o casamento</label><div className="mt-1 flex items-center gap-3"><input id="q-m" type="range" min={3} max={24} value={months} onChange={(e) => setMonths(+e.target.value)} className="flex-1 accent-[#c2603f]" /><b className="w-12 text-right tabular-nums">{months}</b></div></div>
        <button onClick={() => setMoves(!moves)} className={cn("w-full rounded-xl border p-3 text-left text-sm transition", moves ? "border-gold bg-white/10" : "border-white/20")}>{moves ? "✓ " : ""}Vamos montar a casa do zero (enxoval completo)</button>
      </div>
      <motion.div key={`${guests}-${budget}-${months}-${moves}`} initial={{ opacity: 0.4, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-white/10 p-5">
        <div className="flex items-center gap-2 text-sm text-gold-soft"><Sparkles size={15} />O plano de vocês</div>
        <dl className="mt-4 grid grid-cols-2 gap-4">
          {[[brl(per), "por convidado no teto"], [`~${perMonth}`, "tarefas por mês"], [`${Math.ceil(guests / 8)}`, "mesas de 8 lugares"], [`${items}`, "itens no enxoval da casa"]].map(([v, l]) => <div key={l}><dt className="font-serif text-3xl font-semibold">{v}</dt><dd className="text-xs text-white/70">{l}</dd></div>)}
        </dl>
        <p className="mt-5 text-xs text-white/60">Estimativa ilustrativa. No app, o plano considera data, cidade e o perfil de vocês.</p>
      </motion.div>
    </div>
  );
}
