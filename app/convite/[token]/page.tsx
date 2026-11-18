"use client";
import { use, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, X, Send } from "lucide-react";
import { InviteCard, Envelope, type InviteData } from "@/components/invite";

type Data = Omit<InviteData, "guests"> & { guests: { id: string; name: string; rsvp: string }[] };
export default function Convite({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params); const [i, setI] = useState<Data | null | undefined>(undefined); const [open, setOpen] = useState(false); const [ans, setAns] = useState<Record<string, boolean>>({}); const [recado, setRecado] = useState(""); const [sent, setSent] = useState(false); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  useEffect(() => { fetch(`/api/public/invite/${token}`).then((r) => (r.ok ? r.json() : null)).then((d: Data | null) => { setI(d); if (d) setAns(Object.fromEntries(d.guests.filter((g) => g.rsvp !== "pendente").map((g) => [g.id, g.rsvp === "confirmado"]))); }).catch(() => setI(null)); }, [token]);
  if (i === undefined) return <div className="grid min-h-screen place-items-center text-muted">Carregando convite…</div>;
  if (!i) return <div className="grid min-h-screen place-items-center p-6 text-center text-muted">Convite não encontrado. Peça um novo link aos noivos.</div>;
  const send = async () => { setBusy(true); setErr(""); const r = await fetch(`/api/public/invite/${token}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ answers: ans, recado }) }); setBusy(false); if (r.ok) setSent(true); else setErr((await r.json()).error ?? "Não foi possível enviar."); };
  const going = i.guests.filter((g) => ans[g.id] === true).length;
  return (
    <div className="mx-auto min-h-screen max-w-md bg-white shadow-xl">
      {!open ? <Envelope i={i as unknown as InviteData} onOpen={() => setOpen(true)} /> : (
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <InviteCard i={i as unknown as InviteData}>
            <div className="mx-auto mt-8 max-w-xs text-left">
              <div className="text-center text-[11px] font-semibold uppercase tracking-[0.3em] opacity-70">Presença</div>
              {i.deadline && <p className="mt-1 text-center text-xs opacity-70">Confirmem até {new Date(i.deadline + "T12:00:00").toLocaleDateString("pt-BR")}</p>}
              {sent ? <div className="mt-4 rounded-xl bg-white/70 p-4 text-center text-sm"><b>Obrigado!</b><p className="mt-1">{going > 0 ? `Registramos ${going} presença(s). Mal podemos esperar!` : "Registramos a sua resposta."}</p><button className="mt-2 text-xs underline" onClick={() => setSent(false)}>Alterar resposta</button></div> : (<>
                <div className="mt-3 space-y-2">{i.guests.map((g) => (
                  <div key={g.id} className="flex items-center justify-between rounded-xl border border-black/10 bg-white/60 px-3 py-2 text-sm"><span>{g.name}</span>
                    <span className="flex gap-1"><button aria-label={`${g.name} vai`} onClick={() => setAns({ ...ans, [g.id]: true })} className={`grid size-8 place-items-center rounded-full border ${ans[g.id] === true ? "border-green-700 bg-green-700 text-white" : "border-black/15"}`}><Check size={15} /></button><button aria-label={`${g.name} não vai`} onClick={() => setAns({ ...ans, [g.id]: false })} className={`grid size-8 place-items-center rounded-full border ${ans[g.id] === false ? "border-red-700 bg-red-700 text-white" : "border-black/15"}`}><X size={15} /></button></span></div>))}</div>
                <textarea value={recado} onChange={(e) => setRecado(e.target.value)} maxLength={600} placeholder="Deixe um recado para os noivos…" className="mt-3 min-h-20 w-full rounded-xl border border-black/10 bg-white/70 p-3 text-sm outline-none" />
                {err && <p role="alert" className="mt-2 text-xs text-red-700">{err}</p>}
                <button disabled={busy || i.guests.some((g) => ans[g.id] === undefined)} onClick={send} className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-[#2f5d46] py-3 text-sm font-bold text-white disabled:opacity-40"><Send size={15} />{busy ? "Enviando…" : "Confirmar presença"}</button></>)}
            </div>
          </InviteCard>
        </motion.div>)}
    </div>
  );
}
