"use client";
import { useEffect, useRef, useState } from "react";
import { copyText } from "@/lib/utils";
import { Bookmark, Download, Puzzle } from "lucide-react";

/** Favorito que roda na página da loja, no navegador do casal, e envia nome, foto e preço ao Enlace. */
export function buildBookmarklet(origin: string) {
  const code = `(function(){function m(k){var e=document.querySelector('meta[property="'+k+'"],meta[name="'+k+'"],meta[itemprop="'+k+'"]');return e?e.content:''}var t='',i='',p='';document.querySelectorAll('script[type="application/ld+json"]').forEach(function(s){try{var w=function(n){if(!n||typeof n!=='object')return;if(Array.isArray(n))return n.forEach(w);var ty=n['@type'];if(ty==='Product'||(Array.isArray(ty)&&ty.indexOf('Product')>-1)){t=t||n.name||'';var im=n.image;i=i||(Array.isArray(im)?(im[0]&&im[0].url||im[0]):(im&&im.url)||im||'');var of=n.offers;of=Array.isArray(of)?of[0]:of;if(of&&!p)p=of.price||of.lowPrice||''}Object.values(n).forEach(w)};w(JSON.parse(s.textContent))}catch(e){}});t=t||m('og:title')||document.title;i=i||m('og:image')||m('twitter:image');p=p||m('product:price:amount')||m('price');if(!p){var f=document.querySelector('.andes-money-amount__fraction');if(f){var c=document.querySelector('.andes-money-amount__cents');p=f.textContent.replace(/\\./g,'')+'.'+(c?c.textContent:'00')}}if(!p){var a=document.querySelector('.a-price .a-offscreen');if(a)p=a.textContent}var d={title:String(t).slice(0,160),image:String(i),price:String(p),store:location.hostname.replace(/^www\\./,''),url:location.href.split('#')[0]};var h='${origin}/app/adicionar#'+btoa(unescape(encodeURIComponent(JSON.stringify(d))));var old=document.getElementById('enlace-card');if(old)old.remove();var o=document.createElement('div');o.id='enlace-card';o.style.cssText='position:fixed;top:16px;right:16px;z-index:2147483647;width:320px;background:#fff;color:#231f1c;border:1px solid #e9e0d4;border-radius:16px;box-shadow:0 12px 40px rgba(0,0,0,.28);padding:14px;font:14px/1.4 system-ui,sans-serif';var hd=document.createElement('div');hd.style.cssText='display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;font-weight:700;color:#3f5b4b';hd.textContent='Enlace';var x=document.createElement('button');x.textContent='\\u00d7';x.style.cssText='border:0;background:none;font-size:22px;cursor:pointer;line-height:1';x.onclick=function(){o.remove()};hd.appendChild(x);o.appendChild(hd);if(d.image){var im2=document.createElement('img');im2.src=d.image;im2.style.cssText='width:100%;height:150px;object-fit:contain;border-radius:10px;background:#fbf7f1;margin-bottom:8px';o.appendChild(im2)}var tt=document.createElement('div');tt.textContent=d.title;tt.style.cssText='font-weight:600;margin-bottom:4px;max-height:3em;overflow:hidden';o.appendChild(tt);var pr=document.createElement('div');pr.textContent=d.price?(/R\\$/.test(d.price)?d.price:'R$ '+d.price):'Preço não encontrado nesta página';pr.style.cssText='color:#6b625a;margin-bottom:10px';o.appendChild(pr);var l=document.createElement('a');l.href=h;l.target='_blank';l.rel='noopener';l.textContent='Adicionar à minha lista no Enlace';l.style.cssText='display:block;text-align:center;background:#3f5b4b;color:#fff;border-radius:999px;padding:10px 14px;font-weight:600;text-decoration:none';l.onclick=function(){setTimeout(function(){o.remove()},300)};o.appendChild(l);document.body.appendChild(o)})()`;
  return "javascript:" + code;
}
export function Bookmarklet() {
  const ref = useRef<HTMLAnchorElement>(null); const [ok, setOk] = useState(false); const [opera, setOpera] = useState(false);
  useEffect(() => { ref.current?.setAttribute("href", buildBookmarklet(location.origin)); setOpera(/OPR\/|Opera/.test(navigator.userAgent)); }, []);
  return (
    <div className="space-y-4">
    {(() => {
      const extBlock = (
    <div className="card space-y-3 border-sage/40 bg-sage-soft/40 p-5">
        <h3 className="font-sans text-base font-semibold tracking-tight"><Puzzle size={16} className="mr-1.5 inline" />Extensão (Opera, Chrome e Edge)</h3>
        <a href="/enlace-extensao.zip" download className="btn btn-primary btn-sm"><Download size={14} />Baixar a extensão</a>
        <ol className="list-decimal space-y-1.5 pl-5 text-sm">
          <li>Extraia o arquivo baixado (botão direito &gt; Extrair tudo).</li>
          <li>Abra <code className="rounded bg-white px-1">opera://extensions</code> (no Chrome: <code className="rounded bg-white px-1">chrome://extensions</code>) e ative o <b>Modo de desenvolvedor</b>.</li>
          <li>Clique em <b>Carregar descompactada</b> e escolha a pasta extraída.</li>
          <li>Na loja, abra o produto e clique no ícone da extensão.</li>
        </ol>
      </div>
        );
      const favBlock = (
      <div className="card space-y-3 p-5">
        <h3 className="font-sans text-base font-semibold tracking-tight">Adicionar produtos de qualquer loja (computador)</h3>
        <ol className="list-decimal space-y-1.5 pl-5 text-sm">
          <li>Arraste este botão para a barra de favoritos: <a ref={ref} onClick={(e) => e.preventDefault()} draggable className="btn btn-primary btn-sm mx-1 cursor-grab select-none" title="Adicionar ao Enlace"><Bookmark size={14} />Adicionar ao Enlace</a></li>
          <li>Abra um produto na loja e clique no favorito.</li>
          <li>No cartão que aparecer, clique em <b>Adicionar à minha lista</b>.</li>
        </ol>
        <p className="text-xs text-muted">Não conseguiu arrastar? <button type="button" className="font-semibold text-sage underline" onClick={async () => { setOk(await copyText(buildBookmarklet(location.origin))); setTimeout(() => setOk(false), 2000); }}>{ok ? "Código copiado!" : "Copie o código"}</button> e cole no endereço de um favorito novo. No celular, cole o link do produto abaixo.</p>
      </div>
      );
      return opera ? <>{extBlock}<details className="card p-4 text-sm"><summary className="cursor-pointer font-semibold">Outra opção: favorito</summary><div className="mt-3">{favBlock}</div></details></> : <>{favBlock}<details className="card p-4 text-sm"><summary className="cursor-pointer font-semibold">Outra opção: extensão</summary><div className="mt-3">{extBlock}</div></details></>;
    })()}
    </div>
  );
}
