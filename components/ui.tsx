"use client";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn, brl } from "@/lib/utils";
import { useEffect, type ReactNode } from "react";

export function Logo({ className, light }: { className?: string; light?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-serif text-xl font-semibold", className)}>
      <svg width="30" height="30" viewBox="0 0 64 64" aria-hidden><circle cx="26" cy="32" r="14" fill="none" stroke={light ? "#f4ead6" : "#3f5b4b"} strokeWidth="5" /><circle cx="39" cy="32" r="14" fill="none" stroke="#c2603f" strokeWidth="5" /></svg>
      Enlace
    </span>
  );
}
export const Money = ({ v, className }: { v: number; className?: string }) => <span className={cn("money tabular-nums", className)}>{brl(v)}</span>;

export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean }) {
  useEffect(() => { const h = (e: KeyboardEvent) => e.key === "Escape" && onClose(); if (open) addEventListener("keydown", h); return () => removeEventListener("keydown", h); }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-0 backdrop-blur-sm sm:items-center sm:p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={onClose}>
          <motion.div role="dialog" aria-modal aria-label={title} onMouseDown={(e) => e.stopPropagation()} initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} transition={{ type: "spring", stiffness: 260, damping: 28 }}
            className={cn("card max-h-[92vh] w-full overflow-y-auto rounded-b-none p-5 sm:rounded-b-2xl", wide ? "max-w-2xl" : "max-w-md")}>
            <div className="mb-4 flex items-center justify-between"><h3 className="text-xl font-semibold">{title}</h3><button aria-label="Fechar" onClick={onClose} className="rounded-full p-1.5 hover:bg-ivory"><X size={18} /></button></div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
export const Field = ({ label, children, className }: { label: string; children: ReactNode; className?: string }) => <label className={cn("block space-y-1", className)}><span className="label">{label}</span>{children}</label>;
export function Progress({ value, className, tone = "sage" }: { value: number; className?: string; tone?: "sage" | "terra" | "gold" }) {
  const c = { sage: "bg-sage", terra: "bg-terra", gold: "bg-gold" }[tone];
  return <div className={cn("h-2 overflow-hidden rounded-full bg-line", className)}><motion.div className={cn("h-full rounded-full", c)} initial={{ width: 0 }} animate={{ width: `${Math.min(100, Math.max(0, value))}%` }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} /></div>;
}
export const Badge = ({ children, tone = "muted" }: { children: ReactNode; tone?: "muted" | "sage" | "terra" | "gold" }) => (
  <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", { muted: "bg-line/70 text-muted", sage: "bg-sage-soft text-sage-deep", terra: "bg-terra-soft text-terra", gold: "bg-gold-soft text-gold" }[tone])}>{children}</span>
);
export function PageHeader({ title, sub, actions }: { title: string; sub?: string; actions?: ReactNode }) {
  return <div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-3xl font-semibold">{title}</h1>{sub && <p className="mt-1 max-w-xl text-sm text-muted">{sub}</p>}</div><div className="no-print flex flex-wrap gap-2">{actions}</div></div>;
}
export const Empty = ({ children }: { children: ReactNode }) => <div className="rounded-2xl border border-dashed border-line p-8 text-center text-sm text-muted">{children}</div>;
export const Stat = ({ label, value, hint }: { label: string; value: ReactNode; hint?: ReactNode }) => (
  <div className="card p-4"><div className="label">{label}</div><div className="mt-1 text-2xl font-semibold tabular-nums">{value}</div>{hint && <div className="mt-0.5 text-xs text-muted">{hint}</div>}</div>
);
export const Reveal = ({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) => (
  <motion.div className={className} initial={{ opacity: 0, y: 24, filter: "blur(6px)" }} whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}>{children}</motion.div>
);
