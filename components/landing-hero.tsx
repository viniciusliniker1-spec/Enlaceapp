"use client";
import { motion } from "framer-motion";
import { Check, FileSpreadsheet, MessageCircle, FileText } from "lucide-react";

export function HeroVisual() {
  const chaos = [
    { icon: FileSpreadsheet, t: "planilha_casamento.xlsx", s: "Decoração  12.800  #REF!", r: -6, x: 0, y: 0 },
    { icon: MessageCircle, t: "Buffet", s: "A degustação pode ser dia 27 ?", r: 4, x: 28, y: 70 },
    { icon: FileText, t: "contrato_foto.pdf", s: "versão final (2) (1)", r: -3, x: 6, y: 140 },
  ];
  return (
    <div className="relative mx-auto w-full max-w-xl">
      <div className="absolute -left-2 top-4 hidden w-56 sm:block">
        {chaos.map((c, i) => <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: c.x, rotate: c.r }} transition={{ delay: 0.3 + i * 0.12 }} className="card absolute flex w-52 items-center gap-2 p-2.5 text-[11px] opacity-90" style={{ top: c.y }}><c.icon size={16} className="shrink-0 text-muted" /><div><b className="block">{c.t}</b><span className="text-muted">{c.s}</span></div></motion.div>)}
      </div>
      <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }} className="card relative ml-auto w-full max-w-sm overflow-hidden sm:w-[78%]">
        <div className="bg-sage-deep p-5 text-white"><div className="text-[11px] text-gold-soft">domingo, 20 de junho · Curitiba</div><div className="font-serif text-2xl font-semibold">Rafael e Marina</div><div className="mt-2 flex items-end justify-between"><span className="text-xs text-white/70">Fase 6 a 9 meses</span><span className="font-serif text-4xl font-semibold leading-none">214<span className="ml-1 text-xs font-sans font-normal text-white/70">dias</span></span></div></div>
        <div className="space-y-3 p-4 text-xs">
          <div className="rounded-xl bg-terra-soft/70 p-2.5"><b className="text-terra">Próximo passo</b><div>2 contratados sem pagamento definido</div></div>
          <div className="grid grid-cols-2 gap-2"><div className="rounded-xl bg-ivory p-2.5"><div className="text-muted">Orçamento</div><b className="text-base">90%</b></div><div className="rounded-xl bg-ivory p-2.5"><div className="text-muted">Convidados</div><b className="text-base">142/186</b></div></div>
          {["DJ Compasso · Parcela 1 de 2 · amanhã", "Buffet · Parcela 3 de 5 · em 3 dias"].map((t) => <div key={t} className="flex items-center gap-2 border-t border-line pt-2"><span className="grid size-4 place-items-center rounded-full bg-sage text-white"><Check size={10} /></span>{t}</div>)}
        </div>
      </motion.div>
    </div>
  );
}
