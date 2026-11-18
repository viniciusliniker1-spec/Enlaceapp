"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, UserPlus, Download, Upload } from "lucide-react";
import { useData, useStore } from "@/lib/store";
import { PageHeader, Field, Badge } from "@/components/ui";
import { uid } from "@/lib/utils";

export default function Ajustes() {
  const { d, update } = useData(); const { state, setState, removeWedding } = useStore(); const w = d.wedding; const router = useRouter(); const [em, setEm] = useState(""); const set = (p: Partial<typeof w>) => update((x) => Object.assign(x.wedding, p));
  const backup = () => { const b = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" }); const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "enlace-backup.json"; a.click(); };
  const restore = (f: File | undefined) => { if (!f) return; f.text().then((t) => { try { const s = JSON.parse(t); if (s.weddings) setState(() => s); } catch { alert("Arquivo inválido."); } }); };
  return (
    <div className="space-y-5">
      <PageHeader title="Casamento e equipe" sub="Dados gerais, quem planeja junto e o backup do que vocês cadastraram." />
      <section className="card grid gap-3 p-5 sm:grid-cols-2"><h2 className="text-lg font-semibold sm:col-span-2">Dados do casamento</h2>
        <Field label="Nome 1"><input className="input" value={w.partner1} onChange={(e) => set({ partner1: e.target.value })} /></Field><Field label="Nome 2"><input className="input" value={w.partner2} onChange={(e) => set({ partner2: e.target.value })} /></Field>
        <Field label="Data"><input type="date" className="input" value={w.date} onChange={(e) => set({ date: e.target.value })} /></Field><Field label="Cidade"><input className="input" value={w.city} onChange={(e) => set({ city: e.target.value })} /></Field>
        <Field label="Teto do orçamento (R$)"><input type="number" className="input" value={w.budget} onChange={(e) => set({ budget: +e.target.value })} /></Field><Field label="Convidados estimados"><input type="number" className="input" value={w.guestsEstimate} onChange={(e) => set({ guestsEstimate: +e.target.value })} /></Field></section>
      <section className="card p-5"><h2 className="mb-1 text-lg font-semibold">Quem planeja junto</h2><p className="mb-3 text-xs text-muted">Cerimonialista, mãe, o outro do casal… cada pessoa com permissão de editar ou só ver. Nesta versão de demonstração o convite fica registrado só neste aparelho; o acesso real entra com a conta online.</p>
        <div className="mb-3 flex flex-wrap gap-2"><input className="input min-w-0 flex-1" type="email" placeholder="e-mail da pessoa" value={em} onChange={(e) => setEm(e.target.value)} /><button className="btn btn-primary btn-sm" onClick={() => { if (em) { update((x) => x.members.push({ id: uid(), email: em, role: "editar" })); setEm(""); } }}><UserPlus size={14} />Convidar</button></div>
        {d.members.map((m) => <div key={m.id} className="flex items-center justify-between gap-2 border-t border-line py-2 text-sm"><span>{m.email}</span><span className="flex items-center gap-2"><select className="rounded-lg border border-line bg-white px-1.5 py-1 text-xs" value={m.role} onChange={(e) => update((x) => { x.members.find((k) => k.id === m.id)!.role = e.target.value as "editar" | "ver"; })}><option value="editar">Pode editar</option><option value="ver">Só ver</option></select><button aria-label="Remover" onClick={() => update((x) => { x.members = x.members.filter((k) => k.id !== m.id); })}><Trash2 size={14} className="text-muted" /></button></span></div>)}</section>
      <section className="card p-5"><h2 className="mb-1 text-lg font-semibold">Seus dados</h2><p className="mb-3 text-xs text-muted">Tudo fica salvo neste navegador. Façam backup de vez em quando.</p><div className="flex flex-wrap gap-2"><button className="btn btn-ghost" onClick={backup}><Download size={15} />Baixar backup</button><label className="btn btn-ghost cursor-pointer"><Upload size={15} />Restaurar backup<input type="file" accept="application/json" className="hidden" onChange={(e) => restore(e.target.files?.[0])} /></label><button className="btn btn-ghost" onClick={() => { setState((s) => ({ ...s, role: s.role === "casal" ? "assessor" : "casal" })); }}>Modo: <Badge tone="gold">{state.role === "casal" ? "Casal" : "Assessor"}</Badge></button><button className="btn btn-ghost text-terra" onClick={() => { if (confirm("Excluir este casamento? Isso não pode ser desfeito.")) { removeWedding(w.id); router.push("/app/comecar"); } }}><Trash2 size={15} />Excluir casamento</button></div></section>
    </div>
  );
}
