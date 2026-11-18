"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { CreditCard, LogOut, Home, Store, Wallet, Users, LayoutGrid, ListChecks, Gift, Mail, Clock, Briefcase, Search, Eye, EyeOff, Menu, X, Settings } from "lucide-react";
import { useStore } from "@/lib/store";
import { Logo, Modal } from "./ui";
import { cn, daysUntil } from "@/lib/utils";

const NAV = [
  { href: "/app", label: "Visão geral", icon: Home }, { href: "/app/tarefas", label: "Tarefas", icon: ListChecks }, { href: "/app/fornecedores", label: "Fornecedores", icon: Store },
  { href: "/app/financeiro", label: "Orçamento e pagamentos", icon: Wallet }, { href: "/app/convidados", label: "Convidados", icon: Users }, { href: "/app/mesas", label: "Mesas", icon: LayoutGrid },
  { href: "/app/convite", label: "Convite digital", icon: Mail }, { href: "/app/presentes", label: "Presentes e enxoval", icon: Gift }, { href: "/app/cronograma", label: "Cronograma do dia", icon: Clock },
  { href: "/app/ajustes", label: "Casamento e equipe", icon: Settings }, { href: "/app/assinatura", label: "Assinatura", icon: CreditCard },
];
export function AppShell({ children }: { children: React.ReactNode }) {
  const { state, ready, data, meta, setState, switchTo, canEdit, syncError, saving, logout } = useStore(); const path = usePathname(); const router = useRouter(); const [open, setOpen] = useState(false); const [q, setQ] = useState(""); const [sOpen, setSOpen] = useState(false);
  useEffect(() => { if (!ready) return; if (!state.user) router.replace("/entrar"); else if (!data && path !== "/app/comecar") router.replace("/app/comecar"); }, [ready, state.user, data, path, router]);
  useEffect(() => { const h = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setSOpen(true); } }; addEventListener("keydown", h); return () => removeEventListener("keydown", h); }, []);
  useEffect(() => setOpen(false), [path]);
  const results = useMemo(() => {
    if (!data || q.trim().length < 2) return []; const s = q.toLowerCase(); const r: { t: string; label: string; href: string }[] = [];
    data.vendors.filter((v) => (v.name + v.phone + v.contact + v.notes + v.category).toLowerCase().includes(s)).forEach((v) => r.push({ t: "Fornecedor", label: v.name, href: "/app/fornecedores" }));
    data.guests.filter((g) => (g.name + g.group + g.phone).toLowerCase().includes(s)).forEach((g) => r.push({ t: "Convidado", label: `${g.name} · ${g.group}`, href: "/app/convidados" }));
    data.tasks.filter((t) => t.title.toLowerCase().includes(s)).forEach((t) => r.push({ t: "Tarefa", label: t.title, href: "/app/tarefas" }));
    data.gifts.filter((g) => g.title.toLowerCase().includes(s)).forEach((g) => r.push({ t: "Presente", label: g.title, href: "/app/presentes" }));
    return r.slice(0, 12);
  }, [q, data]);
  if (!ready) return <div className="grid min-h-screen place-items-center text-muted">Carregando…</div>;
  if (!state.user) return null;
  if (path === "/app/comecar") return <>{children}</>;
  if (!data) return null;
  const w = data.wedding; const ids = Object.keys(state.weddings);
  const nav = [...NAV, ...(state.user?.role === "assessor" ? [{ href: "/app/assessor", label: "Carteira de casamentos", icon: Briefcase }] : [])];
  const side = (
    <nav className="flex h-full flex-col gap-1 p-4">
      <Link href="/" className="mb-4 px-2"><Logo /></Link>
      <div className="card mb-3 p-3">
        <div className="label">Casamento</div>
        {ids.length > 1 ? <select className="input mt-1" value={state.activeId ?? ""} onChange={(e) => switchTo(e.target.value)}>{ids.map((i) => <option key={i} value={i}>{state.weddings[i].wedding.partner1} e {state.weddings[i].wedding.partner2}</option>)}</select> : <div className="mt-0.5 font-serif text-lg font-semibold">{w.partner1} e {w.partner2}</div>}
        <div className="text-xs text-muted">{daysUntil(w.date)} dias · {w.city}</div>
      </div>
      {nav.map((n) => { const on = n.href === "/app" ? path === "/app" : path.startsWith(n.href); return (
        <Link key={n.href} href={n.href} className={cn("flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors", on ? "bg-sage text-white" : "text-muted hover:bg-white hover:text-ink")}><n.icon size={17} />{n.label}</Link>); })}
    </nav>
  );
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="no-print sticky top-0 hidden h-screen overflow-y-auto border-r border-line bg-ivory lg:block">{side}</aside>
      {open && <div className="fixed inset-0 z-40 bg-ink/40 lg:hidden" onClick={() => setOpen(false)}><aside className="h-full w-72 overflow-y-auto bg-ivory" onClick={(e) => e.stopPropagation()}>{side}</aside></div>}
      <div className="min-w-0">
        <header className="no-print sticky top-0 z-30 flex items-center gap-2 border-b border-line bg-ivory/90 px-4 py-3 backdrop-blur">
          <button aria-label="Menu" className="rounded-full p-2 hover:bg-white lg:hidden" onClick={() => setOpen(!open)}>{open ? <X size={20} /> : <Menu size={20} />}</button>
          <button onClick={() => setSOpen(true)} className="flex flex-1 items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-left text-sm text-muted sm:max-w-md"><Search size={15} />Buscar fornecedor, convidado, tarefa… <kbd className="ml-auto hidden rounded border border-line px-1.5 text-[10px] sm:block">Ctrl K</kbd></button>
          <button onClick={() => setState((s) => ({ ...s, hideMoney: !s.hideMoney }))} className="ml-auto flex items-center gap-2 rounded-full border border-line bg-white px-3 py-2 text-xs font-semibold" aria-pressed={state.hideMoney}>{state.hideMoney ? <EyeOff size={15} /> : <Eye size={15} />}<span className="hidden sm:inline">{state.hideMoney ? "Valores ocultos" : "Ocultar valores"}</span></button>
          <span className="hidden text-xs text-muted sm:block" aria-live="polite">{saving ? "Salvando…" : "Salvo"}</span>
          <button aria-label="Sair" title={`Sair (${state.user.name})`} onClick={async () => { await logout(); router.replace("/entrar"); }} className="rounded-full border border-line bg-white p-2"><LogOut size={15} /></button>
        </header>
        <main className="mx-auto max-w-6xl p-4 sm:p-8">{meta?.billing.state === "trial" && <p className="mb-4 rounded-xl bg-gold-soft p-3 text-sm">Período grátis: {meta.billing.daysLeft} dia(s) restantes. <Link href="/app/assinatura" className="font-semibold underline">Ver plano</Link></p>}{meta?.billing.state === "blocked" && <p role="alert" className="mb-4 rounded-xl bg-terra-soft p-3 text-sm text-terra">O período grátis terminou: o casamento está em modo leitura e os links públicos pausaram. <Link href="/app/assinatura" className="font-semibold underline">Assinar agora</Link></p>}{!canEdit && <p className="mb-4 rounded-xl bg-gold-soft p-3 text-sm">Você tem acesso somente para visualizar este casamento.</p>}{syncError && <p role="alert" className="mb-4 rounded-xl bg-terra-soft p-3 text-sm text-terra">{syncError}</p>}{children}</main>
      </div>
      <Modal open={sOpen} onClose={() => { setSOpen(false); setQ(""); }} title="Buscar no casamento">
        <input autoFocus className="input" placeholder="Digite ao menos 2 letras…" value={q} onChange={(e) => setQ(e.target.value)} />
        <ul className="mt-3 space-y-1">{results.map((r, i) => <li key={i}><Link onClick={() => setSOpen(false)} href={r.href} className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-ivory"><span>{r.label}</span><span className="text-xs text-muted">{r.t}</span></Link></li>)}{q.length >= 2 && !results.length && <li className="p-3 text-sm text-muted">Nada encontrado.</li>}</ul>
      </Modal>
    </div>
  );
}
