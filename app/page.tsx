"use client";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Store, Wallet, Users, LayoutGrid, ListChecks, Gift, Mail, Clock, Briefcase, Check, Plus, Minus, Heart, ShieldCheck, Smartphone, Sparkles } from "lucide-react";
import { Logo, Reveal } from "@/components/ui";
import { HeroVisual } from "@/components/landing-hero";
import { LandingQuiz } from "@/components/landing-quiz";
import { InviteCard, type InviteData } from "@/components/invite";
import { cn } from "@/lib/utils";
import { STYLES } from "@/lib/plan";

const inv: InviteData = { p1: "Marina", p2: "Rafael", date: "2027-06-19", time: "16:30", cerN: "Capela Santa Luzia", cerA: "Rua das Acácias, 120", recN: "Espaço Alameda", recA: "Av. das Palmeiras, 900", dress: "Esporte fino", deadline: "2027-05-15", style: "classico", palette: 0, msg: "Com muita alegria, convidamos vocês para celebrar o nosso casamento.", family: "Família Prado" };
const FEATURES = [
  { i: Store, t: "Fornecedores", d: "Cotação, contrato e contato de cada um, com comparação lado a lado." },
  { i: Wallet, t: "Orçamento e pagamentos", d: "Previsto, fechado e pago por categoria. Parcelas com vencimento e alerta." },
  { i: Users, t: "Convidados A e B", d: "Segunda chamada quando alguém não pode vir, com faixas de buffet." },
  { i: LayoutGrid, t: "Mesas", d: "Planta do salão arrastável, distribuição automática por família." },
  { i: ListChecks, t: "Checklist por fase", d: "46 tarefas contadas a partir da data, com agenda do mês." },
  { i: Gift, t: "Enxoval e presentes", d: "Revise item por item e compartilhe uma lista que ninguém duplica." },
  { i: Mail, t: "Convite no WhatsApp", d: "Cinco modelos. Um link por família, resposta de cada pessoa." },
  { i: Clock, t: "Cronograma do dia", d: "Hora a hora, em um link que todos os fornecedores abrem." },
  { i: Briefcase, t: "Modo assessor", d: "Vários casamentos numa carteira, com o que pede atenção primeiro." },
];
const FAQ = [
  ["Quanto custa?", "Para casais, R$ 34,90 por mês por casamento, depois de 7 dias grátis sem cartão. Assessores têm um plano por carteira. Os valores são uma proposta e podem mudar antes do lançamento."],
  ["Meus convidados precisam instalar algo?", "Não. Eles abrem o link no celular, sem conta e sem baixar nada, e respondem a presença de cada pessoa da família."],
  ["Funciona no celular?", "Sim. É um app web que se instala na tela inicial do Android e do iPhone. A planta das mesas fica melhor no computador."],
  ["Posso planejar junto com outras pessoas?", "Sim. O outro do casal, a cerimonialista ou a mãe, com permissão de editar ou só ver."],
  ["Sou assessora. Serve para mim?", "Foi pensado para isso: uma carteira com todos os casamentos, alertas de atraso e um cronograma que você envia aos fornecedores."],
  ["Meus dados ficam seguros?", "Nada é vendido nem usado para anúncios ou para treinar inteligência artificial. Vocês podem ocultar os valores com um toque."],
];
export default function Home() {
  const [style, setStyle] = useState(0); const [pal, setPal] = useState(0); const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="overflow-x-clip">
      <header className="sticky top-0 z-40 border-b border-line/70 bg-ivory/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-6 px-5 py-3">
          <Logo />
          <nav className="ml-6 hidden gap-5 text-sm font-medium text-muted md:flex">{[["#como", "Como funciona"], ["#recursos", "Recursos"], ["#convite", "Convite"], ["#assessores", "Assessores"], ["#preco", "Plano"], ["#duvidas", "Dúvidas"]].map(([h, l]) => <a key={h} href={h} className="hover:text-ink">{l}</a>)}</nav>
          <Link href="/entrar" className="btn btn-ghost btn-sm ml-auto">Entrar</Link><Link href="/app" className="btn btn-primary btn-sm">Começar grátis</Link>
        </div>
      </header>

      <section className="grain relative px-5 pb-20 pt-14 sm:pt-20">
        <div className="pointer-events-none absolute -right-40 -top-40 size-[560px] rounded-full bg-terra-soft blur-3xl" aria-hidden /><div className="pointer-events-none absolute -left-40 top-40 size-[460px] rounded-full bg-sage-soft blur-3xl" aria-hidden />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_1fr]">
          <div>
            <motion.span initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1 text-xs font-semibold text-sage"><Heart size={12} className="text-terra" />Para casais e para assessores de casamento</motion.span>
            <motion.h1 initial={{ opacity: 0, y: 16, filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.8 }} className="mt-5 text-5xl font-semibold leading-[1.02] sm:text-7xl">Do sim ao grande dia, <span className="relative inline-block italic text-sage">sem planilha<svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none" aria-hidden><motion.path d="M2 8 Q75 0 150 6 T298 5" stroke="#c2603f" strokeWidth="3" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.8, duration: 0.9 }} /></svg></span>.</motion.h1>
            <p className="mt-6 max-w-xl text-lg text-muted">Fornecedores, pagamentos, convidados, convite pelo WhatsApp, mesas, checklist, enxoval da casa e lista de presentes. Tudo ligado entre si, com uma visão geral que mostra o que vem agora.</p>
            <div className="mt-8 flex flex-wrap items-center gap-3"><Link href="/app" className="btn btn-primary px-6 py-3 text-base">Montar meu plano grátis <ArrowRight size={17} /></Link><a href="#como" className="btn btn-ghost px-6 py-3 text-base">Ver como funciona</a></div>
            <p className="mt-4 text-xs text-muted">7 dias grátis, sem cartão. Funciona no celular, sem baixar nada.</p>
          </div>
          <HeroVisual />
        </div>
      </section>

      <section id="como" className="mx-auto max-w-6xl px-5 py-20">
        <Reveal><h2 className="max-w-2xl text-4xl font-semibold sm:text-5xl">Do contrato fechado ao que vence esta semana</h2></Reveal>
        <div className="mt-10 grid gap-4 md:grid-cols-4">{[["1", "Respondam algumas perguntas", "Data, cidade, orçamento, convidados e o perfil da casa. O Enlace monta o plano em segundos."], ["2", "Fechem com os fornecedores", "Valor, proposta e contrato ficam na ficha de cada um."], ["3", "Parcelem num toque", "Entrada e parcelas com vencimento em Pix, boleto ou cartão."], ["4", "Vejam o que vem agora", "Pagamentos dos próximos 7 dias e as próximas tarefas, num relance."]].map(([n, t, d], i) => (
          <Reveal key={n} delay={i * 0.08}><div className="card h-full p-5"><div className="mb-3 grid size-9 place-items-center rounded-full bg-sage font-serif text-lg text-white">{n}</div><h3 className="font-sans text-base font-semibold tracking-tight">{t}</h3><p className="mt-1 text-sm text-muted">{d}</p></div></Reveal>))}</div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20"><Reveal><div className="mb-6 max-w-2xl"><h2 className="text-4xl font-semibold sm:text-5xl">Testem o plano de vocês agora</h2><p className="mt-2 text-muted">Mexam nos números e vejam o que o Enlace calcula antes mesmo de criar a conta.</p></div><LandingQuiz /></Reveal></section>

      <section id="recursos" className="bg-white px-5 py-20">
        <div className="mx-auto max-w-6xl"><Reveal><h2 className="max-w-3xl text-balance text-4xl font-semibold sm:text-5xl">Tudo do casamento num lugar só</h2><p className="mt-2 max-w-xl text-muted">Cada parte conversa com as outras: o convidado que recusa libera o lugar na mesa, o contrato fechado vira parcelas, a parcela vira alerta.</p></Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{FEATURES.map((f, i) => <Reveal key={f.t} delay={(i % 3) * 0.07}><motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 380, damping: 30 }} className="card h-full p-6"><div className="mb-4 grid size-11 place-items-center rounded-xl bg-sage-soft text-sage"><f.i size={20} /></div><h3 className="font-sans text-lg font-semibold tracking-tight">{f.t}</h3><p className="mt-1 text-sm text-muted">{f.d}</p></motion.div></Reveal>)}</div></div>
      </section>

      <section id="convite" className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 lg:grid-cols-2">
        <div><Reveal><h2 className="text-4xl font-semibold sm:text-5xl">O convite vai pelo WhatsApp, a presença volta na hora</h2><p className="mt-4 text-muted">Escolham um dos cinco modelos e uma paleta (ou a cor de vocês). Cada família recebe o seu link. Quem abre não precisa de conta: confirma cada pessoa, deixa um recado e a resposta chega no WhatsApp de vocês.</p></Reveal>
          <div className="mt-6 flex flex-wrap gap-2">{STYLES.map((s, i) => <button key={s.id} onClick={() => setStyle(i)} className={cn("btn btn-sm", style === i ? "btn-primary" : "btn-ghost")}>{s.name}</button>)}</div>
          <div className="mt-3 flex gap-2">{[0, 1, 2, 3, 4].map((p) => <button key={p} aria-label={`Paleta ${p + 1}`} onClick={() => setPal(p)} className={cn("size-7 rounded-full border-2", pal === p ? "border-ink" : "border-transparent")} style={{ background: ["#3f5b4b", "#7a3b52", "#2f4a6b", "#22201e", "#8a6b4f"][p] }} />)}</div>
          <ul className="mt-6 space-y-2 text-sm">{["Abertura animada para cada modelo", "Mapa e \"como chegar\" para cerimônia e recepção", "As mesas acompanham as respostas", "Recados dos convidados num varal"].map((t) => <li key={t} className="flex items-center gap-2"><Check size={15} className="text-sage" />{t}</li>)}</ul></div>
        <Reveal><div className="mx-auto w-[300px] overflow-hidden rounded-[2.2rem] border-[7px] border-ink shadow-2xl"><div className="max-h-[560px] overflow-hidden"><InviteCard i={{ ...inv, style: STYLES[style].id, palette: pal }} compact /></div></div></Reveal>
      </section>

      <section className="bg-sage-soft px-5 py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
          <Reveal><h2 className="text-4xl font-semibold sm:text-5xl">Enxoval da casa e lista de presentes, sem presente repetido</h2><p className="mt-4 text-muted">Revisem item por item, arrastando cartões: "já temos" ou "ainda não". O que falta vai para a lista, com cotas de lua de mel e links de qualquer loja. A família escolhe o presente e avisa pelo WhatsApp, e vocês reservam o item.</p></Reveal>
          <Reveal delay={0.1}><div className="card p-6"><div className="mb-1 text-xs font-semibold uppercase tracking-widest text-gold">Cozinha</div><div className="font-serif text-3xl font-semibold">Jogo de panelas</div><div className="mb-4 text-sm text-muted">Quantidade sugerida: 1 · essencial</div><div className="flex gap-2"><span className="btn btn-ghost btn-sm">Ainda não</span><span className="btn btn-primary btn-sm">Já temos</span></div><div className="mt-5 space-y-2 border-t border-line pt-4 text-sm">{[["Air fryer", "Garantido"], ["Noite de hotel na lua de mel", "1/1"], ["Cota livre para a casa nova", "7/20"]].map(([a, b]) => <div key={a} className="flex justify-between"><span>{a}</span><span className="text-muted">{b}</span></div>)}</div></div></Reveal>
        </div>
      </section>

      <section id="assessores" className="mx-auto max-w-6xl px-5 py-20">
        <div className="grain relative overflow-hidden rounded-3xl bg-ink p-8 text-white sm:p-14">
          <div className="relative grid gap-8 lg:grid-cols-[1.2fr_1fr]"><Reveal><span className="text-xs font-semibold uppercase tracking-widest text-gold">Para assessores e cerimonialistas</span><h2 className="mt-3 text-4xl font-semibold sm:text-5xl">Uma carteira, vários casamentos, nada esquecido</h2><p className="mt-4 max-w-lg text-white/70">Veja de relance quem tem pagamento atrasado e quem está sem resposta. Mande aos fornecedores um cronograma em link, e convide o casal para acompanhar com permissão de ver ou editar.</p><Link href="/app" className="btn mt-6 bg-white text-ink hover:bg-ivory">Experimentar a carteira <ArrowRight size={15} /></Link></Reveal>
            <Reveal delay={0.1}><div className="space-y-2">{[["Marina e Rafael", "112 dias", "Em dia", "sage"], ["Júlia e Caio", "34 dias", "2 atrasados", "terra"], ["Bia e Léo", "201 dias", "9 sem resposta", "gold"]].map(([n, d, s, t]) => <div key={n} className="flex items-center justify-between rounded-xl bg-white/10 p-4 text-sm"><div><div className="font-semibold">{n}</div><div className="text-xs text-white/60">{d}</div></div><span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", t === "sage" ? "bg-sage-soft text-sage-deep" : t === "terra" ? "bg-terra-soft text-terra" : "bg-gold-soft text-gold")}>{s}</span></div>)}</div></Reveal></div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-5 pb-20 md:grid-cols-3">
        {[[Smartphone, "O casamento a um toque", "Instala na tela inicial, sem loja de aplicativos. Funciona no celular de verdade."], [ShieldCheck, "Dados são de vocês", "Sem anúncios, sem venda de dados, sem treinar IA com o casamento de vocês."], [Sparkles, "Valores escondidos quando precisar", "Um toque oculta o dinheiro em todas as telas, para usar perto de outras pessoas."]].map(([I, t, d], i) => { const Ic = I as typeof Smartphone; return <Reveal key={i as number} delay={(i as number) * 0.08}><div className="card h-full p-6"><Ic className="mb-3 text-terra" /><h3 className="font-sans text-lg font-semibold tracking-tight">{t as string}</h3><p className="mt-1 text-sm text-muted">{d as string}</p></div></Reveal>; })}
      </section>

      <section id="preco" className="bg-white px-5 py-20">
        <div className="mx-auto max-w-5xl"><Reveal><h2 className="text-center text-4xl font-semibold sm:text-5xl">Um plano, com tudo dentro</h2><p className="mx-auto mt-2 max-w-lg text-center text-muted">Um convidado no buffet custa mais que um mês de Enlace. Valores de lançamento, sujeitos a ajuste.</p></Reveal>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {[{ n: "Casal", p: "R$ 34,90", u: "por mês, por casamento", l: ["Tudo incluso: fornecedores a presentes", "Convite digital para todos os convidados", "Até 2 pessoas planejando junto", "7 dias grátis, sem cartão"], hi: false }, { n: "Assessor", p: "R$ 129", u: "por mês, até 10 casamentos", l: ["Carteira com alertas de atraso", "Cronograma em link para fornecedores", "Casal convidado com permissão de ver", "Casamentos extras sob consulta"], hi: true }].map((pl) => (
              <Reveal key={pl.n}><div className={cn("card h-full p-8", pl.hi && "border-sage ring-2 ring-sage/30")}><div className="text-sm font-semibold text-sage">{pl.n}</div><div className="mt-2 font-serif text-5xl font-semibold">{pl.p}</div><div className="text-sm text-muted">{pl.u}</div><ul className="mt-6 space-y-2 text-sm">{pl.l.map((x) => <li key={x} className="flex gap-2"><Check size={16} className="mt-0.5 shrink-0 text-sage" />{x}</li>)}</ul><Link href="/app" className={cn("btn mt-7 w-full", pl.hi ? "btn-primary" : "btn-ghost")}>Começar os 7 dias grátis</Link></div></Reveal>))}</div></div>
      </section>

      <section id="duvidas" className="mx-auto max-w-3xl px-5 py-20"><h2 className="mb-8 text-center text-4xl font-semibold">Perguntas frequentes</h2>
        <div className="space-y-2">{FAQ.map(([q, a], i) => <div key={q} className="card overflow-hidden"><button className="flex w-full items-center justify-between gap-3 p-5 text-left font-semibold" aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)}>{q}{open === i ? <Minus size={16} /> : <Plus size={16} />}</button><motion.div initial={false} animate={{ height: open === i ? "auto" : 0, opacity: open === i ? 1 : 0 }} className="overflow-hidden"><p className="px-5 pb-5 text-sm text-muted">{a}</p></motion.div></div>)}</div></section>

      <section className="px-5 pb-20"><div className="grain relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-sage-deep px-6 py-16 text-center text-white"><h2 className="relative text-4xl font-semibold sm:text-6xl">A planilha pode se aposentar hoje.</h2><p className="relative mx-auto mt-3 max-w-md text-white/70">Criem o casamento no Enlace e usem tudo por 7 dias grátis.</p><Link href="/app" className="btn relative mt-7 bg-white px-7 py-3 text-base text-ink hover:bg-ivory">Montar meu plano grátis <ArrowRight size={17} /></Link></div></section>
      <footer className="border-t border-line px-5 py-8 text-center text-xs text-muted"><Logo className="mb-2 justify-center text-base" /><p>© 2026 Enlace · Projeto em desenvolvimento</p></footer>
    </div>
  );
}
