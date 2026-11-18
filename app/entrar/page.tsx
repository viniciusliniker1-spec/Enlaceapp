"use client";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { StoreProvider, useStore } from "@/lib/store";
import { Logo, Field } from "@/components/ui";
import { cn } from "@/lib/utils";

function Form() {
  const { auth, state, ready } = useStore(); const router = useRouter(); const sp = useSearchParams(); const token = sp.get("convite");
  const [mode, setMode] = useState<"login" | "register">(token ? "register" : "login"); const [f, setF] = useState({ name: "", email: "", password: "", role: "casal" }); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  useEffect(() => { if (ready && state.user) router.replace("/app"); }, [ready, state.user, router]);
  useEffect(() => { if (!token) return; fetch(`/api/invites/${token}`).then((r) => r.json()).then((j) => j.email && setF((x) => ({ ...x, email: j.email }))).catch(() => {}); }, [token]);
  const submit = async (e: React.FormEvent) => { e.preventDefault(); setErr(""); setBusy(true); try { await auth(mode, f); router.replace("/app"); } catch (x) { setErr((x as Error).message); } setBusy(false); };
  return (
    <div className="grain relative grid min-h-screen place-items-center bg-ivory p-4">
      <form onSubmit={submit} className="card relative w-full max-w-md space-y-4 p-7">
        <Link href="/"><Logo /></Link>
        <h1 className="text-3xl font-semibold">{mode === "login" ? "Entrar" : token ? "Criar conta para aceitar o convite" : "Criar conta"}</h1>
        {mode === "register" && <><Field label="Seu nome"><input className="input" required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} autoComplete="name" /></Field>
          {!token && <div className="grid grid-cols-2 gap-2">{([["casal", "Somos o casal"], ["assessor", "Sou assessor(a)"]] as const).map(([k, l]) => <button type="button" key={k} onClick={() => setF({ ...f, role: k })} className={cn("rounded-xl border p-2.5 text-sm font-semibold", f.role === k ? "border-sage bg-sage-soft" : "border-line")}>{l}</button>)}</div>}</>}
        <Field label="E-mail"><input className="input" type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} autoComplete="email" /></Field>
        <Field label="Senha"><input className="input" type="password" required minLength={mode === "register" ? 8 : 1} value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} autoComplete={mode === "login" ? "current-password" : "new-password"} placeholder={mode === "register" ? "mínimo de 8 caracteres" : ""} /></Field>
        {err && <p role="alert" className="rounded-xl bg-terra-soft p-3 text-sm text-terra">{err}</p>}
        <button className="btn btn-primary w-full" disabled={busy}>{busy ? "Aguarde…" : mode === "login" ? "Entrar" : "Criar conta"}</button>
        <p className="text-center text-sm text-muted">{mode === "login" ? "Ainda não tem conta?" : "Já tem conta?"} <button type="button" className="font-semibold text-sage underline" onClick={() => { setMode(mode === "login" ? "register" : "login"); setErr(""); }}>{mode === "login" ? "Criar agora" : "Entrar"}</button></p>
      </form>
    </div>
  );
}
export default function Entrar() { return <StoreProvider><Suspense><Form /></Suspense></StoreProvider>; }
