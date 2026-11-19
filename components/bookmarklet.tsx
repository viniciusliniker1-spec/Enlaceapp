"use client";
import { useEffect, useRef, useState } from "react";
import { copyText } from "@/lib/utils";
import { Bookmark } from "lucide-react";

/** Favorito que roda na página da loja, no navegador do casal, e envia nome, foto e preço ao Enlace. */
export function buildBookmarklet(origin: string) {
  const code = `(function(){function m(k){var e=document.querySelector('meta[property="'+k+'"],meta[name="'+k+'"],meta[itemprop="'+k+'"]');return e?e.content:''}var t='',i='',p='';document.querySelectorAll('script[type="application/ld+json"]').forEach(function(s){try{var w=function(n){if(!n||typeof n!=='object')return;if(Array.isArray(n))return n.forEach(w);var ty=n['@type'];if(ty==='Product'||(Array.isArray(ty)&&ty.indexOf('Product')>-1)){t=t||n.name||'';var im=n.image;i=i||(Array.isArray(im)?(im[0]&&im[0].url||im[0]):(im&&im.url)||im||'');var of=n.offers;of=Array.isArray(of)?of[0]:of;if(of&&!p)p=of.price||of.lowPrice||''}Object.values(n).forEach(w)};w(JSON.parse(s.textContent))}catch(e){}});t=t||m('og:title')||document.title;i=i||m('og:image')||m('twitter:image');p=p||m('product:price:amount')||m('price');if(!p){var f=document.querySelector('.andes-money-amount__fraction');if(f){var c=document.querySelector('.andes-money-amount__cents');p=f.textContent.replace(/\\./g,'')+'.'+(c?c.textContent:'00')}}if(!p){var a=document.querySelector('.a-price .a-offscreen');if(a)p=a.textContent}var d={title:String(t).slice(0,160),image:String(i),price:String(p),store:location.hostname.replace(/^www\\./,''),url:location.href.split('#')[0]};window.open('${origin}/app/adicionar#'+btoa(unescape(encodeURIComponent(JSON.stringify(d)))),'_blank')})()`;
  return "javascript:" + code;
}
export function Bookmarklet() {
  const ref = useRef<HTMLAnchorElement>(null); const [ok, setOk] = useState(false);
  useEffect(() => { ref.current?.setAttribute("href", buildBookmarklet(location.origin)); }, []);
  return (
    <div className="card space-y-3 border-sage/40 bg-sage-soft/40 p-5">
      <h3 className="font-sans text-base font-semibold tracking-tight">Capturar de qualquer loja, com foto e preço (computador)</h3>
      <ol className="list-decimal space-y-1.5 pl-5 text-sm">
        <li>Mostre a barra de favoritos do navegador (Ctrl+Shift+B).</li>
        <li>Arraste este botão para a barra: <a ref={ref} onClick={(e) => e.preventDefault()} draggable className="btn btn-primary btn-sm mx-1 cursor-grab select-none" title="Adicionar ao Enlace"><Bookmark size={14} />Adicionar ao Enlace</a></li>
        <li>Se o favorito ficar com o código no lugar do nome, clique nele com o botão direito, escolha <b>Editar</b> e troque o nome para "Adicionar ao Enlace". Ou crie à mão: <button type="button" className="btn btn-ghost btn-sm mx-1" onClick={async () => { setOk(await copyText(buildBookmarklet(location.origin))); setTimeout(() => setOk(false), 2000); }}>{ok ? "Código copiado!" : "Copiar código"}</button> e, em Favoritos, adicione um novo com esse código no campo endereço (URL).</li>
        <li>Abra o produto no Mercado Livre, Amazon, Shopee ou qualquer loja e clique no favorito.</li>
        <li>Abre uma aba do Enlace com nome, foto e preço já preenchidos. Confira e adicione.</li>
      </ol>
      <p className="text-xs text-muted">Funciona porque roda no seu navegador, na página que você já abriu, e as lojas não bloqueiam isso. No celular, use "Colar o link" abaixo e complete preço e foto.</p>
    </div>
  );
}
