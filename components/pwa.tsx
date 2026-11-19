"use client";
import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";

interface BIP extends Event { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> }
export function RegisterSW() {
  useEffect(() => { if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") navigator.serviceWorker.register("/sw.js").catch(() => {}); }, []);
  return null;
}
/** Botão "Instalar app": usa o aviso do navegador (Android/Chrome/Edge/Opera) ou mostra o passo a passo no iPhone. */
export function InstallButton({ className }: { className?: string }) {
  const [ev, setEv] = useState<BIP | null>(null); const [ios, setIos] = useState(false); const [installed, setInstalled] = useState(false); const [help, setHelp] = useState(false);
  useEffect(() => {
    const standalone = matchMedia("(display-mode: standalone)").matches || (navigator as unknown as { standalone?: boolean }).standalone; setInstalled(!!standalone);
    setIos(/iPad|iPhone|iPod/.test(navigator.userAgent) && !standalone);
    const h = (e: Event) => { e.preventDefault(); setEv(e as BIP); }; const done = () => setInstalled(true);
    addEventListener("beforeinstallprompt", h); addEventListener("appinstalled", done); return () => { removeEventListener("beforeinstallprompt", h); removeEventListener("appinstalled", done); };
  }, []);
  if (installed || (!ev && !ios)) return null;
  return (
    <>
      <button className={className ?? "btn btn-ghost btn-sm w-full"} onClick={async () => { if (ev) { await ev.prompt(); await ev.userChoice; setEv(null); } else setHelp(true); }}><Download size={14} />Instalar app</button>
      {help && <div className="fixed inset-0 z-50 grid place-items-end bg-ink/40 p-4 sm:place-items-center" onClick={() => setHelp(false)}><div className="card w-full max-w-sm space-y-3 p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between"><h3 className="text-lg font-semibold">Instalar no iPhone</h3><button aria-label="Fechar" onClick={() => setHelp(false)}><X size={18} /></button></div>
        <ol className="list-decimal space-y-2 pl-5 text-sm"><li>Abra o Enlace no <b>Safari</b>.</li><li>Toque em <b>Compartilhar</b> <Share size={13} className="inline" />.</li><li>Escolha <b>Adicionar à Tela de Início</b>.</li></ol></div></div>}
    </>
  );
}
