"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, UserPlus, Download, Copy, Check } from "lucide-react";
import { useData, useStore } from "@/lib/store";
import { PageHeader, Field, Badge } from "@/components/ui";
import type { TeamInfo } from "@/lib/types";
import { copyText } from "@/lib/utils";

export default function Ajustes() {
  const { d, update } = useData(); const { state, meta, setTeam, removeWedding } = useStore(); const w = d.wedding; const router = useRouter();
  const [em, setEm] = useState(""); const [role, setRole] = useState<"editar" | "ver">("editar"); const [link, setLink] = useState(""); const [err, setErr] = useState(""); const [copied, setCopied] = useState(false);
  const set = (p: Partial<typeof w>) => update((x) => Object.assign(x.wedding, p)); const isOwner = meta?.role === "owner"; const team = meta!.team;
  const call = async (method: string, qs: string, body?: unknown) => { setErr(""); const r = await fetch(`/api/w/${w.id}/members${qs}`, { method, headers: { "content-type": "application/json" }, body: body ? JSON.stringify(body) : undefined }); const j = await r.json(); if (!r.ok) { setErr(j.error); return null; } setTeam(w.id, j as TeamInfo); return j as TeamInfo & { link?: string | null }; };
  const invite = async () => { if (!em) return; const j = await call("POST", "", { email: em, role }); if (j) { setLink(j.link ? location.origin + j.link : ""); setEm(""); } };
  const backup = () => { const b = new Blob([JSON.stringify(d, null, 2)], { type: "application/json" }); const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = `casamento-${w.partner1}-${w.partner2}.json`; a.click(); };
  return (
    <div className="space-y-5">
      <PageHeader title="Casamento e equipe" sub="Dados gerais, quem planeja junto e a cópia dos seus dados." />
      <section className="card grid gap-3 p-5 sm:grid-cols-2"><h2 className="text-lg font-semibold sm:col-span-2">Dados do casamento</h2>
        <Field label="Nome 1"><input className="input" value={w.partner1} onChange={(e) => set({ partner1: e.target.value })} /></Field><Field label="Nome 2"><input className="input" value={w.partner2} onChange={(e) => set({ partner2: e.target.value })} /></Field>
        <Field label="Data"><input type="date" className="input" value={w.date} onChange={(e) => set({ date: e.target.value })} /></Field><Field label="Cidade"><input className="input" value={w.city} onChange={(e) => set({ city: e.target.value })} /></Field>
        <Field label="Teto do orçamento (R$)"><input type="number" className="input" value={w.budget} onChange={(e) => set({ budget: +e.target.value })} /></Field><Field label="Convidados estimados"><input type="number" className="input" value={w.guestsEstimate} onChange={(e) => set({ guestsEstimate: +e.target.value })} /></Field></section>
      <section className="card p-5"><h2 className="mb-1 text-lg font-semibold">Quem planeja junto</h2><p className="mb-3 text-xs text-muted">Cada pessoa entra com a própria conta, com permissão de editar ou só ver. As mudanças aparecem para todos em poucos segundos.</p>
        <div className="flex items-center justify-between border-t border-line py-2 text-sm"><span>{team.owner.name} <span className="text-muted">· {team.owner.email}</span></span><Badge tone="sage">Criador</Badge></div>
        {team.members.map((m) => <div key={m.id} className="flex flex-wrap items-center justify-between gap-2 border-t border-line py-2 text-sm"><span>{m.name} <span className="text-muted">· {m.email}</span></span><span className="flex items-center gap-2">
          {isOwner ? <select className="rounded-lg border border-line bg-white px-1.5 py-1 text-xs" value={m.role} onChange={(e) => call("PATCH", "", { userId: m.id, role: e.target.value })}><option value="editar">Pode editar</option><option value="ver">Só ver</option></select> : <Badge>{m.role === "editar" ? "Pode editar" : "Só ver"}</Badge>}
          {isOwner && <button aria-label="Remover" onClick={() => call("DELETE", `?userId=${m.id}`)}><Trash2 size={14} className="text-muted" /></button>}</span></div>)}
        {team.pending.map((p) => <div key={p.token} className="flex items-center justify-between border-t border-line py-2 text-sm"><span>{p.email} <Badge tone="gold">Convite pendente</Badge></span>{isOwner && <button aria-label="Cancelar convite" onClick={() => call("DELETE", `?invite=${p.token}`)}><Trash2 size={14} className="text-muted" /></button>}</div>)}
        {isOwner && <div className="mt-3 flex flex-wrap gap-2"><input className="input min-w-0 flex-1" type="email" placeholder="e-mail da pessoa" value={em} onChange={(e) => setEm(e.target.value)} /><select className="input w-auto" value={role} onChange={(e) => setRole(e.target.value as "editar" | "ver")}><option value="editar">Pode editar</option><option value="ver">Só ver</option></select><button className="btn btn-primary btn-sm" onClick={invite}><UserPlus size={14} />Convidar</button></div>}
        {link && <div className="mt-3 rounded-xl bg-sage-soft p-3 text-sm">Convite criado (se o envio de e-mail estiver ativo, ela já recebeu). Você também pode mandar este link para ela criar a conta e entrar no casamento:<div className="mt-2 flex gap-2"><input readOnly className="input" value={link} onFocus={(e) => e.target.select()} /><button className="btn btn-ghost btn-sm" onClick={async () => { await copyText(link); setCopied(true); setTimeout(() => setCopied(false), 1500); }}>{copied ? <Check size={14} /> : <Copy size={14} />}</button></div></div>}
        {err && <p role="alert" className="mt-2 text-sm text-terra">{err}</p>}</section>
      <section className="card p-5"><h2 className="mb-1 text-lg font-semibold">Seus dados</h2><p className="mb-3 text-xs text-muted">Conta: {state.user?.email}. Tudo é salvo online, na sua conta.</p><div className="flex flex-wrap gap-2"><button className="btn btn-ghost" onClick={backup}><Download size={15} />Baixar cópia (JSON)</button>
        {isOwner && <button className="btn btn-ghost text-terra" onClick={async () => { if (confirm("Excluir este casamento para todos os membros? Isso não pode ser desfeito.")) { await removeWedding(w.id); router.push("/app/comecar"); } }}><Trash2 size={15} />Excluir casamento</button>}</div></section>
    </div>
  );
}
