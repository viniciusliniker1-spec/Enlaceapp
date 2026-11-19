// Endereço do seu Enlace. Se usar outro domínio, troque aqui e recarregue a extensão.
const APP = "https://enlaceapp.vercel.app";

// Roda dentro da página da loja (só quando você clica no ícone).
function extract() {
  function m(k) { var e = document.querySelector('meta[property="' + k + '"],meta[name="' + k + '"],meta[itemprop="' + k + '"]'); return e ? e.content : ""; }
  var t = "", i = "", p = "";
  document.querySelectorAll('script[type="application/ld+json"]').forEach(function (s) {
    try {
      var w = function (n) {
        if (!n || typeof n !== "object") return;
        if (Array.isArray(n)) return n.forEach(w);
        var ty = n["@type"];
        if (ty === "Product" || (Array.isArray(ty) && ty.indexOf("Product") > -1)) {
          t = t || n.name || "";
          var im = n.image; i = i || (Array.isArray(im) ? ((im[0] && im[0].url) || im[0]) : (im && im.url) || im || "");
          var of = n.offers; of = Array.isArray(of) ? of[0] : of; if (of && !p) p = of.price || of.lowPrice || "";
        }
        Object.values(n).forEach(w);
      };
      w(JSON.parse(s.textContent));
    } catch (e) {}
  });
  t = t || m("og:title") || document.title; i = i || m("og:image") || m("twitter:image"); p = p || m("product:price:amount") || m("price");
  if (!p) { var f = document.querySelector(".andes-money-amount__fraction"); if (f) { var c = document.querySelector(".andes-money-amount__cents"); p = f.textContent.replace(/\./g, "") + "." + (c ? c.textContent : "00"); } }
  if (!p) { var a = document.querySelector(".a-price .a-offscreen"); if (a) p = a.textContent; }
  return { title: String(t).slice(0, 160), image: String(i), price: String(p), store: location.hostname.replace(/^www\./, ""), url: location.href.split("#")[0] };
}

async function capture(tab) {
  try {
    const [{ result }] = await chrome.scripting.executeScript({ target: { tabId: tab.id }, func: extract });
    const b64 = btoa(unescape(encodeURIComponent(JSON.stringify(result))));
    await chrome.tabs.create({ url: APP + "/app/adicionar#" + b64 });
  } catch (e) {
    chrome.action.setBadgeText({ text: "!", tabId: tab.id });
    chrome.action.setBadgeBackgroundColor({ color: "#c2603f" });
  }
}
chrome.action.onClicked.addListener(capture);
