import { newWedding } from "./store";
import { addDays, addMonths, todayISO, uid } from "./utils";
import type { WeddingData, Guest, Vendor, Payment } from "./types";

export function demoWedding(): WeddingData {
  const date = addMonths(todayISO(), 7);
  const d = newWedding({ partner1: "Marina", partner2: "Rafael", date, city: "Curitiba, PR", venue: "Espaço Alameda", budget: 85000, guestsEstimate: 160, phone: "5519999999999", ceremonyPlace: "Capela Santa Luzia", ceremonyAddr: "Rua das Flores, 100, Centro", receptionPlace: "Espaço Alameda", receptionAddr: "Avenida Brasil, 2000", style: "jardim", palette: 0, liveTogether: false });
  const v = (name: string, category: string, status: Vendor["status"], value: number, contact: string): Vendor => ({ id: uid(), name, category, status, value, contact, phone: "", notes: "", docs: status === "contratado" ? ["Proposta.pdf", "Contrato.pdf"] : [] });
  d.vendors = [v("Buffet Casa Bonfim", "Buffet e bebidas", "contratado", 38400, "Carla Menezes"), v("Espaço Alameda", "Espaço da festa", "contratado", 12800, "Ana"), v("Foto Lume", "Fotografia e vídeo", "contratado", 9400, "Marcos"), v("DJ Compasso", "Música", "contratado", 3600, "Rafa"), v("Botânica Decoração", "Decoração e flores", "cotacao", 12800, "Bia"), v("Ateliê Pétala", "Decoração e flores", "cotacao", 10900, "Lia"), v("Estúdio Claro", "Fotografia e vídeo", "descartado", 11500, "Pedro")];
  const pay = (vi: number, label: string, amount: number, off: number, method: Payment["method"], paid = false): Payment => ({ id: uid(), vendorId: d.vendors[vi].id, label, amount, due: addDays(todayISO(), off), method, paid, paidAt: paid ? addDays(todayISO(), off) : undefined });
  d.payments = [pay(0, "Entrada", 7680, -40, "pix", true), pay(0, "Parcela 2 de 5", 7680, -10, "boleto", true), pay(0, "Parcela 3 de 5", 7680, 3, "boleto"), pay(0, "Parcela 4 de 5", 7680, 33, "boleto"), pay(0, "Parcela 5 de 5", 7680, 63, "boleto"), pay(1, "Entrada", 6400, -20, "pix", true), pay(1, "Saldo", 6400, 90, "pix"), pay(2, "Parcela 1 de 4", 2350, 5, "pix"), pay(2, "Parcela 2 de 4", 2350, 35, "pix"), pay(3, "Sinal", 1800, 1, "pix"), pay(3, "Saldo", 1800, 120, "pix")];
  const fam = ["Souza", "Ribeiro", "Lima", "Alves", "Costa", "Prado", "Andrade", "Nunes"]; const nm = ["Helena", "Marcos", "Lia", "Theo", "Cida", "Jorge", "Bruno", "Carol", "Pedro", "Marina"];
  const guests: Guest[] = [];
  fam.forEach((f, i) => { const n = 2 + (i % 3); for (let k = 0; k < n; k++) guests.push({ id: uid(), name: `${nm[(i + k) % nm.length]} ${f}`, group: `Família ${f}`, list: i === 7 ? "B" : "A", rsvp: (i + k) % 3 === 0 ? "pendente" : (i + k) % 7 === 0 ? "recusado" : "confirmado", fee: k === 3 ? "isenta" : k === 2 ? "meia" : "inteira", phone: "" }); });
  d.guests = guests;
  d.tasks.forEach((t, i) => { if (i < 14) t.done = true; });
  d.recados = [{ id: uid(), from: "Família Ribeiro", text: "Contem com a gente! Mal podemos esperar para dançar com vocês.", date: todayISO() }];
  const e = d.enxoval; e.forEach((x, i) => { if (i % 5 === 0) x.state = "tenho"; if (i % 7 === 0) x.state = "comprado"; });
  return d;
}
