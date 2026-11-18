"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Briefcase, ArrowRight, ArrowLeft, Sparkles, Check } from "lucide-react";
import { useStore } from "@/lib/store";
import { demoWedding } from "@/lib/demo";
import { Logo, Field } from "@/components/ui";
import { STYLES } from "@/lib/plan";
import { addMonths, todayISO, cn, brl } from "@/lib/utils";
import type { Wedding } from "@/lib/types";

export default function Comecar() {
  const { createWedding, createDemo, state } = useStore(); const router = useRouter();
  const [step, setStep] = useState(0); const [busy, setBusy] = useState(false); const [err, setErr] = useState("");
  const [f, setF] = useState<Partial<Wedding>>({ partner1: "", partner2: "", city: "", date: addMonths(todayISO(), 10), budget: 60000, guestsEstimate: 120, style: "classico", homeType: "apto", liveTogether: false, honeymoon: true });
  const set = (p: Partial<Wedding>) => setF((x) => ({ ...x, ...p }));
  const steps = 5; const role = state.user?.role ?? "casal"; const valid = [!!f.partner1 && !!f.partner2, !!f.date && !!f.city, (f.budget ?? 0) > 0 && (f.guestsEstimate ?? 0) > 0, true, true][step];
  const finish = async () => { setBusy(true); setErr(""); try { await createWedding(f); router.push("/app"); } catch (e) { setErr((e as Error).message); setBusy(false); } };
  const demo = async () => { setBusy(true); try { await createDemo(demoWedding()); router.push("/app"); } catch (e) { setErr((e as Error).message); setBusy(false); } };
  const perGuest = Math.round((f.budget ?? 0) / Math.max(1, f.guestsEstimate ?? 1));
  return (
    <div className="grain relative grid min-h-screen place-items-center overflow-hidden bg-ivory p-4">
      <div className="relative w-full max-w-xl">
        <div className="mb-6 flex items-center justify-between"><Logo /><span className="text-xs text-muted">{Object.keys(state.weddings).length ? <button className="underline" onClick={() => router.push("/app")}>Voltar ao app</button> : `Passo ${step + 1} de ${steps}`}</span></div>
        <div className="mb-5 h-1 rounded-full bg-line"><motion.div className="h-1 rounded-full bg-sage" animate={{ width: `${((step + 1) / steps) * 100}%` }} /></div>
        <div className="card p-6 sm:p-8">
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.25 }} className="space-y-5">
                            {step === 0 && (<>
                <h1 className="text-3xl font-semibold">{role === "casal" ? "Quem vai se casar?" : "Quem são os noivos deste casamento?"}</h1>
                <div className="grid gap-3 sm:grid-cols-2"><Field label="Nome 1"><input className="input" autoFocus value={f.partner1} onChange={(e) => set({ partner1: e.target.value })} placeholder="Daniela" /></Field><Field label="Nome 2"><input className="input" value={f.partner2} onChange={(e) => set({ partner2: e.target.value })} placeholder="Thiago" /></Field></div>
                <Field label="WhatsApp do casal (para receber confirmações e reservas de presentes)"><input className="input" inputMode="tel" value={f.phone ?? ""} onChange={(e) => set({ phone: e.target.value.replace(/\D/g, "") })} placeholder="5519999999999" /></Field>
              </>)}
              {step === 1 && (<>
                <h1 className="text-3xl font-semibold">Quando e onde?</h1>
                <div className="grid gap-3 sm:grid-cols-2"><Field label="Data"><input type="date" className="input" value={f.date} onChange={(e) => set({ date: e.target.value })} /></Field><Field label="Horário da cerimônia"><input type="time" className="input" value={f.time ?? "16:30"} onChange={(e) => set({ time: e.target.value })} /></Field></div>
                <Field label="Cidade"><input className="input" value={f.city} onChange={(e) => set({ city: e.target.value })} placeholder="Campinas, SP" /></Field>
                <Field label="Espaço da festa (se já tiver)"><input className="input" value={f.venue ?? ""} onChange={(e) => set({ venue: e.target.value, receptionPlace: e.target.value })} /></Field>
              </>)}
              {step === 2 && (<>
                <h1 className="text-3xl font-semibold">Orçamento e convidados</h1>
                <Field label="Teto do orçamento (R$)"><input type="number" className="input" value={f.budget} onChange={(e) => set({ budget: +e.target.value })} /></Field>
                <Field label="Convidados estimados"><input type="number" className="input" value={f.guestsEstimate} onChange={(e) => set({ guestsEstimate: +e.target.value })} /></Field>
                <p className="rounded-xl bg-gold-soft p-3 text-sm text-ink">Isso dá cerca de <b>{brl(perGuest)}</b> por convidado. O Enlace divide o teto por categoria para vocês ajustarem depois.</p>
              </>)}
              {step === 3 && (<>
                <h1 className="text-3xl font-semibold">Qual é o clima da festa?</h1>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">{STYLES.map((s) => <button key={s.id} onClick={() => set({ style: s.id })} className={cn("rounded-xl border p-3 text-sm font-semibold transition", f.style === s.id ? "border-sage bg-sage-soft" : "border-line hover:bg-ivory")}>{s.name}</button>)}</div>
                <p className="text-sm text-muted">Define o modelo do convite digital e as sugestões. Dá para trocar depois.</p>
              </>)}
              {step === 4 && (<>
                <h1 className="text-3xl font-semibold">A casa de vocês</h1>
                <p className="text-sm text-muted">Como no Enxovaly: o plano do enxoval muda com o perfil de vocês.</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {([["liveTogether", "Já moram juntos?"], ["honeymoon", "Terão lua de mel (cotas de presente)?"]] as const).map(([k, l]) => (
                    <button key={k} onClick={() => set({ [k]: !f[k] })} className={cn("flex items-center justify-between rounded-xl border p-3 text-left text-sm font-medium", f[k] ? "border-sage bg-sage-soft" : "border-line")}>{l}<span className={cn("grid size-5 place-items-center rounded-full", f[k] ? "bg-sage text-white" : "bg-line")}>{f[k] && <Check size={12} />}</span></button>))}
                </div>
                <div className="flex gap-2">{(["apto", "casa"] as const).map((h) => <button key={h} onClick={() => set({ homeType: h })} className={cn("flex-1 rounded-xl border p-3 text-sm font-semibold capitalize", f.homeType === h ? "border-sage bg-sage-soft" : "border-line")}>{h === "apto" ? "Apartamento" : "Casa"}</button>)}</div>
                <div className="rounded-xl bg-sage-soft p-3 text-sm"><Sparkles size={14} className="mr-1 inline text-sage" />Vamos gerar: <b>checklist por fase</b>, <b>orçamento por categoria</b>, <b>enxoval da casa</b>, <b>lista de presentes</b>, <b>mapa de mesas</b> e <b>cronograma do dia</b>.</div>
              </>)}
            </motion.div>
          </AnimatePresence>
          <div className="mt-6 flex items-center justify-between">
            <button className="btn btn-ghost btn-sm" disabled={step === 0} onClick={() => setStep(step - 1)}><ArrowLeft size={14} />Voltar</button>
            {step < steps - 1 ? <button className="btn btn-primary" disabled={!valid} onClick={() => setStep(step + 1)}>Continuar <ArrowRight size={15} /></button> : <button className="btn btn-primary" disabled={busy} onClick={finish}>{busy ? "Gerando…" : "Gerar o plano"} <Sparkles size={15} /></button>}
          </div>
        </div>
        {err && <p role="alert" className="mt-3 rounded-xl bg-terra-soft p-3 text-sm text-terra">{err}</p>}
        <button onClick={demo} disabled={busy} className="mx-auto mt-4 block text-sm text-muted underline">Só quero explorar com um casamento de exemplo</button>
      </div>
    </div>
  );
}
