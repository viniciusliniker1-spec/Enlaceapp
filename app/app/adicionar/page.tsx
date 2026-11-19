"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, ImagePlus } from "lucide-react";
import { useData } from "@/lib/store";
import { PageHeader, Field } from "@/components/ui";
import { decodePayload, uid, parsePrice, fileToDataUrl } from "@/lib/utils";

interface Raw { title: string; image: string; price: string; store: string; url: string }
export default function Adicionar() {
  const { d, update } = useData(); const router = useRouter(); const [p, setP] = useState<{ title: string; image: string; price: number; store: string; url: string } | null | undefined>(undefined); const [cat, setCat] = useState("Casa"); const [qty, setQty] = useState(1);
  useEffect(() => { const h = location.hash.slice(1); const r = h ? decodePayload<Raw>(h) : null; setP(r ? { title: r.title.replace(/\s*[|\-–]\s*(Mercado Livre|Amazon\.com\.br|Shopee.*|Magazine Luiza.*|Magalu.*)$/i, "").trim(), image: r.image, price: parsePrice(r.price), store: r.store, url: r.url } : null); }, []);
  if (p === undefined) return null;
  if (!p) return <div className="card p-6 text-sm text-muted">Nenhum produto recebido. Use o favorito "Adicionar ao Enlace" numa página de produto (Presentes e enxoval &gt; Adicionar produtos).</div>;
  const add = () => { update((x) => x.gifts.push({ id: uid(), title: p.title, category: cat, price: p.price, url: p.url, qty, got: 0, reservedBy: [], kind: "casa", image: p.image, store: p.store })); router.push("/app/presentes"); };
  return (
    <div className="max-w-xl"><PageHeader title="Adicionar à lista de presentes" sub={`Lido da página em ${p.store}. Confira os dados antes de adicionar.`} />
      <div className="card space-y-4 p-5">
        <div className="flex gap-4">{p.image ? <img src={p.image} alt="" referrerPolicy="no-referrer" className="size-28 shrink-0 rounded-xl object-cover" /> : <div className="grid size-28 shrink-0 place-items-center rounded-xl bg-ivory text-xs text-muted">sem foto</div>}
          <div className="min-w-0 flex-1 space-y-2"><input className="input" value={p.title} onChange={(e) => setP({ ...p, title: e.target.value })} aria-label="Nome" />
            <div className="grid grid-cols-2 gap-2"><label className="space-y-1"><span className="label">Preço (R$)</span><input type="number" min={0} step="0.01" className="input" value={p.price || ""} onChange={(e) => setP({ ...p, price: +e.target.value })} /></label><label className="space-y-1"><span className="label">Quantidade</span><input type="number" min={1} className="input" value={qty} onChange={(e) => setQty(Math.max(1, +e.target.value))} /></label></div></div></div>
        {!p.image && <label className="btn btn-ghost btn-sm cursor-pointer"><ImagePlus size={14} />Enviar foto do aparelho<input type="file" accept="image/*" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (f) setP({ ...p, image: await fileToDataUrl(f) }); }} /></label>}
        <Field label="Categoria na lista"><select className="input" value={cat} onChange={(e) => setCat(e.target.value)}>{["Casa", "Cozinha", "Quarto", "Banheiro", "Sala", "Eletro e casa", "Lua de mel"].map((c) => <option key={c}>{c}</option>)}</select></Field>
        <button className="btn btn-primary w-full" disabled={!p.title.trim()} onClick={add}><Plus size={15} />Adicionar à lista de presentes</button>
        <p className="text-xs text-muted">Casamento: {d.wedding.partner1} e {d.wedding.partner2}.</p></div></div>
  );
}
