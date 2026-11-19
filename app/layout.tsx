import type { Metadata, Viewport } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import { RegisterSW } from "@/components/pwa";
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", axes: ["opsz"] });
export const metadata: Metadata = {
  title: "Enlace • Organizador de casamento para casais e assessores",
  description: "Fornecedores, pagamentos, convidados, convite digital pelo WhatsApp, mesas, checklist, enxoval da casa e lista de presentes num lugar só. Experimente grátis.",
  manifest: "/manifest.webmanifest",
  icons: { icon: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }, { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" }], apple: "/icons/apple-touch-icon.png" },
  appleWebApp: { capable: true, title: "Enlace", statusBarStyle: "default" },
};
export const viewport: Viewport = { themeColor: "#3f5b4b", width: "device-width", initialScale: 1 };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="pt-BR" className={`${inter.variable} ${fraunces.variable}`}><body>{children}<RegisterSW /></body></html>);
}
