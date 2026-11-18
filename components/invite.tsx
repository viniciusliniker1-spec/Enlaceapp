"use client";
import { motion } from "framer-motion";
import { MapPin, Shirt, Clock } from "lucide-react";
import { PALETTES } from "@/lib/plan";
import { fmtDateLong, cn } from "@/lib/utils";

export interface InviteData { p1: string; p2: string; date: string; time: string; cerN: string; cerA: string; recN: string; recA: string; dress: string; deadline: string; style: string; palette: number; msg: string; family?: string; phone?: string; guests?: string[]; }
const maps = (a: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(a)}`;

export function InviteCard({ i, children, compact }: { i: InviteData; children?: React.ReactNode; compact?: boolean }) {
  const [main, soft, acc] = PALETTES[i.palette % PALETTES.length]; const gala = i.style === "gala"; const bg = gala ? "#1d1a18" : soft; const fg = gala ? "#f1ece3" : "#231f1c"; const heading = i.style === "praia" || i.style === "civil" ? "var(--font-inter)" : "var(--font-serif)";
  const deco = {
    classico: <div className="pointer-events-none absolute inset-3 rounded-[4px] border" style={{ borderColor: acc }} />,
    jardim: <><Leaf c={main} cls="left-0 top-0" /><Leaf c={main} cls="bottom-0 right-0 rotate-180" /></>,
    praia: <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 400 60" aria-hidden><path d="M0 30 Q50 5 100 30 T200 30 T300 30 T400 30 V60 H0Z" fill={main} opacity=".18" /><path d="M0 42 Q50 20 100 42 T200 42 T300 42 T400 42 V60 H0Z" fill={acc} opacity=".25" /></svg>,
    gala: <div className="pointer-events-none absolute inset-4 border" style={{ borderColor: acc, outline: `1px solid ${acc}`, outlineOffset: 5 }} />,
    civil: <div className="absolute left-0 top-0 h-1.5 w-full" style={{ background: main }} />,
  }[i.style] ?? null;
  return (
    <div className="relative overflow-hidden px-7 py-12 text-center" style={{ background: bg, color: fg }}>
      {deco}
      <div className="relative">
        <div className="text-[11px] font-semibold uppercase tracking-[0.3em]" style={{ color: acc }}>Vamos nos casar</div>
        <h2 className={cn("mt-4 leading-[1.05]", compact ? "text-3xl" : "text-5xl")} style={{ fontFamily: heading, fontWeight: i.style === "civil" ? 700 : 500, color: gala ? acc : main }}>{i.p1 || "Nome"}<span className="block text-2xl italic" style={{ color: acc }}>&amp;</span>{i.p2 || "Nome"}</h2>
        <p className="mt-5 text-sm" style={{ opacity: 0.8 }}>{fmtDateLong(i.date)}</p>
        {i.family && <p className="mt-5 text-sm font-semibold">{i.family},</p>}
        <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed" style={{ opacity: 0.85 }}>{i.msg}</p>
        <div className="mx-auto mt-7 grid max-w-xs gap-3 text-left text-sm">
          {[["Cerimônia", i.time, i.cerN, i.cerA], ["Recepção", "", i.recN, i.recA]].filter((x) => x[2]).map(([t, h, n, a]) => (
            <div key={t} className="rounded-xl border p-3" style={{ borderColor: `${acc}66` }}><div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest" style={{ color: acc }}><Clock size={11} />{t} {h && `· ${h}`}</div><div className="mt-1 font-semibold">{n}</div><div className="text-xs opacity-70">{a}</div>{a && <a className="mt-1 inline-flex items-center gap-1 text-xs font-semibold underline" style={{ color: main === "#22201e" ? acc : gala ? acc : main }} href={maps(`${n} ${a}`)} target="_blank" rel="noreferrer"><MapPin size={11} />Como chegar</a>}</div>))}
          {i.dress && <div className="flex items-center gap-2 text-xs opacity-80"><Shirt size={13} />Traje: {i.dress}</div>}
        </div>
        {children}
      </div>
    </div>
  );
}
const Leaf = ({ c, cls }: { c: string; cls: string }) => <svg className={cn("pointer-events-none absolute w-28 opacity-30", cls)} viewBox="0 0 100 100" aria-hidden><path d="M0 0 C40 5 70 30 80 80 C50 60 20 40 0 0Z M0 30 C20 35 40 55 45 90 C25 75 10 55 0 30Z" fill={c} /></svg>;

export function Envelope({ i, onOpen }: { i: InviteData; onOpen: () => void }) {
  const [main, soft, acc] = PALETTES[i.palette % PALETTES.length];
  return (
    <button onClick={onOpen} className="group relative grid h-full min-h-[480px] w-full place-items-center px-6 text-center" style={{ background: main, color: soft }} aria-label="Abrir convite">
      <div>
        <div className="mx-auto mb-6 grid size-24 place-items-center rounded-full border-2 font-serif text-3xl" style={{ borderColor: acc }}>{(i.p1[0] ?? "") + "&" + (i.p2[0] ?? "")}</div>
        {i.family && <p className="text-sm opacity-80">Para {i.family}</p>}
        <h1 className="mt-2 font-serif text-4xl">{i.p1} e {i.p2}</h1>
        <motion.p animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="mt-8 text-xs font-semibold uppercase tracking-[0.25em]" style={{ color: acc }}>Toque para abrir</motion.p>
      </div>
    </button>
  );
}
