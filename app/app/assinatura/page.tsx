"use client";
import { useEffect, useState } from "react";
import { CreditCard, Check } from "lucide-react";
import { useData, useStore } from "@/lib/store";
import { PageHeader, Badge, Field } from "@/components/ui";
import { brl } from "@/lib/utils";

interface B { state: "trial" | "active" | "blocked"; daysLeft: number; status: string; plan: "casal" | "assessor"; price: number; canceled: boolean; configured: boolean }
export default function Assinatura() {
  const { d } = useData(); const { meta, state } = useStore(); const id = d.wedding.id; const [b, setB] = useState<B | null>(null); const [doc, setDoc] = useState(""); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false); const isOwner = meta?.role === "owner";
  const load = () => fetch(`/api/w/${id}/billing`).then((r) => r.json()).then(setB);
  useEffect(() => { load(); }, [id]); // eslint-disable-line
  const call = async (body: object) => { setBusy(true); setErr(""); const r = await fetch(`/api/w/${id}/billing`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }); const j = await r.json(); setBusy(false); if (!r.ok) { setErr(j.error); return null; } return j; };
  const subscribe = async () => { const j = await call({ cpfCnpj: doc }); if (j?.url) location.href = j.url; };
  if (!b) return <p className="text-muted">Carregando…</p>;
  const label = b.state === "active" ? (b.canceled ? "Cancelada (acesso até o fim do mês pago)" : "Assinatura ativa") : b.state === "trial" ? `Período grátis: ${b.daysLeft} dia(s) restantes` : "Período grátis encerrado";
  return (
    <div className="max-w-xl">
      <PageHeader title="Assinatura" sub={b.plan === "assessor" ? "Plano Assessor: cobre todos os casamentos da sua carteira." : "Uma assinatura por casamento, com tudo incluso."} />
      <div className="card space-y-4 p-6">
        <div className="flex items-center justify-between"><div><div className="label">Plano {b.plan === "assessor" ? "Assessor" : "Casal"}</div><div className="font-serif text-4xl font-semibold">{brl(b.price)}<span className="text-base font-normal text-muted"> /mês</span></div></div><Badge tone={b.state === "blocked" ? "terra" : b.state === "trial" ? "gold" : "sage"}>{label}</Badge></div>
        <ul className="space-y-1.5 text-sm">{["Tudo incluso, sem limite de convidados", "Convite digital para todos os convidados", "Equipe com permissões", "Cancele quando quiser, sem multa"].map((t) => <li key={t} className="flex gap-2"><Check size={15} className="mt-0.5 text-sage" />{t}</li>)}</ul>
        {state.user && b.state !== "active" && isOwner && <div className="space-y-3 border-t border-line pt-4"><Field label="CPF ou CNPJ (para emitir a cobrança)"><input className="input" inputMode="numeric" value={doc} onChange={(e) => setDoc(e.target.value)} /></Field>
          <button className="btn btn-primary w-full" disabled={busy || !b.configured} onClick={subscribe}><CreditCard size={15} />{busy ? "Abrindo…" : "Assinar com Pix, boleto ou cartão"}</button>
          {!b.configured && <p className="text-xs text-muted">A cobrança ainda não foi ativada neste servidor.</p>}</div>}
        {b.state === "active" && !b.canceled && isOwner && <button className="btn btn-ghost text-terra" disabled={busy} onClick={async () => { if (confirm("Cancelar a assinatura? O acesso continua até o fim do período pago.")) { await call({ action: "cancel" }); load(); } }}>Cancelar assinatura</button>}
        {!isOwner && <p className="text-xs text-muted">Só quem criou o casamento gerencia a assinatura.</p>}
        {err && <p role="alert" className="text-sm text-terra">{err}</p>}
      </div>
    </div>
  );
}
