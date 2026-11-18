"use client";
import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Logo, Field } from "@/components/ui";
function Form() {
  const token = useSearchParams().get("token") ?? ""; const [pw, setPw] = useState(""); const [done, setDone] = useState(false); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => { e.preventDefault(); setBusy(true); setErr(""); const r = await fetch("/api/auth/reset", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ token, password: pw }) }); setBusy(false); if (r.ok) setDone(true); else setErr((await r.json()).error); };
  return (
    <div className="grid min-h-screen place-items-center bg-ivory p-4"><form onSubmit={submit} className="card w-full max-w-md space-y-4 p-7"><Link href="/"><Logo /></Link><h1 className="text-3xl font-semibold">Nova senha</h1>
      {done ? <p className="rounded-xl bg-sage-soft p-4 text-sm">Senha alterada. <Link href="/entrar" className="font-semibold underline">Entrar agora</Link>.</p> : <><Field label="Nova senha"><input className="input" type="password" required minLength={8} value={pw} onChange={(e) => setPw(e.target.value)} placeholder="mínimo de 8 caracteres" autoComplete="new-password" /></Field>{err && <p role="alert" className="text-sm text-terra">{err}</p>}<button className="btn btn-primary w-full" disabled={busy || !token}>{busy ? "Salvando…" : "Salvar nova senha"}</button></>}</form></div>
  );
}
export default function Redefinir() { return <Suspense><Form /></Suspense>; }
