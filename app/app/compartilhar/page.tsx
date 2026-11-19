"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { encodePayload } from "@/lib/utils";

/** Destino do "Compartilhar" do celular: recebe o link do produto e leva para a tela de confirmação. */
function Inner() {
  const sp = useSearchParams(); const router = useRouter(); const [msg, setMsg] = useState("Lendo o produto…");
  useEffect(() => {
    const raw = `${sp.get("url") ?? ""} ${sp.get("text") ?? ""}`; const url = raw.match(/https?:\/\/[^\s]+/)?.[0];
    if (!url) { setMsg("Não encontrei um link de produto no que foi compartilhado."); return; }
    (async () => {
      let p = { title: sp.get("title") ?? "", image: "", price: "", store: new URL(url).hostname.replace(/^www\./, ""), url };
      try { const r = await fetch("/api/products/resolve", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ url }) }); if (r.ok) { const j = await r.json(); p = { title: j.product.title || p.title, image: j.product.image || "", price: j.product.price ? String(j.product.price) : "", store: j.product.store || p.store, url: j.product.url || url }; } } catch { /* segue com o que temos */ }
      router.replace(`/app/adicionar#${encodePayload(p)}`);
    })();
  }, [sp, router]);
  return <div className="card p-6 text-sm text-muted">{msg}</div>;
}
export default function Compartilhar() { return <Suspense><Inner /></Suspense>; }
