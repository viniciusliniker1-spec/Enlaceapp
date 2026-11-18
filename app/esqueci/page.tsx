"use client";
import { useState } from "react";
import Link from "next/link";
import { Logo, Field } from "@/components/ui";
export default function Esqueci() {
  const [email, setEmail] = useState(""); const [done, setDone] = useState(false); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => { e.preventDefault(); setBusy(true); setErr(""); const r = await fetch("/api/auth/forgot", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email }) }); setBusy(false); if (r.ok) setDone(true); else setErr((await r.json()).error); };
  return (
    <div className="grid min-h-screen place-items-center bg-ivory p-4"><form onSubmit={submit} className="card w-full max-w-md space-y-4 p-7"><Link href="/"><Logo /></Link><h1 className="text-3xl font-semibold">Esqueci a senha</h1>
      {done ? <p className="rounded-xl bg-sage-soft p-4 text-sm">Se existir uma conta com esse e-mail, enviamos um link para criar uma nova senha. Ele vale por 1 hora.</p> : <><Field label="E-mail da conta"><input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></Field>{err && <p role="alert" className="text-sm text-terra">{err}</p>}<button className="btn btn-primary w-full" disabled={busy}>{busy ? "Enviando…" : "Enviar link"}</button></>}
      <Link href="/entrar" className="block text-center text-sm font-semibold text-sage underline">Voltar para entrar</Link></form></div>
  );
}
