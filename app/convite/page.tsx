"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, X, Send } from "lucide-react";
import { InviteCard, Envelope, type InviteData } from "@/components/invite";
import { decodePayload } from "@/lib/utils";

export default function Convite() {
  const [i, setI] = useState<InviteData | null | undefined>(undefined); const [open, setOpen] = useState(false); const [ans, setAns] = useState<Record<string, boolean>>({}); const [recado, setRecado] = useState("");
  useEffect(() => { const h = location.hash.slice(1); setI(h ? decodePayload<InviteData>(h) : null); }, []);
  if (i === undefined) return null;
  if (!i) return <div className="grid min-h-screen place-items-center p-6 text-center text-muted">Link de convite inválido ou incompleto.</div>;
  const guests = i.guests ?? [];
  const send = () => {
    const lines = guests.map((g) => `${ans[g] === false ? "❌" : "✅"} ${g}`).join("\n"); const msg = `Oi, ${i.p1} e ${i.p2}! Sobre o casamento:\n${lines}${recado ? `\n\nRecado: ${recado}` : ""}\n\n(${i.family ?? "convidado"})`;
    window.open(`https://wa.me/${i.phone ?? ""}?text=${encodeURIComponent(msg)}`, "_blank");
  };
  return (
    <div className="mx-auto min-h-screen max-w-md bg-white shadow-xl">
      {!open ? <Envelope i={i} onOpen={() => setOpen(true)} /> : (
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <InviteCard i={i}>
            <div className="mx-auto mt-8 max-w-xs text-left">
              <div className="text-center text-[11px] font-semibold uppercase tracking-[0.3em] opacity-70">Presença</div>
              {i.deadline && <p className="mt-1 text-center text-xs opacity-70">Confirmem até {new Date(i.deadline + "T12:00:00").toLocaleDateString("pt-BR")}</p>}
              <div className="mt-3 space-y-2">{guests.map((g) => (
                <div key={g} className="flex items-center justify-between rounded-xl border border-black/10 bg-white/60 px-3 py-2 text-sm"><span>{g}</span>
                  <span className="flex gap-1"><button aria-label={`${g} vai`} onClick={() => setAns({ ...ans, [g]: true })} className={`grid size-8 place-items-center rounded-full border ${ans[g] === true ? "border-green-700 bg-green-700 text-white" : "border-black/15"}`}><Check size={15} /></button><button aria-label={`${g} não vai`} onClick={() => setAns({ ...ans, [g]: false })} className={`grid size-8 place-items-center rounded-full border ${ans[g] === false ? "border-red-700 bg-red-700 text-white" : "border-black/15"}`}><X size={15} /></button></span></div>))}</div>
              <textarea value={recado} onChange={(e) => setRecado(e.target.value)} placeholder="Deixe um recado para os noivos…" className="mt-3 min-h-20 w-full rounded-xl border border-black/10 bg-white/70 p-3 text-sm outline-none" />
              <button disabled={guests.length > 0 && Object.keys(ans).length < guests.length} onClick={send} className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-[#25a35a] py-3 text-sm font-bold text-white disabled:opacity-40"><Send size={15} />Enviar confirmação pelo WhatsApp</button>
            </div>
          </InviteCard>
        </motion.div>)}
    </div>
  );
}
