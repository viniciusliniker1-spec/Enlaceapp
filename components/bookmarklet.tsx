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
  const ref = useRef<HTMLAnchorElement>(null); const [ok, setOk] = useState(false);
  useEffect(() => { ref.current?.setAttribute("href", buildBookmarklet(location.origin)); }, []);
  return (
    <div className="space-y-4">
    <div className="card space-y-3 border-sage/40 bg-sage-soft/40 p-5">
      <h3 className="font-sans text-base font-semibold tracking-tight"><Puzzle size={16} className="mr-1.5 inline" />Extensão do Enlace (Opera, Chrome e Edge): o jeito mais confiável</h3>
      <p className="text-sm">Um clique no ícone, na página do produto, traz <b>nome, foto e preço</b> para a sua lista. Funciona em qualquer loja, e só lê a página quando você clica.</p>
      <a href="/enlace-extensao.zip" download className="btn btn-primary btn-sm"><Download size={14} />Baixar a extensão (.zip)</a>
      <ol className="list-decimal space-y-1.5 pl-5 text-sm">
        <li>Extraia o arquivo .zip (clique direito &gt; Extrair tudo). Vai criar a pasta <b>enlace-extensao</b>. Não apague a pasta depois.</li>
        <li><b>Opera:</b> digite <code className="rounded bg-white px-1">opera://extensions</code> na barra de endereço. <b>Chrome:</b> <code className="rounded bg-white px-1">chrome://extensions</code>. <b>Edge:</b> <code className="rounded bg-white px-1">edge://extensions</code>.</li>
        <li>Ative o <b>Modo de desenvolvedor</b> (botão no canto da página).</li>
        <li>Clique em <b>Carregar sem compactação</b> (Opera: "Carregar descompactada") e escolha a pasta <b>enlace-extensao</b>.</li>
        <li>Fixe a extensão na barra: clique no ícone de peça de quebra-cabeça e no alfinete ao lado de "Adicionar ao Enlace".</li>
        <li>Abra um produto na loja e clique no ícone. Abre o Enlace com tudo preenchido: confira e adicione.</li>
      </ol>
      <p className="text-xs text-muted">Se o seu endereço do Enlace não for <b>enlaceapp.vercel.app</b>, abra o arquivo <code>background.js</code> da pasta, troque o endereço na primeira linha e recarregue a extensão.</p>
    </div>
    <div className="card space-y-3 p-5">
      <h3 className="font-sans text-base font-semibold tracking-tight">Alternativa: favorito (computador)</h3>
      <ol className="list-decimal space-y-1.5 pl-5 text-sm">
        <li>Mostre a barra de favoritos do navegador (Ctrl+Shift+B).</li>
        <li>Arraste este botão para a barra: <a ref={ref} onClick={(e) => e.preventDefault()} draggable className="btn btn-primary btn-sm mx-1 cursor-grab select-none" title="Adicionar ao Enlace"><Bookmark size={14} />Adicionar ao Enlace</a></li>
        <li><b>Atualizou o site? Apague o favorito antigo e crie de novo</b>, porque o código fica salvo dentro dele. Se o favorito ficar com o código no lugar do nome, clique nele com o botão direito, escolha <b>Editar</b> e troque o nome para "Adicionar ao Enlace". Ou crie à mão: <button type="button" className="btn btn-ghost btn-sm mx-1" onClick={async () => { setOk(await copyText(buildBookmarklet(location.origin))); setTimeout(() => setOk(false), 2000); }}>{ok ? "Código copiado!" : "Copiar código"}</button> e, em Favoritos, adicione um novo com esse código no campo endereço (URL).</li>
        <li>Abra o produto no Mercado Livre, Amazon, Shopee ou qualquer loja e clique no favorito.</li>
        <li>Aparece um cartão no canto da página com foto, nome e preço. Clique em <b>Adicionar à minha lista no Enlace</b>, confira e adicione.</li>
      </ol>
      <p className="text-xs text-muted">Alternativa à extensão. Alguns navegadores (como o Opera) bloqueiam favoritos com código; nesse caso use a extensão acima. No celular, use "Colar o link" abaixo e complete preço e foto.</p>
    </div>
    </div>
  );
}
